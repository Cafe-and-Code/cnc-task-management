using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Notification entity
    /// </summary>
    public class Notification : BaseEntity
    {
        /// <summary>
        /// Title of the notification
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Message content of the notification
        /// </summary>
        [Required]
        [MaxLength(1000)]
        public string Message { get; set; } = string.Empty;
        
        /// <summary>
        /// ID of the user who will receive the notification
        /// </summary>
        [Required]
        public int UserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user
        /// </summary>
        public virtual User User { get; set; } = null!;
        
        /// <summary>
        /// ID of the organization
        /// </summary>
        [Required]
        public int OrganizationId { get; set; }
        
        /// <summary>
        /// Navigation property to the organization
        /// </summary>
        public virtual Organization Organization { get; set; } = null!;
        
        /// <summary>
        /// Type of the notification
        /// </summary>
        [Required]
        public NotificationType Type { get; set; }
        
        /// <summary>
        /// Related entity type (e.g., Project, Sprint, UserStory, Task)
        /// </summary>
        public string? RelatedEntityType { get; set; }
        
        /// <summary>
        /// ID of the related entity
        /// </summary>
        public int? RelatedEntityId { get; set; }
        
        /// <summary>
        /// URL to navigate to when the notification is clicked
        /// </summary>
        [MaxLength(500)]
        public string? ActionUrl { get; set; }
        
        /// <summary>
        /// Indicates if the notification has been read
        /// </summary>
        public bool IsRead { get; set; } = false;
        
        /// <summary>
        /// Date and time when the notification was read
        /// </summary>
        public DateTime? ReadAt { get; set; }
        
        /// <summary>
        /// Indicates if the notification is active
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}