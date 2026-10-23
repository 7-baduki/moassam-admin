import { User, UserStatistics } from '@/types/user.type';
import { getDaysPeriod } from './period';
import { formatDate } from './formatDate';

const RECENT_USER_COUNT = 5;

function countSignupsBetween(signupDates: string[], startDate?: string, endDate?: string) {
  return signupDates.filter(
    (date) => (!startDate || date >= startDate) && (!endDate || date <= endDate),
  ).length;
}

// 회원 목록(최신순)을 집계 API 응답과 같은 모양으로 변환합니다.
export function getUserStatistics(users: User[], days: number): UserStatistics {
  const signupDates = users.map((user) => user.createdAt.slice(0, 10));
  const recent = getDaysPeriod(days);
  const previous = getDaysPeriod(days, days);

  const providerCounts = new Map<string, number>();
  users.forEach(({ provider }) => {
    providerCounts.set(provider, (providerCounts.get(provider) ?? 0) + 1);
  });

  const dailySignups = Array.from({ length: days }, (_, index) => {
    const day = new Date();
    day.setDate(day.getDate() - (days - 1 - index));
    const date = formatDate(day);
    return {
      date,
      count: countSignupsBetween(signupDates, date, date),
      cumulativeCount: countSignupsBetween(signupDates, undefined, date),
    };
  });

  return {
    totalUserCount: users.length,
    withdrawnUserCount: users.filter((user) => user.status === 'WITHDRAWN').length,
    recentSignupCount: countSignupsBetween(signupDates, recent.startDate, recent.endDate),
    previousSignupCount: countSignupsBetween(signupDates, previous.startDate, previous.endDate),
    providerCounts: [...providerCounts]
      .map(([provider, count]) => ({ provider, count }))
      .sort((a, b) => b.count - a.count),
    dailySignups,
    recentUsers: users.slice(0, RECENT_USER_COUNT),
  };
}
