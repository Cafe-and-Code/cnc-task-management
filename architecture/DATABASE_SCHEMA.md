# CNC Task Management System - Database Schema

## Overview

This document outlines the complete database schema for the CNC Task Management System, designed for PostgreSQL with multi-tenant architecture.

## Database Design Principles

1. **Multi-Tenancy**: All tables include an `OrganizationId` field for tenant isolation
2. **Audit Trail**: All entities include created/updated timestamps and tracking
3. **Soft Deletes**: Critical entities use soft deletes with `IsDeleted` flag
4. **Normalization**: Proper normalization to reduce data redundancy
5. **Performance**: Optimized for common query patterns with appropriate indexing

## Core Tables

### 1. Organizations

```sql
CREATE TABLE Organizations (
    Id SERIAL PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    Settings JSONB DEFAULT '{}',
    SubscriptionTier VARCHAR(50) DEFAULT 'Basic',
    MaxUsers INTEGER DEFAULT 10,
    IsActive BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_organizations_name ON Organizations(Name);
CREATE INDEX idx_organizations_is_active ON Organizations(IsActive);
```

### 2. Users

```sql
CREATE TABLE Users (
    Id SERIAL PRIMARY KEY,
    OrganizationId INTEGER NOT NULL REFERENCES Organizations(Id) ON DELETE CASCADE,
    Email VARCHAR(255) NOT NULL UNIQUE,
    UserName VARCHAR(100) NOT NULL UNIQUE,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    PasswordHash VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'Developer',
    AvatarUrl VARCHAR(500),
    IsActive BOOLEAN DEFAULT true,
    IsEmailVerified BOOLEAN DEFAULT false,
    EmailVerificationToken VARCHAR(255),
    PasswordResetToken VARCHAR(255),
    PasswordResetExpires TIMESTAMP WITH TIME ZONE,
    LastLoginAt TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_role CHECK (Role IN ('Admin', 'ProductOwner', 'ScrumMaster', 'Developer', 'Stakeholder'))
);

-- Indexes
CREATE INDEX idx_users_organization_id ON Users(OrganizationId);
CREATE INDEX idx_users_email ON Users(Email);
CREATE INDEX idx_users_role ON Users(Role);
CREATE INDEX idx_users_is_active ON Users(IsActive);
CREATE UNIQUE INDEX idx_users_org_email ON Users(OrganizationId, Email);
```

### 3. Projects

```sql
CREATE TABLE Projects (
    Id SERIAL PRIMARY KEY,
    OrganizationId INTEGER NOT NULL REFERENCES Organizations(Id) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    ProductOwnerId INTEGER REFERENCES Users(Id),
    ScrumMasterId INTEGER REFERENCES Users(Id),
    Status VARCHAR(50) DEFAULT 'Active',
    StartDate DATE,
    EndDate DATE,
    VelocityGoal DECIMAL(5,2) DEFAULT 0,
    SprintDuration INTEGER DEFAULT 14, -- in days
    IsActive BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_status CHECK (Status IN ('Active', 'OnHold', 'Completed', 'Archived')),
    CONSTRAINT chk_sprint_duration CHECK (SprintDuration BETWEEN 1 AND 30)
);

-- Indexes
CREATE INDEX idx_projects_organization_id ON Projects(OrganizationId);
CREATE INDEX idx_projects_product_owner_id ON Projects(ProductOwnerId);
CREATE INDEX idx_projects_scrum_master_id ON Projects(ScrumMasterId);
CREATE INDEX idx_projects_status ON Projects(Status);
CREATE INDEX idx_projects_is_active ON Projects(IsActive);
```

### 4. Teams

```sql
CREATE TABLE Teams (
    Id SERIAL PRIMARY KEY,
    OrganizationId INTEGER NOT NULL REFERENCES Organizations(Id) ON DELETE CASCADE,
    ProjectId INTEGER REFERENCES Projects(Id) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    IsActive BOOLEAN DEFAULT true,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_teams_organization_id ON Teams(OrganizationId);
CREATE INDEX idx_teams_project_id ON Teams(ProjectId);
CREATE INDEX idx_teams_is_active ON Teams(IsActive);
```

### 5. TeamMembers

