import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import sprintService from '@/services/sprintService';

// Types
export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'Planned' | 'Active' | 'Completed' | 'Cancelled';
  projectId: string;
  projectName: string;
  goal: string;
  capacity: number;
  velocity?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SprintState {
  sprints: Sprint[];
  currentSprint: Sprint | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SprintState = {
  sprints: [],
  currentSprint: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const fetchSprints = createAsyncThunk(
  'sprints/fetchSprints',
  async (projectId: string) => {
    const response = await sprintService.getSprints(projectId);
    return response;
  }
);

export const fetchSprintById = createAsyncThunk(
  'sprints/fetchSprintById',
  async (sprintId: string) => {
    const response = await sprintService.getSprintById(sprintId);
    return response;
  }
);

export const createSprint = createAsyncThunk(
  'sprints/createSprint',
  async (sprintData: Partial<Sprint>) => {
    const response = await sprintService.createSprint(sprintData);
    return response;
  }
);

export const updateSprint = createAsyncThunk(
  'sprints/updateSprint',
  async ({ id, sprintData }: { id: string; sprintData: Partial<Sprint> }) => {
    const response = await sprintService.updateSprint(id, sprintData);
    return response;
  }
);

export const deleteSprint = createAsyncThunk(
  'sprints/deleteSprint',
  async (sprintId: string) => {
    await sprintService.deleteSprint(sprintId);
    return sprintId;
  }
);

// Slice
const sprintSlice = createSlice({
  name: 'sprints',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentSprint: (state, action: PayloadAction<Sprint | null>) => {
      state.currentSprint = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch sprints
      .addCase(fetchSprints.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSprints.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints = action.payload;
      })
      .addCase(fetchSprints.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch sprints';
      })
      // Fetch sprint by ID
      .addCase(fetchSprintById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSprintById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSprint = action.payload;
      })
      .addCase(fetchSprintById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch sprint';
      })
      // Create sprint
      .addCase(createSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints.push(action.payload);
      })
      .addCase(createSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create sprint';
      })
      // Update sprint
      .addCase(updateSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.sprints.findIndex(sprint => sprint.id === action.payload.id);
        if (index !== -1) {
          state.sprints[index] = action.payload;
        }
        if (state.currentSprint?.id === action.payload.id) {
          state.currentSprint = action.payload;
        }
      })
      .addCase(updateSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to update sprint';
      })
      // Delete sprint
      .addCase(deleteSprint.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteSprint.fulfilled, (state, action) => {
        state.isLoading = false;
        state.sprints = state.sprints.filter(sprint => sprint.id !== action.payload);
        if (state.currentSprint?.id === action.payload) {
          state.currentSprint = null;
        }
      })
      .addCase(deleteSprint.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to delete sprint';
      });
  },
});

export const { clearError, setCurrentSprint } = sprintSlice.actions;
export default sprintSlice.reducer;