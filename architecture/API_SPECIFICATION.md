# CNC Task Management System - API Specification

## Overview

This document outlines the complete RESTful API specification for the CNC Task Management System, built with .NET 8 Web API.

## API Design Principles

1. **RESTful Design**: Proper use of HTTP methods and status codes
2. **Multi-Tenancy**: All requests include tenant context
3. **Versioning**: API versioning for future compatibility
4. **Consistency**: Standardized response formats and error handling
5. **Security**: JWT-based authentication with role-based authorization

## Base URL and Versioning

```
Base URL: https://api.cnctaskmanagement.com/api/v1
Development: http://localhost:5000/api/v1
```

## Authentication

All API endpoints (except authentication endpoints) require a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {
      // Additional error details
    }
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 100,
      "totalPages": 5,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "message": "Data retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Authentication Endpoints

### POST /auth/login

Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": 1,
      "email": "user@example.com",
      "userName": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "Developer",
      "organizationId": 1,
      "organizationName": "Acme Corp"
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### POST /auth/register

Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "userName": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "organizationId": 1
}
```

### POST /auth/logout

Logout and invalidate the current token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### GET /auth/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "userName": "johndoe",
    "firstName": "John",
    "lastName": "Doe",
    "role": "Developer",
    "avatarUrl": "https://example.com/avatar.jpg",
    "organizationId": 1,
    "organizationName": "Acme Corp",
    "isActive": true,
    "lastLoginAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  },
  "message": "Profile retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /auth/profile

Update current user profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

## Organization Management

### GET /organizations

Get all organizations (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (int, optional): Page number (default: 1)
- `pageSize` (int, optional): Items per page (default: 20)
- `search` (string, optional): Search term
- `isActive` (boolean, optional): Filter by active status

### POST /organizations

Create a new organization (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "New Organization",
  "description": "Organization description",
  "subscriptionTier": "Basic",
  "maxUsers": 10
}
```

### GET /organizations/{id}

Get organization by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Acme Corp",
    "description": "Technology company",
    "subscriptionTier": "Premium",
    "maxUsers": 50,
    "isActive": true,
    "userCount": 15,
    "projectCount": 5,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Organization retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /organizations/{id}

