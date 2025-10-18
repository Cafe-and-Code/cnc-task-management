## ADDED Requirements

### Requirement: Notification button must be interactive
#### Scenario:
- User can click the notification button to toggle the notification list.
- Button is not blocked by other UI elements (z-index, pointer-events).

### Requirement: Notification messages must be visible
#### Scenario:
- When toggled, a dropdown/modal displays recent notification messages.
- Messages are readable and accessible.

### Requirement: Accessibility
#### Scenario:
- Button has aria-label and supports keyboard navigation.
- Dropdown/modal is focusable and dismissible via keyboard.

### Requirement: Unread badge
#### Scenario:
- If there are unread notifications, a badge is shown on the button.
