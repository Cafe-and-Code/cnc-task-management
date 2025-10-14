# CNC Task Management System - Complete File Architecture

## Overview

This document provides the complete file structure for the CNC Task Management System, including all necessary files with their basic implementation structure.

## Backend File Structure

### Solution Structure

```
CNCTaskManagement/
├── CNCTaskManagement.Api/
│   ├── Controllers/
│   │   ├── AuthController.cs
│   │   ├── OrganizationsController.cs
│   │   ├── UsersController.cs
│   │   ├── ProjectsController.cs
│   │   ├── SprintsController.cs
│   │   ├── BacklogController.cs
│   │   ├── TasksController.cs
│   │   ├── TeamsController.cs
│   │   ├── ReportsController.cs
│   │   ├── IntegrationsController.cs
│   │   └── NotificationsController.cs
│   ├── Hubs/
│   │   ├── ProjectHub.cs
│   │   └── NotificationHub.cs
│   ├── Middleware/
│   │   ├── TenantMiddleware.cs
│   │   ├── AuditLoggingMiddleware.cs
│   │   └── ErrorHandlingMiddleware.cs
│   ├── Models/
│   │   ├── DTOs/
│   │   │   ├── Request/
│   │   │   │   ├── LoginRequest.cs
│   │   │   │   ├── RegisterRequest.cs
│   │   │   │   ├── CreateProjectRequest.cs
│   │   │   │   ├── UpdateProjectRequest.cs
│   │   │   │   ├── CreateSprintRequest.cs
│   │   │   │   ├── UpdateSprintRequest.cs
│   │   │   │   ├── CreateUserStoryRequest.cs
│   │   │   │   ├── UpdateUserStoryRequest.cs
│   │   │   │   ├── CreateTaskRequest.cs
│   │   │   │   ├── UpdateTaskRequest.cs
│   │   │   │   ├── CreateTeamRequest.cs
│   │   │   │   ├── UpdateTaskStatusRequest.cs
│   │   │   │   └── CreateCommentRequest.cs
│   │   │   └── Response/
│   │   │       ├── AuthResponse.cs
│   │   │       ├── UserResponse.cs
│   │   │       ├── ProjectResponse.cs
│   │   │       ├── SprintResponse.cs
│   │   │       ├── UserStoryResponse.cs
│   │   │       ├── TaskResponse.cs
│   │   │       ├── TeamResponse.cs
│   │   │       ├── NotificationResponse.cs
│   │   │       └── PaginatedResponse.cs
│   │   └── Configuration/
│   │       ├── JwtSettings.cs
│   │       ├── DatabaseSettings.cs
│   │       ├── IntegrationSettings.cs
│   │       └── FileStorageSettings.cs
│   ├── Filters/
│   │   ├── ApiExceptionFilter.cs
│   │   └── ValidationFilter.cs
│   ├── Extensions/
│   │   ├── ServiceCollectionExtensions.cs
│   │   ├── AuthenticationExtensions.cs
│   │   ├── SwaggerExtensions.cs
│   │   └── CorsExtensions.cs
│   ├── Program.cs
│   ├── appsettings.json
│   ├── appsettings.Development.json
│   ├── appsettings.Production.json
│   └── CNCTaskManagement.Api.csproj
├── CNCTaskManagement.Core/
│   ├── Entities/
│   │   ├── BaseEntity.cs
│   │   ├── Organization.cs
│   │   ├── User.cs
│   │   ├── Project.cs
│   │   ├── Team.cs
│   │   ├── Sprint.cs
│   │   ├── UserStory.cs
│   │   ├── Task.cs
│   │   ├── Comment.cs
│   │   ├── Attachment.cs
│   │   ├── Activity.cs
│   │   └── Notification.cs
│   ├── Enums/
│   │   ├── UserRole.cs
│   │   ├── ProjectStatus.cs
│   │   ├── SprintStatus.cs
│   │   ├── StoryStatus.cs
│   │   ├── TaskStatus.cs
│   │   ├── TaskType.cs
│   │   ├── NotificationType.cs
│   │   └── ActivityType.cs
│   ├── Interfaces/
│   │   ├── Repositories/
│   │   │   ├── IBaseRepository.cs
│   │   │   ├── IOrganizationRepository.cs
│   │   │   ├── IUserRepository.cs
│   │   │   ├── IProjectRepository.cs
│   │   │   ├── ITeamRepository.cs
│   │   │   ├── ISprintRepository.cs
│   │   │   ├── IUserStoryRepository.cs
│   │   │   ├── ITaskRepository.cs
│   │   │   ├── ICommentRepository.cs
│   │   │   ├── IAttachmentRepository.cs
│   │   │   ├── IActivityRepository.cs
│   │   │   └── INotificationRepository.cs
│   │   └── Services/
│   │       ├── IAuthService.cs
│   │       ├── IOrganizationService.cs
│   │       ├── IUserService.cs
│   │       ├── IProjectService.cs
│   │       ├── ITeamService.cs
│   │       ├── ISprintService.cs
│   │       ├── IUserStoryService.cs
│   │       ├── ITaskService.cs
│   │       ├── INotificationService.cs
│   │       ├── IReportService.cs
│   │       ├── IIntegrationService.cs
│   │       ├── IFileStorageService.cs
│   │       └── IEmailService.cs
│   ├── ValueObjects/
│   │   ├── StoryPoints.cs
│   │   ├── Email.cs
│   │   ├── Capacity.cs
│   │   ├── Velocity.cs
│   │   ├── BusinessValue.cs
│   │   └── TimeTracking.cs
│   ├── Specifications/
│   │   ├── BaseSpecification.cs
│   │   ├── ProjectSpecifications.cs
│   │   ├── SprintSpecifications.cs
│   │   ├── TaskSpecifications.cs
│   │   └── UserSpecifications.cs
│   └── CNCTaskManagement.Core.csproj
├── CNCTaskManagement.Infrastructure/
│   ├── Data/
│   │   ├── AppDbContext.cs
│   │   ├── Configurations/
│   │   │   ├── BaseEntityConfiguration.cs
│   │   │   ├── OrganizationConfiguration.cs
│   │   │   ├── UserConfiguration.cs
│   │   │   ├── ProjectConfiguration.cs
│   │   │   ├── TeamConfiguration.cs
│   │   │   ├── SprintConfiguration.cs
│   │   │   ├── UserStoryConfiguration.cs
│   │   │   ├── TaskConfiguration.cs
│   │   │   ├── CommentConfiguration.cs
│   │   │   ├── AttachmentConfiguration.cs
│   │   │   ├── ActivityConfiguration.cs
│   │   │   └── NotificationConfiguration.cs
│   │   ├── Migrations/
│   │   │   ├── 20240101000000_InitialCreate.cs
│   │   │   ├── 20240101000001_InitialCreate.Designer.cs
│   │   │   └── AppDbContextModelSnapshot.cs
│   │   ├── Seeders/
│   │   │   ├── DataSeeder.cs
│   │   │   ├── OrganizationSeeder.cs
│   │   │   ├── UserSeeder.cs
│   │   │   └── ProjectSeeder.cs
│   │   └── Views/
│   │       ├── SprintBurndownView.sql
│   │       ├── ProjectVelocityView.sql
│   │       └── CumulativeFlowView.sql
│   ├── Repositories/
│   │   ├── BaseRepository.cs
│   │   ├── OrganizationRepository.cs
│   │   ├── UserRepository.cs
│   │   ├── ProjectRepository.cs
│   │   ├── TeamRepository.cs
│   │   ├── SprintRepository.cs
│   │   ├── UserStoryRepository.cs
│   │   ├── TaskRepository.cs
│   │   ├── CommentRepository.cs
│   │   ├── AttachmentRepository.cs
│   │   ├── ActivityRepository.cs
│   │   └── NotificationRepository.cs
│   ├── Services/
│   │   ├── AuthService.cs
│   │   ├── OrganizationService.cs
│   │   ├── UserService.cs
│   │   ├── ProjectService.cs
│   │   ├── TeamService.cs
│   │   ├── SprintService.cs
│   │   ├── UserStoryService.cs
│   │   ├── TaskService.cs
│   │   ├── NotificationService.cs
│   │   ├── ReportService.cs
│   │   ├── IntegrationService.cs
│   │   ├── FileStorageService.cs
│   │   └── EmailService.cs
│   ├── Integrations/
│   │   ├── GitHub/
│   │   │   ├── GitHubApiClient.cs
│   │   │   ├── GitHubService.cs
│   │   │   ├── GitHubWebhookHandler.cs
│   │   │   └── Models/
│   │   │       ├── GitHubRepository.cs
│   │   │       ├── GitHubIssue.cs
│   │   │       ├── GitHubCommit.cs
│   │   │       └── GitHubUser.cs
│   │   └── BaseIntegrationService.cs
│   ├── Security/
│   │   ├── JwtTokenService.cs
│   │   ├── PasswordHasher.cs
│   │   ├── EncryptionService.cs
│   │   ├── AuditService.cs
│   │   └── PermissionService.cs
│   ├── Notifications/
│   │   ├── SignalRNotificationService.cs
│   │   ├── EmailNotificationService.cs
│   │   ├── NotificationTemplates/
│   │   │   ├── TaskAssignedEmail.html
│   │   │   ├── SprintStartedEmail.html
│   │   │   └── CommentAddedEmail.html
│   │   └── NotificationFactory.cs
│   ├── Reports/
│   │   ├── BurndownReportGenerator.cs
│   │   ├── VelocityReportGenerator.cs
│   │   ├── CumulativeFlowReportGenerator.cs
│   │   └── SprintReportGenerator.cs
│   └── CNCTaskManagement.Infrastructure.csproj
├── CNCTaskManagement.Shared/
│   ├── DTOs/
│   │   ├── Common/
│   │   │   ├── ApiResponse.cs
│   │   │   ├── PaginatedList.cs
│   │   │   ├── FilterOptions.cs
│   │   │   └── SortOptions.cs
│   │   └── Constants/
│   │       ├── ErrorCodes.cs
│   │       ├── PermissionNames.cs
│   │       └── ValidationMessages.cs
│   └── CNCTaskManagement.Shared.csproj
├── CNCTaskManagement.sln
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── Dockerfile
├── .dockerignore
├── .gitignore
└── README.md
```