Update organization (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### DELETE /organizations/{id}

Delete organization (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## User Management

### GET /users

Get all users in the organization.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (int, optional): Page number
- `pageSize` (int, optional): Items per page
- `role` (string, optional): Filter by role
- `isActive` (boolean, optional): Filter by active status
- `search` (string, optional): Search term

### POST /users

Create a new user (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "userName": "newuser",
  "firstName": "New",
  "lastName": "User",
  "password": "password123",
  "role": "Developer"
}
```

### GET /users/{id}

Get user by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### PUT /users/{id}

Update user (Admin or own profile).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### PUT /users/{id}/role

Update user role (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "role": "ScrumMaster"
}
```

### DELETE /users/{id}

Delete user (Admin only).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Project Management

### GET /projects

Get all projects in the organization.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` (int, optional): Page number
- `pageSize` (int, optional): Items per page
- `status` (string, optional): Filter by status
- `productOwnerId` (int, optional): Filter by product owner
- `scrumMasterId` (int, optional): Filter by scrum master
- `search` (string, optional): Search term

### POST /projects

Create a new project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "New Project",
  "description": "Project description",
  "productOwnerId": 2,
  "scrumMasterId": 3,
  "startDate": "2024-01-01",
  "endDate": "2024-12-31",
  "velocityGoal": 25.5,
  "sprintDuration": 14
}
```

### GET /projects/{id}

Get project by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Mobile App Development",
    "description": "iOS and Android mobile app",
    "productOwner": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "scrumMaster": {
      "id": 3,
      "firstName": "Mike",
      "lastName": "Johnson",
      "email": "mike@example.com"
    },
    "status": "Active",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "velocityGoal": 25.5,
    "sprintDuration": 14,
    "currentSprint": {
      "id": 5,
      "name": "Sprint 5",
      "status": "Active",
      "startDate": "2024-05-01",
      "endDate": "2024-05-14"
    },
    "teamCount": 2,
    "storyCount": 25,
    "taskCount": 45,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Project retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /projects/{id}

Update project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### DELETE /projects/{id}

Delete project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Sprint Management

### GET /projects/{projectId}/sprints

Get all sprints for a project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (string, optional): Filter by status
- `page` (int, optional): Page number
- `pageSize` (int, optional): Items per page

### POST /projects/{projectId}/sprints

Create a new sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "name": "Sprint 6",
  "goal": "Complete user authentication",
  "startDate": "2024-05-15",
  "endDate": "2024-05-28",
  "capacity": 40
}
```

### GET /sprints/{id}

Get sprint by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 5,
    "projectId": 1,
    "name": "Sprint 5",
    "goal": "Implement user authentication",
    "startDate": "2024-05-01T00:00:00Z",
    "endDate": "2024-05-14T23:59:59Z",
    "status": "Active",
    "capacity": 40,
    "velocity": 32.5,
    "storyCount": 8,
    "taskCount": 15,
    "completedTasks": 7,
    "remainingTasks": 8,
    " burndownData": [
      {
        "date": "2024-05-01",
        "ideal": 40,
        "actual": 40
      },
      {
        "date": "2024-05-02",
        "ideal": 37.14,
        "actual": 38
      }
    ],
    "createdAt": "2024-04-30T00:00:00Z",
    "updatedAt": "2024-05-01T00:00:00Z"
  },
  "message": "Sprint retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /sprints/{id}

Update sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### POST /sprints/{id}/start

Start a sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### POST /sprints/{id}/complete

Complete a sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "retrospectiveNotes": "Good sprint, need better time estimation"
}
```

### DELETE /sprints/{id}

Delete sprint (only if not started).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Backlog Management

### GET /projects/{projectId}/backlog

Get product backlog for a project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (string, optional): Filter by status
- `priority` (int, optional): Filter by priority
- `assigneeId` (int, optional): Filter by assignee
- `storyPoints` (string, optional): Filter by story points range
- `page` (int, optional): Page number
- `pageSize` (int, optional): Items per page
- `search` (string, optional): Search term

### POST /projects/{projectId}/stories

Create a new user story.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "User Login Feature",
  "description": "As a user, I want to log in to the application",
  "acceptanceCriteria": "- User can enter email and password\n- System validates credentials\n- User is redirected to dashboard",
  "storyPoints": 5,
  "priority": 8,
  "businessValue": 10,
  "estimatedHours": 8
}
```

### GET /stories/{id}

Get user story by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "projectId": 1,
    "title": "User Login Feature",
    "description": "As a user, I want to log in to the application",
    "acceptanceCriteria": "- User can enter email and password\n- System validates credentials\n- User is redirected to dashboard",
    "storyPoints": 5,
    "priority": 8,
    "status": "Ready",
    "businessValue": 10,
    "estimatedHours": 8,
    "actualHours": 6,
    "assignee": {
      "id": 4,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "sprint": {
      "id": 5,
      "name": "Sprint 5"
    },
    "taskCount": 3,
    "completedTasks": 2,
    "comments": [
      {
        "id": 1,
        "content": "Working on the UI design",
        "author": {
          "id": 4,
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-05-02T10:30:00Z"
      }
    ],
    "attachments": [
      {
        "id": 1,
        "fileName": "login-mockup.png",
        "originalFileName": "login-mockup.png",
        "fileSize": 256000,
        "contentType": "image/png",
        "uploadedBy": {
          "id": 4,
          "firstName": "John",
          "lastName": "Doe"
        },
        "uploadedAt": "2024-05-02T10:15:00Z"
      }
    ],
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-02T10:30:00Z"
  },
  "message": "User story retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /stories/{id}

Update user story.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### POST /stories/{id}/assign-to-sprint

Assign user story to sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "sprintId": 6
}
```

### DELETE /stories/{id}

Delete user story (soft delete).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Task Management

