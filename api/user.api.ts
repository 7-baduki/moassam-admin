import apiClient from './axios';
import { User, UsersParams, UsersResponse } from '@/types/user.type';

export const getUsers = async (params: UsersParams): Promise<UsersResponse> => {
  const response = await apiClient.get<{ data: UsersResponse }>('/api/v1/admin/users', {
    params,
  });
  return response.data.data;
};

const MAX_PAGE_SIZE = 100;

export const getAllUsers = async (): Promise<User[]> => {
  const firstPage = await getUsers({ page: 0, size: MAX_PAGE_SIZE });
  const restPages = await Promise.all(
    Array.from({ length: Math.max(firstPage.users.totalPages - 1, 0) }, (_, index) =>
      getUsers({ page: index + 1, size: MAX_PAGE_SIZE }),
    ),
  );
  return [firstPage, ...restPages].flatMap((response) => response.users.data);
};
