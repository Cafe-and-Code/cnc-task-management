# Proposal: Remove Backend API Data Fetching from Dashboard Components

## Context
The frontend dashboard components (`RecentActivityFeed`, `UpcomingDeadlines`, `NotificationCenter`) are attempting to fetch data from backend API endpoints that either don't exist or return 404 errors:
- `GET /api/activities`
- `GET /api/dashboard/deadlines`
- `GET /api/dashboard/notifications`

These failed requests populate the browser console with error logs, creating a poor development experience and potentially impacting app stability.

## Why
1. **Remove 404 errors** — eliminate console noise from missing API endpoints.
2. **Simplify development** — allow the frontend to work without backend API implementation.
3. **Use Redux state** — rely on in-memory Redux state or mock data for dashboard components.
4. **Unblock UI work** — focus on component behavior and styling without API dependencies.

## What Changes
1. **RecentActivityFeed**: Remove `activityService.getRecentActivities()` call; show "No recent activity" by default or use Redux state.
2. **UpcomingDeadlines**: Remove `dashboardService.fetchUpcomingDeadlines()` call; show "No upcoming deadlines" by default or use Redux state.
3. **NotificationCenter**: Remove `dashboardService.fetchNotifications()` call; use Redux notifications only (no API fetch).
4. **Error handling**: Simplify error handling since no API calls will be made.

## Acceptance Criteria
- ✅ No 404 errors in console from `/api/activities`, `/api/dashboard/deadlines`, `/api/dashboard/notifications`
- ✅ Dashboard components display empty states gracefully (no spinners indefinitely)
- ✅ Components use Redux state only for data
- ✅ No console errors related to API fetching
- ✅ Notification button works with Redux notifications only