```sql
CREATE TABLE TeamMembers (
    Id SERIAL PRIMARY KEY,
    TeamId INTEGER NOT NULL REFERENCES Teams(Id) ON DELETE CASCADE,
    UserId INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Role VARCHAR(50) NOT NULL DEFAULT 'Developer',
    JoinedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    LeftAt TIMESTAMP WITH TIME ZONE,
    IsActive BOOLEAN DEFAULT true,
    
    CONSTRAINT chk_team_role CHECK (Role IN ('ProductOwner', 'ScrumMaster', 'Developer', 'Tester', 'Designer')),
    CONSTRAINT unique_team_user UNIQUE(TeamId, UserId)
);

-- Indexes
CREATE INDEX idx_team_members_team_id ON TeamMembers(TeamId);
CREATE INDEX idx_team_members_user_id ON TeamMembers(UserId);
CREATE INDEX idx_team_members_is_active ON TeamMembers(IsActive);
```

### 6. Sprints

```sql
CREATE TABLE Sprints (
    Id SERIAL PRIMARY KEY,
    ProjectId INTEGER NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL,
    Goal TEXT,
    StartDate TIMESTAMP WITH TIME ZONE,
    EndDate TIMESTAMP WITH TIME ZONE,
    Status VARCHAR(50) DEFAULT 'Planning',
    Capacity DECIMAL(5,2) DEFAULT 0, -- in story points
    Velocity DECIMAL(5,2) DEFAULT 0, -- actual velocity
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_sprint_status CHECK (Status IN ('Planning', 'Active', 'Completed', 'Cancelled')),
    CONSTRAINT chk_dates CHECK (EndDate > StartDate)
);

-- Indexes
CREATE INDEX idx_sprints_project_id ON Sprints(ProjectId);
CREATE INDEX idx_sprints_status ON Sprints(Status);
CREATE INDEX idx_sprints_dates ON Sprints(StartDate, EndDate);
```

### 7. ProductBacklog

```sql
CREATE TABLE ProductBacklog (
    Id SERIAL PRIMARY KEY,
    ProjectId INTEGER NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL DEFAULT 'Product Backlog',
    Description TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_project_backlog UNIQUE(ProjectId)
);

-- Indexes
CREATE INDEX idx_product_backlog_project_id ON ProductBacklog(ProjectId);
```

### 8. UserStories

```sql
CREATE TABLE UserStories (
    Id SERIAL PRIMARY KEY,
    ProjectId INTEGER NOT NULL REFERENCES Projects(Id) ON DELETE CASCADE,
    ProductBacklogId INTEGER NOT NULL REFERENCES ProductBacklog(Id) ON DELETE CASCADE,
    SprintId INTEGER REFERENCES Sprints(Id) ON DELETE SET NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    AcceptanceCriteria TEXT,
    StoryPoints INTEGER DEFAULT 0,
    Priority INTEGER DEFAULT 0, -- 0 = lowest, 10 = highest
    Status VARCHAR(50) DEFAULT 'Backlog',
    AssigneeId INTEGER REFERENCES Users(Id) ON DELETE SET NULL,
    ReporterId INTEGER REFERENCES Users(Id),
    EstimatedHours DECIMAL(5,2),
    ActualHours DECIMAL(5,2) DEFAULT 0,
    BusinessValue INTEGER DEFAULT 0,
    IsDeleted BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_story_points CHECK (StoryPoints BETWEEN 0 AND 100),
    CONSTRAINT chk_priority CHECK (Priority BETWEEN 0 AND 10),
    CONSTRAINT chk_status CHECK (Status IN ('Backlog', 'Refinement', 'Ready', 'InProgress', 'Testing', 'Done', 'Rejected'))
);

-- Indexes
CREATE INDEX idx_user_stories_project_id ON UserStories(ProjectId);
CREATE INDEX idx_user_stories_backlog_id ON UserStories(ProductBacklogId);
CREATE INDEX idx_user_stories_sprint_id ON UserStories(SprintId);
CREATE INDEX idx_user_stories_status ON UserStories(Status);
CREATE INDEX idx_user_stories_priority ON UserStories(Priority);
CREATE INDEX idx_user_stories_assignee_id ON UserStories(AssigneeId);
CREATE INDEX idx_user_stories_is_deleted ON UserStories(IsDeleted);
```

### 9. SprintBacklog

```sql
CREATE TABLE SprintBacklog (
    Id SERIAL PRIMARY KEY,
    SprintId INTEGER NOT NULL REFERENCES Sprints(Id) ON DELETE CASCADE,
    Name VARCHAR(255) NOT NULL DEFAULT 'Sprint Backlog',
    Description TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_sprint_backlog UNIQUE(SprintId)
);

-- Indexes
CREATE INDEX idx_sprint_backlog_sprint_id ON SprintBacklog(SprintId);
```

### 10. Tasks

