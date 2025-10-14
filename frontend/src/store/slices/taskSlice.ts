import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import taskService from '@/services/taskService';

// Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Testing' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  hoursEstimated: number;
  hoursActual: number;
  projectId: string;
  projectName: string;
  userStoryId: string;
  userStoryTitle: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  userStoryTasks: Task[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  currentTask: null,
  userStoryTasks: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (projectId: string) => {
    const response = await taskService.getTasks(projectId);
    return response;
  }
);

export const fetchTaskById = createAsyncThunk(
  'tasks/fetchTaskById',
  async (taskId: string) => {
    const response = await taskService.getTaskById(taskId);
    return response;
  }
);

export const fetchUserStoryTasks = createAsyncThunk(
  'tasks/fetchUserStoryTasks',
  async (userStoryId: string) => {
    const response = await taskService.getUserStoryTasks(userStoryId);
    return response;
  }
);

export const fetchSprintTasks = createAsyncThunk(
  'tasks/fetchSprintTasks',
  async (sprintId: string) => {
    const response = await taskService.getSprintTasks(sprintId);
    return response;
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: Partial<Task>) => {
    const response = await taskService.createTask(taskData);
    return response;
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: string; taskData: Partial<Task> }) => {
    const response = await taskService.updateTask(id, taskData);
    return response;
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId: string) => {
    await taskService.deleteTask(taskId);
    return taskId;
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }: { taskId: string; status: Task['status'] }) => {
    const response = await taskService.updateTaskStatus(taskId, status);
    return response;
  }
);

export const logHours = createAsyncThunk(
  'tasks/logHours',
  async ({ taskId, hours }: { taskId: string; hours: number }) => {
    const response = await taskService.logHours(taskId, hours);
    return response;
  }
);

// Slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentTask: (state, action: PayloadAction<Task | null>) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch tasks';
      })
      // Fetch task by ID
      .addCase(fetchTaskById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTaskById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch task';
      })
      // Fetch user story tasks
      .addCase(fetchUserStoryTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStoryTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStoryTasks = action.payload;
      })
      .addCase(fetchUserStoryTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user story tasks';
      })
      // Create task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.push(action.payload);
        // Add to user story tasks if it belongs to a user story
        if (state.userStoryTasks.length > 0 && 
            state.userStoryTasks[0].userStoryId === action.payload.userStoryId) {
          state.userStoryTasks.push(action.payload);
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create task';
      })
      // Update task
      .addCase(updateTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        const userStoryIndex = state.userStoryTasks.findIndex(task => task.id === action.payload.id);
        if (userStoryIndex !== -1) {
          state.userStoryTasks[userStoryIndex] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update task';
      })
      // Delete task
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = state.tasks.filter(task => task.id !== action.payload);
        state.userStoryTasks = state.userStoryTasks.filter(task => task.id !== action.payload);
        if (state.currentTask?.id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete task';
      })
      // Update task status
      .addCase(updateTaskStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        const userStoryIndex = state.userStoryTasks.findIndex(task => task.id === action.payload.id);
        if (userStoryIndex !== -1) {
          state.userStoryTasks[userStoryIndex] = action.payload;
        }
      })
      .addCase(updateTaskStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update task status';
      })
      // Log hours
      .addCase(logHours.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logHours.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.tasks.findIndex(task => task.id === action.payload.id);
        if (index !== -1) {
          state.tasks[index] = action.payload;
        }
        if (state.currentTask?.id === action.payload.id) {
          state.currentTask = action.payload;
        }
        const userStoryIndex = state.userStoryTasks.findIndex(task => task.id === action.payload.id);
        if (userStoryIndex !== -1) {
          state.userStoryTasks[userStoryIndex] = action.payload;
        }
      })
      .addCase(logHours.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to log hours';
      });
  },
});

export const { clearError, setCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;