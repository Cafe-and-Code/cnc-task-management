using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using CNCTaskManagement.Core.Entities;
using CNCTaskManagement.Core.Enums;
using CNCTaskManagement.Infrastructure.Data;
using CNCTaskManagement.Api.Attributes;

namespace CNCTaskManagement.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TeamsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TeamsController(AppDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Get all teams in the organization
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<object>> GetTeams(
            [FromQuery] int? projectId = null)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);
            var currentUserIdInt = int.Parse(currentUserId);

            // Start with base query
            var query = _context.Teams
                .Include(t => t.Members)
                .ThenInclude(tm => tm.User)
                .Where(t => t.OrganizationId == organizationId);

            // Filter by project if specified
            if (projectId.HasValue)
            {
                query = query.Where(t => t.ProjectId == projectId.Value);
            }

            var teams = await query
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Description,
                    t.ProjectId,
                    t.IsActive,
                    MemberCount = t.Members.Count(m => m.IsActive),
                    Members = t.Members.Where(m => m.IsActive).Select(m => new
                    {
                        m.Id,
                        Role = m.Role,
                        JoinedAt = m.JoinedAt,
                        User = new
                        {
                            m.User.Id,
                            m.User.FirstName,
                            m.User.LastName,
                            m.User.Email,
                            m.User.AvatarUrl,
                            m.User.Role
                        }
                    }).ToList()
                })
                .ToListAsync();

            return Ok(teams);
        }

        /// <summary>
        /// Get team by ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetTeam(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var team = await _context.Teams
                .Include(t => t.Members)
                .ThenInclude(tm => tm.User)
                .Where(t => t.Id == id && t.OrganizationId == organizationId)
                .Select(t => new
                {
                    t.Id,
                    t.Name,
                    t.Description,
                    t.ProjectId,
                    t.IsActive,
                    Members = t.Members.Where(m => m.IsActive).Select(m => new
                    {
                        m.Id,
                        Role = m.Role,
                        JoinedAt = m.JoinedAt,
                        User = new
                        {
                            m.User.Id,
                            m.User.FirstName,
                            m.User.LastName,
                            m.User.Email,
                            m.User.AvatarUrl,
                            m.User.Role
                        }
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (team == null)
            {
                return NotFound();
            }

            return Ok(team);
        }

        /// <summary>
        /// Create a new team
        /// </summary>
        [HttpPost]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<ActionResult<Team>> CreateTeam([FromBody] CreateTeamModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify project exists if specified
            if (model.ProjectId.HasValue)
            {
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == model.ProjectId.Value && p.OrganizationId == organizationId);

                if (project == null)
                {
                    return BadRequest(new { Message = "Project not found" });
                }
            }

            var team = new Team
            {
                Name = model.Name,
                Description = model.Description,
                ProjectId = model.ProjectId,
                OrganizationId = organizationId,
                IsActive = true
            };

            _context.Teams.Add(team);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTeam), new { id = team.Id }, team);
        }

        /// <summary>
        /// Update a team
        /// </summary>
        [HttpPut("{id}")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> UpdateTeam(int id, [FromBody] UpdateTeamModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.OrganizationId == organizationId);

            if (team == null)
            {
                return NotFound();
            }

            // Verify project exists if specified
            if (model.ProjectId.HasValue)
            {
                var project = await _context.Projects
                    .FirstOrDefaultAsync(p => p.Id == model.ProjectId.Value && p.OrganizationId == organizationId);

                if (project == null)
                {
                    return BadRequest(new { Message = "Project not found" });
                }
            }

            team.Name = model.Name ?? team.Name;
            team.Description = model.Description ?? team.Description;
            team.ProjectId = model.ProjectId ?? team.ProjectId;
            team.UpdatedAt = DateTime.UtcNow;
            team.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Team updated successfully" });
        }

        /// <summary>
        /// Delete a team
        /// </summary>
        [HttpDelete("{id}")]
        [RequireRole(UserRole.Admin)]
        public async Task<IActionResult> DeleteTeam(int id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.OrganizationId == organizationId);

            if (team == null)
            {
                return NotFound();
            }

            // Deactivate all team members
            var teamMembers = await _context.TeamMembers
                .Where(tm => tm.TeamId == id)
                .ToListAsync();

            foreach (var member in teamMembers)
            {
                member.IsActive = false;
                member.LeftAt = DateTime.UtcNow;
            }

            // Deactivate the team
            team.IsActive = false;
            team.UpdatedAt = DateTime.UtcNow;
            team.UpdatedBy = currentUserId;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Team deleted successfully" });
        }

        /// <summary>
        /// Add member to team
        /// </summary>
        [HttpPost("{id}/members")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> AddTeamMember(int id, [FromBody] AddTeamMemberModel model)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify team exists
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.OrganizationId == organizationId);

            if (team == null)
            {
                return NotFound();
            }

            // Verify user exists and is in the same organization
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Id == model.UserId && u.OrganizationId == organizationId);

            if (user == null)
            {
                return BadRequest(new { Message = "User not found" });
            }

            // Check if user is already a team member
            var existingMembership = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.TeamId == id && tm.UserId == model.UserId && tm.IsActive);

            if (existingMembership != null)
            {
                return BadRequest(new { Message = "User is already a team member" });
            }

            // Create new team membership
            var teamMember = new TeamMember
            {
                TeamId = id,
                UserId = model.UserId,
                Role = model.Role,
                IsActive = true,
                JoinedAt = DateTime.UtcNow,
                OrganizationId = organizationId
            };

            _context.TeamMembers.Add(teamMember);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Team member added successfully" });
        }

        /// <summary>
        /// Remove member from team
        /// </summary>
        [HttpDelete("{id}/members/{memberId}")]
        [RequireRole(UserRole.Admin, UserRole.ScrumMaster)]
        public async Task<IActionResult> RemoveTeamMember(int id, int memberId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserOrganizationId = User.FindFirstValue("OrganizationId");

            if (currentUserOrganizationId == null || currentUserId == null)
            {
                return Unauthorized();
            }

            var organizationId = int.Parse(currentUserOrganizationId);

            // Verify team exists
            var team = await _context.Teams
                .FirstOrDefaultAsync(t => t.Id == id && t.OrganizationId == organizationId);

            if (team == null)
            {
                return NotFound();
            }

            // Find team member
            var teamMember = await _context.TeamMembers
                .FirstOrDefaultAsync(tm => tm.Id == memberId && tm.TeamId == id);

            if (teamMember == null)
            {
                return NotFound();
            }

            // Deactivate team membership
            teamMember.IsActive = false;
            teamMember.LeftAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Team member removed successfully" });
        }
    }

    // DTOs for team management
    public class CreateTeamModel
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? ProjectId { get; set; }
    }

    public class UpdateTeamModel
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public int? ProjectId { get; set; }
    }

    public class AddTeamMemberModel
    {
        public int UserId { get; set; }
        public string Role { get; set; } = "Developer";
    }
}