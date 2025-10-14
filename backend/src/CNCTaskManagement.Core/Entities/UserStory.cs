using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using CNCTaskManagement.Core.Enums;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// User story entity
    /// </summary>
    public class UserStory : BaseEntity
    {
        /// <summary>
        /// Title of the user story
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the user story
        /// </summary>
        [MaxLength(2000)]
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
        /// ID of the sprint (null if not assigned to a sprint)
        /// </summary>
        public int? SprintId { get; set; }
        
        /// <summary>
        /// Navigation property to the sprint
        /// </summary>
        public virtual Sprint? Sprint { get; set; }
        
        /// <summary>
        /// ID of the user who created the user story
        /// </summary>
        public int? CreatedByUserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user who created the user story
        /// </summary>
        public virtual User? CreatedByUser { get; set; }
        
        /// <summary>
        /// ID of the user assigned to the user story
        /// </summary>
        public int? AssignedToUserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user assigned to the user story
        /// </summary>
        public virtual User? AssignedToUser { get; set; }
        
        /// <summary>
        /// Status of the user story
        /// </summary>
        [Required]
        public UserStoryStatus Status { get; set; } = UserStoryStatus.Backlog;
        
        /// <summary>
        /// Priority of the user story
        /// </summary>
        [Required]
        public UserStoryPriority Priority { get; set; } = UserStoryPriority.Medium;
        
        /// <summary>
        /// Story points for the user story
        /// </summary>
        [Column(TypeName = "decimal(3,1)")]
        public decimal StoryPoints { get; set; } = 0;
        
        /// <summary>
        /// Business value of the user story
        /// </summary>
        [Column(TypeName = "decimal(3,1)")]
        public decimal BusinessValue { get; set; } = 0;
        
        /// <summary>
        /// Acceptance criteria for the user story
        /// </summary>
        [Column(TypeName = "jsonb")]
        public string? AcceptanceCriteria { get; set; } = "[]";
        
        /// <summary>
        /// Due date for the user story
        /// </summary>
        public DateTime? DueDate { get; set; }
        
        /// <summary>
        /// Indicates if the user story is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Navigation property for tasks in the user story
        /// </summary>
        public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    }
}