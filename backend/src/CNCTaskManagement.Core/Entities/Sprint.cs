using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Sprint entity
    /// </summary>
    public class Sprint : BaseEntity
    {
        /// <summary>
        /// Name of the sprint
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the sprint
        /// </summary>
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        /// <summary>
        /// ID of the project
        /// </summary>
        [Required]
        public int ProjectId { get; set; }
        
        /// <summary>
        /// Navigation property to the project
        /// </summary>
        public virtual Project Project { get; set; } = null!;
        
        /// <summary>
        /// Sprint number
        /// </summary>
        public int SprintNumber { get; set; }
        
        /// <summary>
        /// Status of the sprint
        /// </summary>
        [Required]
        public SprintStatus Status { get; set; } = SprintStatus.Planned;
        
        /// <summary>
        /// Start date of the sprint
        /// </summary>
        public DateTime StartDate { get; set; }
        
        /// <summary>
        /// End date of the sprint
        /// </summary>
        public DateTime EndDate { get; set; }
        
        /// <summary>
        /// Velocity goal for the sprint
        /// </summary>
        [Column(TypeName = "decimal(5,2)")]
        public decimal VelocityGoal { get; set; } = 0;
        
        /// <summary>
        /// Actual velocity achieved in the sprint
        /// </summary>
        [Column(TypeName = "decimal(5,2)")]
        public decimal VelocityActual { get; set; } = 0;
        
        /// <summary>
        /// Indicates if the sprint is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Navigation property for user stories in the sprint
        /// </summary>
        public virtual ICollection<UserStory> UserStories { get; set; } = new List<UserStory>();
    }
}