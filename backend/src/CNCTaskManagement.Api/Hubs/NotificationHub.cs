using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Api.Hubs
{
    /// <summary>
    /// SignalR hub for real-time notifications
    /// </summary>
    [Authorize]
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Called when a client connects
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var organizationId = Context.User?.FindFirst("OrganizationId")?.Value;

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(organizationId))
            {
                // Add user to their personal group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
                
                // Add user to their organization group
                await Groups.AddToGroupAsync(Context.ConnectionId, $"org_{organizationId}");
                
                _logger.LogInformation($"User {userId} connected to NotificationHub");
            }

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Called when a client disconnects
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var organizationId = Context.User?.FindFirst("OrganizationId")?.Value;

            if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(organizationId))
            {
                // Remove user from their personal group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"user_{userId}");
                
                // Remove user from their organization group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"org_{organizationId}");
                
                _logger.LogInformation($"User {userId} disconnected from NotificationHub");
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Join a project group to receive project-specific notifications
        /// </summary>
        public async Task JoinProjectGroup(string projectId)
        {
            if (int.TryParse(projectId, out int projectIdInt))
            {
                // Check if user has access to this project
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var organizationId = Context.User?.FindFirst("OrganizationId")?.Value;
                var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

                if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(organizationId) && !string.IsNullOrEmpty(userRole))
                {
                    // For simplicity, we'll allow all authenticated users to join project groups
                    // In a real implementation, you would verify the user has access to the project
                    
                    // Add user to project group
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"project_{projectId}");
                    
                    _logger.LogInformation($"User {userId} joined project group {projectId}");
                    
                    // Notify others in the project that this user has joined
                    await Clients.Group($"project_{projectId}").SendAsync("UserJoinedProject", new 
                    { 
                        UserId = userId,
                        ProjectId = projectId,
                        Timestamp = DateTime.UtcNow
                    });
                }
            }
        }

        /// <summary>
        /// Leave a project group
        /// </summary>
        public async Task LeaveProjectGroup(string projectId)
        {
            if (int.TryParse(projectId, out int projectIdInt))
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                // Remove user from project group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"project_{projectId}");
                
                _logger.LogInformation($"User {userId} left project group {projectId}");
                
                // Notify others in the project that this user has left
                await Clients.Group($"project_{projectId}").SendAsync("UserLeftProject", new 
                { 
                    UserId = userId,
                    ProjectId = projectId,
                    Timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Join a sprint group to receive sprint-specific notifications
        /// </summary>
        public async Task JoinSprintGroup(string sprintId)
        {
            if (int.TryParse(sprintId, out int sprintIdInt))
            {
                // Check if user has access to this sprint
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var organizationId = Context.User?.FindFirst("OrganizationId")?.Value;
                var userRole = Context.User?.FindFirst(ClaimTypes.Role)?.Value;

                if (!string.IsNullOrEmpty(userId) && !string.IsNullOrEmpty(organizationId) && !string.IsNullOrEmpty(userRole))
                {
                    // For simplicity, we'll allow all authenticated users to join sprint groups
                    // In a real implementation, you would verify the user has access to the sprint
                    
                    // Add user to sprint group
                    await Groups.AddToGroupAsync(Context.ConnectionId, $"sprint_{sprintId}");
                    
                    _logger.LogInformation($"User {userId} joined sprint group {sprintId}");
                }
            }
        }

        /// <summary>
        /// Leave a sprint group
        /// </summary>
        public async Task LeaveSprintGroup(string sprintId)
        {
            if (int.TryParse(sprintId, out int sprintIdInt))
            {
                var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                
                // Remove user from sprint group
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"sprint_{sprintId}");
                
                _logger.LogInformation($"User {userId} left sprint group {sprintId}");
            }
        }
    }
}