```sql
CREATE TABLE Tasks (
    Id SERIAL PRIMARY KEY,
    UserStoryId INTEGER NOT NULL REFERENCES UserStories(Id) ON DELETE CASCADE,
    SprintBacklogId INTEGER REFERENCES SprintBacklog(Id) ON DELETE SET NULL,
    Title VARCHAR(255) NOT NULL,
    Description TEXT,
    Status VARCHAR(50) DEFAULT 'ToDo',
    Type VARCHAR(50) DEFAULT 'Development',
    AssigneeId INTEGER REFERENCES Users(Id) ON DELETE SET NULL,
    ReporterId INTEGER REFERENCES Users(Id),
    EstimatedHours DECIMAL(5,2),
    ActualHours DECIMAL(5,2) DEFAULT 0,
    RemainingHours DECIMAL(5,2),
    ParentTaskId INTEGER REFERENCES Tasks(Id) ON DELETE SET NULL,
    OrderIndex INTEGER DEFAULT 0,
    DueDate TIMESTAMP WITH TIME ZONE,
    CompletedAt TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_task_status CHECK (Status IN ('ToDo', 'InProgress', 'InReview', 'Testing', 'Done', 'Blocked')),
    CONSTRAINT chk_task_type CHECK (Type IN ('Development', 'Testing', 'Documentation', 'Research', 'Design', 'Meeting'))
);

-- Indexes
CREATE INDEX idx_tasks_user_story_id ON Tasks(UserStoryId);
CREATE INDEX idx_tasks_sprint_backlog_id ON Tasks(SprintBacklogId);
CREATE INDEX idx_tasks_status ON Tasks(Status);
CREATE INDEX idx_tasks_assignee_id ON Tasks(AssigneeId);
CREATE INDEX idx_tasks_parent_task_id ON Tasks(ParentTaskId);
CREATE INDEX idx_tasks_due_date ON Tasks(DueDate);
```

### 11. Comments

```sql
CREATE TABLE Comments (
    Id SERIAL PRIMARY KEY,
    EntityType VARCHAR(50) NOT NULL, -- 'UserStory', 'Task', etc.
    EntityId INTEGER NOT NULL,
    Content TEXT NOT NULL,
    AuthorId INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    ParentCommentId INTEGER REFERENCES Comments(Id) ON DELETE SET NULL,
    IsEdited BOOLEAN DEFAULT false,
    IsDeleted BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_entity_type CHECK (EntityType IN ('UserStory', 'Task', 'Project', 'Sprint'))
);

-- Indexes
CREATE INDEX idx_comments_entity ON Comments(EntityType, EntityId);
CREATE INDEX idx_comments_author_id ON Comments(AuthorId);
CREATE INDEX idx_comments_parent_id ON Comments(ParentCommentId);
CREATE INDEX idx_comments_created_at ON Comments(CreatedAt);
CREATE INDEX idx_comments_is_deleted ON Comments(IsDeleted);
```

### 12. Attachments

```sql
CREATE TABLE Attachments (
    Id SERIAL PRIMARY KEY,
    EntityType VARCHAR(50) NOT NULL, -- 'UserStory', 'Task', 'Comment', etc.
    EntityId INTEGER NOT NULL,
    FileName VARCHAR(255) NOT NULL,
    OriginalFileName VARCHAR(255) NOT NULL,
    FilePath VARCHAR(500) NOT NULL,
    FileSize INTEGER NOT NULL,
    ContentType VARCHAR(100),
    UploadedById INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    IsDeleted BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_attachment_entity_type CHECK (EntityType IN ('UserStory', 'Task', 'Comment', 'Project'))
);

-- Indexes
CREATE INDEX idx_attachments_entity ON Attachments(EntityType, EntityId);
CREATE INDEX idx_attachments_uploaded_by_id ON Attachments(UploadedById);
CREATE INDEX idx_attachments_is_deleted ON Attachments(IsDeleted);
```

### 13. Activities

```sql
CREATE TABLE Activities (
    Id SERIAL PRIMARY KEY,
    OrganizationId INTEGER NOT NULL REFERENCES Organizations(Id) ON DELETE CASCADE,
    ProjectId INTEGER REFERENCES Projects(Id) ON DELETE CASCADE,
    UserId INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    ActionType VARCHAR(100) NOT NULL,
    EntityType VARCHAR(50) NOT NULL,
    EntityId INTEGER NOT NULL,
    EntityName VARCHAR(255),
    OldValues JSONB,
    NewValues JSONB,
    Description TEXT,
    IpAddress INET,
    UserAgent TEXT,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_activities_organization_id ON Activities(OrganizationId);
CREATE INDEX idx_activities_project_id ON Activities(ProjectId);
CREATE INDEX idx_activities_user_id ON Activities(UserId);
CREATE INDEX idx_actions_type ON Activities(ActionType);
CREATE INDEX idx_activities_entity ON Activities(EntityType, EntityId);
CREATE INDEX idx_activities_created_at ON Activities(CreatedAt);
```

