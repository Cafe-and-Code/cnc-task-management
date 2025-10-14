using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Team entity
    /// </summary>
    public class Team : BaseEntity
    {
        /// <summary>
        /// Name of the team
        /// </summary>
        [Required]
        [MaxLength(255)]
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// Description of the team
        /// </summary>
        [MaxLength(1000)]
        public string? Description { get; set; }
        
        /// <summary>
        /// ID of the project the team belongs to
        /// </summary>
        public int? ProjectId { get; set; }
        
        /// <summary>
        /// Navigation property to the project
        /// </summary>
        public virtual Project? Project { get; set; }
        
        /// <summary>
        /// Indicates if the team is active
        /// </summary>
        public bool IsActive { get; set; } = true;
        
        /// <summary>
        /// Navigation property to the organization
        /// </summary>
        public virtual Organization Organization { get; set; } = null!;
        
        /// <summary>
        /// Navigation property for team members
        /// </summary>
        public virtual ICollection<TeamMember> Members { get; set; } = new List<TeamMember>();
    }
}