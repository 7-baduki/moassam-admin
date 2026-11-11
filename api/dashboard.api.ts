import apiClient from './axios';
import { DashboardParams, DashboardResponse } from '@/types/dashboard.type';

export const getDashboard = async (params: DashboardParams): Promise<DashboardResponse> => {
  const response = await apiClient.get<{ data: DashboardResponse }>('/api/v1/admin/dashboard', {
    params,
  });
  return response.data.data;
};
