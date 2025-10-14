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
    public class ChartsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ChartsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get burndown chart data for a sprint
        /// </summary>
        [HttpGet("burndown")]
        public async Task<ActionResult<object>> GetBurndownChart([FromQuery] int sprintId)
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
                .Include(s => s.UserStories)
                    .ThenInclude(us => us.Tasks)
                .FirstOrDefaultAsync(s => s.Id == sprintId && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return BadRequest(new { Message = "Sprint not found" });
            }

            // Calculate total story points for the sprint
            var totalStoryPoints = sprint.UserStories
                .Where(us => us.IsActive)
                .Sum(us => us.StoryPoints);

            // Calculate total hours for the sprint
            var totalHours = sprint.UserStories
                .SelectMany(us => us.Tasks)
                .Where(t => t.IsActive)
                .Sum(t => t.EstimatedHours);

            // Calculate sprint duration in days
            var sprintDuration = (sprint.EndDate - sprint.StartDate).Days + 1;

            // Generate ideal burndown line
            var idealBurndown = new List<object>();
            for (int i = 0; i <= sprintDuration; i++)
            {
                idealBurndown.Add(new
                {
                    day = i,
                    date = sprint.StartDate.AddDays(i).ToString("yyyy-MM-dd"),
                    storyPoints = Math.Round(totalStoryPoints * (1 - (decimal)i / sprintDuration), 2),
                    hours = Math.Round(totalHours * (1 - (decimal)i / sprintDuration), 2)
                });
            }

            // Generate actual burndown data
            var actualBurndown = new List<object>();
            var currentDate = sprint.StartDate;
            var completedStoryPoints = 0m;
            var completedHours = 0m;

            for (int i = 0; i <= sprintDuration; i++)
            {
                // Get tasks completed up to this date
                var tasksCompletedBeforeDate = sprint.UserStories
                    .SelectMany(us => us.Tasks)
                    .Where(t => t.IsActive && t.Status == TaskStatus.Completed && t.UpdatedAt <= currentDate.Date.AddDays(1))
                    .ToList();

                var userStoryIdsCompleted = tasksCompletedBeforeDate
                    .Select(t => t.UserStoryId)
                    .Distinct()
                    .ToList();

                // Calculate completed story points
                completedStoryPoints = sprint.UserStories
                    .Where(us => us.IsActive && userStoryIdsCompleted.Contains(us.Id))
                    .Sum(us => us.StoryPoints);

                // Calculate completed hours
                completedHours = tasksCompletedBeforeDate.Sum(t => t.EstimatedHours);

                // Add actual burndown point
                actualBurndown.Add(new
                {
                    day = i,
                    date = currentDate.ToString("yyyy-MM-dd"),
                    storyPoints = Math.Round(totalStoryPoints - completedStoryPoints, 2),
                    hours = Math.Round(totalHours - completedHours, 2)
                });

                // Move to next day
                currentDate = currentDate.AddDays(1);

                // If current date is beyond today, break the loop
                if (currentDate > DateTime.Today)
                {
                    break;
                }
            }

            return Ok(new
            {
                sprintId,
                sprintName = sprint.Name,
                sprintStart = sprint.StartDate.ToString("yyyy-MM-dd"),
                sprintEnd = sprint.EndDate.ToString("yyyy-MM-dd"),
                totalStoryPoints,
                totalHours,
                idealBurndown,
                actualBurndown
            });
        }

        /// <summary>
        /// Get burnup chart data for a sprint
        /// </summary>
        [HttpGet("burnup")]
        public async Task<ActionResult<object>> GetBurnupChart([FromQuery] int sprintId)
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
                .Include(s => s.UserStories)
                    .ThenInclude(us => us.Tasks)
                .FirstOrDefaultAsync(s => s.Id == sprintId && s.Project.OrganizationId == organizationId);

            if (sprint == null)
            {
                return BadRequest(new { Message = "Sprint not found" });
            }

            // Calculate total story points for the sprint
            var totalStoryPoints = sprint.UserStories
                .Where(us => us.IsActive)
                .Sum(us => us.StoryPoints);

            // Calculate total hours for the sprint
            var totalHours = sprint.UserStories
                .SelectMany(us => us.Tasks)
                .Where(t => t.IsActive)
                .Sum(t => t.EstimatedHours);

            // Calculate sprint duration in days
            var sprintDuration = (sprint.EndDate - sprint.StartDate).Days + 1;

            // Generate scope (total work) line
            var scopeLine = new List<object>();
            for (int i = 0; i <= sprintDuration; i++)
            {
                // Calculate total work as of this date (including any scope changes)
                // For simplicity, we'll assume no scope changes, so it's just the total
                scopeLine.Add(new
                {
                    day = i,
                    date = sprint.StartDate.AddDays(i).ToString("yyyy-MM-dd"),
                    storyPoints = totalStoryPoints,
                    hours = totalHours
                });
            }

            // Generate actual burnup data
            var actualBurnup = new List<object>();
            var currentDate = sprint.StartDate;

            for (int i = 0; i <= sprintDuration; i++)
            {
                // Get tasks completed up to this date
                var tasksCompletedBeforeDate = sprint.UserStories
                    .SelectMany(us => us.Tasks)
                    .Where(t => t.IsActive && t.Status == TaskStatus.Completed && t.UpdatedAt <= currentDate.Date.AddDays(1))
                    .ToList();

                var userStoryIdsCompleted = tasksCompletedBeforeDate
                    .Select(t => t.UserStoryId)
                    .Distinct()
                    .ToList();

                // Calculate completed story points
                var completedStoryPoints = sprint.UserStories
                    .Where(us => us.IsActive && userStoryIdsCompleted.Contains(us.Id))
                    .Sum(us => us.StoryPoints);

                // Calculate completed hours
                var completedHours = tasksCompletedBeforeDate.Sum(t => t.EstimatedHours);

                // Add actual burnup point
                actualBurnup.Add(new
                {
                    day = i,
                    date = currentDate.ToString("yyyy-MM-dd"),
                    storyPoints = Math.Round(completedStoryPoints, 2),
                    hours = Math.Round(completedHours, 2)
                });

                // Move to next day
                currentDate = currentDate.AddDays(1);

                // If current date is beyond today, break the loop
                if (currentDate > DateTime.Today)
                {
                    break;
                }
            }

            return Ok(new
            {
                sprintId,
                sprintName = sprint.Name,
                sprintStart = sprint.StartDate.ToString("yyyy-MM-dd"),
                sprintEnd = sprint.EndDate.ToString("yyyy-MM-dd"),
                totalStoryPoints,
                totalHours,
                scopeLine,
                actualBurnup
            });
        }

        /// <summary>
        /// Get velocity chart data for a project
        /// </summary>
        [HttpGet("velocity")]
        public async Task<ActionResult<object>> GetVelocityChart([FromQuery] int projectId)
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

            // Get completed sprints for the project
            var completedSprints = await _context.Sprints
                .Include(s => s.UserStories)
                    .ThenInclude(us => us.Tasks)
                .Where(s => s.ProjectId == projectId && s.Status == SprintStatus.Completed)
                .OrderBy(s => s.EndDate)
                .ToListAsync();

            // Generate velocity data
            var velocityData = completedSprints.Select(s => new
            {
                sprintId = s.Id,
                sprintName = s.Name,
                sprintNumber = s.SprintNumber,
                startDate = s.StartDate.ToString("yyyy-MM-dd"),
                endDate = s.EndDate.ToString("yyyy-MM-dd"),
                committedStoryPoints = s.UserStories
                    .Where(us => us.IsActive)
                    .Sum(us => us.StoryPoints),
                completedStoryPoints = s.UserStories
                    .Where(us => us.IsActive && us.Status == UserStoryStatus.Completed)
                    .Sum(us => us.StoryPoints),
                velocityGoal = s.VelocityGoal,
                velocityActual = s.VelocityActual
            }).ToList();

            // Calculate average velocity
            var averageVelocity = velocityData.Count > 0 
                ? velocityData.Average(v => v.completedStoryPoints) 
                : 0;

            return Ok(new
            {
                projectId,
                projectName = project.Name,
                velocityData,
                averageVelocity = Math.Round(averageVelocity, 2)
            });
        }

        /// <summary>
        /// Get cumulative flow diagram data for a project
        /// </summary>
        [HttpGet("cumulative-flow")]
        public async Task<ActionResult<object>> GetCumulativeFlowDiagram([FromQuery] int projectId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null)
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
            startDate = startDate ?? DateTime.Today.AddDays(-30);
            endDate = endDate ?? DateTime.Today;

            // Get all tasks for the project that were created within the date range
            var tasks = await _context.Tasks
                .Include(t => t.UserStory)
                    .ThenInclude(us => us.Project)
                .Where(t => t.UserStory.ProjectId == projectId && 
                           t.CreatedAt >= startDate && 
                           t.CreatedAt <= endDate.Value.Date.AddDays(1))
                .ToListAsync();

            // Generate date range for the chart
            var dateRange = Enumerable.Range(0, ((TimeSpan)(endDate.Value - startDate.Value)).Days + 1)
                .Select(i => startDate.Value.AddDays(i))
                .ToList();

            // Generate cumulative flow data for each date
            var cumulativeFlowData = new List<object>();

            foreach (var date in dateRange)
            {
                // Get tasks created on or before this date
                var tasksCreatedBeforeDate = tasks
                    .Where(t => t.CreatedAt.Date <= date.Date)
                    .ToList();

                // Count tasks in each status as of this date
                var todoCount = tasksCreatedBeforeDate.Count(t => t.IsActive && t.Status == TaskStatus.ToDo);
                var inProgressCount = tasksCreatedBeforeDate.Count(t => t.IsActive && t.Status == TaskStatus.InProgress);
                var testingCount = tasksCreatedBeforeDate.Count(t => t.IsActive && t.Status == TaskStatus.Testing);
                var completedCount = tasksCreatedBeforeDate.Count(t => t.IsActive && t.Status == TaskStatus.Completed);
                var blockedCount = tasksCreatedBeforeDate.Count(t => t.IsActive && t.Status == TaskStatus.Blocked);

                // Add data point for this date
                cumulativeFlowData.Add(new
                {
                    date = date.ToString("yyyy-MM-dd"),
                    todo = todoCount,
                    inProgress = inProgressCount,
                    testing = testingCount,
                    completed = completedCount,
                    blocked = blockedCount
                });
            }

            return Ok(new
            {
                projectId,
                projectName = project.Name,
                startDate = startDate.Value.ToString("yyyy-MM-dd"),
                endDate = endDate.Value.ToString("yyyy-MM-dd"),
                cumulativeFlowData
            });
        }
    }
}