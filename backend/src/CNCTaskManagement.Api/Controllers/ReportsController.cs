using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;
using Task = CNCTaskManagement.Core.Entities.Task;
using TaskStatus = CNCTaskManagement.Core.Enums.TaskStatus;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReportsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get project performance report
        /// </summary>
        [HttpGet("project-performance")]
        public async Task<ActionResult<object>> GetProjectPerformanceReport(
            [FromQuery] int projectId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify project exists and belongs to the organization
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == projectId && p.OrganizationId == organizationId);

            if (project == null)
            {
                return BadRequest(new { Message = "Project not found" });
            }

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? project.CreatedAt;

            // Get project metrics
            var totalUserStories = await _context.UserStories
                .CountAsync(us => us.ProjectId == projectId && us.IsActive);

            var completedUserStories = await _context.UserStories
                .CountAsync(us => us.ProjectId == projectId && us.IsActive && us.Status == UserStoryStatus.Completed);

            var totalSprints = await _context.Sprints
                .CountAsync(s => s.ProjectId == projectId);

            var completedSprints = await _context.Sprints
                .CountAsync(s => s.ProjectId == projectId && s.Status == SprintStatus.Completed);

            // Get task metrics
            var allTaskIds = await _context.UserStories
                .Where(us => us.ProjectId == projectId && us.IsActive)
                .SelectMany(us => us.Tasks)
                .Where(t => t.IsActive)
                .Select(t => t.Id)
                .ToListAsync();

            var totalTasks = allTaskIds.Count;
            var completedTasks = await _context.Tasks
                .CountAsync(t => allTaskIds.Contains(t.Id) && t.Status == TaskStatus.Completed);

            // Get story points metrics
            var totalStoryPoints = await _context.UserStories
                .Where(us => us.ProjectId == projectId && us.IsActive)
                .SumAsync(us => us.StoryPoints);

            var completedStoryPoints = await _context.UserStories
                .Where(us => us.ProjectId == projectId && us.IsActive && us.Status == UserStoryStatus.Completed)
                .SumAsync(us => us.StoryPoints);

            // Get velocity data
            var velocityData = await _context.Sprints
                .Where(s => s.ProjectId == projectId && s.Status == SprintStatus.Completed)
                .OrderBy(s => s.EndDate)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.SprintNumber,
                    s.StartDate,
                    s.EndDate,
                    s.VelocityActual,
                    s.VelocityGoal
                })
                .ToListAsync();

            // Get burndown data
            var burndownData = await _context.Sprints
                .Where(s => s.ProjectId == projectId)
                .OrderBy(s => s.StartDate)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.SprintNumber,
                    s.StartDate,
                    s.EndDate,
                    s.Status,
                    TotalStoryPoints = _context.UserStories
                        .Where(us => us.SprintId == s.Id && us.IsActive)
                        .Sum(us => us.StoryPoints),
                    CompletedStoryPoints = _context.UserStories
                        .Where(us => us.SprintId == s.Id && us.IsActive && us.Status == UserStoryStatus.Completed)
                        .Sum(us => us.StoryPoints)
                })
                .ToListAsync();

            // Get team performance
            var teamPerformance = await _context.TeamMembers
                .Where(tm => tm.Team.ProjectId == projectId)
                .Include(tm => tm.User)
                .Include(tm => tm.Team)
                .Select(tm => new
                {
                    tm.User.Id,
                    UserName = $"{tm.User.FirstName} {tm.User.LastName}",
                    tm.User.Role,
                    TeamName = tm.Team.Name,
                    CompletedTasks = _context.Tasks
                        .Count(t => t.AssignedToUserId == tm.UserId && t.UserStory.ProjectId == projectId && t.Status == TaskStatus.Completed),
                    TotalTasks = _context.Tasks
                        .Count(t => t.AssignedToUserId == tm.UserId && t.UserStory.ProjectId == projectId),
                    CompletedStoryPoints = _context.UserStories
                        .Where(us => us.AssignedToUserId == tm.UserId && us.ProjectId == projectId && us.Status == UserStoryStatus.Completed)
                        .Sum(us => us.StoryPoints),
                    TotalStoryPoints = _context.UserStories
                        .Where(us => us.AssignedToUserId == tm.UserId && us.ProjectId == projectId)
                        .Sum(us => us.StoryPoints)
                })
                .ToListAsync();

            return Ok(new
            {
                project = new
                {
                    project.Id,
                    project.Name,
                    project.Description,
                    project.Status,
                    project.StartDate,
                    project.EndDate
                },
                metrics = new
                {
                    userStories = new
                    {
                        total = totalUserStories,
                        completed = completedUserStories,
                        completionPercentage = totalUserStories > 0 ? Math.Round((double)completedUserStories / totalUserStories * 100, 2) : 0
                    },
                    sprints = new
                    {
                        total = totalSprints,
                        completed = completedSprints,
                        completionPercentage = totalSprints > 0 ? Math.Round((double)completedSprints / totalSprints * 100, 2) : 0
                    },
                    tasks = new
                    {
                        total = totalTasks,
                        completed = completedTasks,
                        completionPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0
                    },
                    storyPoints = new
                    {
                        total = totalStoryPoints,
                        completed = completedStoryPoints,
                        completionPercentage = totalStoryPoints > 0 ? Math.Round((double)completedStoryPoints / (double)totalStoryPoints * 100, 2) : 0
                    }
                },
                velocityData,
                burndownData,
                teamPerformance,
                dateRange = new
                {
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }

        /// <summary>
        /// Get team performance report
        /// </summary>
        [HttpGet("team-performance")]
        public async Task<ActionResult<object>> GetTeamPerformanceReport(
            [FromQuery] int teamId,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify team exists and belongs to the organization
            var team = await _context.Teams
                .Include(t => t.Project)
                .FirstOrDefaultAsync(t => t.Id == teamId && t.OrganizationId == organizationId);

            if (team == null)
            {
                return BadRequest(new { Message = "Team not found" });
            }

            // Set default date range if not provided
            endDate = endDate ?? DateTime.UtcNow;
            startDate = startDate ?? DateTime.UtcNow.AddDays(-30);

            // Get team members
            var teamMembers = await _context.TeamMembers
                .Where(tm => tm.TeamId == teamId)
                .Include(tm => tm.User)
                .ToListAsync();

            var teamMemberIds = teamMembers.Select(tm => tm.UserId).ToList();

            // Get team metrics
            var assignedUserStories = await _context.UserStories
                .CountAsync(us => teamMemberIds.Contains(us.AssignedToUserId ?? 0) && us.CreatedAt >= startDate && us.CreatedAt <= endDate);

            var completedUserStories = await _context.UserStories
                .CountAsync(us => teamMemberIds.Contains(us.AssignedToUserId ?? 0) && us.Status == UserStoryStatus.Completed && us.UpdatedAt >= startDate && us.UpdatedAt <= endDate);

            var assignedTasks = await _context.Tasks
                .CountAsync(t => teamMemberIds.Contains(t.AssignedToUserId ?? 0) && t.CreatedAt >= startDate && t.CreatedAt <= endDate);

            var completedTasks = await _context.Tasks
                .CountAsync(t => teamMemberIds.Contains(t.AssignedToUserId ?? 0) && t.Status == TaskStatus.Completed && t.UpdatedAt >= startDate && t.UpdatedAt <= endDate);

            // Get story points metrics
            var assignedStoryPoints = await _context.UserStories
                .Where(us => teamMemberIds.Contains(us.AssignedToUserId ?? 0) && us.CreatedAt >= startDate && us.CreatedAt <= endDate)
                .SumAsync(us => us.StoryPoints);

            var completedStoryPoints = await _context.UserStories
                .Where(us => teamMemberIds.Contains(us.AssignedToUserId ?? 0) && us.Status == UserStoryStatus.Completed && us.UpdatedAt >= startDate && us.UpdatedAt <= endDate)
                .SumAsync(us => us.StoryPoints);

            // Get individual member performance
            var memberPerformance = await _context.TeamMembers
                .Where(tm => tm.TeamId == teamId)
                .Include(tm => tm.User)
                .Select(tm => new
                {
                    tm.User.Id,
                    UserName = $"{tm.User.FirstName} {tm.User.LastName}",
                    tm.User.Role,
                    TeamMemberRole = tm.Role,
                    AssignedUserStories = _context.UserStories
                        .Count(us => us.AssignedToUserId == tm.UserId && us.CreatedAt >= startDate && us.CreatedAt <= endDate),
                    CompletedUserStories = _context.UserStories
                        .Count(us => us.AssignedToUserId == tm.UserId && us.Status == UserStoryStatus.Completed && us.UpdatedAt >= startDate && us.UpdatedAt <= endDate),
                    AssignedTasks = _context.Tasks
                        .Count(t => t.AssignedToUserId == tm.UserId && t.CreatedAt >= startDate && t.CreatedAt <= endDate),
                    CompletedTasks = _context.Tasks
                        .Count(t => t.AssignedToUserId == tm.UserId && t.Status == TaskStatus.Completed && t.UpdatedAt >= startDate && t.UpdatedAt <= endDate),
                    AssignedStoryPoints = _context.UserStories
                        .Where(us => us.AssignedToUserId == tm.UserId && us.CreatedAt >= startDate && us.CreatedAt <= endDate)
                        .Sum(us => us.StoryPoints),
                    CompletedStoryPoints = _context.UserStories
                        .Where(us => us.AssignedToUserId == tm.UserId && us.Status == UserStoryStatus.Completed && us.UpdatedAt >= startDate && us.UpdatedAt <= endDate)
                        .Sum(us => us.StoryPoints)
                })
                .ToListAsync();

            // Get task distribution by status
            var taskDistribution = await _context.Tasks
                .Include(t => t.UserStory)
                .Where(t => teamMemberIds.Contains(t.AssignedToUserId ?? 0) && t.CreatedAt >= startDate && t.CreatedAt <= endDate)
                .GroupBy(t => t.Status)
                .Select(g => new
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToListAsync();

            // Get sprint participation
            var sprintParticipation = await _context.Sprints
                .Include(s => s.UserStories)
                .Where(s => s.ProjectId == team.ProjectId && s.StartDate >= startDate && s.EndDate <= endDate)
                .Select(s => new
                {
                    s.Id,
                    s.Name,
                    s.SprintNumber,
                    s.StartDate,
                    s.EndDate,
                    s.Status,
                    ParticipatedStories = s.UserStories.Count(us => teamMemberIds.Contains(us.AssignedToUserId ?? 0)),
                    CompletedStories = s.UserStories.Count(us => teamMemberIds.Contains(us.AssignedToUserId ?? 0) && us.Status == UserStoryStatus.Completed)
                })
                .ToListAsync();

            return Ok(new
            {
                team = new
                {
                    team.Id,
                    team.Name,
                    team.Description,
                    ProjectName = team.Project.Name
                },
                metrics = new
                {
                    userStories = new
                    {
                        assigned = assignedUserStories,
                        completed = completedUserStories,
                        completionPercentage = assignedUserStories > 0 ? Math.Round((double)completedUserStories / assignedUserStories * 100, 2) : 0
                    },
                    tasks = new
                    {
                        assigned = assignedTasks,
                        completed = completedTasks,
                        completionPercentage = assignedTasks > 0 ? Math.Round((double)completedTasks / assignedTasks * 100, 2) : 0
                    },
                    storyPoints = new
                    {
                        assigned = assignedStoryPoints,
                        completed = completedStoryPoints,
                        completionPercentage = assignedStoryPoints > 0 ? Math.Round((double)completedStoryPoints / (double)assignedStoryPoints * 100, 2) : 0
                    }
                },
                memberPerformance,
                taskDistribution,
                sprintParticipation,
                dateRange = new
                {
                    startDate = startDate.Value.ToString("yyyy-MM-ddTHH:mm:ss"),
                    endDate = endDate.Value.ToString("yyyy-MM-ddTHH:mm:ss")
                }
            });
        }

        /// <summary>
        /// Get sprint completion report
        /// </summary>
        [HttpGet("sprint-completion")]
        public async Task<ActionResult<object>> GetSprintCompletionReport(
            [FromQuery] int sprintId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify sprint exists and belongs to the organization
            var sprint = await _context.Sprints
                .Include(s => s.Project)
                .FirstOrDefaultAsync(s => s.Id == sprintId && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return BadRequest(new { Message = "Sprint not found" });
            }

            // Get sprint user stories
            var userStories = await _context.UserStories
                .Where(us => us.SprintId == sprintId && us.IsActive)
                .Include(us => us.Tasks)
                .ToListAsync();

            // Get sprint metrics
            var totalUserStories = userStories.Count;
            var completedUserStories = userStories.Count(us => us.Status == UserStoryStatus.Completed);
            var totalStoryPoints = userStories.Sum(us => us.StoryPoints);
            var completedStoryPoints = userStories.Where(us => us.Status == UserStoryStatus.Completed).Sum(us => us.StoryPoints);

            // Get task metrics
            var allTasks = userStories.SelectMany(us => us.Tasks).Where(t => t.IsActive).ToList();
            var totalTasks = allTasks.Count;
            var completedTasks = allTasks.Count(t => t.Status == TaskStatus.Completed);

            // Get task distribution by status
            var taskDistribution = allTasks
                .GroupBy(t => t.Status)
                .Select(g => new
                {
                    Status = g.Key.ToString(),
                    Count = g.Count()
                })
                .ToList();

            // Get team performance
            var teamPerformance = await _context.TeamMembers
                .Where(tm => tm.Team.ProjectId == sprint.ProjectId)
                .Include(tm => tm.User)
                .Select(tm => new
                {
                    tm.User.Id,
                    UserName = $"{tm.User.FirstName} {tm.User.LastName}",
                    tm.User.Role,
                    CompletedUserStories = userStories.Count(us => us.AssignedToUserId == tm.UserId && us.Status == UserStoryStatus.Completed),
                    CompletedTasks = allTasks.Count(t => t.AssignedToUserId == tm.UserId && t.Status == TaskStatus.Completed),
                    CompletedStoryPoints = userStories.Where(us => us.AssignedToUserId == tm.UserId && us.Status == UserStoryStatus.Completed).Sum(us => us.StoryPoints)
                })
                .Where(tm => tm.CompletedUserStories > 0 || tm.CompletedTasks > 0)
                .ToListAsync();

            // Get daily burndown data
            var sprintDuration = (sprint.EndDate - sprint.StartDate).Days + 1;
            var idealBurndown = new List<object>();
            var actualBurndown = new List<object>();

            // Calculate ideal burndown
            var storyPointsPerDay = totalStoryPoints > 0 ? (double)totalStoryPoints / sprintDuration : 0;
            var remainingStoryPoints = (double)totalStoryPoints;
            var currentDate = sprint.StartDate;

            for (int i = 0; i <= sprintDuration; i++)
            {
                idealBurndown.Add(new
                {
                    day = i,
                    date = currentDate.ToString("yyyy-MM-dd"),
                    storyPoints = Math.Round(remainingStoryPoints, 2)
                });

                remainingStoryPoints = Math.Max(0, remainingStoryPoints - storyPointsPerDay);
                currentDate = currentDate.AddDays(1);
            }

            // Calculate actual burndown
            currentDate = sprint.StartDate;
            var completedStoryPointsToDate = 0m;

            for (int i = 0; i <= sprintDuration; i++)
            {
                // Get stories completed up to this date
                var storiesCompletedBeforeDate = userStories
                    .Where(us => us.Status == UserStoryStatus.Completed && us.UpdatedAt <= currentDate.Date.AddDays(1))
                    .ToList();

                completedStoryPointsToDate = (decimal)storiesCompletedBeforeDate.Sum(us => us.StoryPoints);
                var remainingStoryPointsActual = (double)(totalStoryPoints - completedStoryPointsToDate);

                actualBurndown.Add(new
                {
                    day = i,
                    date = currentDate.ToString("yyyy-MM-dd"),
                    storyPoints = Math.Round(remainingStoryPointsActual, 2)
                });

                currentDate = currentDate.AddDays(1);
            }

            return Ok(new
            {
                sprint = new
                {
                    sprint.Id,
                    sprint.Name,
                    sprint.SprintNumber,
                    sprint.StartDate,
                    sprint.EndDate,
                    sprint.Status,
                    sprint.VelocityGoal,
                    sprint.VelocityActual
                },
                metrics = new
                {
                    userStories = new
                    {
                        total = totalUserStories,
                        completed = completedUserStories,
                        completionPercentage = totalUserStories > 0 ? Math.Round((double)completedUserStories / totalUserStories * 100, 2) : 0
                    },
                    tasks = new
                    {
                        total = totalTasks,
                        completed = completedTasks,
                        completionPercentage = totalTasks > 0 ? Math.Round((double)completedTasks / totalTasks * 100, 2) : 0
                    },
                    storyPoints = new
                    {
                        total = totalStoryPoints,
                        completed = completedStoryPoints,
                        completionPercentage = totalStoryPoints > 0 ? Math.Round((double)completedStoryPoints / (double)totalStoryPoints * 100, 2) : 0
                    }
                },
                userStories = userStories.Select(us => new
                {
                    us.Id,
                    us.Title,
                    us.StoryPoints,
                    us.Status,
                    AssignedTo = us.AssignedToUserId != null ? 
                        (_context.Users.FirstOrDefault(u => u.Id == us.AssignedToUserId).FirstName + " " + 
                         _context.Users.FirstOrDefault(u => u.Id == us.AssignedToUserId).LastName) : null,
                    TaskCount = us.Tasks.Count(t => t.IsActive),
                    CompletedTaskCount = us.Tasks.Count(t => t.IsActive && t.Status == TaskStatus.Completed)
                }).ToList(),
                taskDistribution,
                teamPerformance,
                burndownChart = new
                {
                    idealBurndown,
                    actualBurndown
                }
            });
        }
    }
}