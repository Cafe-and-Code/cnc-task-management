# Backend Setup Specification

## ADDED Requirements

### Requirement: Backend Service Startup
The .NET backend API service SHALL start successfully in development environment.

#### Scenario: Backend starts without errors
Given I have .NET 6+ runtime installed
And I have a valid database connection string
When I run `dotnet run` in the backend directory
Then the API service starts successfully
And the service listens on the configured port (5001 or 8080)
And the API endpoints are accessible

#### Scenario: Database connection is established
Given the database server is running
And the connection string is valid
When the application starts
Then the database connection is established
And database migrations are applied automatically
And the service logs successful database connection

### Requirement: Database Configuration
The backend SHALL connect to a working database.

#### Scenario: PostgreSQL database connection
Given PostgreSQL server is running on configured host
And database exists with proper schema
When the application attempts to connect
Then connection succeeds without authentication errors
And all required tables are created/migrated
And seed data is populated if needed

#### Scenario: SQLite fallback for development
Given PostgreSQL is not available
And development environment is detected
When the application starts with SQLite configuration
Then SQLite database file is created automatically
And schema migrations are applied
And basic seed data is inserted

### Requirement: Frontend Integration
Frontend SHALL successfully communicate with backend API.

#### Scenario: API endpoints are accessible
Given backend service is running
And frontend is configured with correct API URL
When frontend makes API requests
Then requests reach the backend successfully
And backend returns proper HTTP responses
And CORS policies allow frontend requests

#### Scenario: Authentication flow works
Given user attempts to log in
When frontend sends login request to backend
Then backend validates credentials
And returns valid JWT token on success
And token is accepted for subsequent API calls

## MODIFIED Requirements

### Requirement: Project Creation Workflow
Project creation SHALL use real backend API instead of mock data.

#### Scenario: Create project via API
Given user is authenticated
And project form is filled with valid data
When user submits the form
Then request is sent to backend `/api/projects` endpoint
And backend creates project in database
And returns created project with server-generated ID
And frontend displays success and redirects

#### Scenario: Project listing from database
Given projects exist in database
When user navigates to projects page
Then frontend requests projects from `/api/projects`
And backend returns paginated project list
And projects are displayed with real data

## REMOVED Requirements

### Requirement: Mock Data Services
All mock data implementations SHALL be removed.

#### Scenario: Mock services eliminated
Given backend is operational
When frontend makes any API request
Then mock service implementations are not used
And all requests go to real backend API
And no localStorage mock data is created

#### Scenario: LocalStorage cleanup
Given mock data exists in browser localStorage
When application starts in production mode
Then all mock data is cleared from localStorage
And only real API data is used