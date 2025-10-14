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
    public class ActivityController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ActivityController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get activity feed for a project
        /// </summary>
        [HttpGet("project/{projectId}")]
        public async Task<ActionResult<object>> GetProjectActivity(
            int projectId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
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

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? endDate.Value.AddDays(-30);

            // Get all entities related to the project
            var userStoryIds = await _context.UserStories
                .Where(us => us.ProjectId == projectId && us.IsActive)
                .Select(us => us.Id)
                .ToListAsync();

            var sprintIds = await _context.Sprints
                .Where(s => s.ProjectId == projectId && s.IsActive)
                .Select(s => s.Id)
                .ToListAsync();

            var taskIds = await _context.Tasks
                .Where(t => userStoryIds.Contains(t.UserStoryId) && t.IsActive)
                .Select(t => t.Id)
                .ToListAsync();

            // Get all audit entries for the project entities
            var auditEntries = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           (
                               // Direct project changes
                               a.EntityType == "Project" && a.EntityId == projectId ||
                               // User story changes
                               a.EntityType == "UserStory" && userStoryIds.Contains(a.EntityId) ||
                               // Sprint changes
                               a.EntityType == "Sprint" && sprintIds.Contains(a.EntityId) ||
                               // Task changes
                               a.EntityType == "Task" && taskIds.Contains(a.EntityId)
                           ))
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.PropertyName,
                    a.OldValue,
                    a.NewValue,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    UserAvatar = a.User != null ? a.User.AvatarUrl : null,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                projectId,
                projectName = project.Name,
                activities = auditEntries,
                pagination = new
                {
                    page,
                    pageSize,
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }

        /// <summary>
        /// Get activity feed for a sprint
        /// </summary>
        [HttpGet("sprint/{sprintId}")]
        public async Task<ActionResult<object>> GetSprintActivity(
            int sprintId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
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
                .FirstOrDefaultAsync(s => s.Id == sprintId && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return BadRequest(new { Message = "Sprint not found" });
            }

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? sprint.StartDate;

            // Get all user stories in the sprint
            var userStoryIds = await _context.UserStories
                .Where(us => us.SprintId == sprintId && us.IsActive)
                .Select(us => us.Id)
                .ToListAsync();

            var taskIds = await _context.Tasks
                .Where(t => userStoryIds.Contains(t.UserStoryId) && t.IsActive)
                .Select(t => t.Id)
                .ToListAsync();

            // Get all audit entries for the sprint entities
            var auditEntries = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           (
                               // Sprint changes
                               a.EntityType == "Sprint" && a.EntityId == sprintId ||
                               // User story changes
                               a.EntityType == "UserStory" && userStoryIds.Contains(a.EntityId) ||
                               // Task changes
                               a.EntityType == "Task" && taskIds.Contains(a.EntityId)
                           ))
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.PropertyName,
                    a.OldValue,
                    a.NewValue,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    UserAvatar = a.User != null ? a.User.AvatarUrl : null,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                sprintId,
                sprintName = sprint.Name,
                activities = auditEntries,
                pagination = new
                {
                    page,
                    pageSize,
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }

        /// <summary>
        /// Get activity feed for a user story
        /// </summary>
        [HttpGet("user-story/{userStoryId}")]
        public async Task<ActionResult<object>> GetUserStoryActivity(
            int userStoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
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

            // Get all tasks in the user story
            var taskIds = await _context.Tasks
                .Where(t => t.UserStoryId == userStoryId && t.IsActive)
                .Select(t => t.Id)
                .ToListAsync();

            // Get all audit entries for the user story entities
            var auditEntries = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           (
                               // User story changes
                               a.EntityType == "UserStory" && a.EntityId == userStoryId ||
                               // Task changes
                               a.EntityType == "Task" && taskIds.Contains(a.EntityId)
                           ))
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.PropertyName,
                    a.OldValue,
                    a.NewValue,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    UserAvatar = a.User != null ? a.User.AvatarUrl : null,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                userStoryId,
                userStoryTitle = userStory.Title,
                activities = auditEntries,
                pagination = new
                {
                    page,
                    pageSize
                }
            });
        }

        /// <summary>
        /// Get activity feed for the current user
        /// </summary>
        [HttpGet("my-activity")]
        public async Task<ActionResult<object>> GetMyActivity(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? endDate.Value.AddDays(-30);

            // Get all audit entries for the user
            var auditEntries = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           a.UserId == userIdInt)
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    a.PropertyName,
                    a.OldValue,
                    a.NewValue,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    UserAvatar = a.User != null ? a.User.AvatarUrl : null,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                activities = auditEntries,
                pagination = new
                {
                    page,
                    pageSize,
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }
    }
}