using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Security.Cryptography;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// Authentication service implementation
    /// </summary>
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly AppDbContext _context;

        public AuthService(
            IConfiguration configuration,
            AppDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        /// <summary>
        /// Register a new user
        /// </summary>
        public async Task<(bool Success, string Message, User? User)> RegisterAsync(string email, string password, string firstName, string lastName, int organizationId)
        {
            // Check if user already exists
            var existingUser = _context.Users.FirstOrDefault(u => u.Email == email);
            if (existingUser != null)
            {
                return (false, "User with this email already exists", null);
            }

            // Check if organization exists
            var organization = await _context.Organizations.FindAsync(organizationId);
            if (organization == null)
            {
                return (false, "Organization not found", null);
            }

            // Hash password
            var passwordHash = HashPassword(password);

            // Create new user
            var user = new User
            {
                UserName = email,
                Email = email,
                FirstName = firstName,
                LastName = lastName,
                PasswordHash = passwordHash,
                OrganizationId = organizationId,
                Role = UserRole.Developer, // Default role
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return (true, "User registered successfully", user);
        }

        /// <summary>
        /// Authenticate a user
        /// </summary>
        public async Task<(bool Success, string Message, string? Token)> LoginAsync(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return (false, "Invalid email or password", null);
            }

            if (!user.IsActive)
            {
                return (false, "Account is disabled", null);
            }

            if (!VerifyPassword(password, user.PasswordHash))
            {
                return (false, "Invalid email or password", null);
            }

            var token = GenerateJwtToken(user);
            return (true, "Login successful", token);
        }

        /// <summary>
        /// Generate JWT token for a user
        /// </summary>
        public string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured");
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("OrganizationId", user.OrganizationId.ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationMinutes"] ?? "60")),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Validate a JWT token
        /// </summary>
        public async Task<(bool Valid, User? User)> ValidateTokenAsync(string token)
        {
            try
            {
                var jwtSettings = _configuration.GetSection("Jwt");
                var secretKey = jwtSettings["Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured");
                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.UTF8.GetBytes(secretKey);

                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings["Issuer"],
                    ValidateAudience = true,
                    ValidAudience = jwtSettings["Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                var jwtToken = (JwtSecurityToken)validatedToken;
                var userId = int.Parse(jwtToken.Claims.First(x => x.Type == ClaimTypes.NameIdentifier).Value);

                var user = await _context.Users.FindAsync(userId);
                return (true, user);
            }
            catch
            {
                return (false, null);
            }
        }

        /// <summary>
        /// Reset user password
        /// </summary>
        public async Task<(bool Success, string Message)> ResetPasswordAsync(string email, string token, string newPassword)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return (false, "User not found");
            }

            if (user.PasswordResetToken != token || user.PasswordResetExpires < DateTime.UtcNow)
            {
                return (false, "Invalid or expired token");
            }

            user.PasswordHash = HashPassword(newPassword);
            user.PasswordResetToken = null;
            user.PasswordResetExpires = null;

            await _context.SaveChangesAsync();

            return (true, "Password reset successful");
        }

        /// <summary>
        /// Generate password reset token
        /// </summary>
        public async Task<(bool Success, string Message, string? Token)> GeneratePasswordResetTokenAsync(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null)
            {
                return (false, "User not found", null);
            }

            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
            user.PasswordResetToken = token;
            user.PasswordResetExpires = DateTime.UtcNow.AddHours(24);

            await _context.SaveChangesAsync();

            return (true, "Password reset token generated", token);
        }

        /// <summary>
        /// Hash a password using PBKDF2
        /// </summary>
        private string HashPassword(string password)
        {
            byte[] salt;
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt = new byte[16]);
            }

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);

            byte[] hashBytes = new byte[36];
            Array.Copy(salt, 0, hashBytes, 0, 16);
            Array.Copy(hash, 0, hashBytes, 16, 20);

            return Convert.ToBase64String(hashBytes);
        }

        /// <summary>
        /// Verify a password against its hash
        /// </summary>
        private bool VerifyPassword(string password, string hashedPassword)
        {
            byte[] hashBytes = Convert.FromBase64String(hashedPassword);
            byte[] salt = new byte[16];
            Array.Copy(hashBytes, 0, salt, 0, 16);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 10000);
            byte[] hash = pbkdf2.GetBytes(20);

            for (int i = 0; i < 20; i++)
            {
                if (hashBytes[i + 16] != hash[i])
                    return false;
            }

            return true;
        }
    }
}