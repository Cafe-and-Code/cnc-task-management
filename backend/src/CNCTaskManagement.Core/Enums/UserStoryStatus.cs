namespace CNCTaskManagement.Core.Enums
{
    /// <summary>
    /// User story status values
    /// </summary>
    public enum UserStoryStatus
    {
        /// <summary>
        /// User story is in the backlog
        /// </summary>
        Backlog = 0,
        
        /// <summary>
        /// User story is ready for sprint planning
        /// </summary>
        Ready = 1,
        
        /// <summary>
        /// User story is in a sprint
        /// </summary>
        InProgress = 2,
        
        /// <summary>
        /// User story is in testing
        /// </summary>
        Testing = 3,
        
        /// <summary>
        /// User story is completed
        /// </summary>
        Completed = 4,
        
        /// <summary>
        /// User story is blocked
        /// </summary>
        Blocked = 5
    }
}