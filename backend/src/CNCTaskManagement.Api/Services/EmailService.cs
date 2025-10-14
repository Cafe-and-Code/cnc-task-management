using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;
using System.Text;

namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// Email service implementation
    /// </summary>
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        /// <summary>
        /// Send an email
        /// </summary>
        public async Task<(bool Success, string Message)> SendEmailAsync(string to, string subject, string body, bool isHtml = false)
        {
            try
            {
                var smtpHost = _configuration["EmailSettings:SmtpHost"];
                var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
                var smtpUsername = _configuration["EmailSettings:SmtpUsername"];
                var smtpPassword = _configuration["EmailSettings:SmtpPassword"];
                var fromEmail = _configuration["EmailSettings:FromEmail"];
                var fromName = _configuration["EmailSettings:FromName"] ?? "CNC Task Management";

                if (string.IsNullOrEmpty(smtpHost) || string.IsNullOrEmpty(smtpUsername) || string.IsNullOrEmpty(smtpPassword))
                {
                    // For development, log the email instead of sending it
                    _logger.LogInformation($"Email would be sent to: {to}, Subject: {subject}, Body: {body}");
                    return (true, "Email logged successfully (development mode)");
                }

                using (var client = new SmtpClient(smtpHost, smtpPort))
                {
                    client.EnableSsl = true;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(fromEmail, fromName),
                        Subject = subject,
                        Body = body,
                        IsBodyHtml = isHtml
                    };

                    mailMessage.To.Add(to);

                    await client.SendMailAsync(mailMessage);

                    _logger.LogInformation($"Email sent successfully to: {to}, Subject: {subject}");
                    return (true, "Email sent successfully");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to: {to}, Subject: {subject}");
                return (false, $"Failed to send email: {ex.Message}");
            }
        }

        /// <summary>
        /// Send a password reset email
        /// </summary>
        public async Task<(bool Success, string Message)> SendPasswordResetEmailAsync(string email, string resetToken)
        {
            var subject = "Password Reset Request";
            var resetUrl = $"{_configuration["AppSettings:BaseUrl"]}/reset-password?token={resetToken}&email={email}";
            
            var body = $@"
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>You have requested to reset your password. Please click the link below to reset your password:</p>
                <p><a href='{resetUrl}'>Reset Password</a></p>
                <p>If you did not request this password reset, please ignore this email.</p>
                <p>This link will expire in 24 hours.</p>
                <p>Thank you,<br>CNC Task Management Team</p>
            ";

            return await SendEmailAsync(email, subject, body, true);
        }

        /// <summary>
        /// Send an email verification email
        /// </summary>
        public async Task<(bool Success, string Message)> SendEmailVerificationAsync(string email, string verificationToken)
        {
            var subject = "Email Verification";
            var verificationUrl = $"{_configuration["AppSettings:BaseUrl"]}/verify-email?token={verificationToken}&email={email}";
            
            var body = $@"
                <h2>Email Verification</h2>
                <p>Hello,</p>
                <p>Please click the link below to verify your email address:</p>
                <p><a href='{verificationUrl}'>Verify Email</a></p>
                <p>If you did not create an account, please ignore this email.</p>
                <p>Thank you,<br>CNC Task Management Team</p>
            ";

            return await SendEmailAsync(email, subject, body, true);
        }

        /// <summary>
        /// Send a welcome email
        /// </summary>
        public async Task<(bool Success, string Message)> SendWelcomeEmailAsync(string email, string firstName)
        {
            var subject = "Welcome to CNC Task Management";
            
            var body = $@"
                <h2>Welcome to CNC Task Management!</h2>
                <p>Hello {firstName},</p>
                <p>We're excited to have you on board. CNC Task Management is a powerful tool designed to help your team collaborate more efficiently and deliver projects on time.</p>
                <p>Here are some quick links to get you started:</p>
                <ul>
                    <li><a href='{_configuration["AppSettings:BaseUrl"]}/dashboard'>Dashboard</a></li>
                    <li><a href='{_configuration["AppSettings:BaseUrl"]}/projects'>Projects</a></li>
                    <li><a href='{_configuration["AppSettings:BaseUrl"]}/help'>Help Center</a></li>
                </ul>
                <p>If you have any questions, feel free to reach out to our support team.</p>
                <p>Thank you,<br>CNC Task Management Team</p>
            ";

            return await SendEmailAsync(email, subject, body, true);
        }
    }
}