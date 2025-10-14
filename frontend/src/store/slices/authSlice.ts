import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, LoginRequest, RegisterRequest } from '@/types';
import authService, { AuthResponse } from '@/services/authService';
import { setCookie, deleteCookie, deleteAllAuthCookies } from '@/utils/cookies';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  AuthResponse,
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk<
  AuthResponse,
  RegisterRequest,
  { rejectValue: string }
>('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const response = await authService.register(userData);
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Registration failed');
  }
});

export const refreshToken = createAsyncThunk<
  AuthResponse,
  void,
  { rejectValue: string }
>('auth/refreshToken', async (_, { rejectWithValue, getState }) => {
  try {
    const state = getState() as { auth: AuthState };
    const { refreshToken } = state.auth;
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await authService.refreshToken();
    return response;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Token refresh failed');
  }
});

export const logoutUser = createAsyncThunk<void, void, { rejectValue: string }>(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await authService.getCurrentUser();
    return response as User;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to get user');
  }
});

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { user, token, refreshToken } = action.payload;
      state.user = user as any;
      state.token = token;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      // Store tokens in cookies (expires in 7 days)
      setCookie('token', token, 7);
      if (refreshToken) {
        setCookie('refreshToken', refreshToken, 7);
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      // Clear tokens from cookies
      deleteAllAuthCookies();
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, token, refreshToken } = action.payload;
        state.user = user as any;
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        // Store tokens in cookies (expires in 7 days)
        setCookie('token', token, 7);
        if (refreshToken) {
          setCookie('refreshToken', refreshToken, 7);
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      });

    // Register
    builder
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, token, refreshToken } = action.payload;
        state.user = user as any;
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        // Store tokens in cookies (expires in 7 days)
        setCookie('token', token, 7);
        if (refreshToken) {
          setCookie('refreshToken', refreshToken, 7);
        }
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Registration failed';
      });

    // Refresh Token
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.isLoading = false;
        const { user, token, refreshToken } = action.payload;
        state.user = user as any;
        state.token = token;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Token refresh failed';
        // Clear auth state on refresh failure
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        // Clear tokens from cookies
        deleteAllAuthCookies();
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Logout failed';
        // Still clear auth state even if logout API call fails
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        // Clear tokens from cookies
        deleteAllAuthCookies();
      });

    // Get Current User
    builder
      .addCase(getCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload as any;
        state.isAuthenticated = true;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to get user';
        // Do not clear tokens here to avoid logging the user out on transient errors
      });
  },
});

export const { clearError, setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;