## MODIFIED Requirements

- Requirement: Dashboard avoids API 404s

	#### Scenario: Dashboard avoids API 404s
	Given the frontend is running in development without backend API endpoints
	When the dashboard renders
	Then it should not attempt to call `/api/activities`, `/api/dashboard/deadlines`, or `/api/dashboard/notifications`
	And the UI should show empty states and not throw console errors.

- Requirement: Notifications derive from Redux state only

	#### Scenario: Notifications derive from Redux state only
	Given the app has notifications in Redux
	When the NotificationCenter is opened
	Then notifications should show from Redux state without making API calls
	And mark-read/clear actions should operate on Redux state.
