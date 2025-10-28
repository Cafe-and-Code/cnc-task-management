using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using CNCTaskManagement.Core.Entities;
using Task = CNCTaskManagement.Core.Entities.Task;

namespace CNCTaskManagement.Infrastructure.Data
{
    /// <summary>
    /// Entity Framework database context
    /// </summary>
    public class AppDbContext : IdentityDbContext<User, IdentityRole<int>, int>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSets for all entities
        public DbSet<Organization> Organizations { get; set; }
        // Users DbSet is inherited from IdentityDbContext
        public DbSet<Project> Projects { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<Sprint> Sprints { get; set; }
        public DbSet<UserStory> UserStories { get; set; }
        public DbSet<Task> Tasks { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<AuditLog> AuditLogs { get; set; }
        public DbSet<GitHubIntegration> GitHubIntegrations { get; set; }
        public DbSet<GitHubWebhook> GitHubWebhooks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Apply configurations
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

            // Set up global query filters for multi-tenancy
            ConfigureMultiTenancy(modelBuilder);

            // Configure relationships
            ConfigureRelationships(modelBuilder);
        }

        /// <summary>
        /// Configure global query filters for multi-tenancy
        /// </summary>
        private void ConfigureMultiTenancy(ModelBuilder modelBuilder)
        {
            // Add OrganizationId filter to all entities that inherit from BaseEntity
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
                {
                    modelBuilder.Entity(entityType.ClrType).HasQueryFilter(
                        CreateSoftDeleteFilter(entityType.ClrType));
                }
            }
        }

        /// <summary>
        /// Create a soft delete filter for the specified entity type
        /// </summary>
        private static System.Linq.Expressions.LambdaExpression CreateSoftDeleteFilter(Type entityType)
        {
            // This is a simplified version - in a real implementation,
            // you would create a proper expression tree for the soft delete filter
            return null!;
        }

