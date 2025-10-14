using CNCTaskManagement.Core.Entities;

namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// Authentication service interface
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Register a new user
        /// </summary>
        Task<(bool Success, string Message, User? User)> RegisterAsync(string email, string password, string firstName, string lastName, int organizationId);

        /// <summary>
        /// Authenticate a user
        /// </summary>
        Task<(bool Success, string Message, string? Token)> LoginAsync(string email, string password);

        /// <summary>
        /// Generate JWT token for a user
        /// </summary>
        string GenerateJwtToken(User user);

        /// <summary>
        /// Validate a JWT token
        /// </summary>
        Task<(bool Valid, User? User)> ValidateTokenAsync(string token);

        /// <summary>
        /// Reset user password
        /// </summary>
        Task<(bool Success, string Message)> ResetPasswordAsync(string email, string token, string newPassword);

        /// <summary>
        /// Generate password reset token
        /// </summary>
        Task<(bool Success, string Message, string? Token)> GeneratePasswordResetTokenAsync(string email);
    }
}