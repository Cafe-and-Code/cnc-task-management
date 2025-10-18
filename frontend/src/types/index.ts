// User and Authentication types
export interface User {
  id: number;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: number;
  organizationName?: string;
  avatarUrl?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export enum UserRole {
  Admin = 0,
  ProductOwner = 1,
  ScrumMaster = 2,
  Developer = 3,
  Stakeholder = 4,
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  productOwnerId?: number;
  scrumMasterId?: number;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  velocityGoal: number;
  sprintDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  productOwner?: User;
  scrumMaster?: User;
  teams?: Team[];
  teamCount?: number;
  activeSprintCount?: number;
}

export enum ProjectStatus {
  Active = 0,
  OnHold = 1,
  Completed = 2,
  Archived = 3,
}

// Team types
export interface Team {
  id: number;
  projectId?: number;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  user: User;
  role: TeamRole;
  joinedAt: string;
  leftAt?: string;
  isActive: boolean;
}

export enum TeamRole {
  ProductOwner = 'ProductOwner',
  ScrumMaster = 'ScrumMaster',
  Developer = 'Developer',
  Tester = 'Tester',
  Designer = 'Designer',
}

// Sprint types
export interface Sprint {
  id: number;
  projectId: number;
  name: string;
  goal?: string;
  startDate?: string;
  endDate?: string;
  status: SprintStatus;
  capacity: number;
  velocity: number;
  storyCount?: number;
  taskCount?: number;
  completedTasks?: number;
  remainingTasks?: number;
  burndownData?: BurndownData[];
  createdAt: string;
  updatedAt: string;
}

export enum SprintStatus {
  Planned = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3,
}

export interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
}

// User Story types
export interface UserStory {
  id: number;
  projectId: number;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  storyPoints: number;
  priority: UserStoryPriority;
  status: UserStoryStatus;
  businessValue: number;
  estimatedHours?: number;
  actualHours: number;
  assignee?: User;
  reporter: User;
  sprint?: Sprint;
  taskCount?: number;
  completedTasks?: number;
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export enum UserStoryPriority {
  Lowest = 0,
  Low = 1,
  Medium = 2,
  High = 3,
  Highest = 4,
}

export enum UserStoryStatus {
  Backlog = 0,
  Ready = 1,
  InProgress = 2,
  Testing = 3,
  Completed = 4,
  Blocked = 5,
}

// Task types
export interface Task {
  id: number;
  userStoryId: number;
  title: string;
  description?: string;
  status: TaskStatus;
  type: TaskType;
  assignee?: User;
  reporter: User;
  userStory: UserStory;
  estimatedHours?: number;
  actualHours: number;
  remainingHours?: number;
  parentTaskId?: number;
  subtasks?: Task[];
  orderIndex: number;
  dueDate?: string;
  completedAt?: string;
  comments?: Comment[];
  attachments?: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  ToDo = 0,
  InProgress = 1,
  Testing = 2,
  Completed = 3,
  Blocked = 4,
}

export enum TaskType {
  Development = 'Development',
  Testing = 'Testing',
  Documentation = 'Documentation',
  Research = 'Research',
  Design = 'Design',
  Meeting = 'Meeting',
}

// Comment and Attachment types
export interface Comment {
  id: number;
  entityType: string;
  entityId: number;
  content: string;
  author: User;
  parentCommentId?: number;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  entityType: string;
  entityId: number;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  contentType?: string;
  uploadedBy: User;
  uploadedAt: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationState;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  password: string;
  organizationId?: number;
  role: UserRole;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
}

// UI State types
export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

export interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
}

export interface VelocityData {
  sprint: string;
  planned: number;
  completed: number;
}

export interface FlowData {
  date: string;
  backlog: number;
  inProgress: number;
  testing: number;
  done: number;
}
