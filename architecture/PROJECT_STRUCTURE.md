# CNC Task Management System - Project Structure

## Solution Overview

The solution is organized into two main projects:
1. **Backend API** - .NET 8 Web API with multi-tenant architecture
2. **Frontend Application** - React with TypeScript and Tailwind CSS

## Backend Project Structure

```
CNCTaskManagement.Api/
├── CNCTaskManagement.Api.sln
├── src/
│   ├── CNCTaskManagement.Api/
│   │   ├── Controllers/
│   │   │   ├── AuthController.cs
│   │   │   ├── OrganizationsController.cs
│   │   │   ├── UsersController.cs
│   │   │   ├── ProjectsController.cs
│   │   │   ├── SprintsController.cs
│   │   │   ├── BacklogController.cs
│   │   │   ├── TasksController.cs
│   │   │   ├── TeamsController.cs
│   │   │   ├── ReportsController.cs
│   │   │   └── IntegrationsController.cs
│   │   ├── Hubs/
│   │   │   ├── ProjectHub.cs
│   │   │   └── NotificationHub.cs
│   │   ├── Middleware/
│   │   │   ├── TenantMiddleware.cs
│   │   │   └── AuditLoggingMiddleware.cs
│   │   ├── Models/
│   │   │   ├── DTOs/
│   │   │   │   ├── Request/
│   │   │   │   │   ├── LoginRequest.cs
│   │   │   │   │   ├── RegisterRequest.cs
│   │   │   │   │   ├── CreateProjectRequest.cs
│   │   │   │   │   ├── CreateSprintRequest.cs
│   │   │   │   │   ├── CreateUserStoryRequest.cs
│   │   │   │   │   ├── CreateTaskRequest.cs
│   │   │   │   │   └── UpdateTaskStatusRequest.cs
│   │   │   │   └── Response/
│   │   │   │       ├── AuthResponse.cs
│   │   │   │       ├── UserResponse.cs
│   │   │   │       ├── ProjectResponse.cs
│   │   │   │       ├── SprintResponse.cs
│   │   │   │       ├── UserStoryResponse.cs
│   │   │   │       ├── TaskResponse.cs
│   │   │   │       └── TeamResponse.cs
│   │   │   └── Configuration/
│   │   │       ├── JwtSettings.cs
│   │   │       ├── DatabaseSettings.cs
│   │   │       └── IntegrationSettings.cs
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   ├── appsettings.Development.json
│   │   ├── appsettings.Production.json
│   │   └── CNCTaskManagement.Api.csproj
│   ├── CNCTaskManagement.Core/
│   │   ├── Entities/
│   │   │   ├── Organization.cs
│   │   │   ├── User.cs
│   │   │   ├── Project.cs
│   │   │   ├── Team.cs
│   │   │   ├── Sprint.cs
│   │   │   ├── UserStory.cs
│   │   │   ├── Task.cs
│   │   │   ├── Comment.cs
│   │   │   ├── Attachment.cs
│   │   │   ├── Activity.cs
│   │   │   └── Notification.cs
│   │   ├── Enums/
│   │   │   ├── UserRole.cs
│   │   │   ├── ProjectStatus.cs
│   │   │   ├── SprintStatus.cs
│   │   │   ├── StoryStatus.cs
│   │   │   ├── TaskStatus.cs
│   │   │   └── NotificationType.cs
│   │   ├── Interfaces/
│   │   │   ├── Repositories/
│   │   │   │   ├── IOrganizationRepository.cs
│   │   │   │   ├── IUserRepository.cs
│   │   │   │   ├── IProjectRepository.cs
│   │   │   │   ├── ITeamRepository.cs
│   │   │   │   ├── ISprintRepository.cs
│   │   │   │   ├── IUserStoryRepository.cs
│   │   │   │   ├── ITaskRepository.cs
│   │   │   │   ├── ICommentRepository.cs
│   │   │   │   ├── IAttachmentRepository.cs
│   │   │   │   ├── IActivityRepository.cs
│   │   │   │   └── INotificationRepository.cs
│   │   │   └── Services/
│   │   │       ├── IAuthService.cs
│   │   │       ├── IOrganizationService.cs
│   │   │       ├── IUserService.cs
│   │   │       ├── IProjectService.cs
│   │   │       ├── ITeamService.cs
│   │   │       ├── ISprintService.cs
│   │   │       ├── IUserStoryService.cs
│   │   │       ├── ITaskService.cs
│   │   │       ├── INotificationService.cs
│   │   │       ├── IReportService.cs
│   │   │       └── IIntegrationService.cs
│   │   ├── ValueObjects/
│   │   │   ├── StoryPoints.cs
│   │   │   ├── Email.cs
│   │   │   ├── Capacity.cs
│   │   │   └── Velocity.cs
│   │   └── CNCTaskManagement.Core.csproj
│   ├── CNCTaskManagement.Infrastructure/
│   │   ├── Data/
│   │   │   ├── AppDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── OrganizationConfiguration.cs
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── ProjectConfiguration.cs
│   │   │   │   ├── TeamConfiguration.cs
│   │   │   │   ├── SprintConfiguration.cs
│   │   │   │   ├── UserStoryConfiguration.cs
│   │   │   │   ├── TaskConfiguration.cs
│   │   │   │   ├── CommentConfiguration.cs
│   │   │   │   ├── AttachmentConfiguration.cs
│   │   │   │   ├── ActivityConfiguration.cs
│   │   │   │   └── NotificationConfiguration.cs
│   │   │   └── Migrations/
│   │   ├── Repositories/
│   │   │   ├── BaseRepository.cs
│   │   │   ├── OrganizationRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   ├── ProjectRepository.cs
│   │   │   ├── TeamRepository.cs
│   │   │   ├── SprintRepository.cs
│   │   │   ├── UserStoryRepository.cs
│   │   │   ├── TaskRepository.cs
│   │   │   ├── CommentRepository.cs
│   │   │   ├── AttachmentRepository.cs
│   │   │   ├── ActivityRepository.cs
│   │   │   └── NotificationRepository.cs
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── OrganizationService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── ProjectService.cs
│   │   │   ├── TeamService.cs
│   │   │   ├── SprintService.cs
│   │   │   ├── UserStoryService.cs
│   │   │   ├── TaskService.cs
│   │   │   ├── NotificationService.cs
│   │   │   ├── ReportService.cs
│   │   │   └── IntegrationService.cs
│   │   ├── Integrations/
│   │   │   ├── GitHub/
│   │   │   │   ├── GitHubApiClient.cs
│   │   │   │   ├── GitHubService.cs
│   │   │   │   └── Models/
│   │   │   │       ├── GitHubRepository.cs
│   │   │   │       ├── GitHubIssue.cs
│   │   │   │       └── GitHubCommit.cs
│   │   │   └── BaseIntegrationService.cs
│   │   ├── Security/
│   │   │   ├── JwtTokenService.cs
│   │   │   ├── PasswordHasher.cs
│   │   │   └── EncryptionService.cs
│   │   └── CNCTaskManagement.Infrastructure.csproj
│   └── CNCTaskManagement.Tests/
│       ├── Unit/
│       │   ├── Services/
│       │   │   ├── AuthServiceTests.cs
│       │   │   ├── ProjectServiceTests.cs
│       │   │   ├── SprintServiceTests.cs
│       │   │   └── TaskServiceTests.cs
│       │   └── Repositories/
│       │       ├── ProjectRepositoryTests.cs
│       │       └── TaskRepositoryTests.cs
│       ├── Integration/
│       │   ├── Controllers/
│       │   │   ├── AuthControllerTests.cs
│       │   │   ├── ProjectsControllerTests.cs
│       │   │   └── TasksControllerTests.cs
│       │   └── Database/
│       │       └── DatabaseIntegrationTests.cs
│       ├── TestData/
│       │   ├── Builders/
│       │   ├── Fixtures/
│       │   └── Mocks/
│       └── CNCTaskManagement.Tests.csproj
├── docker-compose.yml
├── docker-compose.override.yml
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

## Frontend Project Structure

```
cnctaskmanagement-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   └── index.ts
│   │   │   ├── UI/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Dropdown.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Table.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Forms/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── ProjectForm.tsx
│   │   │   │   ├── SprintForm.tsx
│   │   │   │   ├── UserStoryForm.tsx
│   │   │   │   ├── TaskForm.tsx
│   │   │   │   └── index.ts
│   │   │   └── Charts/
│   │   │       ├── BurndownChart.tsx
│   │   │       ├── BurnupChart.tsx
│   │   │       ├── VelocityChart.tsx
│   │   │       ├── CumulativeFlowDiagram.tsx
│   │   │       └── index.ts
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── RecentActivities.tsx
│   │   │   └── index.ts
│   │   ├── projects/
│   │   │   ├── ProjectListPage.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   ├── CreateProjectPage.tsx
│   │   │   ├── ProjectSettingsPage.tsx
│   │   │   └── index.ts
│   │   ├── backlog/
│   │   │   ├── ProductBacklogPage.tsx
│   │   │   ├── UserStoryCard.tsx
│   │   │   ├── UserStoryDetailModal.tsx
│   │   │   ├── BacklogFilters.tsx
│   │   │   └── index.ts
│   │   ├── sprints/
│   │   │   ├── SprintListPage.tsx
│   │   │   ├── SprintDetailPage.tsx
│   │   │   ├── CreateSprintPage.tsx
│   │   │   ├── SprintPlanningPage.tsx
│   │   │   └── index.ts
│   │   ├── kanban/
│   │   │   ├── KanbanBoardPage.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── Swimlane.tsx
│   │   │   └── index.ts
│   │   ├── teams/
│   │   │   ├── TeamListPage.tsx
│   │   │   ├── TeamDetailPage.tsx
│   │   │   ├── CreateTeamPage.tsx
│   │   │   ├── TeamMembersPage.tsx
│   │   │   └── index.ts
│   │   ├── reports/
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SprintReportPage.tsx
│   │   │   ├── VelocityReportPage.tsx
│   │   │   ├── CustomReportBuilder.tsx
│   │   │   └── index.ts
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── OrganizationSettingsPage.tsx
│   │   │   ├── AuditLogPage.tsx
│   │   │   └── index.ts
│   │   └── notifications/
│   │       ├── NotificationCenter.tsx
│   │       ├── NotificationItem.tsx
│   │       ├── NotificationSettings.tsx
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProjects.ts
│   │   ├── useSprints.ts
│   │   ├── useTasks.ts
│   │   ├── useTeams.ts
│   │   ├── useNotifications.ts
│   │   ├── useSignalR.ts
│   │   ├── useLocalStorage.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── rootReducer.ts
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── projectsSlice.ts
│   │   │   ├── sprintsSlice.ts
│   │   │   ├── tasksSlice.ts
│   │   │   ├── teamsSlice.ts
│   │   │   ├── notificationsSlice.ts
│   │   │   └── uiSlice.ts
│   │   └── middleware/
│   │       ├── api.ts
│   │       └── signalr.ts
│   ├── services/
│   │   ├── api.ts
│   │   ├── authService.ts
│   │   ├── projectService.ts
│   │   ├── sprintService.ts
│   │   ├── taskService.ts
│   │   ├── teamService.ts
│   │   ├── notificationService.ts
│   │   ├── reportService.ts
│   │   ├── signalrService.ts
│   │   ├── githubService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── permissions.ts
│   │   ├── dates.ts
│   │   └── index.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── project.ts
│   │   ├── sprint.ts
│   │   ├── task.ts
│   │   ├── team.ts
│   │   ├── user.ts
│   │   ├── notification.ts
│   │   ├── report.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── utilities.css
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── fonts/
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── __mocks__/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── setup.ts
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.js
├── .prettierrc
├── Dockerfile
├── .dockerignore
└── README.md
```

## Key Architecture Patterns

### Backend Patterns
- **Clean Architecture**: Separation of concerns with Core, Infrastructure, and API layers
- **Repository Pattern**: Data access abstraction
- **Service Layer Pattern**: Business logic encapsulation
- **CQRS Pattern**: Command Query Responsibility Segregation for complex operations
- **Specification Pattern**: Flexible querying capabilities

### Frontend Patterns
- **Component-Based Architecture**: Reusable UI components
- **Container/Presenter Pattern**: Separation of logic and presentation
- **Custom Hooks Pattern**: Reusable stateful logic
- **Redux Toolkit Pattern**: Predictable state management
- **Observer Pattern**: Real-time updates with SignalR

## Naming Conventions

### Backend
- **Entities**: PascalCase (e.g., UserStory, SprintBacklog)
- **Interfaces**: Prefix with 'I' (e.g., IUserRepository)
- **Methods**: PascalCase (e.g., GetUserStories, CreateSprint)
- **Variables**: camelCase (e.g., userId, sprintId)
- **Constants**: PascalCase (e.g., MaxStoryPoints, DefaultSprintDuration)

### Frontend
- **Components**: PascalCase (e.g., UserStoryCard, KanbanBoard)
- **Hooks**: camelCase with 'use' prefix (e.g., useProjects, useAuth)
- **Types/Interfaces**: PascalCase (e.g., UserStory, Sprint)
- **Variables**: camelCase (e.g., userId, sprintData)
- **Constants**: UPPER_SNAKE_CASE (e.g., API_BASE_URL, DEFAULT_PAGE_SIZE)

## File Organization Principles

1. **Feature-Based Organization**: Group related functionality together
2. **Shared Components**: Keep reusable components in common directories
3. **Index Files**: Use index files for clean imports
4. **Barrel Exports**: Group related exports for cleaner imports
5. **Separation of Concerns**: Keep UI, logic, and data separate

This structure provides a solid foundation for building a scalable and maintainable Scrum project management application.