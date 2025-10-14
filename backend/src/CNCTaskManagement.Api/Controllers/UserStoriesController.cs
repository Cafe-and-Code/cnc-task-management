using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;
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
    public class UserStoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserStoriesController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all user stories in a project
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetUserStories(
            [FromQuery] int projectId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] UserStoryStatus? status = null,
            [FromQuery] UserStoryPriority? priority = null)
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
            var query = _context.UserStories
                .Include(us => us.CreatedByUser)
                .Include(us => us.AssignedToUser)
                .Include(us => us.Tasks)
                .Where(us => us.ProjectId == projectId);

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(us =>
                    us.Title.Contains(search) ||
                    (us.Description != null && us.Description.Contains(search)));
            }

            if (status.HasValue)
            {
                query = query.Where(us => us.Status == status.Value);
            }

            if (priority.HasValue)
            {
                query = query.Where(us => us.Priority == priority.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var userStories = await query
                .OrderByDescending(us => us.Priority)
                .ThenByDescending(us => us.CreatedAt)
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
                    Sprint = us.Sprint != null ? new
                    {
                        us.Sprint.Id,
                        us.Sprint.Name,
                        us.Sprint.Status
                    } : null,
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
        /// Get user story by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUserStory(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var userStory = await _context.UserStories
                .Include(us => us.Project)
                .Include(us => us.Sprint)
                .Include(us => us.CreatedByUser)
                .Include(us => us.AssignedToUser)
                .Include(us => us.Tasks)
                    .ThenInclude(t => t.AssignedToUser)
                .Where(us => us.Id == id && us.Project.OrganizationId == organizationId)
                .Select(us => new
                {
                    us.Id,
                    us.Title,
                    us.Description,
                    us.Status,
                    us.Priority,
                    us.StoryPoints,
                    us.BusinessValue,
                    AcceptanceCriteria = us.AcceptanceCriteria != null ? 
                        JsonSerializer.Deserialize<object>(us.AcceptanceCriteria, new JsonSerializerOptions()) : new object(),
                    DueDate = us.DueDate.HasValue ? us.DueDate.Value.ToString("yyyy-MM-dd") : null,
                    us.IsActive,
                    Project = new
                    {
                        us.Project.Id,
                        us.Project.Name
                    },
                    Sprint = us.Sprint != null ? new
                    {
                        us.Sprint.Id,
                        us.Sprint.Name,
                        us.Sprint.Status,
                        us.Sprint.StartDate,
                        us.Sprint.EndDate
                    } : null,
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
                    Tasks = us.Tasks.Where(t => t.IsActive).Select(t => new
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
                        AssignedToUser = t.AssignedToUser != null ? new
                        {
                            t.AssignedToUser.Id,
                            t.AssignedToUser.FirstName,
                            t.AssignedToUser.LastName,
                            t.AssignedToUser.AvatarUrl
                        } : null
                    }).ToList(),
                    us.CreatedAt,
                    us.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (userStory == null)
            {
                return NotFound();
            }

            return Ok(userStory);
        }

        /// <summary>
        /// Create a new user story
        /// </summary>
        [HttpPost]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner, UserRole.ScrumMaster)]
        public async Task<ActionResult<UserStory>> CreateUserStory([FromBody] CreateUserStoryModel model)
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

            var userStory = new UserStory
            {
                Title = model.Title,
                Description = model.Description,
                ProjectId = model.ProjectId,
                SprintId = model.SprintId,
                CreatedByUserId = int.Parse(currentUserId),
                AssignedToUserId = model.AssignedToUserId,
                Status = model.Status,
                Priority = model.Priority,
                StoryPoints = model.StoryPoints,
                BusinessValue = model.BusinessValue,
                AcceptanceCriteria = model.AcceptanceCriteria != null ? 
                    JsonSerializer.Serialize(model.AcceptanceCriteria) : "[]",
                DueDate = model.DueDate,
                IsActive = true
            };

            _context.UserStories.Add(userStory);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserStory), new { id = userStory.Id }, userStory);
        }

        /// <summary>
        /// Update a user story
        /// </summary>
        [HttpPut("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner, UserRole.ScrumMaster)]
        public async Task<IActionResult> UpdateUserStory(int id, [FromBody] UpdateUserStoryModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var userStory = await _context.UserStories
                .Include(us => us.Project)
                .FirstOrDefaultAsync(us => us.Id == id && us.Project.OrganizationId == organizationId);

            if (userStory == null)
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

            userStory.Title = model.Title ?? userStory.Title;
            userStory.Description = model.Description ?? userStory.Description;
            userStory.SprintId = model.SprintId ?? userStory.SprintId;
            userStory.AssignedToUserId = model.AssignedToUserId ?? userStory.AssignedToUserId;
            userStory.Status = model.Status ?? userStory.Status;
            userStory.Priority = model.Priority ?? userStory.Priority;
            userStory.StoryPoints = model.StoryPoints ?? userStory.StoryPoints;
            userStory.BusinessValue = model.BusinessValue ?? userStory.BusinessValue;
            userStory.AcceptanceCriteria = model.AcceptanceCriteria != null ? 
                JsonSerializer.Serialize(model.AcceptanceCriteria) : userStory.AcceptanceCriteria;
            userStory.DueDate = model.DueDate ?? userStory.DueDate;
            userStory.UpdatedAt = DateTime.UtcNow;
            userStory.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User story updated successfully" });
        }

        /// <summary>
        /// Delete a user story
        /// </summary>
        [HttpDelete("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner)]
        public async Task<IActionResult> DeleteUserStory(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var userStory = await _context.UserStories
                .Include(us => us.Project)
                .FirstOrDefaultAsync(us => us.Id == id && us.Project.OrganizationId == organizationId);

            if (userStory == null)
            {
                return NotFound();
            }

            // Deactivate the user story
            userStory.IsActive = false;
            userStory.UpdatedAt = DateTime.UtcNow;
            userStory.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User story deleted successfully" });
        }
    }

    // DTOs for user story management
    public class CreateUserStoryModel
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int ProjectId { get; set; }
        public int? SprintId { get; set; }
        public int? AssignedToUserId { get; set; }
        public UserStoryStatus Status { get; set; } = UserStoryStatus.Backlog;
        public UserStoryPriority Priority { get; set; } = UserStoryPriority.Medium;
        public decimal StoryPoints { get; set; } = 0;
        public decimal BusinessValue { get; set; } = 0;
        public object? AcceptanceCriteria { get; set; }
        public DateTime? DueDate { get; set; }
    }

    public class UpdateUserStoryModel
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public int? SprintId { get; set; }
        public int? AssignedToUserId { get; set; }
        public UserStoryStatus? Status { get; set; }
        public UserStoryPriority? Priority { get; set; }
        public decimal? StoryPoints { get; set; }
        public decimal? BusinessValue { get; set; }
        public object? AcceptanceCriteria { get; set; }
        public DateTime? DueDate { get; set; }
    }
}