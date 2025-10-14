using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Team member entity representing the relationship between users and teams
    /// </summary>
    public class TeamMember : BaseEntity
    {
        /// <summary>
        /// ID of the team
        /// </summary>
        [Required]
        public int TeamId { get; set; }
        
        /// <summary>
        /// Navigation property to the team
        /// </summary>
        public virtual Team Team { get; set; } = null!;
        
        /// <summary>
        /// ID of the user
        /// </summary>
        [Required]
        public int UserId { get; set; }
        
        /// <summary>
        /// Navigation property to the user
        /// </summary>
        public virtual User User { get; set; } = null!;
        
        /// <summary>
        /// Role of the user in the team
        /// </summary>
        [Required]
        [MaxLength(50)]
        public string Role { get; set; } = "Developer";
        
        /// <summary>
        /// Date and time when the user joined the team
        /// </summary>
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Date and time when the user left the team
        /// </summary>
        public DateTime? LeftAt { get; set; }
        
        /// <summary>
        /// Indicates if the team membership is active
        /// </summary>
        public bool IsActive { get; set; } = true;
    }
}