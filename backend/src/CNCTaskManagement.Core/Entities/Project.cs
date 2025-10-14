using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Project entity
    /// </summary>
    public class Project : BaseEntity
    {
        /// <summary>
        /// Name of the project
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the project
        /// </summary>
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        /// <summary>
        /// ID of the product owner
        /// </summary>
        public int? ProductOwnerId { get; set; }
        
        /// <summary>
        /// Navigation property to the product owner
        /// </summary>
        public virtual User? ProductOwner { get; set; }
        
        /// <summary>
        /// ID of the scrum master
        /// </summary>
        public int? ScrumMasterId { get; set; }
        
        /// <summary>
        /// Navigation property to the scrum master
        /// </summary>
        public virtual User? ScrumMaster { get; set; }
        
        /// <summary>
        /// Status of the project
        /// </summary>
        [Required]
        public ProjectStatus Status { get; set; } = ProjectStatus.Active;
        
        /// <summary>
        /// Start date of the project
        /// </summary>
        public DateTime? StartDate { get; set; }
        
        /// <summary>
        /// End date of the project
        /// </summary>
        public DateTime? EndDate { get; set; }
        
        /// <summary>
        /// Velocity goal for the project
        /// </summary>
        [Column(TypeName = "decimal(5,2)")]
        public decimal VelocityGoal { get; set; } = 0;
        
        /// <summary>
        /// Default sprint duration in days
        /// </summary>
        public int SprintDuration { get; set; } = 14;
        
        /// <summary>
        /// Indicates if the project is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Navigation property to the organization
        /// </summary>
        public virtual Organization Organization { get; set; } = null!;
        
        /// <summary>
        /// Navigation property for teams in the project
        /// </summary>
        public virtual ICollection<Team> Teams { get; set; } = new List<Team>();
        
        /// <summary>
        /// Navigation property for sprints in the project
        /// </summary>
        public virtual ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
        
        /// <summary>
        /// Navigation property for user stories in the project
        /// </summary>
        public virtual ICollection<UserStory> UserStories { get; set; } = new List<UserStory>();
    }
}