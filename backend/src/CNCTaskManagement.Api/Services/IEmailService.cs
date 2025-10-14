namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// Email service interface
    /// </summary>
    public interface IEmailService
    {
        /// <summary>
        /// Send an email
        /// </summary>
        Task<(bool Success, string Message)> SendEmailAsync(string to, string subject, string body, bool isHtml = false);

        /// <summary>
        /// Send a password reset email
        /// </summary>
        Task<(bool Success, string Message)> SendPasswordResetEmailAsync(string email, string resetToken);

        /// <summary>
        /// Send an email verification email
        /// </summary>
        Task<(bool Success, string Message)> SendEmailVerificationAsync(string email, string verificationToken);

        /// <summary>
        /// Send a welcome email
        /// </summary>
        Task<(bool Success, string Message)> SendWelcomeEmailAsync(string email, string firstName);
    }
}