        /// <summary>
        /// Configure relationships between entities
        /// </summary>
        private void ConfigureRelationships(ModelBuilder modelBuilder)
        {
            // User relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Organization)
                .WithMany(o => o.Users)
                .HasForeignKey(u => u.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // Project relationships
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Organization)
                .WithMany(o => o.Projects)
                .HasForeignKey(p => p.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.ProductOwner)
                .WithMany()
                .HasForeignKey(p => p.ProductOwnerId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Project>()
                .HasOne(p => p.ScrumMaster)
                .WithMany()
                .HasForeignKey(p => p.ScrumMasterId)
                .OnDelete(DeleteBehavior.SetNull);

            // Team relationships
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Organization)
                .WithMany(o => o.Teams)
                .HasForeignKey(t => t.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Team>()
                .HasOne(t => t.Project)
                .WithMany(p => p.Teams)
                .HasForeignKey(t => t.ProjectId)
                .OnDelete(DeleteBehavior.SetNull);

            // TeamMember relationships
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.Team)
                .WithMany(t => t.Members)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.User)
                .WithMany(u => u.TeamMemberships)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Sprint relationships
            modelBuilder.Entity<Sprint>()
                .HasOne(s => s.Project)
                .WithMany(p => p.Sprints)
                .HasForeignKey(s => s.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            // UserStory relationships
            modelBuilder.Entity<UserStory>()
                .HasOne(us => us.Project)
                .WithMany(p => p.UserStories)
                .HasForeignKey(us => us.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<UserStory>()
                .HasOne(us => us.Sprint)
                .WithMany()
                .HasForeignKey(us => us.SprintId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<UserStory>()
                .HasOne(us => us.CreatedByUser)
                .WithMany()
                .HasForeignKey(us => us.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<UserStory>()
                .HasOne(us => us.AssignedToUser)
                .WithMany()
                .HasForeignKey(us => us.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Task relationships
            modelBuilder.Entity<Task>()
                .HasOne(t => t.UserStory)
                .WithMany(us => us.Tasks)
                .HasForeignKey(t => t.UserStoryId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Task>()
                .HasOne(t => t.CreatedByUser)
                .WithMany()
                .HasForeignKey(t => t.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<Task>()
                .HasOne(t => t.AssignedToUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedToUserId)
                .OnDelete(DeleteBehavior.SetNull);

            // Notification relationships
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany()
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Organization)
                .WithMany()
                .HasForeignKey(n => n.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // AuditLog relationships
            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.User)
                .WithMany()
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            modelBuilder.Entity<AuditLog>()
                .HasOne(a => a.Organization)
                .WithMany()
                .HasForeignKey(a => a.OrganizationId)
                .OnDelete(DeleteBehavior.Cascade);

            // GitHubIntegration relationships
            modelBuilder.Entity<GitHubIntegration>()
                .HasOne(g => g.User)
                .WithMany()
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // GitHubWebhook relationships
            modelBuilder.Entity<GitHubWebhook>()
                .HasOne(g => g.User)
                .WithMany()
                .HasForeignKey(g => g.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        /// <summary>
        /// Override SaveChanges to update audit fields
        /// </summary>
        public override int SaveChanges()
        {
            UpdateAuditFields();
            CreateAuditLogs();
            return base.SaveChanges();
        }

        /// <summary>
        /// Override SaveChangesAsync to update audit fields
        /// </summary>
        public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            UpdateAuditFields();
            CreateAuditLogs();
            return await base.SaveChangesAsync(cancellationToken);
        }

        /// <summary>
        /// Update audit fields before saving changes
        /// </summary>
        private void UpdateAuditFields()
        {
            var entries = ChangeTracker.Entries<BaseEntity>();

            foreach (var entry in entries)
            {
                var currentUser = GetCurrentUser();

                if (entry.State == EntityState.Added)
                {
                    entry.Property(e => e.CreatedAt).CurrentValue = DateTime.UtcNow;
                    entry.Property(e => e.CreatedBy).CurrentValue = currentUser;
                }
                else if (entry.State == EntityState.Modified)
                {
                    entry.Property(e => e.UpdatedAt).CurrentValue = DateTime.UtcNow;
                    entry.Property(e => e.UpdatedBy).CurrentValue = currentUser;
                }
            }
        }

        /// <summary>
        /// Create audit logs for modified entities
        /// </summary>
        private void CreateAuditLogs()
        {
            // This is a simplified implementation
            // In a real scenario, you would create detailed audit logs for all changes

            var modifiedEntries = ChangeTracker.Entries()
                .Where(e => e.State == EntityState.Modified || e.State == EntityState.Added || e.State == EntityState.Deleted)
                .ToList();

            foreach (var entry in modifiedEntries)
            {
                // Don't create audit logs for AuditLog, GitHubIntegration, GitHubWebhook, or UserStory entities to avoid infinite recursion and constraint issues
                if (entry.Entity.GetType() == typeof(AuditLog) ||
                    entry.Entity.GetType() == typeof(GitHubIntegration) ||
                    entry.Entity.GetType() == typeof(GitHubWebhook) ||
                    entry.Entity.GetType() == typeof(UserStory))
                    continue;

                // Only create audit logs for specific entity types
                if (!IsAuditableEntity(entry.Entity.GetType()))
                    continue;

                var currentUser = GetCurrentUser();
                var organizationId = GetCurrentUserOrganizationId(entry);

                if (organizationId == null) continue;

                var auditLog = new AuditLog
                {
                    Action = entry.State.ToString(),
                    EntityType = entry.Entity.GetType().Name,
                    EntityId = GetEntityId(entry),
                    UserId = int.TryParse(currentUser, out int userId) ? userId : null,
                    OrganizationId = organizationId.Value,
                    IpAddress = GetCurrentUserIpAddress(),
                    UserAgent = GetCurrentUserAgent(),
                    CreatedAt = DateTime.UtcNow,
                    CreatedBy = currentUser
                };

                // Add property-level changes
                if (entry.State == EntityState.Modified)
                {
                    var properties = entry.Properties
                        .Where(p => p.IsModified)
                        .ToList();

                    if (properties.Count == 1)
                    {
                        var property = properties.First();
                        auditLog.PropertyName = property.Metadata.Name;
                        auditLog.OldValue = property.OriginalValue?.ToString();
                        auditLog.NewValue = property.CurrentValue?.ToString();
                    }
                    else if (properties.Count > 1)
                    {
                        // For multiple properties, we'll just create a summary
                        auditLog.Details = $"{properties.Count} properties modified";
                    }
                }

                AuditLogs.Add(auditLog);
            }
        }

        /// <summary>
        /// Check if an entity type should be audited
        /// </summary>
        private bool IsAuditableEntity(Type entityType)
        {
            // Define which entity types should be audited
            var auditableTypes = new[]
            {
                typeof(Project),
                typeof(Sprint),
                typeof(UserStory),
                typeof(Task),
                typeof(Team),
                typeof(TeamMember),
                typeof(User),
                typeof(Notification),
                typeof(GitHubIntegration),
                typeof(GitHubWebhook)
            };

            return auditableTypes.Contains(entityType);
        }

        /// <summary>
        /// Get the ID of an entity
        /// </summary>
        private int GetEntityId(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            var idProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "Id");
            return idProperty != null ? (int)(idProperty.CurrentValue ?? 0) : 0;
        }

        /// <summary>
        /// Get the current user ID from the context
        /// </summary>
        private string? GetCurrentUser()
        {
            // In a real implementation, you would get the current user from the HttpContext
            // This is a simplified version
            return "system";
        }

        /// <summary>
        /// Get the current user's organization ID
        /// </summary>
        private int? GetCurrentUserOrganizationId(Microsoft.EntityFrameworkCore.ChangeTracking.EntityEntry entry)
        {
            // Try to get OrganizationId from the entity
            var orgIdProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "OrganizationId");
            if (orgIdProperty != null)
            {
                return (int?)(orgIdProperty.CurrentValue);
            }

            // For entities that don't have OrganizationId directly, try to get it through relationships
            if (entry.Entity.GetType() == typeof(UserStory))
            {
                // For UserStory, get OrganizationId through the Project relationship
                var projectIdProperty = entry.Properties.FirstOrDefault(p => p.Metadata.Name == "ProjectId");
                if (projectIdProperty != null && projectIdProperty.CurrentValue != null)
                {
                    var projectId = (int)projectIdProperty.CurrentValue;
                    // Get the project to find its OrganizationId
                    var project = Projects.FirstOrDefault(p => p.Id == projectId);
                    return project?.OrganizationId;
                }
            }

            return null;
        }

        /// <summary>
        /// Get the current user's IP address
        /// </summary>
        private string? GetCurrentUserIpAddress()
        {
            // In a real implementation, you would get the IP address from the HttpContext
            // This is a simplified version
            return "127.0.0.1";
        }

        /// <summary>
        /// Get the current user's user agent
        /// </summary>
        private string? GetCurrentUserAgent()
        {
            // In a real implementation, you would get the user agent from the HttpContext
            // This is a simplified version
            return null;
        }
    }
}
