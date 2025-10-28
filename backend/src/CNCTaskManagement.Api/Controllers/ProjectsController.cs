using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProjectsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all projects in the organization
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetProjects(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] ProjectStatus? status = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Start with base query
            var query = _context.Projects
                .Include(p => p.ProductOwner)
                .Include(p => p.ScrumMaster)
                .Include(p => p.Teams)
                .Where(p => p.OrganizationId == organizationId);

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(p =>
                    p.Name.Contains(search) ||
                    (p.Description != null && p.Description.Contains(search)));
            }

            if (status.HasValue)
            {
                query = query.Where(p => p.Status == status.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var projects = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Status,
                    StartDate = p.StartDate.HasValue ? p.StartDate.Value.ToString("yyyy-MM-dd") : null,
                    EndDate = p.EndDate.HasValue ? p.EndDate.Value.ToString("yyyy-MM-dd") : null,
                    p.VelocityGoal,
                    p.SprintDuration,
                    p.IsActive,
                    ProductOwner = p.ProductOwner != null ? new
                    {
                        p.ProductOwner.Id,
                        p.ProductOwner.FirstName,
                        p.ProductOwner.LastName,
                        p.ProductOwner.Email,
                        p.ProductOwner.AvatarUrl
                    } : null,
                    ScrumMaster = p.ScrumMaster != null ? new
                    {
                        p.ScrumMaster.Id,
                        p.ScrumMaster.FirstName,
                        p.ScrumMaster.LastName,
                        p.ScrumMaster.Email,
                        p.ScrumMaster.AvatarUrl
                    } : null,
                    TeamCount = p.Teams.Count(t => t.IsActive),
                    p.CreatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                projects,
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
        /// Get project by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetProject(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var project = await _context.Projects
                .Include(p => p.ProductOwner)
                .Include(p => p.ScrumMaster)
                .Include(p => p.Teams)
                    .ThenInclude(t => t.Members)
                        .ThenInclude(tm => tm.User)
                .Include(p => p.Sprints)
                .Where(p => p.Id == id && p.OrganizationId == organizationId)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Status,
                    StartDate = p.StartDate.HasValue ? p.StartDate.Value.ToString("yyyy-MM-dd") : null,
                    EndDate = p.EndDate.HasValue ? p.EndDate.Value.ToString("yyyy-MM-dd") : null,
                    p.VelocityGoal,
                    p.SprintDuration,
                    p.IsActive,
                    ProductOwner = p.ProductOwner != null ? new
                    {
                        p.ProductOwner.Id,
                        p.ProductOwner.FirstName,
                        p.ProductOwner.LastName,
                        p.ProductOwner.Email,
                        p.ProductOwner.AvatarUrl
                    } : null,
                    ScrumMaster = p.ScrumMaster != null ? new
                    {
                        p.ScrumMaster.Id,
                        p.ScrumMaster.FirstName,
                        p.ScrumMaster.LastName,
                        p.ScrumMaster.Email,
                        p.ScrumMaster.AvatarUrl
                    } : null,
                    Teams = p.Teams.Where(t => t.IsActive).Select(t => new
                    {
                        t.Id,
                        t.Name,
                        t.Description,
                        MemberCount = t.Members.Count(m => m.IsActive)
                    }).ToList(),
                    ActiveSprintCount = p.Sprints.Count(s => s.IsActive),
                    p.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (project == null)
            {
                return NotFound();
            }

            return Ok(project);
        }

        /// <summary>
        /// Get project backlog (user stories not assigned to sprints)
        /// </summary>
        [HttpGet("{id}/backlog")]
        public async Task<ActionResult<object>> GetProjectBacklog(
            int id,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20,
            [FromQuery] string? search = null,
            [FromQuery] UserStoryPriority? priority = null,
            [FromQuery] UserStoryStatus? status = null,
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
                .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId);

            if (project == null)
            {
                return NotFound(new { Message = "Project not found" });
            }

            // Start with base query - get user stories that are in backlog (not assigned to sprints)
            var query = _context.UserStories
                .Include(us => us.CreatedByUser)
                .Include(us => us.AssignedToUser)
                .Include(us => us.Tasks)
                    .ThenInclude(t => t.AssignedToUser)
                .Where(us => us.ProjectId == id && us.SprintId == null && us.IsActive);

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
                    CompletedTaskCount = us.Tasks.Count(t => t.IsActive && t.Status == Core.Enums.TaskStatus.Completed),
                    TotalEstimatedHours = us.Tasks.Where(t => t.IsActive).Sum(t => t.EstimatedHours),
                    AcceptanceCriteria = us.AcceptanceCriteria != null ?
                        System.Text.Json.JsonSerializer.Deserialize<object>(us.AcceptanceCriteria, new System.Text.Json.JsonSerializerOptions()) : new object(),
                    us.CreatedAt,
                    us.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                items = userStories,
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
        /// Get project sprints for a project
        /// </summary>
        [HttpGet("{id}/sprints")]
        public async Task<ActionResult<object>> GetProjectSprints(
            int id,
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
                .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId);

            if (project == null)
            {
                return NotFound(new { Message = "Project not found" });
            }

            // Start with base query - get sprints for the project
            var query = _context.Sprints
                .Include(s => s.UserStories)
                .Where(s => s.ProjectId == id && s.IsActive);

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
                    Goal = s.Description,
                    s.Status,
                    StartDate = s.StartDate.ToString("yyyy-MM-dd"),
                    EndDate = s.EndDate.ToString("yyyy-MM-dd"),
                    Capacity = s.VelocityGoal,
                    Velocity = s.VelocityActual,
                    StoryCount = s.UserStories.Count(us => us.IsActive),
                    TaskCount = s.UserStories.SelectMany(us => us.Tasks).Count(t => t.IsActive),
                    CompletedTasks = s.UserStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status == Core.Enums.TaskStatus.Completed),
                    RemainingTasks = s.UserStories.SelectMany(us => us.Tasks).Count(t => t.IsActive && t.Status != Core.Enums.TaskStatus.Completed),
                    s.CreatedAt,
                    s.UpdatedAt
                })
                .ToListAsync();

            return Ok(new
            {
                items = sprints,
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
        /// Create a new project
        /// </summary>
        [HttpPost]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner)]
        public async Task<ActionResult<Project>> CreateProject([FromBody] CreateProjectModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify product owner exists if specified
            if (model.ProductOwnerId.HasValue)
            {
                var productOwner = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == model.ProductOwnerId.Value && u.OrganizationId == organizationId);

                if (productOwner == null)
                {
                    return BadRequest(new { Message = "Product owner not found" });
                }
            }

            // Verify scrum master exists if specified
            if (model.ScrumMasterId.HasValue)
            {
                var scrumMaster = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == model.ScrumMasterId.Value && u.OrganizationId == organizationId);

                if (scrumMaster == null)
                {
                    return BadRequest(new { Message = "Scrum master not found" });
                }
            }

            var project = new Project
            {
                Name = model.Name,
                Description = model.Description,
                ProductOwnerId = model.ProductOwnerId,
                ScrumMasterId = model.ScrumMasterId,
                Status = model.Status,
                StartDate = model.StartDate,
                EndDate = model.EndDate,
                VelocityGoal = model.VelocityGoal,
                SprintDuration = model.SprintDuration,
                OrganizationId = organizationId,
                IsActive = true
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProject), new { id = project.Id }, project);
        }

        /// <summary>
        /// Update a project
        /// </summary>
        [HttpPut("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ProductOwner, UserRole.ScrumMaster)]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId);

            if (project == null)
            {
                return NotFound();
            }

            // Verify product owner exists if specified
            if (model.ProductOwnerId.HasValue)
            {
                var productOwner = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == model.ProductOwnerId.Value && u.OrganizationId == organizationId);

                if (productOwner == null)
                {
                    return BadRequest(new { Message = "Product owner not found" });
                }
            }

            // Verify scrum master exists if specified
            if (model.ScrumMasterId.HasValue)
            {
                var scrumMaster = await _context.Users
                    .FirstOrDefaultAsync(u => u.Id == model.ScrumMasterId.Value && u.OrganizationId == organizationId);

                if (scrumMaster == null)
                {
                    return BadRequest(new { Message = "Scrum master not found" });
                }
            }

            project.Name = model.Name ?? project.Name;
            project.Description = model.Description ?? project.Description;
            project.ProductOwnerId = model.ProductOwnerId ?? project.ProductOwnerId;
            project.ScrumMasterId = model.ScrumMasterId ?? project.ScrumMasterId;
            project.Status = model.Status ?? project.Status;
            project.StartDate = model.StartDate ?? project.StartDate;
            project.EndDate = model.EndDate ?? project.EndDate;
            project.VelocityGoal = model.VelocityGoal ?? project.VelocityGoal;
            project.SprintDuration = model.SprintDuration ?? project.SprintDuration;
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Project updated successfully" });
        }

        /// <summary>
        /// Delete a project
        /// </summary>
        [HttpDelete("{id}")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.OrganizationId == organizationId);

            if (project == null)
            {
                return NotFound();
            }

            // Deactivate the project
            project.IsActive = false;
            project.UpdatedAt = DateTime.UtcNow;
            project.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Project deleted successfully" });
        }
    }

    // DTOs for project management
    public class CreateProjectModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ProductOwnerId { get; set; }
        public int? ScrumMasterId { get; set; }
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal VelocityGoal { get; set; } = 0;
        public int SprintDuration { get; set; } = 14;
    }

    public class UpdateProjectModel
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? ProductOwnerId { get; set; }
        public int? ScrumMasterId { get; set; }
        public ProjectStatus? Status { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? VelocityGoal { get; set; }
        public int? SprintDuration { get; set; }
    }
}
