using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;
using CNCTaskManagement.Api.Services;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class SecurityController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEncryptionService _encryptionService;

        public SecurityController(AppDbContext context, IEncryptionService encryptionService)
        {
            _context = context;
            _encryptionService = encryptionService;
        }

        /// <summary>
        /// Get audit logs for security monitoring
        /// </summary>
        [HttpGet("audit-logs")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetAuditLogs(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? entityType = null,
            [FromQuery] string? action = null,
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

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? endDate.Value.AddDays(-30);

            // Start with base query
            var query = _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate);

            // Apply filters
            if (!string.IsNullOrEmpty(entityType))
            {
                query = query.Where(a => a.EntityType == entityType);
            }

            if (!string.IsNullOrEmpty(action))
            {
                query = query.Where(a => a.Action == action);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var auditLogs = await query
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
                    a.Details,
                    UserName = a.User != null ? $"{a.User.FirstName} {a.User.LastName}" : "System",
                    UserAvatar = a.User != null ? a.User.AvatarUrl : null,
                    a.IpAddress,
                    a.UserAgent,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                auditLogs,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling((double)totalCount / pageSize),
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }

        /// <summary>
        /// Get security events and incidents
        /// </summary>
        [HttpGet("security-events")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetSecurityEvents(
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

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? endDate.Value.AddDays(-7); // Default to last 7 days

            // Get failed login attempts
            var failedLogins = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           a.Action == "FailedLogin")
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new SecurityEvent
                {
                    Id = a.Id,
                    Type = "FailedLogin",
                    UserEmail = a.User != null ? a.User.Email : "Unknown",
                    OldValue = null,
                    NewValue = null,
                    IpAddress = a.IpAddress,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            // Get password reset requests
            var passwordResets = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           a.Action == "PasswordReset")
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new SecurityEvent
                {
                    Id = a.Id,
                    Type = "PasswordReset",
                    UserEmail = a.User != null ? a.User.Email : "Unknown",
                    OldValue = null,
                    NewValue = null,
                    IpAddress = a.IpAddress,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            // Get role changes
            var roleChanges = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           a.EntityType == "User" &&
                           a.PropertyName == "Role")
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new SecurityEvent
                {
                    Id = a.Id,
                    Type = "RoleChange",
                    UserEmail = a.User != null ? a.User.Email : "Unknown",
                    OldValue = a.OldValue,
                    NewValue = a.NewValue,
                    IpAddress = a.IpAddress,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            // Get user deactivation/activation
            var userStatusChanges = await _context.AuditLogs
                .Include(a => a.User)
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= startDate &&
                           a.CreatedAt <= endDate &&
                           a.EntityType == "User" &&
                           a.PropertyName == "IsActive")
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new SecurityEvent
                {
                    Id = a.Id,
                    Type = "UserStatusChange",
                    UserEmail = a.User != null ? a.User.Email : "Unknown",
                    OldValue = a.OldValue,
                    NewValue = a.NewValue,
                    IpAddress = a.IpAddress,
                    CreatedAt = a.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            // Combine all security events
            var allEvents = failedLogins
                .Concat(passwordResets)
                .Concat(roleChanges)
                .Concat(userStatusChanges)
                .OrderByDescending(e => DateTime.Parse(e.CreatedAt))
                .ToList();

            // Apply pagination
            var pagedEvents = allEvents
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return Ok(new
            {
                securityEvents = pagedEvents,
                pagination = new
                {
                    page,
                    pageSize,
                    totalCount = allEvents.Count,
                    totalPages = (int)Math.Ceiling((double)allEvents.Count / pageSize),
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }

        /// <summary>
        /// Get security statistics
        /// </summary>
        [HttpGet("statistics")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> GetSecurityStatistics()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var last7Days = DateTime.UtcNow.AddDays(-7);
            var last30Days = DateTime.UtcNow.AddDays(-30);

            // Get failed login attempts
            var failedLoginsLast7Days = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= last7Days &&
                           a.Action == "FailedLogin")
                .CountAsync();

            var failedLoginsLast30Days = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= last30Days &&
                           a.Action == "FailedLogin")
                .CountAsync();

            // Get password reset requests
            var passwordResetsLast7Days = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= last7Days &&
                           a.Action == "PasswordReset")
                .CountAsync();

            var passwordResetsLast30Days = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= last30Days &&
                           a.Action == "PasswordReset")
                .CountAsync();

            // Get active users
            var activeUsers = await _context.Users
                .Where(u => u.OrganizationId == organizationId && u.IsActive)
                .CountAsync();

            // Get inactive users
            var inactiveUsers = await _context.Users
                .Where(u => u.OrganizationId == organizationId && !u.IsActive)
                .CountAsync();

            // Get recent failed login attempts with unique IPs
            var recentFailedLogins = await _context.AuditLogs
                .Where(a => a.OrganizationId == organizationId &&
                           a.CreatedAt >= last7Days &&
                           a.Action == "FailedLogin" &&
                           !string.IsNullOrEmpty(a.IpAddress))
                .GroupBy(a => a.IpAddress)
                .Select(g => new
                {
                    IpAddress = g.Key,
                    AttemptCount = g.Count(),
                    LastAttemptAt = g.Max(a => a.CreatedAt).ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .OrderByDescending(g => g.AttemptCount)
                .Take(10)
                .ToListAsync();

            return Ok(new
            {
                failedLogins = new
                {
                    last7Days = failedLoginsLast7Days,
                    last30Days = failedLoginsLast30Days
                },
                passwordResets = new
                {
                    last7Days = passwordResetsLast7Days,
                    last30Days = passwordResetsLast30Days
                },
                users = new
                {
                    active = activeUsers,
                    inactive = inactiveUsers
                },
                suspiciousIPs = recentFailedLogins
            });
        }

        /// <summary>
        /// Encrypt sensitive data
        /// </summary>
        [HttpPost("encrypt")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> EncryptData([FromBody] EncryptDataModel model)
        {
            if (string.IsNullOrEmpty(model.Data))
            {
                return BadRequest(new { Message = "Data to encrypt is required" });
            }

            try
            {
                var encryptedData = _encryptionService.Encrypt(model.Data);

                // Log the encryption attempt
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

                if (currentUserOrganizationId != null && currentUserId != null)
                {
                    var organizationId = int.Parse(currentUserOrganizationId);

                    var auditLog = new AuditLog
                    {
                        Action = "DataEncryption",
                        EntityType = "Security",
                        EntityId = 0,
                        UserId = int.Parse(currentUserId),
                        OrganizationId = organizationId,
                        Details = "Data encrypted by admin",
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = currentUserId
                    };

                    _context.AuditLogs.Add(auditLog);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { EncryptedData = encryptedData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to encrypt data", Error = ex.Message });
            }
        }

        /// <summary>
        /// Decrypt sensitive data
        /// </summary>
        [HttpPost("decrypt")]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<object>> DecryptData([FromBody] DecryptDataModel model)
        {
            if (string.IsNullOrEmpty(model.Data))
            {
                return BadRequest(new { Message = "Data to decrypt is required" });
            }

            try
            {
                var decryptedData = _encryptionService.Decrypt(model.Data);

                // Log the decryption attempt
                var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

                if (currentUserOrganizationId != null && currentUserId != null)
                {
                    var organizationId = int.Parse(currentUserOrganizationId);

                    var auditLog = new AuditLog
                    {
                        Action = "DataDecryption",
                        EntityType = "Security",
                        EntityId = 0,
                        UserId = int.Parse(currentUserId),
                        OrganizationId = organizationId,
                        Details = "Data decrypted by admin",
                        CreatedAt = DateTime.UtcNow,
                        CreatedBy = currentUserId
                    };

                    _context.AuditLogs.Add(auditLog);
                    await _context.SaveChangesAsync();
                }

                return Ok(new { DecryptedData = decryptedData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Failed to decrypt data", Error = ex.Message });
            }
        }
    }

    // DTOs for security operations
    public class EncryptDataModel
    {
        public string Data { get; set; } = string.Empty;
    }

    public class DecryptDataModel
    {
        public string Data { get; set; } = string.Empty;
    }

    // Common class for security events
    public class SecurityEvent
    {
        public int Id { get; set; }
        public string Type { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? OldValue { get; set; }
        public string? NewValue { get; set; }
        public string? IpAddress { get; set; }
        public string CreatedAt { get; set; } = string.Empty;
    }
}