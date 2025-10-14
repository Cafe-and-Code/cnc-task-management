# CNC Task Management System - Frontend Specification

## Overview

This document outlines the complete frontend specification for the CNC Task Management System, built with React 18, TypeScript, Tailwind CSS, and DaisyUI.

## Technology Stack

### Core Technologies
- **React**: 18.2.0 with functional components and hooks
- **TypeScript**: 5.0+ for type safety
- **Vite**: 4.0+ for fast development and building
- **Tailwind CSS**: 3.3+ for utility-first styling
- **DaisyUI**: 2.0+ for component library

### State Management & Data Flow
- **Redux Toolkit**: For global state management
- **React Router**: 6.0+ for client-side routing
- **React Query/TanStack Query**: For server state management
- **SignalR Client**: For real-time communication

### UI/UX Libraries
- **React Hook Form**: For form handling with validation
- **Zod**: For schema validation
- **React Beautiful DND**: For drag-and-drop functionality
- **Recharts**: For charts and data visualization
- **React Hot Toast**: For notifications
- **Lucide React**: For icons

### Development Tools
- **ESLint**: For code linting
- **Prettier**: For code formatting
- **Husky**: For git hooks
- **Jest**: For unit testing
- **React Testing Library**: For component testing
- **Playwright**: For end-to-end testing

## Project Structure

```
cnctaskmanagement-frontend/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── manifest.json
├── src/
│   ├── components/          # Reusable UI components
│   ├── features/           # Feature-specific components
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   ├── store/              # Redux store and slices
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   ├── styles/             # Global styles
│   ├── assets/             # Static assets
│   └── pages/              # Page components
├── tests/                  # Test files
└── config files...
```

## Design System

### Color Palette

Based on DaisyUI themes with custom brand colors:

```css
:root {
  --brand-primary: #3b82f6;     /* Blue 500 */
  --brand-secondary: #8b5cf6;   /* Purple 500 */
  --brand-accent: #10b981;      /* Emerald 500 */
  --brand-danger: #ef4444;      /* Red 500 */
  --brand-warning: #f59e0b;     /* Amber 500 */
  --brand-info: #06b6d4;        /* Cyan 500 */
  
  --neutral-50: #fafafa;
  --neutral-100: #f5f5f5;
  --neutral-200: #e5e5e5;
  --neutral-300: #d4d4d4;
  --neutral-400: #a3a3a3;
  --neutral-500: #737373;
  --neutral-600: #525252;
  --neutral-700: #404040;
  --neutral-800: #262626;
  --neutral-900: #171717;
}
```

### Typography

```css
.text-xs { font-size: 0.75rem; line-height: 1rem; }
.text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.text-base { font-size: 1rem; line-height: 1.5rem; }
.text-lg { font-size: 1.125rem; line-height: 1.75rem; }
.text-xl { font-size: 1.25rem; line-height: 1.75rem; }
.text-2xl { font-size: 1.5rem; line-height: 2rem; }
.text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
```

### Spacing System

Using Tailwind's default spacing system:
- 0.25rem (4px) to 16rem (256px) in 0.25rem increments
- Custom spacing for specific layouts where needed

### Component Library

#### Base Components

```tsx
// Button Component
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

// Input Component
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Card Component
interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}
```

## Page Specifications

### Authentication Pages

#### Login Page
```tsx
interface LoginPageProps {}

// Features:
// - Email and password fields
// - Remember me checkbox
// - Forgot password link
// - Organization selection (if multiple)
// - Form validation
// - Loading states
// - Error handling
```

#### Register Page
```tsx
interface RegisterPageProps {
  organizationId?: string; // Pre-filled if invited
}

// Features:
// - User registration form
// - Organization selection/creation
// - Password strength indicator
// - Email verification
// - Terms and conditions
```

### Dashboard Page

```tsx
interface DashboardPageProps {}

// Features:
// - Project overview cards
// - Recent activity feed
// - Upcoming deadlines
// - Sprint progress charts
// - Quick actions
// - Team performance metrics
// - Notifications widget
```

### Project Management Pages

#### Project List Page
```tsx
interface ProjectListPageProps {}

// Features:
// - Project cards with key metrics
// - Search and filtering
// - Sorting options
// - Pagination
// - Create new project button
// - Project status indicators
// - Quick actions menu
```

