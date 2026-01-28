import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { tokenManager } from '../../lib/api';
import type { User, AuthState } from '../../types/auth';

const initialState: AuthState = {
  user: null,
  isAuthenticated: tokenManager.isValid(),
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      const { user, token } = action.payload;
      state.user = user;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      tokenManager.set(token);
    },

    setUserProfile: (state, action: PayloadAction<{ user: User }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      tokenManager.remove();
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    clearError: (state) => {
      state.error = null;
    },

    initializeAuth: (state) => {
      state.isAuthenticated = tokenManager.isValid();
      if (!state.isAuthenticated) {
        state.user = null;
        tokenManager.remove();
      }
    },
  },
});

export const {
  setLoading,
  loginSuccess,
  setUserProfile,
  logout,
  setError,
  clearError,
  initializeAuth,
} = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;
