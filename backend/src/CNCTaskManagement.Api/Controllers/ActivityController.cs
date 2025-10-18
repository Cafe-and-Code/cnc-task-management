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
        /// Get recent activities for the organization
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetRecentActivities(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? type = null,
            [FromQuery] int? userId = null,
            [FromQuery] int? projectId = null,
            [FromQuery] int? limit = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Apply limit if specified
            if (limit.HasValue && limit.Value > 0)
            {
                pageSize = limit.Value;
                page = 1;
            }

            // Build the base query
            var query = _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId);

            // Filter by entity type
            if (!string.IsNullOrEmpty(type))
            {
                query = query.Where(a => a.EntityType == type);
            }

            // Filter by user
            if (userId.HasValue)
            {
                query = query.Where(a => a.UserId == userId.Value);
            }

            // Filter by project - need to get all related entity IDs
            if (projectId.HasValue)
            {
                // Get project-related entity IDs
                var userStoryIds = await _context.UserStories
                    .Where(us => us.ProjectId == projectId.Value && us.IsActive)
                    .Select(us => us.Id)
                    .ToListAsync();

                var sprintIds = await _context.Sprints
                    .Where(s => s.ProjectId == projectId.Value && s.IsActive)
                    .Select(s => s.Id)
                    .ToListAsync();

                var taskIds = await _context.Tasks
                    .Where(t => userStoryIds.Contains(t.UserStoryId) && t.IsActive)
                    .Select(t => t.Id)
                    .ToListAsync();

                query = query.Where(a =>
                    (a.EntityType == "Project" && a.EntityId == projectId.Value) ||
                    (a.EntityType == "UserStory" && userStoryIds.Contains(a.EntityId)) ||
                    (a.EntityType == "Sprint" && sprintIds.Contains(a.EntityId)) ||
                    (a.EntityType == "Task" && taskIds.Contains(a.EntityId))
                );
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Get the activities
            var activities = await query
                .Include(a => a.User)
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(a => new
                {
                    id = a.Id.ToString(),
                    type = a.EntityType.ToLower(),
                    action = a.Action.ToLower(),
                    entity = GetEntityName(a.EntityType, a.EntityId, a.NewValue ?? a.OldValue),
                    description = GetActivityDescription(a.Action, a.EntityType, a.PropertyName, a.NewValue, a.OldValue),
                    user = a.User != null ? new
                    {
                        id = a.User.Id,
                        name = $"{a.User.FirstName} {a.User.LastName}",
                        avatar = a.User.AvatarUrl
                    } : new
                    {
                        id = 0,
                        name = "System",
                        avatar = (string?)null
                    },
                    timestamp = ((DateTimeOffset)a.CreatedAt).ToUnixTimeMilliseconds(),
                    link = GetEntityLink(a.EntityType, a.EntityId)
                })
                .ToListAsync();

            return Ok(new
            {
                activities,
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

        /// <summary>
        /// Get activity statistics
        /// </summary>
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetActivityStats(
            [FromQuery] int? userId = null,
            [FromQuery] int? projectId = null,
            [FromQuery] string? timeframe = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Set date range based on timeframe
            var endDate = DateTime.UtcNow;
            var startDate = timeframe switch
            {
                "today" => endDate.Date,
                "week" => endDate.AddDays(-7),
                "month" => endDate.AddDays(-30),
                "year" => endDate.AddDays(-365),
                _ => endDate.AddDays(-30) // Default to last month
            };

            var previousEndDate = startDate;
            var previousStartDate = timeframe switch
            {
                "today" => startDate.AddDays(-1),
                "week" => startDate.AddDays(-7),
                "month" => startDate.AddDays(-30),
                "year" => startDate.AddDays(-365),
                _ => startDate.AddDays(-30)
            };

            // Build query
            var query = _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId && a.CreatedAt >= startDate && a.CreatedAt <= endDate);

            var previousQuery = _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId && a.CreatedAt >= previousStartDate && a.CreatedAt <= previousEndDate);

            // Apply filters
            if (userId.HasValue)
            {
                query = query.Where(a => a.UserId == userId.Value);
                previousQuery = previousQuery.Where(a => a.UserId == userId.Value);
            }

            if (projectId.HasValue)
            {
                // Get project-related entity IDs
                var userStoryIds = await _context.UserStories
                    .Where(us => us.ProjectId == projectId.Value && us.IsActive)
                    .Select(us => us.Id)
                    .ToListAsync();

                var sprintIds = await _context.Sprints
                    .Where(s => s.ProjectId == projectId.Value && s.IsActive)
                    .Select(s => s.Id)
                    .ToListAsync();

                var taskIds = await _context.Tasks
                    .Where(t => userStoryIds.Contains(t.UserStoryId) && t.IsActive)
                    .Select(t => t.Id)
                    .ToListAsync();

                query = query.Where(a =>
                    (a.EntityType == "Project" && a.EntityId == projectId.Value) ||
                    (a.EntityType == "UserStory" && userStoryIds.Contains(a.EntityId)) ||
                    (a.EntityType == "Sprint" && sprintIds.Contains(a.EntityId)) ||
                    (a.EntityType == "Task" && taskIds.Contains(a.EntityId))
                );

                previousQuery = previousQuery.Where(a =>
                    (a.EntityType == "Project" && a.EntityId == projectId.Value) ||
                    (a.EntityType == "UserStory" && userStoryIds.Contains(a.EntityId)) ||
                    (a.EntityType == "Sprint" && sprintIds.Contains(a.EntityId)) ||
                    (a.EntityType == "Task" && taskIds.Contains(a.EntityId))
                );
            }

            // Get statistics
            var totalActivities = await query.CountAsync();
            var previousTotal = await previousQuery.CountAsync();

            var activitiesByType = await query
                .GroupBy(a => a.EntityType)
                .Select(g => new { type = g.Key, count = g.Count() })
                .ToListAsync();

            var activitiesByAction = await query
                .GroupBy(a => a.Action)
                .Select(g => new { action = g.Key, count = g.Count() })
                .ToListAsync();

            // Calculate trend
            var trend = previousTotal > 0
                ? Math.Round(((double)(totalActivities - previousTotal) / previousTotal) * 100, 1)
                : (totalActivities > 0 ? 100.0 : 0.0);

            return Ok(new
            {
                totalActivities,
                activitiesByType = activitiesByType.ToDictionary(x => x.type.ToLower(), x => x.count),
                activitiesByAction = activitiesByAction.ToDictionary(x => x.action.ToLower(), x => x.count),
                recentTrend = trend
            });
        }

        #region Helper Methods

        private string GetEntityName(string entityType, int entityId, string? entityData)
        {
            // Try to parse entity name from the audit data first
            if (!string.IsNullOrEmpty(entityData))
            {
                try
                {
                    // For JSON data, try to extract a name field
                    if (entityData.StartsWith("{") && entityData.EndsWith("}"))
                    {
                        var jsonDoc = System.Text.Json.JsonDocument.Parse(entityData);
                        if (jsonDoc.RootElement.TryGetProperty("Name", out var nameProp) ||
                            jsonDoc.RootElement.TryGetProperty("Title", out nameProp) ||
                            jsonDoc.RootElement.TryGetProperty("FirstName", out nameProp))
                        {
                            return nameProp.GetString() ?? $"{entityType} {entityId}";
                        }
                    }
                }
                catch
                {
                    // If JSON parsing fails, fall back to default
                }
            }

            // Fallback to database lookup
            return entityType.ToLower() switch
            {
                "project" => _context.Projects
                    .Where(p => p.Id == entityId)
                    .Select(p => p.Name)
                    .FirstOrDefault() ?? $"Project {entityId}",

                "userstory" => _context.UserStories
                    .Where(us => us.Id == entityId)
                    .Select(us => us.Title)
                    .FirstOrDefault() ?? $"User Story {entityId}",

                "sprint" => _context.Sprints
                    .Where(s => s.Id == entityId)
                    .Select(s => s.Name)
                    .FirstOrDefault() ?? $"Sprint {entityId}",

                "task" => _context.Tasks
                    .Where(t => t.Id == entityId)
                    .Select(t => t.Title)
                    .FirstOrDefault() ?? $"Task {entityId}",

                "user" => _context.Users
                    .Where(u => u.Id == entityId)
                    .Select(u => $"{u.FirstName} {u.LastName}")
                    .FirstOrDefault() ?? $"User {entityId}",

                _ => $"{entityType} {entityId}"
            };
        }

        private string GetActivityDescription(string action, string entityType, string? propertyName, string? newValue, string? oldValue)
        {
            var actionLower = action.ToLower();
            var entityTypeLower = entityType.ToLower();

            return actionLower switch
            {
                "created" => $"New {entityTypeLower} created",
                "updated" when !string.IsNullOrEmpty(propertyName) => $"Updated {propertyName.ToLower()} of {entityTypeLower}",
                "updated" => $"Modified {entityTypeLower}",
                "deleted" => $"Deleted {entityTypeLower}",
                "assigned" when entityTypeLower == "task" => $"Task assigned to {newValue}",
                "completed" => $"{entityTypeLower} marked as completed",
                "started" => $"{entityTypeLower} started",
                "finished" => $"{entityTypeLower} finished",
                "added" => $"Added to {entityTypeLower}",
                "removed" => $"Removed from {entityTypeLower}",
                _ => $"{actionLower} {entityTypeLower}"
            };
        }

        private string? GetEntityLink(string entityType, int entityId)
        {
            return entityType.ToLower() switch
            {
                "project" => $"/projects/{entityId}",
                "userstory" => $"/projects/{GetProjectIdForUserStory(entityId)}/backlog",
                "sprint" => $"/projects/{GetProjectIdForSprint(entityId)}/sprints/{entityId}",
                "task" => $"/projects/{GetProjectIdForTask(entityId)}/kanban",
                _ => null
            };
        }

        private int? GetProjectIdForUserStory(int userStoryId)
        {
            return _context.UserStories
                .Where(us => us.Id == userStoryId)
                .Select(us => us.ProjectId)
                .FirstOrDefault();
        }

        private int? GetProjectIdForSprint(int sprintId)
        {
            return _context.Sprints
                .Where(s => s.Id == sprintId)
                .Select(s => s.ProjectId)
                .FirstOrDefault();
        }

        private int? GetProjectIdForTask(int taskId)
        {
            return _context.Tasks
                .Where(t => t.Id == taskId)
                .Join(_context.UserStories, t => t.UserStoryId, us => us.Id, (t, us) => us.ProjectId)
                .FirstOrDefault();
        }

        #endregion
    }
}