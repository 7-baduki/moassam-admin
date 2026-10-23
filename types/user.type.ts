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

export interface DailySignup {
  date: string;
  count: number;
  cumulativeCount: number;
}

export interface UserStatistics {
  totalUserCount: number;
  withdrawnUserCount: number;
  recentSignupCount: number;
  previousSignupCount: number;
  providerCounts: { provider: string; count: number }[];
  dailySignups: DailySignup[];
  recentUsers: User[];
}
