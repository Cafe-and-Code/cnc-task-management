## ADDED Requirements

### Requirement: Project page SHALL display user's projects
The project page SHALL display all projects belonging to the user, even if there is only one.

#### Scenario: Single project is shown
- **GIVEN** the user has exactly one project
- **WHEN** the project page is loaded
- **THEN** the single project SHALL be displayed

### Requirement: Project page SHALL show empty state if no projects
The project page SHALL show a clear empty state message if the user has no projects.

#### Scenario: No projects empty state
- **GIVEN** the user has no projects
- **WHEN** the project page is loaded
- **THEN** an empty state message SHALL be displayed
- **AND** no blank or confusing UI is shown
