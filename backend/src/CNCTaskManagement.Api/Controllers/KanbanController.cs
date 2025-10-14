using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;
using Task = CNCTaskManagement.Core.Entities.Task;
using TaskStatus = CNCTaskManagement.Core.Enums.TaskStatus;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class KanbanController : ControllerBase
    {
        private readonly AppDbContext _context;

        public KanbanController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get Kanban board for a project
        /// </summary>
        [HttpGet("board")]
        public async Task<ActionResult<object>> GetKanbanBoard([FromQuery] int projectId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify project exists and belongs to the organization
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.OrganizationId == organizationId);

            if (project == null)
            {
                return BadRequest(new { Message = "Project not found" });
            }

            // Get all active sprints in the project
            var activeSprints = await _context.Sprints
                .Where(s => s.ProjectId == projectId && s.Status == SprintStatus.Active)
                .Select(s => s.Id)
                .ToListAsync();

            // Get all user stories in active sprints or without sprint (backlog)
            var userStories = await _context.UserStories
                .Include(us => us.Tasks)
                    .ThenInclude(t => t.AssignedToUser)
                .Where(us => us.ProjectId == projectId && us.IsActive && 
                           (us.SprintId == null || activeSprints.Contains(us.SprintId.Value)))
                .ToListAsync();

            // Group tasks by status
            var todoTasks = new List<object>();
            var inProgressTasks = new List<object>();
            var testingTasks = new List<object>();
            var completedTasks = new List<object>();
            var blockedTasks = new List<object>();

            foreach (var userStory in userStories)
            {
                foreach (var task in userStory.Tasks.Where(t => t.IsActive))
                {
                    var taskObj = new
                    {
                        task.Id,
                        task.Title,
                        task.Description,
                        UserStory = new
                        {
                            userStory.Id,
                            userStory.Title,
                            userStory.StoryPoints
                        },
                        AssignedToUser = task.AssignedToUser != null ? new
                        {
                            task.AssignedToUser.Id,
                            task.AssignedToUser.FirstName,
                            task.AssignedToUser.LastName,
                            task.AssignedToUser.AvatarUrl
                        } : null,
                        task.Priority,
                        task.EstimatedHours,
                        task.ActualHours,
                        task.RemainingHours,
                        DueDate = task.DueDate.HasValue ? task.DueDate.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null
                    };

                    switch (task.Status)
                    {
                        case TaskStatus.ToDo:
                            todoTasks.Add(taskObj);
                            break;
                        case TaskStatus.InProgress:
                            inProgressTasks.Add(taskObj);
                            break;
                        case TaskStatus.Testing:
                            testingTasks.Add(taskObj);
                            break;
                        case TaskStatus.Completed:
                            completedTasks.Add(taskObj);
                            break;
                        case TaskStatus.Blocked:
                            blockedTasks.Add(taskObj);
                            break;
                    }
                }
            }

            return Ok(new
            {
                projectId,
                projectName = project.Name,
                columns = new
                {
                    todo = new
                    {
                        id = "todo",
                        title = "To Do",
                        tasks = todoTasks
                    },
                    inProgress = new
                    {
                        id = "inProgress",
                        title = "In Progress",
                        tasks = inProgressTasks
                    },
                    testing = new
                    {
                        id = "testing",
                        title = "Testing",
                        tasks = testingTasks
                    },
                    completed = new
                    {
                        id = "completed",
                        title = "Completed",
                        tasks = completedTasks
                    },
                    blocked = new
                    {
                        id = "blocked",
                        title = "Blocked",
                        tasks = blockedTasks
                    }
                }
            });
        }

        /// <summary>
        /// Update task status (move task between columns)
        /// </summary>
        [HttpPost("tasks/{id}/status")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster, UserRole.ProductOwner, UserRole.Developer)]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] KanbanUpdateTaskStatusModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var task = await _context.Tasks
                .Include(t => t.UserStory)
                    .ThenInclude(us => us.Project)
                .Include(t => t.AssignedToUser)
                .FirstOrDefaultAsync(t => t.Id == id && t.UserStory.Project.OrganizationId == organizationId);

            if (task == null)
            {
                return NotFound();
            }

            // Check if user has permission to update the task
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            var currentUserIdInt = int.Parse(currentUserId);
            
            if (currentUserRole != UserRole.Admin.ToString() && 
                currentUserRole != UserRole.ScrumMaster.ToString() && 
                currentUserRole != UserRole.ProductOwner.ToString() &&
                task.AssignedToUserId != currentUserIdInt)
            {
                return Forbid();
            }

            var previousStatus = task.Status;
            task.Status = model.Status;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedBy = currentUserId;

            // Update remaining hours if task is completed
            if (model.Status == TaskStatus.Completed && task.RemainingHours > 0)
            {
                task.RemainingHours = 0;
            }

            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                Message = "Task status updated successfully",
                PreviousStatus = previousStatus.ToString(),
                NewStatus = task.Status.ToString()
            });
        }

        /// <summary>
        /// Get task statistics for a project
        /// </summary>
        [HttpGet("statistics")]
        public async Task<ActionResult<object>> GetTaskStatistics([FromQuery] int projectId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify project exists and belongs to the organization
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.OrganizationId == organizationId);

            if (project == null)
            {
                return BadRequest(new { Message = "Project not found" });
            }

            // Get all active sprints in the project
            var activeSprints = await _context.Sprints
                .Where(s => s.ProjectId == projectId && s.Status == SprintStatus.Active)
                .Select(s => s.Id)
                .ToListAsync();

            // Get all user stories in active sprints or without sprint (backlog)
            var userStories = await _context.UserStories
                .Include(us => us.Tasks)
                .Where(us => us.ProjectId == projectId && us.IsActive && 
                           (us.SprintId == null || activeSprints.Contains(us.SprintId.Value)))
                .ToListAsync();

            // Calculate statistics
            var totalTasks = userStories.SelectMany(us => us.Tasks).Count(t => t.IsActive);
            var completedTasks = userStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status == TaskStatus.Completed);
            var inProgressTasks = userStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status == TaskStatus.InProgress);
            var testingTasks = userStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status == TaskStatus.Testing);
            var blockedTasks = userStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status == TaskStatus.Blocked);
            var todoTasks = userStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status == TaskStatus.ToDo);

            // Calculate hours statistics
            var totalEstimatedHours = userStories.SelectMany(us => us.Tasks)
                .Where(t => t.IsActive)
                .Sum(t => t.EstimatedHours);
            var totalActualHours = userStories.SelectMany(us => us.Tasks)
                .Where(t => t.IsActive)
                .Sum(t => t.ActualHours);
            var totalRemainingHours = userStories.SelectMany(us => us.Tasks)
                .Where(t => t.IsActive)
                .Sum(t => t.RemainingHours);

            return Ok(new
            {
                projectId,
                projectName = project.Name,
                totalTasks,
                completedTasks,
                inProgressTasks,
                testingTasks,
                blockedTasks,
                todoTasks,
                completionPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0,
                hours = new
                {
                    estimated = totalEstimatedHours,
                    actual = totalActualHours,
                    remaining = totalRemainingHours
                }
            });
        }

        /// <summary>
        /// Get tasks assigned to the current user
        /// </summary>
        [HttpGet("my-tasks")]
        public async Task<ActionResult<object>> GetMyTasks([FromQuery] int projectId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var currentUserIdInt = int.Parse(currentUserId);

            // Verify project exists and belongs to the organization
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.OrganizationId == organizationId);

            if (project == null)
            {
                return BadRequest(new { Message = "Project not found" });
            }

            // Get all active sprints in the project
            var activeSprints = await _context.Sprints
                .Where(s => s.ProjectId == projectId && s.Status == SprintStatus.Active)
                .Select(s => s.Id)
                .ToListAsync();

            // Get all user stories in active sprints or without sprint (backlog)
            var userStories = await _context.UserStories
                .Include(us => us.Tasks)
                    .ThenInclude(t => t.AssignedToUser)
                .Where(us => us.ProjectId == projectId && us.IsActive && 
                           (us.SprintId == null || activeSprints.Contains(us.SprintId.Value)))
                .ToListAsync();

            // Get tasks assigned to the current user
            var myTasks = userStories.SelectMany(us => us.Tasks)
                .Where(t => t.IsActive && t.AssignedToUserId == currentUserIdInt)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    UserStory = new
                    {
                        t.UserStory.Id,
                        t.UserStory.Title,
                        t.UserStory.StoryPoints
                    },
                    t.Status,
                    t.Priority,
                    t.EstimatedHours,
                    t.ActualHours,
                    t.RemainingHours,
                    DueDate = t.DueDate.HasValue ? t.DueDate.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null
                })
                .ToList();

            return Ok(new
            {
                projectId,
                projectName = project.Name,
                tasks = myTasks
            });
        }
    }

    // DTOs for Kanban management
    public class KanbanUpdateTaskStatusModel
    {
        public TaskStatus Status { get; set; }
    }
}