using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace CNCTaskManagement.Api.Services
{
    /// <summary>
    /// GitHub service implementation
    /// </summary>
    public class GitHubService : IGitHubService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;
        private readonly string _githubApiUrl;

        public GitHubService(IConfiguration configuration)
        {
            _configuration = configuration;
            _githubApiUrl = "https://api.github.com";
            _httpClient = new HttpClient();
        }

        /// <summary>
        /// Get user repositories
        /// </summary>
        public async Task<(bool Success, string Message, List<object>? Repositories)> GetUserRepositoriesAsync(string accessToken)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var response = await _httpClient.GetAsync($"{_githubApiUrl}/user/repos?type=owner&sort=updated");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var repositories = JsonSerializer.Deserialize<List<GitHubRepository>>(content);
                    
                    var result = repositories?.Select(r => new
                    {
                        r.Id,
                        r.Name,
                        r.FullName,
                        r.Description,
                        r.HtmlUrl,
                        r.Private,
                        r.Fork,
                        r.Language,
                        r.StargazersCount,
                        r.ForksCount,
                        r.CreatedAt,
                        r.UpdatedAt,
                        Owner = new
                        {
                            r.Owner.Login,
                            r.Owner.AvatarUrl,
                            r.Owner.HtmlUrl
                        }
                    }).ToList<object>();

                    return (true, "Repositories retrieved successfully", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to retrieve repositories: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error retrieving repositories: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Get repository branches
        /// </summary>
        public async Task<(bool Success, string Message, List<object>? Branches)> GetRepositoryBranchesAsync(string owner, string repo, string accessToken)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var response = await _httpClient.GetAsync($"{_githubApiUrl}/repos/{owner}/{repo}/branches");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var branches = JsonSerializer.Deserialize<List<GitHubBranch>>(content);
                    
                    var result = branches?.Select(b => new
                    {
                        b.Name,
                        b.Protected,
                        Commit = new
                        {
                            b.Commit.Sha,
                            b.Commit.Url
                        }
                    }).ToList<object>();

                    return (true, "Branches retrieved successfully", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to retrieve branches: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error retrieving branches: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Get repository commits
        /// </summary>
        public async Task<(bool Success, string Message, List<object>? Commits)> GetRepositoryCommitsAsync(string owner, string repo, string accessToken, string? branch = null)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var url = $"{_githubApiUrl}/repos/{owner}/{repo}/commits";
                if (!string.IsNullOrEmpty(branch))
                {
                    url += $"?sha={branch}";
                }

                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var commits = JsonSerializer.Deserialize<List<GitHubCommit>>(content);
                    
                    var result = commits?.Select(c => new
                    {
                        c.Sha,
                        c.Message,
                        c.Url,
                        Author = new
                        {
                            Name = c.Author.Name,
                            Email = c.Author.Email,
                            Date = c.Author.Date
                        },
                        Committer = new
                        {
                            Name = c.Committer.Name,
                            Email = c.Committer.Email,
                            Date = c.Committer.Date
                        }
                    }).ToList<object>();

                    return (true, "Commits retrieved successfully", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to retrieve commits: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error retrieving commits: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Get repository pull requests
        /// </summary>
        public async Task<(bool Success, string Message, List<object>? PullRequests)> GetRepositoryPullRequestsAsync(string owner, string repo, string accessToken, string? state = null)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var url = $"{_githubApiUrl}/repos/{owner}/{repo}/pulls";
                if (!string.IsNullOrEmpty(state))
                {
                    url += $"?state={state}";
                }

                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var pullRequests = JsonSerializer.Deserialize<List<GitHubPullRequest>>(content);
                    
                    var result = pullRequests?.Select(pr => new
                    {
                        pr.Id,
                        pr.Number,
                        pr.Title,
                        pr.Body,
                        pr.State,
                        pr.HtmlUrl,
                        pr.CreatedAt,
                        pr.UpdatedAt,
                        User = new
                        {
                            pr.User.Login,
                            pr.User.AvatarUrl,
                            pr.User.HtmlUrl
                        },
                        Head = new
                        {
                            Ref = pr.Head.Ref,
                            Sha = pr.Head.Sha,
                            Repo = new
                            {
                                Name = pr.Head.Repo.Name,
                                FullName = pr.Head.Repo.FullName,
                                Owner = new
                                {
                                    Login = pr.Head.Repo.Owner.Login,
                                    AvatarUrl = pr.Head.Repo.Owner.AvatarUrl
                                }
                            }
                        },
                        Base = new
                        {
                            Ref = pr.Base.Ref,
                            Sha = pr.Base.Sha,
                            Repo = new
                            {
                                Name = pr.Base.Repo.Name,
                                FullName = pr.Base.Repo.FullName,
                                Owner = new
                                {
                                    Login = pr.Base.Repo.Owner.Login,
                                    AvatarUrl = pr.Base.Repo.Owner.AvatarUrl
                                }
                            }
                        }
                    }).ToList<object>();

                    return (true, "Pull requests retrieved successfully", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to retrieve pull requests: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error retrieving pull requests: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Get repository issues
        /// </summary>
        public async Task<(bool Success, string Message, List<object>? Issues)> GetRepositoryIssuesAsync(string owner, string repo, string accessToken, string? state = null)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var url = $"{_githubApiUrl}/repos/{owner}/{repo}/issues";
                if (!string.IsNullOrEmpty(state))
                {
                    url += $"?state={state}";
                }

                var response = await _httpClient.GetAsync(url);

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var issues = JsonSerializer.Deserialize<List<GitHubIssue>>(content);
                    
                    var result = issues?.Select(i => new
                    {
                        i.Id,
                        i.Number,
                        i.Title,
                        i.Body,
                        i.State,
                        i.HtmlUrl,
                        i.CreatedAt,
                        i.UpdatedAt,
                        User = new
                        {
                            i.User.Login,
                            i.User.AvatarUrl,
                            i.User.HtmlUrl
                        },
                        Labels = i.Labels.Select(l => new
                        {
                            l.Id,
                            l.Name,
                            l.Color,
                            l.Description
                        }).ToList()
                    }).ToList<object>();

                    return (true, "Issues retrieved successfully", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to retrieve issues: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error retrieving issues: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Create a webhook for repository events
        /// </summary>
        public async Task<(bool Success, string Message, object? Webhook)> CreateWebhookAsync(string owner, string repo, string accessToken, string webhookUrl)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var webhookPayload = new
                {
                    name = "web",
                    active = true,
                    events = new [] { "push", "pull_request", "issues" },
                    config = new
                    {
                        url = webhookUrl,
                        content_type = "json"
                    }
                };

                var content = new StringContent(
                    JsonSerializer.Serialize(webhookPayload), 
                    System.Text.Encoding.UTF8, 
                    "application/json");

                var response = await _httpClient.PostAsync($"{_githubApiUrl}/repos/{owner}/{repo}/hooks", content);

                if (response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    var webhook = JsonSerializer.Deserialize<GitHubWebhook>(responseContent);

                    var result = new
                    {
                        webhook.Id,
                        webhook.Url,
                        webhook.Name,
                        webhook.Active,
                        webhook.Events,
                        CreatedAt = webhook.CreatedAt
                    };

                    return (true, "Webhook created successfully", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to create webhook: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error creating webhook: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Delete a webhook
        /// </summary>
        public async Task<(bool Success, string Message)> DeleteWebhookAsync(string owner, string repo, string accessToken, int webhookId)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var response = await _httpClient.DeleteAsync($"{_githubApiUrl}/repos/{owner}/{repo}/hooks/{webhookId}");

                if (response.IsSuccessStatusCode)
                {
                    return (true, "Webhook deleted successfully");
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Failed to delete webhook: {response.StatusCode} - {errorContent}");
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error deleting webhook: {ex.Message}");
            }
        }

        /// <summary>
        /// Validate GitHub access token
        /// </summary>
        public async Task<(bool Valid, string Message, object? UserInfo)> ValidateAccessTokenAsync(string accessToken)
        {
            try
            {
                _httpClient.DefaultRequestHeaders.Authorization = 
                    new System.Net.Http.Headers.AuthenticationHeaderValue("Token", accessToken);
                _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd("CNC-Task-Management");

                var response = await _httpClient.GetAsync($"{_githubApiUrl}/user");

                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var user = JsonSerializer.Deserialize<GitHubUser>(content);

                    var result = new
                    {
                        user.Id,
                        user.Login,
                        user.Name,
                        user.Email,
                        user.AvatarUrl,
                        user.HtmlUrl,
                        user.Company,
                        user.Location,
                        user.Bio,
                        user.PublicRepos,
                        user.Followers,
                        user.Following,
                        CreatedAt = user.CreatedAt
                    };

                    return (true, "Access token is valid", result);
                }
                else
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    return (false, $"Invalid access token: {response.StatusCode} - {errorContent}", null);
                }
            }
            catch (Exception ex)
            {
                return (false, $"Error validating access token: {ex.Message}", null);
            }
        }
    }

    // GitHub API models
    public class GitHubRepository
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public bool Private { get; set; }
        public bool Fork { get; set; }
        public string HtmlUrl { get; set; } = string.Empty;
        public string? Language { get; set; }
        public int StargazersCount { get; set; }
        public int ForksCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public GitHubUser Owner { get; set; } = null!;
    }

    public class GitHubUser
    {
        public int Id { get; set; }
        public string Login { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string AvatarUrl { get; set; } = string.Empty;
        public string HtmlUrl { get; set; } = string.Empty;
        public string? Company { get; set; }
        public string? Location { get; set; }
        public string? Bio { get; set; }
        public int PublicRepos { get; set; }
        public int Followers { get; set; }
        public int Following { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class GitHubBranch
    {
        public string Name { get; set; } = string.Empty;
        public bool Protected { get; set; }
        public GitHubCommitRef Commit { get; set; } = null!;
    }

    public class GitHubCommitRef
    {
        public string Sha { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
    }

    public class GitHubCommit
    {
        public string Sha { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public GitHubCommitAuthor Author { get; set; } = null!;
        public GitHubCommitAuthor Committer { get; set; } = null!;
    }

    public class GitHubCommitAuthor
    {
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime Date { get; set; }
    }

    public class GitHubPullRequest
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Body { get; set; }
        public string State { get; set; } = string.Empty;
        public string HtmlUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public GitHubUser User { get; set; } = null!;
        public GitHubPullRequestRef Head { get; set; } = null!;
        public GitHubPullRequestRef Base { get; set; } = null!;
    }

    public class GitHubPullRequestRef
    {
        public string Ref { get; set; } = string.Empty;
        public string Sha { get; set; } = string.Empty;
        public GitHubRepository Repo { get; set; } = null!;
    }

    public class GitHubIssue
    {
        public int Id { get; set; }
        public int Number { get; set; }
        public string Title { get; set; } = string.Empty;
        public string? Body { get; set; }
        public string State { get; set; } = string.Empty;
        public string HtmlUrl { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public GitHubUser User { get; set; } = null!;
        public List<GitHubLabel> Labels { get; set; } = new List<GitHubLabel>();
    }

    public class GitHubLabel
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Color { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class GitHubWebhook
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public bool Active { get; set; }
        public List<string> Events { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; }
    }
}