### 14. Notifications

```sql
CREATE TABLE Notifications (
    Id SERIAL PRIMARY KEY,
    OrganizationId INTEGER NOT NULL REFERENCES Organizations(Id) ON DELETE CASCADE,
    UserId INTEGER NOT NULL REFERENCES Users(Id) ON DELETE CASCADE,
    Type VARCHAR(100) NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    EntityType VARCHAR(50),
    EntityId INTEGER,
    ActionUrl VARCHAR(500),
    IsRead BOOLEAN DEFAULT false,
    ReadAt TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_notifications_organization_id ON Notifications(OrganizationId);
CREATE INDEX idx_notifications_user_id ON Notifications(UserId);
CREATE INDEX idx_notifications_type ON Notifications(Type);
CREATE INDEX idx_notifications_is_read ON Notifications(IsRead);
CREATE INDEX idx_notifications_created_at ON Notifications(CreatedAt);
```

### 15. GitHubIntegrations

```sql
CREATE TABLE GitHubIntegrations (
    Id SERIAL PRIMARY KEY,
    OrganizationId INTEGER NOT NULL REFERENCES Organizations(Id) ON DELETE CASCADE,
    ProjectId INTEGER REFERENCES Projects(Id) ON DELETE CASCADE,
    RepositoryName VARCHAR(255) NOT NULL,
    RepositoryOwner VARCHAR(255) NOT NULL,
    AccessToken VARCHAR(500) NOT NULL, -- encrypted
    WebhookSecret VARCHAR(255), -- encrypted
    IsActive BOOLEAN DEFAULT true,
    SyncIssues BOOLEAN DEFAULT true,
    SyncCommits BOOLEAN DEFAULT true,
    LastSyncAt TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT unique_org_project_repo UNIQUE(OrganizationId, ProjectId, RepositoryOwner, RepositoryName)
);

-- Indexes
CREATE INDEX idx_github_integrations_organization_id ON GitHubIntegrations(OrganizationId);
CREATE INDEX idx_github_integrations_project_id ON GitHubIntegrations(ProjectId);
CREATE INDEX idx_github_integrations_is_active ON GitHubIntegrations(IsActive);
```

### 16. GitHubSyncMappings

```sql
CREATE TABLE GitHubSyncMappings (
    Id SERIAL PRIMARY KEY,
    GitHubIntegrationId INTEGER NOT NULL REFERENCES GitHubIntegrations(Id) ON DELETE CASCADE,
    EntityType VARCHAR(50) NOT NULL, -- 'UserStory', 'Task'
    EntityId INTEGER NOT NULL,
    GitHubIssueNumber INTEGER NOT NULL,
    SyncDirection VARCHAR(20) NOT NULL DEFAULT 'Bidirectional', -- 'ToGitHub', 'FromGitHub', 'Bidirectional'
    LastSyncAt TIMESTAMP WITH TIME ZONE,
    CreatedAt TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_github_entity_type CHECK (EntityType IN ('UserStory', 'Task')),
    CONSTRAINT chk_sync_direction CHECK (SyncDirection IN ('ToGitHub', 'FromGitHub', 'Bidirectional')),
    CONSTRAINT unique_integration_entity UNIQUE(GitHubIntegrationId, EntityType, EntityId),
    CONSTRAINT unique_integration_github UNIQUE(GitHubIntegrationId, GitHubIssueNumber)
);

-- Indexes
CREATE INDEX idx_github_mappings_integration_id ON GitHubSyncMappings(GitHubIntegrationId);
CREATE INDEX idx_github_mappings_entity ON GitHubSyncMappings(EntityType, EntityId);
CREATE INDEX idx_github_mappings_issue_number ON GitHubSyncMappings(GitHubIssueNumber);
```

## Views for Common Queries

### 1. SprintBurndownView

```sql
CREATE VIEW SprintBurndownView AS
SELECT 
    s.Id as SprintId,
    s.ProjectId,
    s.Name as SprintName,
    s.StartDate,
    s.EndDate,
    s.Capacity,
    COALESCE(SUM(t.EstimatedHours), 0) as TotalEstimatedHours,
    COALESCE(SUM(t.ActualHours), 0) as TotalActualHours,
    COALESCE(SUM(t.RemainingHours), 0) as TotalRemainingHours,
    COUNT(t.Id) as TotalTasks,
    COUNT(CASE WHEN t.Status = 'Done' THEN 1 END) as CompletedTasks
FROM Sprints s
LEFT JOIN SprintBacklog sb ON s.Id = sb.SprintId
LEFT JOIN Tasks t ON sb.Id = t.SprintBacklogId
GROUP BY s.Id, s.ProjectId, s.Name, s.StartDate, s.EndDate, s.Capacity;
```

