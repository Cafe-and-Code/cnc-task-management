using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// GitHub integration entity
    /// </summary>
    public class GitHubIntegration : BaseEntity
    {
        /// <summary>
        /// ID of the user who owns the integration
        /// </summary>
        [Required]
        public int UserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user
        /// </summary>
        public virtual User User { get; set; } = null!;
        
        /// <summary>
        /// Encrypted GitHub access token
        /// </summary>
        [Required]
        [MaxLength(1000)]
        public string AccessToken { get; set; } = string.Empty;
        
        /// <summary>
        /// GitHub user ID
        /// </summary>
        [MaxLength(50)]
        public string? GitHubUserId { get; set; }
        
        /// <summary>
        /// GitHub username
        /// </summary>
        [MaxLength(50)]
        public string? GitHubUsername { get; set; }
        
        /// <summary>
        /// Indicates if the integration is active
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}