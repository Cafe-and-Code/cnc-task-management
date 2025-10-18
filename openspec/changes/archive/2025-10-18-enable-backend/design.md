# Backend Enablement Design

## Current Architecture Issues

### Frontend Mock Services
The frontend currently uses mock implementations in `projectService.ts` that:
- Use localStorage for data persistence
- Simulate network delays with `setTimeout`
- Generate random IDs for new projects
- Hard-code mock user data

### Backend Configuration
The .NET backend has several dependencies that prevent it from running:
- **Database**: Requires PostgreSQL at specific IP (192.168.31.102)
- **SSL**: Configured for HTTPS on localhost:5001
- **Runtime**: Requires .NET 6+ runtime
- **Authentication**: JWT token configuration with specific secrets

## Proposed Solution

### Phase 1: Database Setup
1. **Local PostgreSQL**: Set up PostgreSQL database locally instead of remote IP
2. **Connection String**: Update appsettings.json with local database connection
3. **Migrations**: Ensure database schema is properly created

### Phase 2: Backend Configuration
1. **Development HTTPS**: Set up development SSL certificates
2. **CORS**: Ensure proper CORS configuration for frontend
3. **Environment Variables**: Use development-friendly configuration

### Phase 3: Frontend Cleanup
1. **Remove Mock Services**: Eliminate mock implementations
2. **Clear localStorage**: Remove mock data stored in browser
3. **API Integration**: Verify real API calls work correctly

### Phase 4: Integration Testing
1. **End-to-End Flow**: Test complete project creation workflow
2. **Authentication**: Verify JWT authentication works
3. **Error Handling**: Ensure proper error responses

## Implementation Strategy

### Minimal Viable Backend
1. **Database**: Use SQLite for development instead of PostgreSQL
2. **Authentication**: Keep existing JWT but with development settings
3. **HTTPS**: Use HTTP for development to simplify SSL requirements

### Gradual Migration
1. **Parallel Operation**: Keep both backend and mock options initially
2. **Feature Flags**: Use environment variable to switch between mock/real
3. **Progressive Cleanup**: Remove mock services after backend verification

## Risk Mitigation

### Database Availability
- Provide fallback SQLite configuration
- Document PostgreSQL setup requirements
- Include database initialization scripts

### SSL Certificate Issues
- Use HTTP for development environment
- Document production HTTPS setup
- Provide self-signed certificate generation script

### API Compatibility
- Ensure mock response format matches real API
- Add API versioning to prevent breaking changes
- Include comprehensive API documentation