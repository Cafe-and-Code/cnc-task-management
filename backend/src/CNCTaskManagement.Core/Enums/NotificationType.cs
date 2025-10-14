namespace CNCTaskManagement.Core.Enums
{
    /// <summary>
    /// Notification type values
    /// </summary>
    public enum NotificationType
    {
        /// <summary>
        /// General information notification
        /// </summary>
        Info = 0,
        
        /// <summary>
        /// Success notification
        /// </summary>
        Success = 1,
        
        /// <summary>
        /// Warning notification
        /// </summary>
        Warning = 2,
        
        /// <summary>
        /// Error notification
        /// </summary>
        Error = 3,
        
        /// <summary>
        /// Task assignment notification
        /// </summary>
        TaskAssigned = 4,
        
        /// <summary>
        /// Task status change notification
        /// </summary>
        TaskStatusChanged = 5,
        
        /// <summary>
        /// User story assignment notification
        /// </summary>
        UserStoryAssigned = 6,
        
        /// <summary>
        /// User story status change notification
        /// </summary>
        UserStoryStatusChanged = 7,
        
        /// <summary>
        /// Sprint started notification
        /// </summary>
        SprintStarted = 8,
        
        /// <summary>
        /// Sprint completed notification
        /// </summary>
        SprintCompleted = 9,
        
        /// <summary>
        /// Team invitation notification
        /// </summary>
        TeamInvitation = 10,
        
        /// <summary>
        /// Project invitation notification
        /// </summary>
        ProjectInvitation = 11,
        
        /// <summary>
        /// Comment added notification
        /// </summary>
        CommentAdded = 12
    }
}