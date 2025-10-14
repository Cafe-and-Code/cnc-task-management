using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
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
    public class UsersController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly AppDbContext _context;

        public UsersController(UserManager<User> userManager, AppDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        /// <summary>
        /// Get all users in the organization
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetUsers(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? search = null,
            [FromQuery] UserRole? role = null,
            [FromQuery] bool? isActive = null)
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
                .Where(u => u.OrganizationId == organizationId && u.Id != int.Parse(currentUserId));

            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    u.FirstName.Contains(search) ||
                    u.LastName.Contains(search) ||
                    u.Email.Contains(search) ||
                    u.UserName.Contains(search));
            }

            if (role.HasValue)
            {
                query = query.Where(u => u.Role == role.Value);
            }

            if (isActive.HasValue)
            {
                query = query.Where(u => u.IsActive == isActive.Value);
            }

            // Get total count
            var totalCount = await query.CountAsync();

            // Apply pagination
            var users = await query
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.UserName,
                    u.Role,
                    u.AvatarUrl,
                    u.IsActive,
                    u.IsEmailVerified,
                    u.LastLoginAt,
                    u.CreatedAt
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
        /// Get user by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var currentUserIdInt = int.Parse(currentUserId);

            // Check if user is trying to access their own profile or has admin role
            if (id != currentUserIdInt)
            {
                var currentUser = await _userManager.FindByIdAsync(currentUserId);
                if (currentUser == null || currentUser.Role != UserRole.Admin)
                {
                    return Forbid();
                }
            }

            var user = await _context.Users
                .Where(u => u.Id == id && u.OrganizationId == organizationId)
                .Select(u => new
                {
                    u.Id,
                    u.FirstName,
                    u.LastName,
                    u.Email,
                    u.UserName,
                    u.Role,
                    u.AvatarUrl,
                    u.IsActive,
                    u.IsEmailVerified,
                    u.LastLoginAt,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        /// <summary>
        /// Update user role (Admin only)
        /// </summary>
        [HttpPut("{id}/role")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UpdateUserRoleModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == organizationId);

            if (user == null)
            {
                return NotFound();
            }

            // Prevent admin from changing their own role
            if (id.ToString() == currentUserId)
            {
                return BadRequest(new { Message = "You cannot change your own role" });
            }

            user.Role = model.Role;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User role updated successfully" });
        }

        /// <summary>
        /// Activate user (Admin only)
        /// </summary>
        [HttpPut("{id}/activate")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> ActivateUser(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == organizationId);

            if (user == null)
            {
                return NotFound();
            }

            user.IsActive = true;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User activated successfully" });
        }

        /// <summary>
        /// Deactivate user (Admin only)
        /// </summary>
        [HttpPut("{id}/deactivate")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> DeactivateUser(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == id && u.OrganizationId == organizationId);

            if (user == null)
            {
                return NotFound();
            }

            // Prevent admin from deactivating themselves
            if (id.ToString() == currentUserId)
            {
                return BadRequest(new { Message = "You cannot deactivate your own account" });
            }

            user.IsActive = false;
            user.UpdatedAt = DateTime.UtcNow;
            user.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "User deactivated successfully" });
        }

        /// <summary>
        /// Reset user password (Admin only)
        /// </summary>
        [HttpPost("{id}/reset-password")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> ResetPassword(int id, [FromBody] ResetPasswordModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var user = await _userManager.FindByIdAsync(id.ToString());
            if (user == null || user.OrganizationId != organizationId)
            {
                return NotFound();
            }

            // Generate password reset token
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            
            // Set new password
            var result = await _userManager.ResetPasswordAsync(user, token, model.NewPassword);
            
            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "Failed to reset password", Errors = result.Errors });
            }

            return Ok(new { Message = "Password reset successfully" });
        }
    }

    // DTOs for user management
    public class UpdateUserRoleModel
    {
        public UserRole Role { get; set; }
    }

    public class ResetPasswordModel
    {
        public string NewPassword { get; set; } = string.Empty;
    }
}