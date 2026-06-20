import apiClient from './axios';
import { LoginRequest } from '@/types/auth.type';

export const login = async (request: LoginRequest): Promise<void> => {
  await apiClient.post('/api/v1/admin/auth/login', request);
};

export const logout = async (): Promise<void> => {
  await apiClient.post('/api/v1/admin/auth/logout');
};