### 2. ProjectVelocityView

```sql
CREATE VIEW ProjectVelocityView AS
SELECT 
    p.Id as ProjectId,
    p.Name as ProjectName,
    COUNT(s.Id) as TotalSprints,
    COALESCE(AVG(s.Velocity), 0) as AverageVelocity,
    COALESCE(MAX(s.Velocity), 0) as MaxVelocity,
    COALESCE(MIN(s.Velocity), 0) as MinVelocity
FROM Projects p
LEFT JOIN Sprints s ON p.Id = s.ProjectId AND s.Status = 'Completed'
GROUP BY p.Id, p.Name;
```

## Database Triggers

### 1. Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.UpdatedAt = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with UpdatedAt column
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON Organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... continue for all relevant tables
```

### 2. Activity Logging Trigger

```sql
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Activities (OrganizationId, ProjectId, UserId, ActionType, EntityType, EntityId, EntityName, NewValues)
        VALUES (NEW.OrganizationId, NEW.ProjectId, NEW.ReporterId, 'CREATE', TG_TABLE_NAME, NEW.Id, NEW.Name, row_to_json(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO Activities (OrganizationId, ProjectId, UserId, ActionType, EntityType, EntityId, EntityName, OldValues, NewValues)
        VALUES (NEW.OrganizationId, NEW.ProjectId, NEW.ReporterId, 'UPDATE', TG_TABLE_NAME, NEW.Id, NEW.Name, row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Apply to key entities
CREATE TRIGGER log_user_story_activity AFTER INSERT OR UPDATE ON UserStories
    FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER log_task_activity AFTER INSERT OR UPDATE ON Tasks
    FOR EACH ROW EXECUTE FUNCTION log_activity();
```

## Database Initialization Script

```sql
-- Create database
CREATE DATABASE CNCTaskManagementDB;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create enum types
CREATE TYPE UserRole AS ENUM ('Admin', 'ProductOwner', 'ScrumMaster', 'Developer', 'Stakeholder');
CREATE TYPE ProjectStatus AS ENUM ('Active', 'OnHold', 'Completed', 'Archived');
CREATE TYPE SprintStatus AS ENUM ('Planning', 'Active', 'Completed', 'Cancelled');
CREATE TYPE StoryStatus AS ENUM ('Backlog', 'Refinement', 'Ready', 'InProgress', 'Testing', 'Done', 'Rejected');
CREATE TYPE TaskStatus AS ENUM ('ToDo', 'InProgress', 'InReview', 'Testing', 'Done', 'Blocked');

-- Execute all table creation scripts in order
-- ... (all the CREATE TABLE statements above)

-- Create initial admin user for each organization
INSERT INTO Users (OrganizationId, Email, UserName, FirstName, LastName, PasswordHash, Role, IsActive, IsEmailVerified)
SELECT 
    Id,
    'admin@' || REPLACE(Name, ' ', '') || '.com',
    'admin_' || REPLACE(Name, ' ', ''),
    'Admin',
    'User',
    '$2a$10$example_hash', -- This should be properly hashed
    'Admin',
    true,
    true
FROM Organizations;
```

## Performance Optimization

### Indexes for Common Queries

```sql
-- Composite indexes for common filter combinations
CREATE INDEX idx_user_stories_project_status ON UserStories(ProjectId, Status);
CREATE INDEX idx_tasks_assignee_status ON Tasks(AssigneeId, Status);
CREATE INDEX idx_sprints_project_status ON Sprints(ProjectId, Status);
CREATE INDEX idx_activities_project_date ON Activities(ProjectId, CreatedAt);
CREATE INDEX idx_notifications_user_read ON Notifications(UserId, IsRead);
```

### Partitioning for Large Tables

```sql
-- Partition Activities table by date for better performance
CREATE TABLE Activities_Partitioned (
    LIKE Activities INCLUDING ALL
) PARTITION BY RANGE (CreatedAt);

-- Create monthly partitions
CREATE TABLE Activities_2024_01 PARTITION OF Activities_Partitioned
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- Create more partitions as needed
```

This comprehensive database schema provides a solid foundation for the CNC Task Management System with proper normalization, indexing, and multi-tenant support.