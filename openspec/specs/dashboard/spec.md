# dashboard Specification

## Purpose
TBD - created by archiving change remove-api-data-fetching. Update Purpose after archive.
## Requirements
### Requirement: Dashboard components SHALL avoid API 404s
Dashboard components SHALL NOT attempt to call missing backend API endpoints (`/api/activities`, `/api/dashboard/deadlines`, `/api/dashboard/notifications`), and SHALL display empty states gracefully.

#### Scenario: Dashboard avoids API 404s
- **WHEN** the frontend application is running
- **THEN** dashboard components SHALL NOT attempt to call `/api/activities`, `/api/dashboard/deadlines`, or `/api/dashboard/notifications`
- **AND** components SHALL display empty states instead of error spinners
- **AND** no 404 errors SHALL appear in the browser console

### Requirement: Notification system MUST operate from Redux state only
The notification system MUST operate exclusively from Redux state without making external API calls to `/api/dashboard/notifications`.

#### Scenario: Notifications derive from Redux state only
- **WHEN** the NotificationCenter dropdown is opened
- **THEN** notifications MUST be retrieved from Redux state
- **AND** mark-read, clear, and related actions MUST operate on Redux state only
- **AND** no API requests MUST be made to `/api/dashboard/notifications`

