import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import userStoryService from '@/services/userStoryService';

// Types
export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string;
  storyPoints: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Backlog' | 'Ready' | 'In Progress' | 'Testing' | 'Done';
  projectId: string;
  projectName: string;
  sprintId?: string;
  sprintName?: string;
  assigneeId?: string;
  assigneeName?: string;
  reporterId: string;
  reporterName: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStoryState {
  userStories: UserStory[];
  currentUserStory: UserStory | null;
  backlogUserStories: UserStory[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserStoryState = {
  userStories: [],
  currentUserStory: null,
  backlogUserStories: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchUserStories = createAsyncThunk(
  'userStories/fetchUserStories',
  async (projectId: string) => {
    const response = await userStoryService.getUserStories(projectId);
    return response;
  }
);

export const fetchUserStoryById = createAsyncThunk(
  'userStories/fetchUserStoryById',
  async (userStoryId: string) => {
    const response = await userStoryService.getUserStoryById(userStoryId);
    return response;
  }
);

export const fetchBacklogUserStories = createAsyncThunk(
  'userStories/fetchBacklogUserStories',
  async (projectId: string) => {
    const response = await userStoryService.getBacklogUserStories(projectId);
    return response;
  }
);

export const createUserStory = createAsyncThunk(
  'userStories/createUserStory',
  async (userStoryData: Partial<UserStory>) => {
    const response = await userStoryService.createUserStory(userStoryData);
    return response;
  }
);

export const updateUserStory = createAsyncThunk(
  'userStories/updateUserStory',
  async ({ id, userStoryData }: { id: string; userStoryData: Partial<UserStory> }) => {
    const response = await userStoryService.updateUserStory(id, userStoryData);
    return response;
  }
);

export const deleteUserStory = createAsyncThunk(
  'userStories/deleteUserStory',
  async (userStoryId: string) => {
    await userStoryService.deleteUserStory(userStoryId);
    return userStoryId;
  }
);

export const assignUserStoryToSprint = createAsyncThunk(
  'userStories/assignUserStoryToSprint',
  async ({ userStoryId, sprintId }: { userStoryId: string; sprintId: string }) => {
    const response = await userStoryService.assignUserStoryToSprint(userStoryId, sprintId);
    return response;
  }
);

export const moveUserStory = createAsyncThunk(
  'userStories/moveUserStory',
  async ({ userStoryId, status }: { userStoryId: string; status: UserStory['status'] }) => {
    const response = await userStoryService.moveUserStory(userStoryId, status);
    return response;
  }
);

// Slice
const userStorySlice = createSlice({
  name: 'userStories',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUserStory: (state, action: PayloadAction<UserStory | null>) => {
      state.currentUserStory = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user stories
      .addCase(fetchUserStories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStories = action.payload;
      })
      .addCase(fetchUserStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user stories';
      })
      // Fetch user story by ID
      .addCase(fetchUserStoryById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStoryById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentUserStory = action.payload;
      })
      .addCase(fetchUserStoryById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch user story';
      })
      // Fetch backlog user stories
      .addCase(fetchBacklogUserStories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBacklogUserStories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.backlogUserStories = action.payload;
      })
      .addCase(fetchBacklogUserStories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch backlog user stories';
      })
      // Create user story
      .addCase(createUserStory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserStory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStories.push(action.payload);
        state.backlogUserStories.push(action.payload);
      })
      .addCase(createUserStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create user story';
      })
      // Update user story
      .addCase(updateUserStory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserStory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.userStories.findIndex(story => story.id === action.payload.id);
        if (index !== -1) {
          state.userStories[index] = action.payload;
        }
        if (state.currentUserStory?.id === action.payload.id) {
          state.currentUserStory = action.payload;
        }
        const backlogIndex = state.backlogUserStories.findIndex(story => story.id === action.payload.id);
        if (backlogIndex !== -1) {
          state.backlogUserStories[backlogIndex] = action.payload;
        }
      })
      .addCase(updateUserStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update user story';
      })
      // Delete user story
      .addCase(deleteUserStory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUserStory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userStories = state.userStories.filter(story => story.id !== action.payload);
        state.backlogUserStories = state.backlogUserStories.filter(story => story.id !== action.payload);
        if (state.currentUserStory?.id === action.payload) {
          state.currentUserStory = null;
        }
      })
      .addCase(deleteUserStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete user story';
      })
      // Assign user story to sprint
      .addCase(assignUserStoryToSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(assignUserStoryToSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.userStories.findIndex(story => story.id === action.payload.id);
        if (index !== -1) {
          state.userStories[index] = action.payload;
        }
        // Remove from backlog if assigned to sprint
        if (action.payload.sprintId) {
          state.backlogUserStories = state.backlogUserStories.filter(story => story.id !== action.payload.id);
        }
      })
      .addCase(assignUserStoryToSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to assign user story to sprint';
      })
      // Move user story
      .addCase(moveUserStory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(moveUserStory.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.userStories.findIndex(story => story.id === action.payload.id);
        if (index !== -1) {
          state.userStories[index] = action.payload;
        }
        if (state.currentUserStory?.id === action.payload.id) {
          state.currentUserStory = action.payload;
        }
      })
      .addCase(moveUserStory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to move user story';
      });
  },
});

export const { clearError, setCurrentUserStory } = userStorySlice.actions;
export default userStorySlice.reducer;