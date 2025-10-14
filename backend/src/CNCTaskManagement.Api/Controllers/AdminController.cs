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
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AdminController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get admin dashboard statistics
        /// </summary>
        [HttpGet("dashboard")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetDashboardStatistics()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Get organization statistics
            var organization = await _context.Organizations
                .FirstOrDefaultAsync(o => o.Id == organizationId);

            if (organization == null)
            {
                return BadRequest(new { Message = "Organization not found" });
            }

            // Get user statistics
            var totalUsers = await _context.Users
                .CountAsync(u => u.OrganizationId == organizationId);

            var activeUsers = await _context.Users
                .CountAsync(u => u.OrganizationId == organizationId && u.IsActive);

            var usersByRole = await _context.Users
                .Where(u => u.OrganizationId == organizationId)
                .GroupBy(u => u.Role)
                .Select(g => new { Role = g.Key.ToString(), Count = g.Count() })
                .ToListAsync();

            // Get project statistics
            var totalProjects = await _context.Projects
                .CountAsync(p => p.OrganizationId == organizationId);

            var activeProjects = await _context.Projects
                .CountAsync(p => p.OrganizationId == organizationId && p.Status == ProjectStatus.Active);

            var completedProjects = await _context.Projects
                .CountAsync(p => p.OrganizationId == organizationId && p.Status == ProjectStatus.Completed);

            // Get sprint statistics
            var activeSprints = await _context.Sprints
                .Include(s => s.Project)
                .CountAsync(s => s.Project.OrganizationId == organizationId && s.Status == SprintStatus.Active);

            var completedSprints = await _context.Sprints
                .Include(s => s.Project)
                .CountAsync(s => s.Project.OrganizationId == organizationId && s.Status == SprintStatus.Completed);

            // Get task statistics
            var totalTasks = await _context.Tasks
                .Include(t => t.UserStory)
                    .ThenInclude(us => us.Project)
                .CountAsync(t => t.UserStory.Project.OrganizationId == organizationId && t.IsActive);

            var completedTasks = await _context.Tasks
                .Include(t => t.UserStory)
                    .ThenInclude(us => us.Project)
                .CountAsync(t => t.UserStory.Project.OrganizationId == organizationId && t.IsActive && t.Status == TaskStatus.Completed);

            // Get team statistics
            var totalTeams = await _context.Teams
                .CountAsync(t => t.OrganizationId == organizationId && t.IsActive);

            // Get recent activity
            var recentActivity = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId)
                .OrderByDescending(a => a.CreatedAt)
                .Take(10)
                .Select(a => new
                {
                    a.Id,
                    a.Action,
                    a.EntityType,
                    a.EntityId,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                organization = new
                {
                    organization.Id,
                    organization.Name,
                    organization.CreatedAt
                },
                userStatistics = new
                {
                    totalUsers,
                    activeUsers,
                    inactiveUsers = totalUsers - activeUsers,
                    usersByRole
                },
                projectStatistics = new
                {
                    totalProjects,
                    activeProjects,
                    completedProjects,
                    pendingProjects = totalProjects - activeProjects - completedProjects
                },
                sprintStatistics = new
                {
                    activeSprints,
                    completedSprints
                },
                taskStatistics = new
                {
                    totalTasks,
                    completedTasks,
                    pendingTasks = totalTasks - completedTasks,
                    completionPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0
                },
                teamStatistics = new
                {
                    totalTeams
                },
                recentActivity
            });
        }

        /// <summary>
        /// Get workspace overview
        /// </summary>
        [HttpGet("workspace-overview")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetWorkspaceOverview()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Get projects overview
            var projectsOverview = await _context.Projects
                .Where(p => p.OrganizationId == organizationId)
                .Include(p => p.Sprints)
                .Include(p => p.UserStories)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    p.Status,
                    p.StartDate,
                    p.EndDate,
                    SprintCount = p.Sprints.Count,
                    UserStoryCount = p.UserStories.Count(us => us.IsActive),
                    CompletedUserStoryCount = p.UserStories.Count(us => us.IsActive && us.Status == UserStoryStatus.Completed),
                    CreatedAt = p.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            // Get teams overview
            var teamsOverview = await _context.Teams
                .Where(t => t.OrganizationId == organizationId && t.IsActive)
                .Include(t => t.Members)
                    .ThenInclude(tm => tm.User)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    MemberCount = t.Members.Count,
                    Members = t.Members.Select(m => new
                    {
                        MemberId = m.Id,
                        User = new
                        {
                            m.User.Id,
                            m.User.FirstName,
                            m.User.LastName,
                            m.User.Role,
                            m.User.AvatarUrl
                        },
                        Role = m.Role
                    }).ToList(),
                    CreatedAt = t.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            // Get recent user activities
            var recentUserActivities = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId)
                .Where(a => a.Action == "Modified" || a.Action == "Added")
                .OrderByDescending(a => a.CreatedAt)
                .Take(20)
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
                projectsOverview,
                teamsOverview,
                recentUserActivities
            });
        }

        /// <summary>
        /// Get user management data
        /// </summary>
        [HttpGet("user-management")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetUserManagement(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] UserRole? role = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Start with base query
            var query = _context.Users
                .Where(u => u.OrganizationId == organizationId);

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u => 
                    u.FirstName.ToLower().Contains(search.ToLower()) ||
                    u.LastName.ToLower().Contains(search.ToLower()) ||
                    u.Email.ToLower().Contains(search.ToLower()));
            }

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Include(u => u.TeamMemberships)
                    .ThenInclude(tm => tm.Team)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.Role,
                    u.IsActive,
                    Teams = u.TeamMemberships.Select(tm => new
                    {
                        TeamMemberId = tm.Id,
                        Team = new
                        {
                            tm.Team.Id,
                            tm.Team.Name
                        },
                        Role = tm.Role
                    }).ToList(),
                    CreatedAt = u.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss"),
                    LastLoginAt = u.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                users,
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
        /// Activate or deactivate a user
        /// </summary>
        [HttpPut("users/{userId}/toggle-status")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> ToggleUserStatus(int userId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var currentUserIdInt = int.Parse(currentUserId);

            // Don't allow admin to deactivate themselves
            if (currentUserIdInt == userId)
            {
                return BadRequest(new { Message = "You cannot deactivate your own account" });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.OrganizationId == organizationId);

            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            user.IsActive = !user.IsActive;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                Message = $"User successfully {(user.IsActive ? "activated" : "deactivated")}",
                IsActive = user.IsActive
            });
        }

        /// <summary>
        /// Change user role
        /// </summary>
        [HttpPut("users/{userId}/role")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> ChangeUserRole(int userId, [FromBody] ChangeUserRoleModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var currentUserIdInt = int.Parse(currentUserId);

            // Don't allow admin to change their own role
            if (currentUserIdInt == userId)
            {
                return BadRequest(new { Message = "You cannot change your own role" });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == userId && u.OrganizationId == organizationId);

            if (user == null)
            {
                return NotFound(new { Message = "User not found" });
            }

            var previousRole = user.Role;
            user.Role = model.Role;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                Message = "User role changed successfully",
                PreviousRole = previousRole.ToString(),
                NewRole = user.Role.ToString()
            });
        }

        /// <summary>
        /// Get system health and performance metrics
        /// </summary>
        [HttpGet("system-health")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetSystemHealth()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Get database metrics
            var totalRecords = await _context.Users
                .CountAsync(u => u.OrganizationId == organizationId);
            
            // Get memory usage (simplified)
            var memoryUsage = GC.GetTotalMemory(false) / (1024 * 1024); // MB
            
            // Get uptime (simplified)
            var uptime = DateTime.UtcNow.Subtract(System.Diagnostics.Process.GetCurrentProcess().StartTime);

            return Ok(new
            {
                database = new
                {
                    totalRecords
                },
                application = new
                {
                    memoryUsageMB = memoryUsage,
                    uptime = uptime.ToString(@"dd\.hh\:mm\:ss"),
                    version = "1.0.0"
                },
                timestamp = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss")
            });
        }
    }

    // DTOs for admin management
    public class ChangeUserRoleModel
    {
        public UserRole Role { get; set; }
    }
}