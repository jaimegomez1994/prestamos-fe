import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAppDispatch } from '../store/hooks';
import { loginSuccess, setUserProfile, setError, logout } from '../store/slices/authSlice';
import type { LoginRequest, AuthResponse, User } from '../types/auth';

const authApi = {
  login: (data: LoginRequest): Promise<AuthResponse> =>
    apiClient.post('/auth/login', data),

  getProfile: (): Promise<{ user: User }> =>
    apiClient.get('/auth/me'),
};

export const useLogin = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      dispatch(loginSuccess(data));
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error: Error) => {
      dispatch(setError(error.message));
    },
  });
};

export const useProfile = () => {
  const dispatch = useAppDispatch();

  return useQuery({
    queryKey: ['profile'],
    queryFn: authApi.getProfile,
    retry: false,
  });
};

export const useLogout = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => Promise.resolve(),
    onSuccess: () => {
      dispatch(logout());
      queryClient.clear();
    },
  });
};
