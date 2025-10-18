import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, PaginationState } from '../../types/index';
import { projectService } from '../../services/projectService';

interface ProjectsState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: PaginationState;
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  },
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (
    params: {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await projectService.getProjects(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProject = createAsyncThunk(
  'projects/fetchProject',
  async (projectId: number, { rejectWithValue }) => {
    try {
      const project = await projectService.getProject(projectId);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const project = await projectService.createProject(projectData);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, data }: { id: number; data: Partial<Project> }, { rejectWithValue }) => {
    try {
      const project = await projectService.updateProject(id, data);
      return project;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    clearProjects: state => {
      state.projects = [];
      state.currentProject = null;
      state.pagination = initialState.pagination;
    },
    updatePagination: (state, action: PayloadAction<Partial<PaginationState>>) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: builder => {
    // Fetch projects
    builder
      .addCase(fetchProjects.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload.projects;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single project
    builder
      .addCase(fetchProject.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create project
    builder
      .addCase(createProject.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update project
    builder
      .addCase(updateProject.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.projects.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentProject, clearProjects, updatePagination } =
  projectsSlice.actions;
export default projectsSlice;
