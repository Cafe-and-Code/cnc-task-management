namespace CNCTaskManagement.Core.Enums
{
    /// <summary>
    /// Task status values
    /// </summary>
    public enum TaskStatus
    {
        /// <summary>
        /// Task is not started yet
        /// </summary>
        ToDo = 0,
        
        /// <summary>
        /// Task is currently being worked on
        /// </summary>
        InProgress = 1,
        
        /// <summary>
        /// Task is being tested
        /// </summary>
        Testing = 2,
        
        /// <summary>
        /// Task is completed
        /// </summary>
        Completed = 3,
        
        /// <summary>
        /// Task is blocked and cannot proceed
        /// </summary>
        Blocked = 4
    }
}