#### Project Detail Page
```tsx
interface ProjectDetailPageProps {
  projectId: string;
}

// Features:
// - Project information header
// - Tab navigation (Overview, Backlog, Sprints, Team, Reports)
// - Project settings
// - Activity timeline
// - Key metrics dashboard
```

#### Project Settings Page
```tsx
interface ProjectSettingsPageProps {
  projectId: string;
}

// Features:
// - General settings
// - Team management
// - Sprint configuration
// - Integration settings
// - Notification preferences
```

### Backlog Management Pages

#### Product Backlog Page
```tsx
interface ProductBacklogPageProps {
  projectId: string;
}

// Features:
// - User story cards
// - Drag and drop reordering
// - Bulk actions
// - Filtering and search
// - Story points estimation
// - Priority management
// - Sprint assignment
```

#### User Story Detail Modal
```tsx
interface UserStoryDetailModalProps {
  storyId: string;
  isOpen: boolean;
  onClose: () => void;
}

// Features:
// - Story details
// - Acceptance criteria
// - Task breakdown
// - Comments and attachments
// - History and activity
// - Edit capabilities
```

### Sprint Management Pages

#### Sprint List Page
```tsx
interface SprintListPageProps {
  projectId: string;
}

// Features:
// - Sprint timeline view
// - Sprint cards with metrics
// - Create new sprint
// - Sprint status indicators
// - Velocity tracking
```

#### Sprint Planning Page
```tsx
interface SprintPlanningPageProps {
  projectId: string;
  sprintId?: string;
}

// Features:
// - Backlog selection
// - Capacity planning
// - Story points allocation
// - Team assignment
// - Sprint goal definition
```

#### Sprint Detail Page
```tsx
interface SprintDetailPageProps {
  projectId: string;
  sprintId: string;
}

// Features:
// - Sprint information header
// - Burndown chart
// - Task management
// - Team performance
// - Sprint controls (start, complete, cancel)
```

### Kanban Board Page

```tsx
interface KanbanBoardPageProps {
  projectId: string;
  sprintId: string;
}

// Features:
// - Drag and drop columns
// - Task cards with details
// - Swimlanes support
// - WIP limits
// - Column constraints
// - Quick task creation
// - Filtering and search
```

### Team Management Pages

#### Team List Page
```tsx
interface TeamListPageProps {
  projectId?: string;
}

// Features:
// - Team cards with member count
// - Create new team
// - Team performance metrics
// - Member management
```

#### Team Detail Page
```tsx
interface TeamDetailPageProps {
  teamId: string;
}

// Features:
// - Team information
// - Member list with roles
// - Add/remove members
// - Team performance charts
// - Activity feed
```

### Reports Pages

#### Reports Dashboard
```tsx
interface ReportsPageProps {
  projectId: string;
}

// Features:
// - Report type selection
// - Date range picker
// - Chart visualization
// - Export options
// - Custom report builder
```

#### Sprint Report Page
```tsx
interface SprintReportPageProps {
  projectId: string;
  sprintId: string;
}

// Features:
// - Sprint metrics
// - Burndown/burnup charts
// - Velocity tracking
// - Team performance
// - Retrospective notes
```

### Admin Pages

#### Admin Dashboard
```tsx
interface AdminDashboardPageProps {}

// Features:
// - Organization overview
// - User management
// - System health
// - Usage analytics
// - Security settings
```

#### User Management Page
```tsx
interface UserManagementPageProps {}

// Features:
// - User list with search/filter
// - Bulk operations
// - Role management
// - User creation
// - Activity monitoring
```

## Component Specifications

### Layout Components

#### App Layout
```tsx
interface AppLayoutProps {
  children: React.ReactNode;
}

// Features:
// - Responsive header with navigation
// - Sidebar with menu items
// - Footer with links
// - Breadcrumb navigation
// - Notification center
```

#### Header Component
```tsx
interface HeaderProps {
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

// Features:
// - Logo and branding
// - User menu
// - Notification bell
// - Search bar
// - Theme switcher
```

#### Sidebar Component
```tsx
interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Features:
// - Navigation menu items
// - Project switcher
// - Collapsible sections
// - Active state indicators
```

### Feature Components

#### Task Card Component
```tsx
interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onStatusChange?: (taskId: string, status: TaskStatus) => void;
  draggable?: boolean;
}

// Features:
// - Task information display
// - Status indicators
// - Assignee avatar
// - Priority badges
// - Quick actions menu
// - Drag handle
```

