using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// User entity
    /// </summary>
    public class User : IdentityUser<int>
    {
        /// <summary>
        /// Email address of the user
        /// Note: Email is inherited from IdentityUser but we override for additional attributes
        /// </summary>
        [Required]
        [MaxLength(255)]
        [EmailAddress]
        public override string? Email { get; set; } = string.Empty;
        
        /// <summary>
        /// Username for login
        /// Note: UserName is inherited from IdentityUser but we override for additional attributes
        /// </summary>
        [Required]
        [MaxLength(100)]
        public override string? UserName { get; set; } = string.Empty;
        
        /// <summary>
        /// First name of the user
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        /// <summary>
        /// Last name of the user
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        /// <summary>
        /// Password hash
        /// Note: PasswordHash is inherited from IdentityUser but we override for additional attributes
        /// </summary>
        [MaxLength(255)]
        public override string? PasswordHash { get; set; } = string.Empty;
        
        /// <summary>
        /// Role of the user in the system
        /// </summary>
        [Required]
        public UserRole Role { get; set; } = UserRole.Developer;
        
        /// <summary>
        /// URL of the user's avatar
        /// </summary>
        [MaxLength(500)]
        public string? AvatarUrl { get; set; }
        
        /// <summary>
        /// Indicates if the user is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Indicates if the user's email has been verified
        /// </summary>
        public bool IsEmailVerified { get; set; } = false;
        
        /// <summary>
        /// Token for email verification
        /// </summary>
        [MaxLength(255)]
        public string? EmailVerificationToken { get; set; }
        
        /// <summary>
        /// Token for password reset
        /// </summary>
        [MaxLength(255)]
        public string? PasswordResetToken { get; set; }
        
        /// <summary>
        /// Expiration date for password reset token
        /// </summary>
        public DateTime? PasswordResetExpires { get; set; }
        
        /// <summary>
        /// Last login date and time
        /// </summary>
        public DateTime? LastLoginAt { get; set; }
        
        // Properties from BaseEntity (since we now inherit from IdentityUser)
        
        /// <summary>
        /// Organization ID for multi-tenant architecture
        /// </summary>
        [Required]
        public int OrganizationId { get; set; }
        
        /// <summary>
        /// Date and time when the entity was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Date and time when the entity was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// ID of the user who created the entity
        /// </summary>
        public string? CreatedBy { get; set; }
        
        /// <summary>
        /// ID of the user who last updated the entity
        /// </summary>
        public string? UpdatedBy { get; set; }
        
        /// <summary>
        /// Navigation property to the organization
        /// </summary>
        public virtual Organization Organization { get; set; } = null!;
        
        /// <summary>
        /// Navigation property for team memberships
        /// </summary>
        public virtual ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
    }
}