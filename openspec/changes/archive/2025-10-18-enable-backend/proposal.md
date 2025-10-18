# Enable Backend and Remove Mock Data

## Summary

This change removes all mock data from the frontend and enables the real .NET backend API server to provide proper functionality for the CNC Task Management system.

## Context

The frontend currently uses mock data services because the .NET backend is not running. The backend requires several dependencies to function properly:
- PostgreSQL database connection
- .NET runtime environment
- SSL configuration for HTTPS
- Proper development environment setup

## Why

The mock data implementation was intended as a temporary solution to enable frontend development while the backend was being set up. However, mock data has several limitations:

1. **Data Persistence**: Mock data only exists in localStorage and is cleared when browser data is cleared
2. **Real-world Behavior**: Mock services don't accurately represent real API behavior, error handling, or network latency
3. **Feature Limitations**: Complex features like real-time updates, proper authentication, and data relationships can't be properly tested with mock data
4. **Production Readiness**: The application cannot be deployed with mock data - real backend functionality is required

The backend exists and is well-structured with proper controllers, services, and database entities, but it's not running due to configuration issues that need to be resolved.

## Goals

1. **Remove Mock Data**: Clean up all mock service implementations and localStorage data
2. **Enable Backend**: Set up the .NET backend to run properly in development
3. **Database Setup**: Ensure PostgreSQL database is accessible and configured
4. **API Integration**: Verify frontend-backend integration works correctly

## What Changes

### Database Configuration
- Added SQLite Entity Framework package for development database
- Created conditional database configuration (SQLite for dev, PostgreSQL for prod)
- Applied database migrations using SQLite with all tables created successfully
- Created appsettings.Development.json with SQLite connection string

### Backend Configuration
- Modified Program.cs to use HTTP instead of HTTPS in development mode
- Updated CORS configuration to allow specific frontend origins
- Set conditional URL configuration (HTTP for dev, HTTPS for prod)
- Removed HTTPS redirection in development mode

### Frontend Changes
- Completely removed all mock service implementations from projectService.ts
- Updated frontend .env to point to backend URL (http://localhost:5000/api)
- Added localStorage cleanup in main.tsx to clear mock data on startup
- Updated SignalR URL to match backend configuration

### Implementation Status
**Note**: This change was partially implemented but then reverted due to PostgreSQL database connection issues. The backend was successfully configured to use SQLite and all mock data was removed from the frontend, but the database configuration was reverted to the original PostgreSQL setup.

## Change Type

- **Scope**: Full-stack (Frontend + Backend)
- **Priority**: High
- **Estimated Effort**: 4-6 hours

## Related Components

- Frontend: `frontend/src/services/projectService.ts`
- Backend: `backend/src/CNCTaskManagement.Api/`
- Database: PostgreSQL configuration
- Development Environment: .NET setup and SSL configuration