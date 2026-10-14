export type UserStatus = 'ACTIVE' | 'WITHDRAWN';

export interface UsersParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  size?: number;
}

export interface User {
  userId: number;
  nickname: string;
  provider: string;
  role: string;
  createdAt: string;
  status: UserStatus;
}

export interface UsersResponse {
  totalUserCount: number;
  periodUserCount: number;
  users: {
    data: User[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
  };
}
