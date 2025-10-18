# Enable Admins to Serve as Product Owners and Scrum Masters

## Why

Administrators are currently restricted from serving as Product Owners or Scrum Masters, creating artificial limitations in small organizations where the same person may need to handle both administrative and project management duties. This restriction forces organizations to create separate user accounts or work around the system limitations, reducing efficiency and user experience.

## What Changes
- Modify frontend role filtering logic to include Admin users in Product Owner and Scrum Master selection dropdowns
- Update `getProductOwners()` function in ProjectFormPage.tsx to filter for `UserRole.ProductOwner || UserRole.Admin`
- Update `getScrumMasters()` function in ProjectFormPage.tsx to filter for `UserRole.ScrumMaster || UserRole.Admin`
- Maintain existing behavior for non-admin users (no change in current filtering)
- No backend changes required (existing API already supports role assignments)

## Problem Statement

Currently, the system restricts project role assignments such that:
- Admin users cannot be selected as Product Owners
- Admin users cannot be selected as Scrum Masters
- Only users with the exact role of "ProductOwner" can be Product Owners
- Only users with the exact role of "ScrumMaster" can be Scrum Masters

This creates an artificial limitation where administrators, who have the highest level of system access, cannot participate in project management roles they may be qualified for.

## Proposed Solution

Enable administrators to serve as Product Owners and Scrum Masters by modifying the role-based filtering logic to include admins in eligible user pools for these project roles.

## Change Rationale

1. **Flexibility**: Small organizations often have administrators who also serve as project managers
2. **Logical Hierarchy**: Admins have system-wide permissions, so they should logically be able to perform project-level roles
3. **Practical Need**: In real scenarios, the same person may need to handle both administrative and project management duties
4. **User Experience**: Prevents confusion when admins cannot assign themselves to project roles they're qualified for

## Implementation Approach

The change will modify the frontend filtering logic to include admins alongside the specific roles when populating dropdown selections for:
- Product Owner selection
- Scrum Master selection

Backend changes are not required since the current system already allows any user to be assigned to these roles regardless of their system role.

## Impact Assessment

- **Low Risk**: Changes are limited to frontend filtering logic
- **Backward Compatible**: Existing functionality remains unchanged
- **User Benefit**: Expands flexibility in project role assignments
- **No Security Impact**: Admins already have elevated permissions system-wide