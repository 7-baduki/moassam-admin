import apiClient from './axios';
import { UsersParams, UsersResponse } from '@/types/user.type';

export const getUsers = async (params: UsersParams): Promise<UsersResponse> => {
  const response = await apiClient.get<{ data: UsersResponse }>('/api/v1/admin/users', {
    params,
  });
  return response.data.data;
};