### GET /sprints/{sprintId}/tasks

Get all tasks in a sprint backlog.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (string, optional): Filter by status
- `assigneeId` (int, optional): Filter by assignee
- `type` (string, optional): Filter by task type
- `page` (int, optional): Page number
- `pageSize` (int, optional): Items per page

### POST /sprints/{sprintId}/tasks

Create a new task.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "userStoryId": 1,
  "title": "Implement login form UI",
  "description": "Create the login form with email and password fields",
  "type": "Development",
  "assigneeId": 4,
  "estimatedHours": 4,
  "dueDate": "2024-05-10T17:00:00Z"
}
```

### GET /tasks/{id}

Get task by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userStoryId": 1,
    "title": "Implement login form UI",
    "description": "Create the login form with email and password fields",
    "status": "InProgress",
    "type": "Development",
    "assignee": {
      "id": 4,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com"
    },
    "reporter": {
      "id": 2,
      "firstName": "Jane",
      "lastName": "Smith",
      "email": "jane@example.com"
    },
    "userStory": {
      "id": 1,
      "title": "User Login Feature"
    },
    "estimatedHours": 4,
    "actualHours": 2,
    "remainingHours": 2,
    "parentTaskId": null,
    "subtasks": [],
    "orderIndex": 1,
    "dueDate": "2024-05-10T17:00:00Z",
    "comments": [
      {
        "id": 1,
        "content": "Started working on the form layout",
        "author": {
          "id": 4,
          "firstName": "John",
          "lastName": "Doe"
        },
        "createdAt": "2024-05-02T09:00:00Z"
      }
    ],
    "attachments": [],
    "createdAt": "2024-05-01T00:00:00Z",
    "updatedAt": "2024-05-02T09:00:00Z"
  },
  "message": "Task retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /tasks/{id}

Update task.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### PUT /tasks/{id}/status

Update task status.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "status": "Done",
  "actualHours": 3.5,
  "remainingHours": 0
}
```

### DELETE /tasks/{id}

Delete task.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Kanban Board

### GET /sprints/{sprintId}/kanban

Get kanban board data for a sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sprint": {
      "id": 5,
      "name": "Sprint 5",
      "status": "Active"
    },
    "columns": [
      {
        "id": "todo",
        "name": "To Do",
        "taskLimit": null,
        "tasks": [
          {
            "id": 1,
            "title": "Implement login form UI",
            "userStoryTitle": "User Login Feature",
            "assignee": {
              "id": 4,
              "firstName": "John",
              "lastName": "Doe"
            },
            "estimatedHours": 4,
            "actualHours": 0,
            "priority": 8
          }
        ]
      },
      {
        "id": "inprogress",
        "name": "In Progress",
        "taskLimit": 3,
        "tasks": [
          {
            "id": 2,
            "title": "Implement authentication logic",
            "userStoryTitle": "User Login Feature",
            "assignee": {
              "id": 5,
              "firstName": "Sarah",
              "lastName": "Wilson"
            },
            "estimatedHours": 6,
            "actualHours": 2,
            "priority": 8
          }
        ]
      },
      {
        "id": "inreview",
        "name": "In Review",
        "taskLimit": null,
        "tasks": []
      },
      {
        "id": "testing",
        "name": "Testing",
        "taskLimit": null,
        "tasks": []
      },
      {
        "id": "done",
        "name": "Done",
        "taskLimit": null,
        "tasks": [
          {
            "id": 3,
            "title": "Create user database schema",
            "userStoryTitle": "User Login Feature",
            "assignee": {
              "id": 6,
              "firstName": "Tom",
              "lastName": "Brown"
            },
            "estimatedHours": 3,
            "actualHours": 3,
            "priority": 8
          }
        ]
      }
    ],
    "swimlanes": [
      {
        "id": "default",
        "name": "Default",
        "color": "#gray"
      }
    ]
  },
  "message": "Kanban board retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### PUT /tasks/{id}/move