### Key Backend Files - Basic Structure

#### Program.cs
```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using CNCTaskManagement.Api.Extensions;
using CNCTaskManagement.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors();
builder.Services.AddAuthentication();
builder.Services.AddAuthorization();

// Add custom services
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApplicationServices();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Custom middleware
app.UseTenantMiddleware();
app.UseAuditLoggingMiddleware();
app.UseErrorHandlingMiddleware();

app.MapControllers();
app.MapHub<ProjectHub>("/api/hubs/project");
app.MapHub<NotificationHub>("/api/hubs/notifications");

// Apply database migrations
using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
await context.Database.MigrateAsync();

await app.RunAsync();
```

#### BaseEntity.cs
```csharp
using System;

namespace CNCTaskManagement.Core.Entities
{
    public abstract class BaseEntity
    {
        public int Id { get; set; }
        public int OrganizationId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; }
        public string UpdatedBy { get; set; }
    }
}
```

## Frontend File Structure

### React Application Structure

```
cnctaskmanagement-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   └── icons/
│       ├── icon-192x192.png
│       └── icon-512x512.png
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Breadcrumb.tsx
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
│   │   │   │   ├── Pagination.tsx
│   │   │   │   ├── SearchBox.tsx
│   │   │   │   ├── DatePicker.tsx
│   │   │   │   ├── Select.tsx
│   │   │   │   ├── TextArea.tsx
│   │   │   │   ├── Checkbox.tsx
│   │   │   │   ├── Radio.tsx
│   │   │   │   ├── Toggle.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Forms/
│   │   │   │   ├── FormField.tsx
│   │   │   │   ├── FormLabel.tsx
│   │   │   │   ├── FormError.tsx
│   │   │   │   ├── FormBuilder.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Charts/
│   │   │   │   ├── BurndownChart.tsx
│   │   │   │   ├── BurnupChart.tsx
│   │   │   │   ├── VelocityChart.tsx
│   │   │   │   ├── CumulativeFlowDiagram.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   └── index.ts
│   │   │   └── FileUpload/
│   │   │       ├── FileUploader.tsx
│   │   │       ├── FilePreview.tsx
│   │   │       ├── FileList.tsx
│   │   │       └── index.ts
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── ChangePasswordForm.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── DashboardStats.tsx
│   │   │   ├── RecentActivities.tsx
│   │   │   ├── UpcomingDeadlines.tsx
│   │   │   ├── SprintProgress.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── index.ts
│   │   ├── projects/
│   │   │   ├── ProjectListPage.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectDetailPage.tsx
│   │   │   ├── ProjectSettingsPage.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   ├── ProjectOverview.tsx
│   │   │   └── index.ts
│   │   ├── backlog/
│   │   │   ├── ProductBacklogPage.tsx
│   │   │   ├── UserStoryCard.tsx
│   │   │   ├── UserStoryDetailModal.tsx
│   │   │   ├── UserStoryForm.tsx
│   │   │   ├── BacklogFilters.tsx
│   │   │   ├── StoryPointsEstimator.tsx
│   │   │   ├── PrioritySelector.tsx
│   │   │   └── index.ts
│   │   ├── sprints/
│   │   │   ├── SprintListPage.tsx
│   │   │   ├── SprintCard.tsx
│   │   │   ├── SprintDetailPage.tsx
│   │   │   ├── SprintPlanningPage.tsx
│   │   │   ├── SprintForm.tsx
│   │   │   ├── SprintTimeline.tsx
│   │   │   ├── CapacityPlanner.tsx
│   │   │   └── index.ts
│   │   ├── kanban/
│   │   │   ├── KanbanBoardPage.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskDetailModal.tsx
│   │   │   ├── TaskForm.tsx
│   │   │   ├── Swimlane.tsx
│   │   │   ├── WipLimitIndicator.tsx
│   │   │   └── index.ts
│   │   ├── teams/
│   │   │   ├── TeamListPage.tsx
│   │   │   ├── TeamCard.tsx
│   │   │   ├── TeamDetailPage.tsx
│   │   │   ├── TeamMembersPage.tsx
│   │   │   ├── TeamForm.tsx
│   │   │   ├── MemberCard.tsx
│   │   │   ├── RoleSelector.tsx
│   │   │   └── index.ts
│   │   ├── reports/
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── SprintReportPage.tsx
│   │   │   ├── VelocityReportPage.tsx
│   │   │   ├── CustomReportBuilder.tsx
│   │   │   ├── ReportFilters.tsx
│   │   │   ├── ReportExport.tsx
│   │   │   └── index.ts
│   │   ├── admin/
│   │   │   ├── AdminDashboardPage.tsx
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── OrganizationSettingsPage.tsx
│   │   │   ├── SystemSettingsPage.tsx
│   │   │   ├── AuditLogPage.tsx
│   │   │   ├── UserForm.tsx
│   │   │   └── index.ts
│   │   ├── notifications/
│   │   │   ├── NotificationCenter.tsx
│   │   │   ├── NotificationItem.tsx
│   │   │   ├── NotificationSettings.tsx
│   │   │   ├── NotificationBadge.tsx
│   │   │   └── index.ts
│   │   └── integrations/
│   │       ├── GitHubIntegrationPage.tsx
│   │       ├── IntegrationCard.tsx
│   │       ├── GitHubRepoSelector.tsx
│   │       ├── WebhookConfig.tsx
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
│   │   ├── usePagination.ts
│   │   ├── useFilters.ts
│   │   ├── useModal.ts
│   │   ├── useFileUpload.ts
│   │   ├── usePermissions.ts
│   │   └── index.ts
│   ├── store/
│   │   ├── index.ts
│   │   ├── rootReducer.ts
│   │   ├── middleware/
│   │   │   ├── api.ts
│   │   │   ├── signalr.ts
│   │   │   └── persist.ts
│   │   └── slices/
│   │       ├── authSlice.ts
│   │       ├── projectsSlice.ts
│   │       ├── sprintsSlice.ts
│   │       ├── tasksSlice.ts
│   │       ├── teamsSlice.ts
│   │       ├── notificationsSlice.ts
│   │       ├── uiSlice.ts
│   │       └── index.ts
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
│   │   ├── fileUploadService.ts
│   │   └── index.ts
│   ├── utils/
│   │   ├── constants.ts
│   │   ├── helpers.ts
│   │   ├── validators.ts
│   │   ├── formatters.ts
│   │   ├── permissions.ts
│   │   ├── dates.ts
│   │   ├── calculations.ts
│   │   ├── storage.ts
│   │   ├── toast.ts
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
│   │   ├── integration.ts
│   │   ├── common.ts
│   │   └── index.ts
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   ├── utilities.css
│   │   ├── animations.css
│   │   └── themes.css
│   ├── assets/
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── avatar-placeholder.png
│   │   │   └── bg-pattern.jpg
│   │   ├── icons/
│   │   │   ├── agile.svg
│   │   │   ├── scrum.svg
│   │   │   └── kanban.svg
│   │   └── fonts/
│   │       └── custom-font.woff2
│   ├── pages/
│   │   ├── _app.tsx
│   │   ├── _document.tsx
│   │   ├── _error.tsx
│   │   ├── NotFoundPage.tsx
│   │   ├── LoadingPage.tsx
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── vite-env.d.ts
│   └── env.d.ts
├── tests/
│   ├── setup.ts
│   ├── mocks/
│   │   ├── handlers.ts
│   │   ├── server.ts
│   │   └── data.ts
│   ├── fixtures/
│   │   ├── auth.ts
│   │   ├── projects.ts
│   │   ├── sprints.ts
│   │   └── tasks.ts
│   └── utils/
│       ├── test-utils.tsx
│       └── render-with-providers.tsx
├── docs/
│   ├── components.md
│   ├── hooks.md
│   ├── services.md
│   └── deployment.md
├── scripts/
│   ├── build.js
│   ├── deploy.js
│   └── test.js
├── .env.example
├── .env.local
├── .gitignore
├── .eslintrc.js
├── .prettierrc
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── .dockerignore
└── README.md
```

