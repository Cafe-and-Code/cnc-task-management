// User types
export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatarUrl?: string;
  isActive: boolean;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export enum UserRole {
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
  ScrumMaster = 'ScrumMaster',
  Developer = 'Developer',
  Designer = 'Designer',
  Tester = 'Tester'
}

// Organization types
export interface Organization {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Project types
export interface Project {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  startDate?: string;
  endDate?: string;
  productOwnerId?: number;
  scrumMasterId?: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export enum ProjectStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  OnHold = 'OnHold',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// Team types
export interface Team {
  id: number;
  name: string;
  description?: string;
  projectId?: number;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  teamId: number;
  userId: number;
  role: TeamRole;
  createdAt: string;
  updatedAt: string;
}

export enum TeamRole {
  Member = 'Member',
  Lead = 'Lead'
}

// Sprint types
export interface Sprint {
  id: number;
  name: string;
  sprintNumber: number;
  startDate: string;
  endDate: string;
  status: SprintStatus;
  velocityGoal?: number;
  velocityActual?: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export enum SprintStatus {
  Planned = 'Planned',
  Active = 'Active',
  Completed = 'Completed',
  Cancelled = 'Cancelled'
}

// User Story types
export interface UserStory {
  id: number;
  title: string;
  description?: string;
  status: UserStoryStatus;
  priority: Priority;
  storyPoints: number;
  acceptanceCriteria?: string;
  assignedToUserId?: number;
  createdByUserId?: number;
  sprintId?: number;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export enum UserStoryStatus {
  Backlog = 'Backlog',
  Ready = 'Ready',
  InProgress = 'InProgress',
  Testing = 'Testing',
  Completed = 'Completed',
  Blocked = 'Blocked'
}

// Task types
export interface Task {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  estimatedHours: number;
  actualHours: number;
  remainingHours: number;
  dueDate?: string;
  assignedToUserId?: number;
  createdByUserId?: number;
  userStoryId: number;
  createdAt: string;
  updatedAt: string;
}

export enum TaskStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Testing = 'Testing',
  Completed = 'Completed',
  Blocked = 'Blocked'
}

export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

// Notification types
export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  userId: number;
  organizationId: number;
  projectId?: number;
  sprintId?: number;
  userStoryId?: number;
  taskId?: number;
  createdAt: string;
}

export enum NotificationType {
  Info = 'Info',
  Success = 'Success',
  Warning = 'Warning',
  Error = 'Error',
  TaskAssigned = 'TaskAssigned',
  UserStoryAssigned = 'UserStoryAssigned',
  SprintStarted = 'SprintStarted',
  SprintCompleted = 'SprintCompleted',
  ProjectCreated = 'ProjectCreated',
  ProjectUpdated = 'ProjectUpdated'
}

// Activity types
export interface Activity {
  id: number;
  action: string;
  entityType: string;
  entityId: number;
  details?: string;
  userId: number;
  organizationId: number;
  projectId?: number;
  sprintId?: number;
  userStoryId?: number;
  createdAt: string;
}

// Chart types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
}

// Form types
export interface FormErrors {
  [key: string]: string | undefined;
}

// Filter types
export interface FilterOptions {
  search?: string;
  status?: string | string[];
  priority?: string | string[];
  assignedTo?: number;
  dateRange?: {
    start: string;
    end: string;
  };
}

// GitHub types
export interface GitHubRepository {
  id: number;
  name: string;
  fullName: string;
  description?: string;
  htmlUrl: string;
  private: boolean;
  fork: boolean;
  language?: string;
  stargazersCount: number;
  forksCount: number;
  createdAt: string;
  updatedAt: string;
  owner: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };
}

export interface GitHubBranch {
  name: string;
  protected: boolean;
  commit: {
    sha: string;
    url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  message: string;
  url: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  committer: {
    name: string;
    email: string;
    date: string;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  user: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };
  head: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      fullName: string;
      owner: {
        login: string;
        avatarUrl: string;
      };
    };
  };
  base: {
    ref: string;
    sha: string;
    repo: {
      name: string;
      fullName: string;
      owner: {
        login: string;
        avatarUrl: string;
      };
    };
  };
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: string;
  htmlUrl: string;
  createdAt: string;
  updatedAt: string;
  user: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };
  labels: {
    id: number;
    name: string;
    color: string;
    description?: string;
  }[];
}

// UI State types
export interface LoadingState {
  [key: string]: boolean;
}

export interface ModalState {
  [key: string]: boolean;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;