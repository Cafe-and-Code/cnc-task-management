using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;
using CNCTaskManagement.Api.Services;
using GitHubIntegration = CNCTaskManagement.Core.Entities.GitHubIntegration;
using GitHubWebhook = CNCTaskManagement.Core.Entities.GitHubWebhook;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class GitHubController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IGitHubService _gitHubService;
        private readonly IEncryptionService _encryptionService;

        public GitHubController(
            AppDbContext context,
            IGitHubService gitHubService,
            IEncryptionService encryptionService)
        {
            _context = context;
            _gitHubService = gitHubService;
            _encryptionService = encryptionService;
        }

        /// <summary>
        /// Validate GitHub access token
        /// </summary>
        [HttpPost("validate-token")]
        public async Task<ActionResult<object>> ValidateAccessToken([FromBody] ValidateTokenModel model)
        {
            if (string.IsNullOrEmpty(model.AccessToken))
            {
                return BadRequest(new { Message = "Access token is required" });
            }

            var result = await _gitHubService.ValidateAccessTokenAsync(model.AccessToken);

            if (!result.Valid)
            {
                return BadRequest(new { Message = result.Message });
            }

            // Get current user
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var userIdInt = int.Parse(currentUserId);

            // Check if user already has a GitHub integration
            var existingIntegration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt);

            if (existingIntegration != null)
            {
                // Update existing integration
                existingIntegration.AccessToken = _encryptionService.Encrypt(model.AccessToken);
                existingIntegration.GitHubUserId = result.UserInfo?.GetType().GetProperty("Id")?.GetValue(result.UserInfo)?.ToString();
                existingIntegration.GitHubUsername = result.UserInfo?.GetType().GetProperty("Login")?.GetValue(result.UserInfo)?.ToString();
                existingIntegration.UpdatedAt = DateTime.UtcNow;
                existingIntegration.UpdatedBy = currentUserId;

                await _context.SaveChangesAsync();
            }
            else
            {
                // Create new integration
                var integration = new GitHubIntegration
                {
                    UserId = userIdInt,
                    AccessToken = _encryptionService.Encrypt(model.AccessToken),
                    GitHubUserId = result.UserInfo?.GetType().GetProperty("Id")?.GetValue(result.UserInfo)?.ToString(),
                    GitHubUsername = result.UserInfo?.GetType().GetProperty("Login")?.GetValue(result.UserInfo)?.ToString(),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = currentUserId
                };

                _context.GitHubIntegrations.Add(integration);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                Message = "Access token validated successfully",
                UserInfo = result.UserInfo
            });
        }

        /// <summary>
        /// Get user repositories
        /// </summary>
        [HttpGet("repositories")]
        public async Task<ActionResult<object>> GetUserRepositories()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Get repositories
            var result = await _gitHubService.GetUserRepositoriesAsync(accessToken);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(new
            {
                repositories = result.Repositories
            });
        }

        /// <summary>
        /// Get repository branches
        /// </summary>
        [HttpGet("repositories/{owner}/{repo}/branches")]
        public async Task<ActionResult<object>> GetRepositoryBranches(string owner, string repo)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Get branches
            var result = await _gitHubService.GetRepositoryBranchesAsync(owner, repo, accessToken);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(new
            {
                branches = result.Branches
            });
        }

        /// <summary>
        /// Get repository commits
        /// </summary>
        [HttpGet("repositories/{owner}/{repo}/commits")]
        public async Task<ActionResult<object>> GetRepositoryCommits(string owner, string repo, [FromQuery] string? branch = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Get commits
            var result = await _gitHubService.GetRepositoryCommitsAsync(owner, repo, accessToken, branch);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(new
            {
                commits = result.Commits
            });
        }

        /// <summary>
        /// Get repository pull requests
        /// </summary>
        [HttpGet("repositories/{owner}/{repo}/pulls")]
        public async Task<ActionResult<object>> GetRepositoryPullRequests(string owner, string repo, [FromQuery] string? state = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Get pull requests
            var result = await _gitHubService.GetRepositoryPullRequestsAsync(owner, repo, accessToken, state);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(new
            {
                pullRequests = result.PullRequests
            });
        }

        /// <summary>
        /// Get repository issues
        /// </summary>
        [HttpGet("repositories/{owner}/{repo}/issues")]
        public async Task<ActionResult<object>> GetRepositoryIssues(string owner, string repo, [FromQuery] string? state = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Get issues
            var result = await _gitHubService.GetRepositoryIssuesAsync(owner, repo, accessToken, state);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            return Ok(new
            {
                issues = result.Issues
            });
        }

        /// <summary>
        /// Create a webhook for repository events
        /// </summary>
        [HttpPost("repositories/{owner}/{repo}/webhooks")]
        public async Task<ActionResult<object>> CreateWebhook(string owner, string repo, [FromBody] CreateWebhookModel model)
        {
            if (string.IsNullOrEmpty(model.WebhookUrl))
            {
                return BadRequest(new { Message = "Webhook URL is required" });
            }

            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Create webhook
            var result = await _gitHubService.CreateWebhookAsync(owner, repo, accessToken, model.WebhookUrl);

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            // Save webhook to database
            var webhook = new GitHubWebhook
            {
                UserId = userIdInt,
                RepositoryOwner = owner,
                RepositoryName = repo,
                WebhookId = result.Webhook?.GetType().GetProperty("Id")?.GetValue(result.Webhook)?.ToString() ?? "0",
                WebhookUrl = model.WebhookUrl,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = currentUserId
            };

            _context.GitHubWebhooks.Add(webhook);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Webhook created successfully",
                Webhook = result.Webhook
            });
        }

        /// <summary>
        /// Delete a webhook
        /// </summary>
        [HttpDelete("repositories/{owner}/{repo}/webhooks/{webhookId}")]
        public async Task<IActionResult> DeleteWebhook(string owner, string repo, string webhookId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's GitHub integration
            var integration = await _context.GitHubIntegrations
                .FirstOrDefaultAsync(g => g.UserId == userIdInt && g.IsActive);

            if (integration == null)
            {
                return BadRequest(new { Message = "GitHub integration not found" });
            }

            // Get webhook from database
            var webhook = await _context.GitHubWebhooks
                .FirstOrDefaultAsync(w => w.UserId == userIdInt && 
                                        w.RepositoryOwner == owner && 
                                        w.RepositoryName == repo && 
                                        w.WebhookId == webhookId);

            if (webhook == null)
            {
                return NotFound(new { Message = "Webhook not found" });
            }

            // Decrypt access token
            var accessToken = _encryptionService.Decrypt(integration.AccessToken);

            // Delete webhook from GitHub
            var result = await _gitHubService.DeleteWebhookAsync(owner, repo, accessToken, int.Parse(webhookId));

            if (!result.Success)
            {
                return BadRequest(new { Message = result.Message });
            }

            // Delete webhook from database
            _context.GitHubWebhooks.Remove(webhook);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Webhook deleted successfully" });
        }

        /// <summary>
        /// Get user's GitHub webhooks
        /// </summary>
        [HttpGet("webhooks")]
        public async Task<ActionResult<object>> GetUserWebhooks()
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var userIdInt = int.Parse(currentUserId);

            // Get user's webhooks
            var webhooks = await _context.GitHubWebhooks
                .Where(w => w.UserId == userIdInt)
                .Select(w => new
                {
                    w.Id,
                    w.RepositoryOwner,
                    w.RepositoryName,
                    w.WebhookId,
                    w.WebhookUrl,
                    w.IsActive,
                    CreatedAt = w.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ss")
                })
                .ToListAsync();

            return Ok(new
            {
                webhooks
            });
        }

        /// <summary>
        /// Webhook endpoint to receive GitHub events
        /// </summary>
        [HttpPost("webhooks/receive")]
        [AllowAnonymous]
        public async Task<IActionResult> ReceiveWebhookEvent([FromBody] object payload)
        {
            // This is a simplified implementation
            // In a real scenario, you would:
            // 1. Verify the webhook signature
            // 2. Parse the event type
            // 3. Process the event data
            // 4. Create notifications or update records based on the event

            // Log the event for debugging
            Console.WriteLine($"Received GitHub webhook event: {payload}");

            // For now, just return a success response
            return Ok();
        }
    }

    // DTOs for GitHub operations
    public class ValidateTokenModel
    {
        public string AccessToken { get; set; } = string.Empty;
    }

    public class CreateWebhookModel
    {
        public string WebhookUrl { get; set; } = string.Empty;
    }
}