### Key Frontend Files - Basic Structure

#### App.tsx
```typescript
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AppLayout } from './components/common/Layout/AppLayout';
import { AuthLayout } from './components/common/Layout/AuthLayout';
import { LoadingPage } from './pages/LoadingPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Lazy load pages for better performance
const DashboardPage = React.lazy(() => import('./components/dashboard/DashboardPage'));
const ProjectListPage = React.lazy(() => import('./components/projects/ProjectListPage'));
const LoginPage = React.lazy(() => import('./components/auth/LoginPage'));

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <Router>
              <React.Suspense fallback={<LoadingPage />}>
                <Routes>
                  {/* Auth routes */}
                  <Route path="/auth" element={<AuthLayout />}>
                    <Route path="login" element={<LoginPage />} />
                    <Route path="register" element={<RegisterPage />} />
                  </Route>
                  
                  {/* Protected routes */}
                  <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                    <Route index element={<Navigate to="/dashboard" replace />} />
                    <Route path="dashboard" element={<DashboardPage />} />
                    <Route path="projects" element={<ProjectListPage />} />
                    {/* Add more routes here */}
                  </Route>
                  
                  {/* 404 page */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </React.Suspense>
            </Router>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
```

#### main.tsx
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './styles/animations.css';

// Initialize SignalR connection
import './services/signalrService';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### package.json
```json
{
  "name": "cnctaskmanagement-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css,md}\"",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "react-redux": "^8.0.0",
    "@tanstack/react-query": "^4.0.0",
    "axios": "^1.0.0",
    "@microsoft/signalr": "^7.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "@hookform/resolvers": "^2.0.0",
    "react-beautiful-dnd": "^13.0.0",
    "recharts": "^2.0.0",
    "react-hot-toast": "^2.0.0",
    "lucide-react": "^0.263.0",
    "clsx": "^1.0.0",
    "tailwind-merge": "^1.0.0",
    "date-fns": "^2.0.0",
    "dompurify": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@types/dompurify": "^2.0.0",
    "@typescript-eslint/eslint-plugin": "^5.0.0",
    "@typescript-eslint/parser": "^5.0.0",
    "@vitejs/plugin-react": "^3.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^8.0.0",
    "eslint-plugin-react-hooks": "^4.0.0",
    "eslint-plugin-react-refresh": "^0.3.0",
    "postcss": "^8.0.0",
    "prettier": "^2.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^4.9.0",
    "vite": "^4.0.0"
  }
}
```

