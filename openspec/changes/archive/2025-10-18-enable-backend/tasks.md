# Implementation Tasks: Enable Backend and Remove Mock Data

## Task 1: Database Setup and Configuration
**Priority**: High | **Estimated**: 60 minutes

1. **Configure Local Database**:
   - Install PostgreSQL locally or verify existing installation
   - Create `CNCTaskManagementDB` database
   - Update appsettings.json with local connection string:
     ```json
     "DefaultConnection": "Host=localhost;Database=CNCTaskManagementDB;Username=postgres;Password=yourpassword"
     ```

2. **Create SQLite Development Alternative**:
   - Add SQLite NuGet package to Infrastructure project
   - Create development appsettings.Development.json with SQLite connection
   - Add SQLite DbContext configuration for development environment

3. **Test Database Connection**:
   - Run `dotnet ef database update` to apply migrations
   - Verify database tables are created
   - Test basic database operations

**Validation**: Backend can connect to database and apply migrations successfully

---

## Task 2: Backend SSL and Port Configuration
**Priority**: High | **Estimated**: 30 minutes

1. **Simplify HTTPS Configuration**:
   - Configure development mode to use HTTP instead of HTTPS
   - Update Program.cs to use HTTP for development:
     ```csharp
     if (app.Environment.IsDevelopment())
     {
         app.Urls.Add("http://localhost:5000");
     }
     else
     {
         app.Urls.Add("https://localhost:5001");
     }
     ```

2. **Update CORS Configuration**:
   - Ensure CORS allows frontend URL (http://localhost:3006)
   - Add specific frontend origin instead of AllowAll for security

3. **Test Backend Startup**:
   - Run `dotnet run` in backend/src/CNCTaskManagement.Api
   - Verify service starts without SSL errors
   - Test API endpoints are accessible

**Validation**: Backend starts successfully on http://localhost:5000 in development

---

## Task 3: Frontend Mock Data Removal
**Priority**: High | **Estimated**: 45 minutes

1. **Remove Mock Service Implementation**:
   - Remove `useMockData` detection logic from projectService.ts
   - Remove mock implementations from createProject() method
   - Remove mock implementations from getProjects() method
   - Clean up localStorage mock data references

2. **Clear Existing Mock Data**:
   - Clear localStorage of all mock projects data
   - Remove mock user data from frontend
   - Reset any cached mock responses

3. **Update API Configuration**:
   - Update frontend .env to point to backend URL:
     ```
     VITE_API_URL=http://localhost:5000/api
     ```
   - Remove mock service conditional logic

**Validation**: Frontend no longer contains any mock data implementations

---

## Task 4: Backend API Endpoints Verification
**Priority**: High | **Estimated**: 60 minutes

1. **Test ProjectsController**:
   - Verify GET /api/projects returns proper response format
   - Test POST /api/projects creates project correctly
   - Check authentication requirements on endpoints

2. **Test Authentication Flow**:
   - Verify AuthController login/register endpoints work
   - Test JWT token generation and validation
   - Ensure proper error responses for invalid credentials

3. **Create Seed Data**:
   - Add basic seed data for testing (users, roles, sample projects)
   - Ensure proper user roles are created for project assignment
   - Test data relationships work correctly

**Validation**: All essential API endpoints return expected responses

---

## Task 5: Frontend-Backend Integration Testing
**Priority**: High | **Estimated**: 45 minutes

1. **Test Project Creation Flow**:
   - Navigate to project creation form
   - Fill form with valid data
   - Submit and verify successful creation
   - Check redirect to projects list
   - Verify new project appears in list

2. **Test Authentication Integration**:
   - Test login flow with backend
   - Verify JWT token storage and usage
   - Test protected route access
   - Verify role-based permissions work

3. **Test Error Handling**:
   - Test network error scenarios
   - Verify proper error messages display
   - Test validation error responses
   - Check loading states work correctly

**Validation**: Complete project creation workflow works with real backend

---

## Task 6: Environment Configuration Cleanup
**Priority**: Medium | **Estimated**: 30 minutes

1. **Create Development Scripts**:
   - Add scripts to run backend and frontend together
   - Create npm/yarn scripts for easy development startup
   - Add documentation for development environment setup

2. **Update Documentation**:
   - Document database setup requirements
   - Add backend startup instructions
   - Create troubleshooting guide for common issues

3. **Final Cleanup**:
   - Remove any remaining mock-related code
   - Clean up console logs from mock implementations
   - Ensure production configuration doesn't reference mock data

**Validation**: Development environment is fully documented and easy to set up

---

## Dependencies and Notes

### Prerequisites
- .NET 6+ SDK installed
- PostgreSQL or SQLite for development
- Node.js and yarn/npm for frontend
- Basic understanding of JWT authentication

### Risk Mitigation
- Test each component individually before integration
- Keep backup of current working mock implementation
- Document rollback procedure if backend setup fails
- Use feature flags to switch between mock/real API if needed

### Success Criteria
- Backend starts successfully without database connection errors
- Frontend creates projects using real API endpoints
- No mock data remains in localStorage or codebase
- Complete project creation workflow works end-to-end
- Development environment is reproducible and documented