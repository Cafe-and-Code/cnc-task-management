namespace CNCTaskManagement.Core.Enums
{
    /// <summary>
    /// User roles in the system
    /// </summary>
    public enum UserRole
    {
        /// <summary>
        /// System administrator with full access
        /// </summary>
        Admin = 0,
        
        /// <summary>
        /// Product owner responsible for product backlog
        /// </summary>
        ProductOwner = 1,
        
        /// <summary>
        /// Scrum master responsible for sprint management
        /// </summary>
        ScrumMaster = 2,
        
        /// <summary>
        /// Developer working on tasks
        /// </summary>
        Developer = 3,
        
        /// <summary>
        /// Stakeholder with view-only access
        /// </summary>
        Stakeholder = 4
    }
}