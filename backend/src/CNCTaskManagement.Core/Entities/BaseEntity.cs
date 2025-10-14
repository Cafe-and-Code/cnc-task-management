using System;

namespace CNCTaskManagement.Core.Entities
{
    /// <summary>
    /// Base entity that all other entities inherit from
    /// </summary>
    public abstract class BaseEntity
    {
        /// <summary>
        /// Primary key
        /// </summary>
        public int Id { get; set; }
        
        /// <summary>
        /// Organization ID for multi-tenant architecture
        /// </summary>
        public int OrganizationId { get; set; }
        
        /// <summary>
        /// Date and time when the entity was created
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// Date and time when the entity was last updated
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        /// <summary>
        /// ID of the user who created the entity
        /// </summary>
        public string? CreatedBy { get; set; }
        
        /// <summary>
        /// ID of the user who last updated the entity
        /// </summary>
        public string? UpdatedBy { get; set; }
    }
}