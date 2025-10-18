# Role Expansion Specification

## ADDED Requirements

### REQ-ROLE-001: Admin Product Owner Eligibility
**Description**: System administrators shall be eligible to serve as Product Owners in projects.

#### Scenario: Admin appears in Product Owner dropdown
- **GIVEN** an authenticated user with Admin role
- **WHEN** they access the project creation form
- **THEN** the Product Owner dropdown shall include all users with ProductOwner role AND all users with Admin role

#### Scenario: Admin can be assigned as Product Owner
- **GIVEN** a project creation form
- **WHEN** an admin user selects themselves as Product Owner
- **THEN** the system shall allow the assignment and successfully create the project

### REQ-ROLE-002: Admin Scrum Master Eligibility
**Description**: System administrators shall be eligible to serve as Scrum Masters in projects.

#### Scenario: Admin appears in Scrum Master dropdown
- **GIVEN** an authenticated user with Admin role
- **WHEN** they access the project creation form
- **THEN** the Scrum Master dropdown shall include all users with ScrumMaster role AND all users with Admin role

#### Scenario: Admin can be assigned as Scrum Master
- **GIVEN** a project creation form
- **WHEN** an admin user selects themselves as Scrum Master
- **THEN** the system shall allow the assignment and successfully create the project

### REQ-ROLE-003: Non-Admin Behavior Preservation
**Description**: Existing role-based behavior shall be preserved for non-admin users.

#### Scenario: Non-Admin Product Owner selection
- **GIVEN** an authenticated user with ProductOwner, ScrumMaster, or Developer role
- **WHEN** they access the project creation form
- **THEN** the Product Owner dropdown shall only include users with ProductOwner role (no change in behavior)

#### Scenario: Non-Admin Scrum Master selection
- **GIVEN** an authenticated user with ProductOwner, ScrumMaster, or Developer role
- **WHEN** they access the project creation form
- **THEN** the Scrum Master dropdown shall only include users with ScrumMaster role (no change in behavior)

### REQ-ROLE-004: Mixed Role Assignment Support
**Description**: The system shall support projects where an Admin serves as both Product Owner and Scrum Master.

#### Scenario: Admin as both Product Owner and Scrum Master
- **GIVEN** a project creation form
- **WHEN** an admin user selects themselves for both Product Owner and Scrum Master roles
- **THEN** the system shall allow both assignments and successfully create the project

### REQ-ROLE-005: Backward Compatibility
**Description**: All existing functionality shall remain unchanged for current implementations.

#### Scenario: Existing project assignments
- **GIVEN** existing projects with non-Admin Product Owners and Scrum Masters
- **WHEN** the system is updated
- **THEN** all existing project role assignments shall continue to function normally

#### Scenario: Existing API endpoints
- **GIVEN** current API endpoints for project management
- **WHEN** the frontend is updated
- **THEN** no backend API changes shall be required

## MODIFIED Requirements

### MOD-ROLE-001: User Role Filtering Logic
**Description**: Frontend user filtering logic shall be modified to include Admin users in project role pools.

#### Current Behavior:
```typescript
const getProductOwners = () => users.filter(u => u.role === UserRole.ProductOwner);
const getScrumMasters = () => users.filter(u => u.role === UserRole.ScrumMaster);
```

#### Modified Behavior:
```typescript
const getProductOwners = () => users.filter(u => u.role === UserRole.ProductOwner || u.role === UserRole.Admin);
const getScrumMasters = () => users.filter(u => u.role === UserRole.ScrumMaster || u.role === UserRole.Admin);
```

#### Scenario: Role filtering includes admins
- **GIVEN** a list of users including Admin, ProductOwner, ScrumMaster, and Developer roles
- **WHEN** getProductOwners() function is called
- **THEN** the result shall include both ProductOwner and Admin role users

#### Scenario: Scrum Master filtering includes admins
- **GIVEN** a list of users including Admin, ProductOwner, ScrumMaster, and Developer roles
- **WHEN** getScrumMasters() function is called
- **THEN** the result shall include both ScrumMaster and Admin role users

## REMOVED Requirements

*No requirements are removed in this change.*

## Cross-Reference Relationships

- **REQ-ROLE-001** and **REQ-ROLE-002** depend on **MOD-ROLE-001** implementation
- **REQ-ROLE-003** ensures backward compatibility for existing functionality
- **REQ-ROLE-004** extends capability while maintaining existing constraints
- **REQ-ROLE-005** ensures system stability during deployment

## Implementation Notes

### Frontend Changes Required:
1. Modify `getProductOwners()` function in ProjectFormPage.tsx
2. Modify `getScrumMasters()` function in ProjectFormPage.tsx
3. Update filtering logic to include Admin role

### Backend Changes Required:
- None (current backend already supports any user in these roles)

### Testing Requirements:
1. Verify admin users appear in role dropdowns
2. Test project creation with admin role assignments
3. Ensure existing functionality remains unchanged
4. Validate form validation works with expanded role pools