Move task to different column.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "columnId": "inprogress",
  "orderIndex": 1
}
```

## Team Management

### GET /teams

Get all teams in the organization.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### POST /teams

Create a new team.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "projectId": 1,
  "name": "Frontend Team",
  "description": "Responsible for frontend development"
}
```

### GET /teams/{id}

Get team by ID.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "projectId": 1,
    "name": "Frontend Team",
    "description": "Responsible for frontend development",
    "isActive": true,
    "memberCount": 4,
    "members": [
      {
        "id": 4,
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "role": "Developer",
        "joinedAt": "2024-01-01T00:00:00Z"
      },
      {
        "id": 5,
        "firstName": "Sarah",
        "lastName": "Wilson",
        "email": "sarah@example.com",
        "role": "Developer",
        "joinedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Team retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### POST /teams/{id}/members

Add member to team.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "userId": 7,
  "role": "Developer"
}
```

### DELETE /teams/{id}/members/{userId}

Remove member from team.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Reports

### GET /projects/{projectId}/burndown

Get burndown chart data for a project or sprint.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `sprintId` (int, optional): Specific sprint ID
- `startDate` (date, optional): Custom start date
- `endDate` (date, optional): Custom end date

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Sprint 5 Burndown",
    "startDate": "2024-05-01",
    "endDate": "2024-05-14",
    "totalHours": 40,
    "data": [
      {
        "date": "2024-05-01",
        "ideal": 40,
        "actual": 40
      },
      {
        "date": "2024-05-02",
        "ideal": 37.14,
        "actual": 38
      }
    ]
  },
  "message": "Burndown data retrieved successfully",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### GET /projects/{projectId}/velocity

Get velocity chart data for a project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### GET /projects/{projectId}/cumulative-flow

Get cumulative flow diagram data for a project.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Notifications

### GET /notifications

Get user notifications.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `isRead` (boolean, optional): Filter by read status
- `type` (string, optional): Filter by type
- `page` (int, optional): Page number
- `pageSize` (int, optional): Items per page

### PUT /notifications/{id}/read

Mark notification as read.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### PUT /notifications/read-all

Mark all notifications as read.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## GitHub Integration

### POST /integrations/github

Add GitHub integration.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "projectId": 1,
  "repositoryOwner": "acme-corp",
  "repositoryName": "mobile-app",
  "accessToken": "github_access_token",
  "webhookSecret": "webhook_secret",
  "syncIssues": true,
  "syncCommits": true
}
```

### GET /integrations/github/{id}

Get GitHub integration details.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### POST /integrations/github/{id}/sync

Manual sync with GitHub.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

### DELETE /integrations/github/{id}

Remove GitHub integration.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Error Codes

| Error Code | Description |
|------------|-------------|
| AUTH_001 | Invalid credentials |
| AUTH_002 | Token expired |
| AUTH_003 | Invalid token |
| AUTH_004 | Insufficient permissions |
| AUTH_005 | Account locked |
| VALID_001 | Validation error |
| VALID_002 | Required field missing |
| VALID_003 | Invalid format |
| RES_001 | Resource not found |
| RES_002 | Resource already exists |
| RES_003 | Resource access denied |
| SYS_001 | Internal server error |
| SYS_002 | Database error |
| SYS_003 | External service error |

## WebSocket Events

### Connection

Connect to SignalR hub:
```
ws://localhost:5000/api/hubs/project
```

### Events

#### Client to Server

- `JoinProject`: Join project for real-time updates
  ```json
  {
    "projectId": 1
  }
  ```

- `JoinTask`: Follow task for updates
  ```json
  {
    "taskId": 1
  }
  ```

#### Server to Client

- `TaskUpdated`: Task status changed
- `StoryUpdated`: User story updated
- `SprintStarted`: Sprint started
- `SprintCompleted`: Sprint completed
- `NewComment`: New comment added
- `Notification`: New notification

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Standard endpoints**: 1000 requests per hour per user
- **Authentication endpoints**: 10 requests per minute per IP
- **File upload endpoints**: 100 requests per hour per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

This API specification provides a comprehensive foundation for implementing the CNC Task Management System backend.