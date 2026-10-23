import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getAllUsers, getUsers } from '@/api/user.api';
import { UsersParams } from '@/types/user.type';
import { getUserStatistics } from '@/utils/userStatistics';

export const USERS_QUERY_KEY = 'users';

export function useUsersQuery(params: UsersParams) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });
}

// 집계 API가 생기면 queryFn만 교체합니다.
export function useUserStatisticsQuery(days: number) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, 'all'],
    queryFn: getAllUsers,
    select: (users) => getUserStatistics(users, days),
  });
}