#### User Story Card Component
```tsx
interface UserStoryCardProps {
  story: UserStory;
  onEdit?: (story: UserStory) => void;
  onDelete?: (storyId: string) => void;
  onSprintAssign?: (storyId: string, sprintId: string) => void;
  draggable?: boolean;
}

// Features:
// - Story title and description
// - Story points display
// - Priority indicator
// - Status badge
// - Assignee information
// - Task progress
```

#### Kanban Column Component
```tsx
interface KanbanColumnProps {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onTaskDrop: (taskId: string, newStatus: TaskStatus) => void;
  onTaskEdit: (task: Task) => void;
  wipLimit?: number;
  color?: string;
}

// Features:
// - Column header with count
// - WIP limit indicator
// - Task list
// - Drop zone
// - Add task button
```

#### Chart Components
```tsx
// Burndown Chart
interface BurndownChartProps {
  data: BurndownData[];
  title?: string;
  height?: number;
}

// Velocity Chart
interface VelocityChartProps {
  data: VelocityData[];
  title?: string;
  height?: number;
}

// Cumulative Flow Diagram
interface CumulativeFlowChartProps {
  data: FlowData[];
  title?: string;
  height?: number;
}
```

### Form Components

#### Project Form Component
```tsx
interface ProjectFormProps {
  project?: Project;
  onSubmit: (project: CreateProjectRequest | UpdateProjectRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Features:
// - Project details fields
// - Team assignment
// - Sprint configuration
// - Form validation
// - Password requirements
```

#### User Story Form Component
```tsx
interface UserStoryFormProps {
  story?: UserStory;
  onSubmit: (story: CreateUserStoryRequest | UpdateUserStoryRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Features:
// - Story details fields
// - Acceptance criteria editor
// - Story points selector
// - Priority setting
// - Assignee selection
```

#### Task Form Component
```tsx
interface TaskFormProps {
  task?: Task;
  userStoryId?: string;
  onSubmit: (task: CreateTaskRequest | UpdateTaskRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

// Features:
// - Task details fields
// - Time tracking
// - Assignee selection
// - Due date setting
// - Subtask management
```

## State Management

### Redux Store Structure

```typescript
interface RootState {
  auth: AuthState;
  projects: ProjectsState;
  sprints: SprintsState;
  tasks: TasksState;
  teams: TeamsState;
  notifications: NotificationsState;
  ui: UIState;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
}

// ... other states
```

### Custom Hooks

```typescript
// useAuth Hook
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  register: (userData: RegisterData) => Promise<void>;
  updateProfile: (profile: UpdateProfileData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

// useProjects Hook
interface UseProjectsReturn {
  projects: Project[];
  currentProject: Project | null;
  createProject: (project: CreateProjectRequest) => Promise<void>;
  updateProject: (id: string, project: UpdateProjectRequest) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
  refetch: () => void;
}

// useSignalR Hook
interface UseSignalRReturn {
  isConnected: boolean;
  connection: signalR.HubConnection | null;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  joinTask: (taskId: string) => void;
  leaveTask: (taskId: string) => void;
}
```

## Routing Structure

```typescript
const routes = [
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectListPage /> },
      { path: 'projects/:projectId', element: <ProjectDetailPage /> },
      { path: 'projects/:projectId/backlog', element: <ProductBacklogPage /> },
      { path: 'projects/:projectId/sprints', element: <SprintListPage /> },
      { path: 'projects/:projectId/sprints/:sprintId', element: <SprintDetailPage /> },
      { path: 'projects/:projectId/kanban/:sprintId', element: <KanbanBoardPage /> },
      { path: 'projects/:projectId/reports', element: <ReportsPage /> },
      { path: 'teams', element: <TeamListPage /> },
      { path: 'teams/:teamId', element: <TeamDetailPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'notifications', element: <NotificationCenter /> },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminDashboardPage /> },
      { path: 'users', element: <UserManagementPage /> },
      { path: 'organizations', element: <OrganizationManagementPage /> },
      { path: 'settings', element: <SystemSettingsPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
```

## Responsive Design

### Breakpoints

