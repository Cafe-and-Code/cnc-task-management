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
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all tasks in a user story
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetTasks(
            [FromQuery] int userStoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] TaskStatus? status = null,
            [FromQuery] TaskPriority? priority = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify user story exists and belongs to the organization
            var userStory = await _context.UserStories
                .Include(us => us.Project)
                .FirstOrDefaultAsync(us => us.Id == userStoryId && us.Project.OrganizationId == organizationId);

            if (userStory == null)
            {
                return BadRequest(new { Message = "User story not found" });
            }

            // Start with base query
            var query = _context.Tasks
                .Where(t => t.UserStoryId == userStoryId);

            // Apply filters
            if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == priority.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var tasks = await query
                .OrderByDescending(t => t.Priority)
                .ThenBy(t => t.Title)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.Priority,
                    t.EstimatedHours,
                    t.ActualHours,
                    t.RemainingHours,
                    DueDate = t.DueDate.HasValue ? t.DueDate.Value.ToString("yyyy-MM-dd") : null,
                    t.IsActive,
                    CreatedByUser = t.CreatedByUser != null ? new
                    {
                        t.CreatedByUser.Id,
                        t.CreatedByUser.FirstName,
                        t.CreatedByUser.LastName,
                        t.CreatedByUser.AvatarUrl
                    } : null,
                    AssignedToUser = t.AssignedToUser != null ? new
                    {
                        t.AssignedToUser.Id,
                        t.AssignedToUser.FirstName,
                        t.AssignedToUser.LastName,
                        t.AssignedToUser.AvatarUrl
                    } : null,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                tasks,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize)
                }
            });
        }

        /// <summary>
        /// Get task by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTask(int id)
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
                .Include(t => t.CreatedByUser)
                .Include(t => t.AssignedToUser)
                .Where(t => t.Id == id && t.UserStory.Project.OrganizationId == organizationId)
                .Select(t => new
                {
                    t.Id,
                    t.Title,
                    t.Description,
                    t.Status,
                    t.Priority,
                    t.EstimatedHours,
                    t.ActualHours,
                    t.RemainingHours,
                    DueDate = t.DueDate.HasValue ? t.DueDate.Value.ToString("yyyy-MM-dd") : null,
                    t.IsActive,
                    UserStory = new
                    {
                        t.UserStory.Id,
                        t.UserStory.Title
                    },
                    Project = new
                    {
                        t.UserStory.Project.Id,
                        t.UserStory.Project.Name
                    },
                    CreatedByUser = t.CreatedByUser != null ? new
                    {
                        t.CreatedByUser.Id,
                        t.CreatedByUser.FirstName,
                        t.CreatedByUser.LastName,
                        t.CreatedByUser.AvatarUrl
                    } : null,
                    AssignedToUser = t.AssignedToUser != null ? new
                    {
                        t.AssignedToUser.Id,
                        t.AssignedToUser.FirstName,
                        t.AssignedToUser.LastName,
                        t.AssignedToUser.AvatarUrl
                    } : null,
                    t.CreatedAt,
                    t.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (task == null)
            {
                return NotFound();
            }

            return Ok(task);
        }

        /// <summary>
        /// Create a new task
        /// </summary>
        [HttpPost]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster, UserRole.ProductOwner)]
        public async Task<ActionResult<Task>> CreateTask([FromBody] CreateTaskModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify user story exists and belongs to the organization
            var userStory = await _context.UserStories
                .Include(us => us.Project)
                .FirstOrDefaultAsync(us => us.Id == model.UserStoryId && us.Project.OrganizationId == organizationId);

            if (userStory == null)
            {
                return BadRequest(new { Message = "User story not found" });
            }

            // Verify assigned user exists if specified
            if (model.AssignedToUserId.HasValue)
            {
                var assignedUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == model.AssignedToUserId.Value && u.OrganizationId == organizationId);

                if (assignedUser == null)
                {
                    return BadRequest(new { Message = "Assigned user not found" });
                }
            }

            var task = new Task
            {
                Title = model.Title,
                Description = model.Description,
                UserStoryId = model.UserStoryId,
                CreatedByUserId = int.Parse(currentUserId),
                AssignedToUserId = model.AssignedToUserId,
                Status = model.Status,
                Priority = model.Priority,
                EstimatedHours = model.EstimatedHours,
                ActualHours = 0,
                RemainingHours = model.EstimatedHours,
                DueDate = model.DueDate,
                IsActive = true
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }

        /// <summary>
        /// Update a task
        /// </summary>
        [HttpPut("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster, UserRole.ProductOwner, UserRole.Developer)]
        public async Task<IActionResult> UpdateTask(int id, [FromBody] UpdateTaskModel model)
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

            // Verify assigned user exists if specified
            if (model.AssignedToUserId.HasValue)
            {
                var assignedUser = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == model.AssignedToUserId.Value && u.OrganizationId == organizationId);

                if (assignedUser == null)
                {
                    return BadRequest(new { Message = "Assigned user not found" });
                }
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

            task.Title = model.Title ?? task.Title;
            task.Description = model.Description ?? task.Description;
            task.AssignedToUserId = model.AssignedToUserId ?? task.AssignedToUserId;
            task.Status = model.Status ?? task.Status;
            task.Priority = model.Priority ?? task.Priority;
            task.EstimatedHours = model.EstimatedHours ?? task.EstimatedHours;
            task.ActualHours = model.ActualHours ?? task.ActualHours;
            task.RemainingHours = model.RemainingHours ?? task.RemainingHours;
            task.DueDate = model.DueDate ?? task.DueDate;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Task updated successfully" });
        }

        /// <summary>
        /// Delete a task
        /// </summary>
        [HttpDelete("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster, UserRole.ProductOwner)]
        public async Task<IActionResult> DeleteTask(int id)
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
                .FirstOrDefaultAsync(t => t.Id == id && t.UserStory.Project.OrganizationId == organizationId);

            if (task == null)
            {
                return NotFound();
            }

            // Deactivate the task
            task.IsActive = false;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Task deleted successfully" });
        }

        /// <summary>
        /// Update task status
        /// </summary>
        [HttpPut("{id}/status")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster, UserRole.ProductOwner, UserRole.Developer)]
        public async Task<IActionResult> UpdateTaskStatus(int id, [FromBody] UpdateTaskStatusModel model)
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

            task.Status = model.Status;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Task status updated successfully" });
        }

        /// <summary>
        /// Update task hours
        /// </summary>
        [HttpPut("{id}/hours")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster, UserRole.ProductOwner, UserRole.Developer)]
        public async Task<IActionResult> UpdateTaskHours(int id, [FromBody] UpdateTaskHoursModel model)
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

            task.EstimatedHours = model.EstimatedHours ?? task.EstimatedHours;
            task.ActualHours = model.ActualHours ?? task.ActualHours;
            task.RemainingHours = model.RemainingHours ?? task.RemainingHours;
            task.UpdatedAt = DateTime.UtcNow;
            task.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Task hours updated successfully" });
        }
    }

    // DTOs for task management
    public class CreateTaskModel
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int UserStoryId { get; set; }
        public int? AssignedToUserId { get; set; }
        public TaskStatus Status { get; set; } = TaskStatus.ToDo;
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        public decimal EstimatedHours { get; set; } = 0;
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskModel
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? AssignedToUserId { get; set; }
        public TaskStatus? Status { get; set; }
        public TaskPriority? Priority { get; set; }
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public decimal? RemainingHours { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateTaskStatusModel
    {
        public TaskStatus Status { get; set; }
    }

    public class UpdateTaskHoursModel
    {
        public decimal? EstimatedHours { get; set; }
        public decimal? ActualHours { get; set; }
        public decimal? RemainingHours { get; set; }
    }
}