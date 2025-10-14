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