```css
/* Tailwind CSS breakpoints */
sm: 640px   /* Small screens */
md: 768px   /* Medium screens */
lg: 1024px  /* Large screens */
xl: 1280px  /* Extra large screens */
2xl: 1536px /* 2X large screens */
```

### Mobile-First Approach

- Base styles for mobile devices
- Progressive enhancement for larger screens
- Touch-friendly interface elements
- Optimized navigation for mobile

### Responsive Components

```tsx
// Responsive Grid Layout
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Cards */}
</div>

// Responsive Navigation
<nav className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
  {/* Navigation items */}
</nav>

// Responsive Tables
<div className="overflow-x-auto">
  <table className="min-w-full">
    {/* Table content */}
  </table>
</div>
```

## Performance Optimization

### Code Splitting

```typescript
// Lazy loading for route components
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProjectListPage = lazy(() => import('../pages/ProjectListPage'));

// Lazy loading for heavy components
const ChartComponent = lazy(() => import('../components/Charts/ChartComponent'));
```

### Memoization

```typescript
// React.memo for component optimization
const TaskCard = React.memo<TaskCardProps>(({ task, onEdit, onDelete }) => {
  // Component implementation
});

// useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);

// useCallback for function references
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);
```

### Virtual Scrolling

```typescript
// For large lists with react-window
import { FixedSizeList as List } from 'react-window';

const TaskList = ({ tasks }: { tasks: Task[] }) => (
  <List
    height={600}
    itemCount={tasks.length}
    itemSize={80}
    itemData={tasks}
  >
    {TaskRow}
  </List>
);
```

## Accessibility

### ARIA Labels and Roles

```tsx
// Semantic HTML with ARIA support
<button
  aria-label="Close modal"
  aria-expanded={isModalOpen}
  aria-controls="modal-content"
  onClick={closeModal}
>
  <XIcon />
</button>

// Form accessibility
<label htmlFor="email">Email address</label>
<input
  id="email"
  type="email"
  aria-required="true"
  aria-describedby="email-error"
  aria-invalid={hasError}
/>
{hasError && (
  <span id="email-error" className="error-message" role="alert">
    {errorMessage}
  </span>
)}
```

### Keyboard Navigation

```typescript
// Keyboard event handling
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeModal();
  } else if (event.key === 'Enter') {
    submitForm();
  }
};

// Focus management
useEffect(() => {
  if (isModalOpen) {
    modalRef.current?.focus();
  }
}, [isModalOpen]);
```

## Testing Strategy

### Unit Tests

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { TaskCard } from './TaskCard';

describe('TaskCard', () => {
  it('renders task information correctly', () => {
    const mockTask = {
      id: '1',
      title: 'Test Task',
      status: 'ToDo',
      // ... other properties
    };

    render(<TaskCard task={mockTask} />);

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('ToDo')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    const mockTask = { /* ... */ };

    render(<TaskCard task={mockTask} onEdit={mockOnEdit} />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });
});
```

### Integration Tests

```typescript
// API integration testing
import { renderHook, waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';

describe('useProjects', () => {
  it('fetches projects successfully', async () => {
    const { result } = renderHook(() => useProjects());

    await waitFor(() => {
      expect(result.current.projects).toHaveLength(3);
      expect(result.current.isLoading).toBe(false);
    });
  });
});
```

### E2E Tests

```typescript
// Playwright E2E testing
import { test, expect } from '@playwright/test';

test('user can create a new project', async ({ page }) => {
  await page.goto('/projects');
  await page.click('[data-testid="create-project-button"]');
  await page.fill('[data-testid="project-name"]', 'Test Project');
  await page.fill('[data-testid="project-description"]', 'Test Description');
  await page.click('[data-testid="submit-button"]');

  await expect(page.locator('h1')).toContainText('Test Project');
});
```

## Security Considerations

### XSS Prevention

```typescript
// Sanitize user input
import DOMPurify from 'dompurify';

const SanitizedContent = ({ content }: { content: string }) => {
  const cleanContent = DOMPurify.sanitize(content);
  return <div dangerouslySetInnerHTML={{ __html: cleanContent }} />;
};
```

### CSRF Protection

```typescript
// Include CSRF token in API requests
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'X-CSRF-Token': getCsrfToken(),
  },
});
```

### Content Security Policy

```html
<!-- CSP meta tag -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
">
```

This frontend specification provides a comprehensive foundation for building a modern, accessible, and performant React application for the CNC Task Management System.