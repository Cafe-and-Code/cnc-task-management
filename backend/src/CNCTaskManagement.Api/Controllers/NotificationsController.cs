using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;
using CNCTaskManagement.Api.Hubs;
using Task = CNCTaskManagement.Core.Entities.Task;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IHubContext<NotificationHub> _hubContext;

        public NotificationsController(AppDbContext context, IHubContext<NotificationHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        /// <summary>
        /// Get all notifications for the current user
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetNotifications(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? isRead = null,
            [FromQuery] NotificationType? type = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            // Start with base query
            var query = _context.Notifications
                .Where(n => n.UserId == userIdInt && n.OrganizationId == organizationId && n.IsActive);

            // Apply filters
            if (isRead.HasValue)
            {
                query = query.Where(n => n.IsRead == isRead.Value);
            }

            if (type.HasValue)
            {
                query = query.Where(n => n.Type == type.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var notifications = await query
                .OrderByDescending(n => n.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(n => new
                {
                    n.Id,
                    n.Title,
                    n.Message,
                    n.Type,
                    n.RelatedEntityType,
                    n.RelatedEntityId,
                    n.ActionUrl,
                    n.IsRead,
                    ReadAt = n.ReadAt.HasValue ? n.ReadAt.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null,
                    CreatedAt = n.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                notifications,
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
        /// Get notification by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetNotification(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userIdInt && n.OrganizationId == organizationId && n.IsActive);

            if (notification == null)
            {
                return NotFound();
            }

            return Ok(new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.RelatedEntityType,
                notification.RelatedEntityId,
                notification.ActionUrl,
                notification.IsRead,
                ReadAt = notification.ReadAt.HasValue ? notification.ReadAt.Value.ToString("yyyy-MM-ddTHH:mm:ss") : null,
                CreatedAt = notification.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
            });
        }

        /// <summary>
        /// Mark notification as read
        /// </summary>
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkNotificationAsRead(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userIdInt && n.OrganizationId == organizationId && n.IsActive);

            if (notification == null)
            {
                return NotFound();
            }

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            notification.UpdatedAt = DateTime.UtcNow;
            notification.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification marked as read" });
        }

        /// <summary>
        /// Mark all notifications as read
        /// </summary>
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllNotificationsAsRead()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userIdInt && n.OrganizationId == organizationId && n.IsActive && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
                notification.UpdatedAt = DateTime.UtcNow;
                notification.UpdatedBy = currentUserId;
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = $"Marked {notifications.Count} notifications as read" });
        }

        /// <summary>
        /// Delete a notification
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == id && n.UserId == userIdInt && n.OrganizationId == organizationId && n.IsActive);

            if (notification == null)
            {
                return NotFound();
            }

            // Deactivate the notification
            notification.IsActive = false;
            notification.UpdatedAt = DateTime.UtcNow;
            notification.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Notification deleted successfully" });
        }

        /// <summary>
        /// Get unread notification count
        /// </summary>
        [HttpGet("unread-count")]
        public async Task<ActionResult<object>> GetUnreadNotificationCount()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            var unreadCount = await _context.Notifications
                .CountAsync(n => n.UserId == userIdInt && n.OrganizationId == organizationId && n.IsActive && !n.IsRead);

            return Ok(new { unreadCount });
        }

        /// <summary>
        /// Create a notification (internal use)
        /// </summary>
        [HttpPost]
        [RequireRole(UserRole.Admin)]
        public async Task<ActionResult<Notification>> CreateNotification([FromBody] CreateNotificationModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify user exists and belongs to the organization
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == model.UserId && u.OrganizationId == organizationId);

            if (user == null)
            {
                return BadRequest(new { Message = "User not found" });
            }

            var notification = new Notification
            {
                Title = model.Title,
                Message = model.Message,
                UserId = model.UserId,
                OrganizationId = organizationId,
                Type = model.Type,
                RelatedEntityType = model.RelatedEntityType,
                RelatedEntityId = model.RelatedEntityId,
                ActionUrl = model.ActionUrl,
                IsRead = false,
                IsActive = true
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Send real-time notification
            await _hubContext.Clients.Group($"user_{model.UserId}").SendAsync("NotificationReceived", new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.RelatedEntityType,
                notification.RelatedEntityId,
                notification.ActionUrl,
                CreatedAt = notification.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
            });

            return CreatedAtAction(nameof(GetNotification), new { id = notification.Id }, notification);
        }

        /// <summary>
        /// Helper method to create a notification
        /// </summary>
        public static async System.Threading.Tasks.Task CreateNotificationAsync(
            AppDbContext context,
            IHubContext<NotificationHub> hubContext,
            int userId,
            int organizationId,
            string title,
            string message,
            NotificationType type,
            string? relatedEntityType = null,
            int? relatedEntityId = null,
            string? actionUrl = null)
        {
            var notification = new Notification
            {
                Title = title,
                Message = message,
                UserId = userId,
                OrganizationId = organizationId,
                Type = type,
                RelatedEntityType = relatedEntityType,
                RelatedEntityId = relatedEntityId,
                ActionUrl = actionUrl,
                IsRead = false,
                IsActive = true
            };

            context.Notifications.Add(notification);
            await context.SaveChangesAsync();

            // Send real-time notification
            await hubContext.Clients.Group($"user_{userId}").SendAsync("NotificationReceived", new
            {
                notification.Id,
                notification.Title,
                notification.Message,
                notification.Type,
                notification.RelatedEntityType,
                notification.RelatedEntityId,
                notification.ActionUrl,
                CreatedAt = notification.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
            });
        }
    }

    // DTOs for notification management
    public class CreateNotificationModel
    {
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int UserId { get; set; }
        public NotificationType Type { get; set; }
        public string? RelatedEntityType { get; set; }
        public int? RelatedEntityId { get; set; }
        public string? ActionUrl { get; set; }
    }
}