import api from './api';
import { LoginRequest, LoginResponse } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/api/auth/login', credentials);
    const data = response.data;
    
    localStorage.setItem('token', data.token);
    localStorage.setItem('tokenExpiration', data.expiration);
    
    return data;
  },

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (!token || !expiration) {
      return false;
    }
    
    return new Date(expiration) > new Date();
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  }
};
