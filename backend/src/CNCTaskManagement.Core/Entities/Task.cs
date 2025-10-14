using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TaskStatus = CNCTaskManagement.Core.Enums.TaskStatus;
using TaskPriority = CNCTaskManagement.Core.Enums.TaskPriority;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Task entity
    /// </summary>
    public class Task : BaseEntity
    {
        /// <summary>
        /// Title of the task
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Title { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the task
        /// </summary>
        [MaxLength(2000)]
        public string? Description { get; set; }
        
        /// <summary>
        /// ID of the user story this task belongs to
        /// </summary>
        [Required]
        public int UserStoryId { get; set; }
        
        /// <summary>
        /// Navigation property to the user story
        /// </summary>
        public virtual UserStory UserStory { get; set; } = null!;
        
        /// <summary>
        /// ID of the user who created the task
        /// </summary>
        public int? CreatedByUserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user who created the task
        /// </summary>
        public virtual User? CreatedByUser { get; set; }
        
        /// <summary>
        /// ID of the user the task is assigned to
        /// </summary>
        public int? AssignedToUserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user the task is assigned to
        /// </summary>
        public virtual User? AssignedToUser { get; set; }
        
        /// <summary>
        /// Status of the task
        /// </summary>
        public TaskStatus Status { get; set; } = TaskStatus.ToDo;
        
        /// <summary>
        /// Priority of the task
        /// </summary>
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
        
        /// <summary>
        /// Estimated hours to complete the task
        /// </summary>
        public decimal EstimatedHours { get; set; } = 0;
        
        /// <summary>
        /// Actual hours spent on the task
        /// </summary>
        public decimal ActualHours { get; set; } = 0;
        
        /// <summary>
        /// Remaining hours to complete the task
        /// </summary>
        public decimal RemainingHours { get; set; } = 0;
        
        /// <summary>
        /// Due date of the task
        /// </summary>
        public DateTime? DueDate { get; set; }
        
        /// <summary>
        /// Indicates if the task is active
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}