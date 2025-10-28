using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;
using TaskStatus = CNCTaskManagement.Core.Enums.TaskStatus;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BacklogController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BacklogController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all backlog items (user stories not assigned to sprints)
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetBacklog(
            [FromQuery] int projectId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] UserStoryPriority? priority = null,
            [FromQuery] string? assigneeFilter = null,
            [FromQuery] string? sortBy = "priority",
            [FromQuery] string? sortOrder = "desc")
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

            // Start with base query - get user stories that are in backlog (not assigned to sprints)
            var query = _context.UserStories
                .Include(us => us.CreatedByUser)
                .Include(us => us.AssignedToUser)
                .Include(us => us.Tasks)
                    .ThenInclude(t => t.AssignedToUser)
                .Where(us => us.ProjectId == projectId && us.SprintId == null && us.IsActive);

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(us =>
                    us.Title.Contains(search) ||
                    (us.Description != null && us.Description.Contains(search)));
            }

            if (priority.HasValue)
            {
                query = query.Where(us => us.Priority == priority.Value);
            }

            if (!string.IsNullOrEmpty(assigneeFilter) && assigneeFilter != "all")
            {
                if (assigneeFilter == "unassigned")
                {
                    query = query.Where(us => us.AssignedToUserId == null);
                }
                else
                {
                    var assigneeId = int.Parse(assigneeFilter);
                    query = query.Where(us => us.AssignedToUserId == assigneeId);
                }
            }

            // Apply sorting
            query = sortBy?.ToLower() switch
            {
                "storypoints" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(us => us.StoryPoints)
                    : query.OrderByDescending(us => us.StoryPoints),
                "created" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(us => us.CreatedAt)
                    : query.OrderByDescending(us => us.CreatedAt),
                "updated" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(us => us.UpdatedAt)
                    : query.OrderByDescending(us => us.UpdatedAt),
                "title" => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(us => us.Title)
                    : query.OrderByDescending(us => us.Title),
                _ => sortOrder?.ToLower() == "asc"
                    ? query.OrderBy(us => us.Priority)
                    : query.OrderByDescending(us => us.Priority)
            };

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var userStories = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(us => new
                {
                    us.Id,
                    us.Title,
                    us.Description,
                    us.Status,
                    us.Priority,
                    us.StoryPoints,
                    us.BusinessValue,
                    DueDate = us.DueDate.HasValue ? us.DueDate.Value.ToString("yyyy-MM-dd") : null,
                    us.IsActive,
                    CreatedByUser = us.CreatedByUser != null ? new
                    {
                        us.CreatedByUser.Id,
                        us.CreatedByUser.FirstName,
                        us.CreatedByUser.LastName,
                        us.CreatedByUser.AvatarUrl
                    } : null,
                    AssignedToUser = us.AssignedToUser != null ? new
                    {
                        us.AssignedToUser.Id,
                        us.AssignedToUser.FirstName,
                        us.AssignedToUser.LastName,
                        us.AssignedToUser.AvatarUrl
                    } : null,
                    TaskCount = us.Tasks.Count(t => t.IsActive),
                    CompletedTaskCount = us.Tasks.Count(t => t.IsActive && t.Status == TaskStatus.Completed),
                    TotalEstimatedHours = us.Tasks.Where(t => t.IsActive).Sum(t => t.EstimatedHours),
                    AcceptanceCriteria = us.AcceptanceCriteria != null ?
                        JsonSerializer.Deserialize<object>(us.AcceptanceCriteria, new JsonSerializerOptions()) : new object(),
                    us.CreatedAt,
                    us.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                userStories,
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
        /// Get backlog statistics and metrics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetBacklogStats([FromQuery] int projectId)
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

            var backlogStories = await _context.UserStories
                .Include(us => us.Tasks)
                .Where(us => us.ProjectId == projectId && us.SprintId == null && us.IsActive)
                .ToListAsync();

            var stats = new
            {
                totalStories = backlogStories.Count,
                totalStoryPoints = backlogStories.Sum(us => us.StoryPoints),
                totalBusinessValue = backlogStories.Sum(us => us.BusinessValue),
                priorityBreakdown = backlogStories
                    .GroupBy(us => us.Priority)
                    .ToDictionary(g => g.Key.ToString(), g => g.Count()),
                unassignedStories = backlogStories.Count(us => us.AssignedToUserId == null),
                storiesWithTasks = backlogStories.Count(us => us.Tasks.Any(t => t.IsActive)),
                totalEstimatedHours = backlogStories.Sum(us => us.Tasks.Where(t => t.IsActive).Sum(t => t.EstimatedHours)),
                averageStoryPoints = backlogStories.Any() ? backlogStories.Average(us => us.StoryPoints) : 0
            };

            return Ok(stats);
        }

        /// <summary>
        /// Bulk update user stories in backlog
        /// </summary>
        [HttpPut("bulk")]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner, UserRole.ScrumMaster)]
        public async Task<IActionResult> BulkUpdateBacklogStories([FromBody] BulkUpdateBacklogModel model)
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

            var userStories = await _context.UserStories
                .Include(us => us.Project)
                .Where(us => model.UserStoryIds.Contains(us.Id) && us.Project.OrganizationId == organizationId && us.IsActive)
                .ToListAsync();

            if (userStories.Count != model.UserStoryIds.Count)
            {
                return BadRequest(new { Message = "Some user stories not found" });
            }

            foreach (var userStory in userStories)
            {
                if (model.Priority.HasValue)
                {
                    userStory.Priority = model.Priority.Value;
                }

                if (model.StoryPoints.HasValue)
                {
                    userStory.StoryPoints = model.StoryPoints.Value;
                }

                if (model.AssignedToUserId.HasValue)
                {
                    // Verify assigned user exists if specified
                    if (model.AssignedToUserId.Value > 0)
                    {
                        var assignedUser = await _context.Users
                            .FirstOrDefaultAsync(u => u.Id == model.AssignedToUserId.Value && u.OrganizationId == organizationId);

                        if (assignedUser == null)
                        {
                            return BadRequest(new { Message = "Assigned user not found" });
                        }
                    }

                    userStory.AssignedToUserId = model.AssignedToUserId.Value == 0 ? null : model.AssignedToUserId.Value;
                }

                userStory.UpdatedAt = DateTime.UtcNow;
                userStory.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"{userStories.Count} user stories updated successfully" });
        }

        /// <summary>
        /// Assign multiple user stories to a sprint
        /// </summary>
        [HttpPost("assign-to-sprint")]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner, UserRole.ScrumMaster)]
        public async Task<IActionResult> AssignStoriesToSprint([FromBody] AssignToSprintModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify sprint exists and belongs to the organization
            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == model.SprintId && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return BadRequest(new { Message = "Sprint not found" });
            }

            var userStories = await _context.UserStories
                .Include(us => us.Project)
                .Where(us => model.UserStoryIds.Contains(us.Id) && us.Project.OrganizationId == organizationId && us.IsActive)
                .ToListAsync();

            if (userStories.Count != model.UserStoryIds.Count)
            {
                return BadRequest(new { Message = "Some user stories not found" });
            }

            foreach (var userStory in userStories)
            {
                userStory.SprintId = model.SprintId;
                userStory.Status = UserStoryStatus.InProgress;
                userStory.UpdatedAt = DateTime.UtcNow;
                userStory.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"{userStories.Count} user stories assigned to sprint successfully" });
        }
    }

    // DTOs for backlog management
    public class BulkUpdateBacklogModel
    {
        public int ProjectId { get; set; }
        public List<int> UserStoryIds { get; set; } = new();
        public UserStoryPriority? Priority { get; set; }
        public decimal? StoryPoints { get; set; }
        public int? AssignedToUserId { get; set; }
    }

    public class AssignToSprintModel
    {
        public int SprintId { get; set; }
        public List<int> UserStoryIds { get; set; } = new();
    }
}