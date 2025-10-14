using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(
            UserManager<User> userManager,
            SignInManager<User> signInManager,
            AppDbContext context,
            IConfiguration configuration)
        {
            _userManager = userManager;
            _signInManager = signInManager;
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// User login
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
            {
                return Unauthorized(new { Message = "Invalid email or password" });
            }

            if (!user.IsActive)
            {
                return Unauthorized(new { Message = "Account is disabled" });
            }

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var token = await GenerateJwtToken(user);
            var refreshToken = GenerateRefreshToken();

            // Store refresh token (in a real implementation, you would store this in the database)
            user.PasswordResetToken = refreshToken; // Using this field temporarily
            await _userManager.UpdateAsync(user);

            return Ok(new
            {
                Token = token,
                RefreshToken = refreshToken,
                ExpiresIn = 3600,
                User = new
                {
                    user.Id,
                    user.Email,
                    user.UserName,
                    user.FirstName,
                    user.LastName,
                    user.Role,
                    user.OrganizationId,
                    user.AvatarUrl
                }
            });
        }

        /// <summary>
        /// User registration
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if user with this email already exists
            var existingUser = await _userManager.FindByEmailAsync(model.Email);
            if (existingUser != null)
            {
                return BadRequest(new { Message = "User with this email already exists" });
            }

            Organization? organization = null;
            int organizationId;

            // For Admin role, create organization automatically if not provided
            if (model.Role == UserRole.Admin && (model.OrganizationId == null || model.OrganizationId == 0))
            {
                // Create a new organization for the admin
                organization = new Organization
                {
                    Name = $"{model.FirstName} {model.LastName}'s Organization",
                    Description = "Default organization",
                    SubscriptionTier = "Free",
                    MaxUsers = 10,
                    IsActive = true,
                    OrganizationId = 0, // Will be set after save
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CreatedBy = "system"
                };

                _context.Organizations.Add(organization);
                await _context.SaveChangesAsync();

                // Set the organization's OrganizationId to its own Id (self-reference)
                organization.OrganizationId = organization.Id;
                await _context.SaveChangesAsync();

                organizationId = organization.Id;
            }
            else
            {
                // For non-admin users or when organizationId is provided
                if (model.OrganizationId == null || model.OrganizationId == 0)
                {
                    return BadRequest(new { Message = "OrganizationId is required for non-admin users" });
                }

                organization = await _context.Organizations.FindAsync(model.OrganizationId.Value);
                if (organization == null)
                {
                    return BadRequest(new { Message = "Organization not found" });
                }

                organizationId = organization.Id;
            }

            var user = new User
            {
                UserName = model.UserName,
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName,
                OrganizationId = organizationId,
                Role = model.Role,
                IsActive = true,
                IsEmailVerified = false
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "Failed to create user", Errors = result.Errors });
            }

            // Generate email verification token
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            user.EmailVerificationToken = token;
            await _userManager.UpdateAsync(user);

            // In a real implementation, you would send an email with the verification link
            // For now, we'll just return the token for testing purposes
            return Ok(new
            {
                Message = "User registered successfully",
                UserId = user.Id,
                OrganizationId = organizationId,
                OrganizationName = organization?.Name,
                EmailVerificationToken = token
            });
        }

        /// <summary>
        /// Verify email
        /// </summary>
        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailModel model)
        {
            var user = await _userManager.FindByIdAsync(model.UserId);
            if (user == null)
            {
                return BadRequest(new { Message = "User not found" });
            }

            if (user.IsEmailVerified)
            {
                return BadRequest(new { Message = "Email already verified" });
            }

            var result = await _userManager.ConfirmEmailAsync(user, model.Token);
            if (!result.Succeeded)
            {
                return BadRequest(new { Message = "Invalid token" });
            }

            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            await _userManager.UpdateAsync(user);

            return Ok(new { Message = "Email verified successfully" });
        }

        /// <summary>
        /// Get current user profile
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            var organization = await _context.Organizations.FindAsync(user.OrganizationId);

            return Ok(new
            {
                user.Id,
                user.Email,
                user.UserName,
                user.FirstName,
                user.LastName,
                user.Role,
                user.AvatarUrl,
                user.OrganizationId,
                OrganizationName = organization?.Name,
                user.IsActive,
                user.IsEmailVerified,
                user.LastLoginAt,
                user.CreatedAt
            });
        }

        /// <summary>
        /// Update current user profile
        /// </summary>
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileModel model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
            {
                return Unauthorized();
            }

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = model.FirstName ?? user.FirstName;
            user.LastName = model.LastName ?? user.LastName;
            user.AvatarUrl = model.AvatarUrl ?? user.AvatarUrl;

            await _userManager.UpdateAsync(user);

            return Ok(new { Message = "Profile updated successfully" });
        }

        /// <summary>
        /// Logout user
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId != null)
            {
                var user = await _userManager.FindByIdAsync(userId);
                if (user != null)
                {
                    // Clear refresh token
                    user.PasswordResetToken = null;
                    await _userManager.UpdateAsync(user);
                }
            }

            return Ok(new { Message = "Logged out successfully" });
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["Secret"];
            var key = Encoding.ASCII.GetBytes(secretKey);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.GivenName, user.FirstName),
                new Claim(ClaimTypes.Surname, user.LastName),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim("OrganizationId", user.OrganizationId.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpirationMinutes"])),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }
    }

    // DTOs for authentication
    public class LoginModel
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterModel
    {
        public string Email { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public int? OrganizationId { get; set; }  // Nullable for Admin users
        public UserRole Role { get; set; } = UserRole.Developer;
    }

    public class VerifyEmailModel
    {
        public string UserId { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
    }

    public class UpdateProfileModel
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? AvatarUrl { get; set; }
    }
}