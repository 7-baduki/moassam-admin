import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getUsers } from '@/api/user.api';
import { UsersParams } from '@/types/user.type';

export const USERS_QUERY_KEY = 'users';

export function useUsersQuery(params: UsersParams) {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
  });
}
