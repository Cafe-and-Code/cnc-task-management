namespace CNCTaskManagement.Core.Enums
{
    /// <summary>
    /// Sprint status values
    /// </summary>
    public enum SprintStatus
    {
        /// <summary>
        /// Sprint is planned but not started
        /// </summary>
        Planned = 0,
        
        /// <summary>
        /// Sprint is currently active
        /// </summary>
        Active = 1,
        
        /// <summary>
        /// Sprint is completed
        /// </summary>
        Completed = 2,
        
        /// <summary>
        /// Sprint is cancelled
        /// </summary>
        Cancelled = 3
    }
}