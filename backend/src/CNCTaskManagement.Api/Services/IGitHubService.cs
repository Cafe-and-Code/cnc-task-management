namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// GitHub service interface
    /// </summary>
    public interface IGitHubService
    {
        /// <summary>
        /// Get user repositories
        /// </summary>
        Task<(bool Success, string Message, List<object>? Repositories)> GetUserRepositoriesAsync(string accessToken);

        /// <summary>
        /// Get repository branches
        /// </summary>
        Task<(bool Success, string Message, List<object>? Branches)> GetRepositoryBranchesAsync(string owner, string repo, string accessToken);

        /// <summary>
        /// Get repository commits
        /// </summary>
        Task<(bool Success, string Message, List<object>? Commits)> GetRepositoryCommitsAsync(string owner, string repo, string accessToken, string? branch = null);

        /// <summary>
        /// Get repository pull requests
        /// </summary>
        Task<(bool Success, string Message, List<object>? PullRequests)> GetRepositoryPullRequestsAsync(string owner, string repo, string accessToken, string? state = null);

        /// <summary>
        /// Get repository issues
        /// </summary>
        Task<(bool Success, string Message, List<object>? Issues)> GetRepositoryIssuesAsync(string owner, string repo, string accessToken, string? state = null);

        /// <summary>
        /// Create a webhook for repository events
        /// </summary>
        Task<(bool Success, string Message, object? Webhook)> CreateWebhookAsync(string owner, string repo, string accessToken, string webhookUrl);

        /// <summary>
        /// Delete a webhook
        /// </summary>
        Task<(bool Success, string Message)> DeleteWebhookAsync(string owner, string repo, string accessToken, int webhookId);

        /// <summary>
        /// Validate GitHub access token
        /// </summary>
        Task<(bool Valid, string Message, object? UserInfo)> ValidateAccessTokenAsync(string accessToken);
    }
}