## Configuration Files

### Backend Configuration

#### .csproj files
```xml
<!-- CNCTaskManagement.Api.csproj -->
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>
  
  <ItemGroup>
    <PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
    <PackageReference Include="Microsoft.AspNetCore.SignalR" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Design" Version="8.0.0" />
    <PackageReference Include="Microsoft.EntityFrameworkCore.Tools" Version="8.0.0" />
    <PackageReference Include="Npgsql.EntityFrameworkCore.PostgreSQL" Version="8.0.0" />
    <PackageReference Include="Swashbuckle.AspNetCore" Version="6.5.0" />
    <PackageReference Include="Serilog.AspNetCore" Version="7.0.0" />
    <PackageReference Include="FluentValidation.AspNetCore" Version="11.3.0" />
    <PackageReference Include="AutoMapper.Extensions.Microsoft.DependencyInjection" Version="12.0.1" />
  </ItemGroup>
  
  <ItemGroup>
    <ProjectReference Include="..\CNCTaskManagement.Core\CNCTaskManagement.Core.csproj" />
    <ProjectReference Include="..\CNCTaskManagement.Infrastructure\CNCTaskManagement.Infrastructure.csproj" />
    <ProjectReference Include="..\CNCTaskManagement.Shared\CNCTaskManagement.Shared.csproj" />
  </ItemGroup>
</Project>
```

### Frontend Configuration

#### vite.config.ts
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/hubs': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          router: ['react-router-dom'],
          ui: ['recharts', 'react-beautiful-dnd'],
        },
      },
    },
  },
});
```

#### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          danger: '#ef4444',
          warning: '#f59e0b',
          info: '#06b6d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-in': 'bounceIn 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['light'],
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#262626',
          'base-100': '#ffffff',
        },
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#3b82f6',
          secondary: '#8b5cf6',
          accent: '#10b981',
          neutral: '#262626',
          'base-100': '#1f2937',
        },
      },
    ],
  },
};
```

This comprehensive file architecture provides a complete foundation for implementing the CNC Task Management System with all necessary files and their basic structure.