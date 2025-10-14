namespace CNCTaskManagement.Core.Enums
{
    /// <summary>
    /// Project status values
    /// </summary>
    public enum ProjectStatus
    {
        /// <summary>
        /// Project is currently active
        /// </summary>
        Active = 0,
        
        /// <summary>
        /// Project is temporarily on hold
        /// </summary>
        OnHold = 1,
        
        /// <summary>
        /// Project has been completed
        /// </summary>
        Completed = 2,
        
        /// <summary>
        /// Project has been archived
        /// </summary>
        Archived = 3
    }
}