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
    public class SprintsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SprintsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all sprints in a project
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetSprints(
            [FromQuery] int projectId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] SprintStatus? status = null)
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

            // Start with base query
            var query = _context.Sprints
                .Include(s => s.UserStories)
                .Where(s => s.ProjectId == projectId);

            // Apply filters
            if (status.HasValue)
            {
                query = query.Where(s => s.Status == status.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var sprints = await query
                .OrderByDescending(s => s.StartDate)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.Status,
                    s.SprintNumber,
                    StartDate = s.StartDate.ToString("yyyy-MM-dd"),
                    EndDate = s.EndDate.ToString("yyyy-MM-dd"),
                    s.VelocityGoal,
                    s.VelocityActual,
                    s.IsActive,
                    UserStoryCount = s.UserStories.Count(us => us.IsActive),
                    CompletedUserStoryCount = s.UserStories.Count(us => us.IsActive && us.Status == UserStoryStatus.Completed),
                    TotalStoryPoints = s.UserStories.Where(us => us.IsActive).Sum(us => us.StoryPoints),
                    CompletedStoryPoints = s.UserStories.Where(us => us.IsActive && us.Status == UserStoryStatus.Completed).Sum(us => us.StoryPoints),
                    s.CreatedAt,
                    s.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                sprints,
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
        /// Get sprint by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetSprint(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .Include(s => s.UserStories)
                    .ThenInclude(us => us.AssignedToUser)
                .Include(s => s.UserStories)
                    .ThenInclude(us => us.Tasks)
                .Where(s => s.Id == id && s.Project.OrganizationId == organizationId)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.Description,
                    s.Status,
                    s.SprintNumber,
                    StartDate = s.StartDate.ToString("yyyy-MM-dd"),
                    EndDate = s.EndDate.ToString("yyyy-MM-dd"),
                    s.VelocityGoal,
                    s.VelocityActual,
                    s.IsActive,
                    Project = new
                    {
                        s.Project.Id,
                        s.Project.Name
                    },
                    UserStories = s.UserStories.Where(us => us.IsActive).Select(us => new
                    {
                        us.Id,
                        us.Title,
                        us.Status,
                        us.Priority,
                        us.StoryPoints,
                        AssignedToUser = us.AssignedToUser != null ? new
                        {
                            us.AssignedToUser.Id,
                            us.AssignedToUser.FirstName,
                            us.AssignedToUser.LastName,
                            us.AssignedToUser.AvatarUrl
                        } : null,
                        TaskCount = us.Tasks.Count(t => t.IsActive),
                        CompletedTaskCount = us.Tasks.Count(t => t.IsActive && t.Status == TaskStatus.Completed)
                    }).ToList(),
                    s.CreatedAt,
                    s.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (sprint == null)
            {
                return NotFound();
            }

            return Ok(sprint);
        }

        /// <summary>
        /// Create a new sprint
        /// </summary>
        [HttpPost]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<ActionResult<Sprint>> CreateSprint([FromBody] CreateSprintModel model)
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
                .FirstOrDefaultAsync(p => p.Id == model.ProjectId && p.OrganizationId == organizationId);

            if (project == null)
            {
                return BadRequest(new { Message = "Project not found" });
            }

            // Get the next sprint number
            var lastSprintNumber = await _context.Sprints
                .Where(s => s.ProjectId == model.ProjectId)
                .OrderByDescending(s => s.SprintNumber)
                .Select(s => s.SprintNumber)
                .FirstOrDefaultAsync();

            var sprint = new Sprint
            {
                Name = model.Name,
                Description = model.Description,
                ProjectId = model.ProjectId,
                SprintNumber = lastSprintNumber + 1,
                Status = model.Status,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                VelocityGoal = model.VelocityGoal,
                VelocityActual = 0,
                IsActive = true
            };

            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetSprint), new { id = sprint.Id }, sprint);
        }

        /// <summary>
        /// Update a sprint
        /// </summary>
        [HttpPut("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> UpdateSprint(int id, [FromBody] UpdateSprintModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == id && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return NotFound();
            }

            sprint.Name = model.Name ?? sprint.Name;
            sprint.Description = model.Description ?? sprint.Description;
            sprint.Status = model.Status ?? sprint.Status;
            sprint.StartDate = model.StartDate ?? sprint.StartDate;
            sprint.EndDate = model.EndDate ?? sprint.EndDate;
            sprint.VelocityGoal = model.VelocityGoal ?? sprint.VelocityGoal;
            sprint.VelocityActual = model.VelocityActual ?? sprint.VelocityActual;
            sprint.UpdatedAt = DateTime.UtcNow;
            sprint.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sprint updated successfully" });
        }

        /// <summary>
        /// Start a sprint
        /// </summary>
        [HttpPost("{id}/start")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> StartSprint(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == id && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return NotFound();
            }

            if (sprint.Status != SprintStatus.Planned)
            {
                return BadRequest(new { Message = "Only planned sprints can be started" });
            }

            // Check if there is already an active sprint in the project
            var activeSprint = await _context.Sprints
                .FirstOrDefaultAsync(s => s.ProjectId == sprint.ProjectId && s.Status == SprintStatus.Active);

            if (activeSprint != null)
            {
                return BadRequest(new { Message = "There is already an active sprint in this project" });
            }

            sprint.Status = SprintStatus.Active;
            sprint.StartDate = DateTime.UtcNow;
            sprint.UpdatedAt = DateTime.UtcNow;
            sprint.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sprint started successfully" });
        }

        /// <summary>
        /// Complete a sprint
        /// </summary>
        [HttpPost("{id}/complete")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> CompleteSprint(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .Include(s => s.UserStories)
                .FirstOrDefaultAsync(s => s.Id == id && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return NotFound();
            }

            if (sprint.Status != SprintStatus.Active)
            {
                return BadRequest(new { Message = "Only active sprints can be completed" });
            }

            // Calculate actual velocity
            var completedStoryPoints = sprint.UserStories
                .Where(us => us.IsActive && us.Status == UserStoryStatus.Completed)
                .Sum(us => us.StoryPoints);

            sprint.Status = SprintStatus.Completed;
            sprint.EndDate = DateTime.UtcNow;
            sprint.VelocityActual = completedStoryPoints;
            sprint.UpdatedAt = DateTime.UtcNow;
            sprint.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Sprint completed successfully", VelocityActual = completedStoryPoints });
        }

        /// <summary>
        /// Add user stories to sprint
        /// </summary>
        [HttpPost("{id}/UserStories")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> AddUserStoriesToSprint(int id, [FromBody] AddUserStoriesToSprintModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == id && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return NotFound();
            }

            if (sprint.Status != SprintStatus.Planned && sprint.Status != SprintStatus.Active)
            {
                return BadRequest(new { Message = "User stories can only be added to planned or active sprints" });
            }

            // Get user stories that belong to the same project
            var userStories = await _context.UserStories
                .Where(us => us.ProjectId == sprint.ProjectId && model.UserStoryIds.Contains(us.Id))
                .ToListAsync();

            foreach (var userStory in userStories)
            {
                userStory.SprintId = id;
                userStory.Status = UserStoryStatus.InProgress;
                userStory.UpdatedAt = DateTime.UtcNow;
                userStory.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Added {userStories.Count} user stories to sprint" });
        }

        /// <summary>
        /// Remove user stories from sprint
        /// </summary>
        [HttpDelete("{id}/UserStories")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> RemoveUserStoriesFromSprint(int id, [FromBody] RemoveUserStoriesFromSprintModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == id && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return NotFound();
            }

            if (sprint.Status == SprintStatus.Completed)
            {
                return BadRequest(new { Message = "User stories cannot be removed from completed sprints" });
            }

            // Get user stories that belong to the sprint
            var userStories = await _context.UserStories
                .Where(us => us.SprintId == id && model.UserStoryIds.Contains(us.Id))
                .ToListAsync();

            foreach (var userStory in userStories)
            {
                userStory.SprintId = null;
                userStory.Status = UserStoryStatus.Backlog;
                userStory.UpdatedAt = DateTime.UtcNow;
                userStory.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Removed {userStories.Count} user stories from sprint" });
        }
    }

    // DTOs for sprint management
    public class CreateSprintModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ProjectId { get; set; }
        public SprintStatus Status { get; set; } = SprintStatus.Planned;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal VelocityGoal { get; set; } = 0;
    }

    public class UpdateSprintModel
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public SprintStatus? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? VelocityGoal { get; set; }
        public decimal? VelocityActual { get; set; }
    }

    public class AddUserStoriesToSprintModel
    {
        public List<int> UserStoryIds { get; set; } = new List<int>();
    }

    public class RemoveUserStoriesFromSprintModel
    {
        public List<int> UserStoryIds { get; set; } = new List<int>();
    }
}