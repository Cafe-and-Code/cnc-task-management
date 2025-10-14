using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Audit log entity for tracking changes
    /// </summary>
    public class AuditLog : BaseEntity
    {
        /// <summary>
        /// Type of action performed
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Action { get; set; } = string.Empty;
        
        /// <summary>
        /// Type of entity that was modified
        /// </summary>
        [Required]
        [MaxLength(100)]
        public string EntityType { get; set; } = string.Empty;
        
        /// <summary>
        /// ID of the entity that was modified
        /// </summary>
        public int EntityId { get; set; }
        
        /// <summary>
        /// ID of the user who performed the action
        /// </summary>
        public int? UserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user
        /// </summary>
        public virtual User? User { get; set; }
        
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
        /// Name of the property that was modified
        /// </summary>
        [MaxLength(100)]
        public string? PropertyName { get; set; }
        
        /// <summary>
        /// Previous value of the property
        /// </summary>
        [MaxLength(1000)]
        public string? OldValue { get; set; }
        
        /// <summary>
        /// New value of the property
        /// </summary>
        [MaxLength(1000)]
        public string? NewValue { get; set; }
        
        /// <summary>
        /// Additional details about the change
        /// </summary>
        [MaxLength(1000)]
        public string? Details { get; set; }
        
        /// <summary>
        /// IP address from which the action was performed
        /// </summary>
        [MaxLength(45)]
        public string? IpAddress { get; set; }
        
        /// <summary>
        /// User agent string
        /// </summary>
        [MaxLength(500)]
        public string? UserAgent { get; set; }
    }
}