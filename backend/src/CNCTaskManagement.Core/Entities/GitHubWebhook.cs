using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// GitHub webhook entity
    /// </summary>
    public class GitHubWebhook : BaseEntity
    {
        /// <summary>
        /// ID of the user who owns the webhook
        /// </summary>
        [Required]
        public int UserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user
        /// </summary>
        public virtual User User { get; set; } = null!;
        
        /// <summary>
        /// Repository owner
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string RepositoryOwner { get; set; } = string.Empty;
        
        /// <summary>
        /// Repository name
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string RepositoryName { get; set; } = string.Empty;
        
        /// <summary>
        /// GitHub webhook ID
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string WebhookId { get; set; } = string.Empty;
        
        /// <summary>
        /// Webhook URL
        /// </summary>
        [Required]
        [MaxLength(500)]
        public string WebhookUrl { get; set; } = string.Empty;
        
        /// <summary>
        /// Indicates if the webhook is active
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}