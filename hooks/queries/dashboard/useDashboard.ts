import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getDashboard } from '@/api/dashboard.api';
import { DashboardParams } from '@/types/dashboard.type';

export const DASHBOARD_QUERY_KEY = 'dashboard';

export function useDashboardQuery(params: DashboardParams) {
  return useQuery({
    queryKey: [DASHBOARD_QUERY_KEY, params],
    queryFn: () => getDashboard(params),
    placeholderData: keepPreviousData,
  });
}
