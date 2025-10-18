# Tasks: Remove Backend API Data Fetching

1. Remove `activityService.getRecentActivities()` call from `RecentActivityFeed.tsx` and set empty state by default. [x]
2. Remove `dashboardService.fetchUpcomingDeadlines()` call from `UpcomingDeadlines.tsx` and set empty state by default. [x]
3. Remove `dashboardService.fetchNotifications()` call from `NotificationCenter.tsx` (dashboard) and use Redux notifications only. [x]
4. Simplify error handling in all three components (no try-catch needed if no API calls). [x]
5. Test in browser: verify no 404 errors in console from dashboard components. [x]
6. Verify notification button displays Redux notifications correctly with no API errors. [x]
7. Validate that dashboard shows empty states gracefully. [x]

