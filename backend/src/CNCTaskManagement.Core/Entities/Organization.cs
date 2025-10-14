using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Organization entity for multi-tenant architecture
    /// </summary>
    public class Organization : BaseEntity
    {
        /// <summary>
        /// Name of the organization
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the organization
        /// </summary>
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        /// <summary>
        /// Organization settings stored as JSON
        /// </summary>
        [Column(TypeName = "jsonb")]
        public string? Settings { get; set; } = "{}";
        
        /// <summary>
        /// Subscription tier of the organization
        /// </summary>
        [MaxLength(50)]
        public string SubscriptionTier { get; set; } = "Basic";
        
        /// <summary>
        /// Maximum number of users allowed for the organization
        /// </summary>
        public int MaxUsers { get; set; } = 10;
        
        /// <summary>
        /// Indicates if the organization is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Navigation property for users in the organization
        /// </summary>
        public virtual ICollection<User> Users { get; set; } = new List<User>();
        
        /// <summary>
        /// Navigation property for projects in the organization
        /// </summary>
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        
        /// <summary>
        /// Navigation property for teams in the organization
        /// </summary>
        public virtual ICollection<Team> Teams { get; set; } = new List<Team>();
    }
}