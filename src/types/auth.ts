export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'operator' | 'collector' | 'customer';
  phone: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}
