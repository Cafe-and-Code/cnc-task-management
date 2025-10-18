# Backend ↔ Frontend Enum Mapping

## Complete Integer Enum Mapping Reference

### UserRole
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | Admin | Admin |
| 1 | ProductOwner | ProductOwner |
| 2 | ScrumMaster | ScrumMaster |
| 3 | Developer | Developer |
| 4 | Stakeholder | Stakeholder |

### ProjectStatus
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | Active | Active |
| 1 | OnHold | OnHold |
| 2 | Completed | Completed |
| 3 | Archived | Archived |

### SprintStatus
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | Planned | Planned |
| 1 | Active | Active |
| 2 | Completed | Completed |
| 3 | Cancelled | Cancelled |

### UserStoryStatus
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | Backlog | Backlog |
| 1 | Ready | Ready |
| 2 | InProgress | InProgress |
| 3 | Testing | Testing |
| 4 | Completed | Completed |
| 5 | Blocked | Blocked |

### TaskStatus
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | ToDo | ToDo |
| 1 | InProgress | InProgress |
| 2 | Testing | Testing |
| 3 | Completed | Completed |
| 4 | Blocked | Blocked |

### UserStoryPriority
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | Lowest | Lowest |
| 1 | Low | Low |
| 2 | Medium | Medium |
| 3 | High | High |
| 4 | Highest | Highest |

### TaskPriority
| Value | Backend (C#) | Frontend (TS) |
|-------|------------|---------------|
| 0 | Low | Low |
| 1 | Medium | Medium |
| 2 | High | High |
| 3 | Critical | Critical |

## Notes

- ✅ All mapped enums now use integers (0-based indexing)
- ✅ Frontend and backend values match exactly
- ✅ String enums (TeamRole, TaskType) are kept as-is (no backend mapping)
- ✅ JSON serialization will send integers, not strings
- ✅ All form submissions will automatically use correct integer values

## API Payload Examples

### Creating a Project
```json
POST /api/projects
{
  "name": "My Project",
  "status": 0,
  "productOwnerId": 1,
  "scrumMasterId": 2
}
```

### Creating a Sprint
```json
POST /api/sprints
{
  "name": "Sprint 1",
  "status": 0,
  "projectId": 1
}
```

### Creating a User Story
```json
POST /api/user-stories
{
  "title": "User Story Title",
  "priority": 2,
  "status": 0,
  "projectId": 1
}
```

### Creating a Task
```json
POST /api/tasks
{
  "title": "Task Title",
  "status": 0,
  "userStoryId": 1
}
```

### Updating Task Status
```json
PUT /api/tasks/{id}/status
{
  "status": 1
}
```

---
**Last Updated:** October 19, 2025
