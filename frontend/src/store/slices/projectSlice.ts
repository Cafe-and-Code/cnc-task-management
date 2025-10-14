import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectStatus, FilterOptions } from '@/types';
import projectService from '@/services/projectService';

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
  filter: FilterOptions;
}

const initialState: ProjectState = {
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
  filter: {},
};

// Async thunks
export const fetchProjects = createAsyncThunk<
  { projects: Project[]; pagination: any },
  { page?: number; pageSize?: number; filter?: FilterOptions },
  { rejectValue: string }
>(
  'projects/fetchProjects',
  async (
    { page = 1, pageSize = 10, filter = {} },
    { rejectWithValue }
  ) => {
    try {
      const response = await projectService.getProjects(page, pageSize, filter);
      return response.data as any;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch projects'
      );
    }
  }
);

export const fetchProjectById = createAsyncThunk<
  Project,
  number,
  { rejectValue: string }
>('projects/fetchProjectById', async (id, { rejectWithValue }) => {
  try {
    const response = await projectService.getProjectById(id);
    return response.data as Project;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to fetch project'
    );
  }
});

export const createProject = createAsyncThunk<
  Project,
  Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
  { rejectValue: string }
>('projects/createProject', async (projectData, { rejectWithValue }) => {
  try {
    const response = await projectService.createProject(projectData);
    return response.data as Project;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to create project'
    );
  }
});

export const updateProject = createAsyncThunk<
  Project,
  { id: number; projectData: Partial<Project> },
  { rejectValue: string }
>(
  'projects/updateProject',
  async ({ id, projectData }, { rejectWithValue }) => {
    try {
      const response = await projectService.updateProject(id, projectData);
      return response.data as Project;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update project'
      );
    }
  }
);

export const deleteProject = createAsyncThunk<
  void,
  number,
  { rejectValue: string }
>('projects/deleteProject', async (id, { rejectWithValue }) => {
  try {
    await projectService.deleteProject(id);
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || 'Failed to delete project'
    );
  }
});

// Slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload;
    },
    setFilter: (state, action: PayloadAction<FilterOptions>) => {
      state.filter = action.payload;
      state.pagination.page = 1; // Reset to first page when filter changes
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    resetProjectState: () => initialState,
  },
  extraReducers: (builder) => {
    // Fetch Projects
    builder
      .addCase(fetchProjects.pending, (state) => {
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
        state.error = action.payload || 'Failed to fetch projects';
      });

    // Fetch Project By ID
    builder
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch project';
      });

    // Create Project
    builder
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create project';
      });

    // Update Project
    builder
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.projects.findIndex(
          (project) => project.id === action.payload.id
        );
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        
        // Update current project if it matches
        if (state.currentProject && state.currentProject.id === action.payload.id) {
          state.currentProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update project';
      });

    // Delete Project
    builder
      .addCase(deleteProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = state.projects.filter(
          (project) => project.id !== action.meta.arg
        );
        
        // Clear current project if it matches
        if (state.currentProject && state.currentProject.id === action.meta.arg) {
          state.currentProject = null;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete project';
      });
  },
});

export const {
  clearError,
  setCurrentProject,
  setFilter,
  clearCurrentProject,
  resetProjectState,
} = projectSlice.actions;

export default projectSlice.reducer;