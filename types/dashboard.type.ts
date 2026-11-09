import { PostCategory } from './post.type';

export type DashboardPeriodDays = 7 | 30 | 90;

export type AvailabilityStatus = 'AVAILABLE' | 'PARTIAL' | 'COLLECTING';

export interface DashboardParams {
  periodDays?: DashboardPeriodDays;
}

export interface Availability {
  status: AvailabilityStatus;
  coveredFrom: string | null;
  coveredTo: string | null;
  degraded: boolean;
}

export interface DashboardPeriod {
  startInclusive: string;
  endExclusive: string;
}

export interface DailyActiveUsers {
  date: string;
  count: number | null;
}

export interface FeatureUsageShare {
  count: number;
  percent: number | null;
}

export interface DashboardRecentPost {
  postId: number;
  category: PostCategory;
  title: string;
  commentCount: number;
  createdAt: string;
}

export interface DashboardResponse {
  asOf: string;
  todayStart: string;
  periodDays: DashboardPeriodDays;
  currentPeriod: DashboardPeriod;
  comparisonPeriod: DashboardPeriod;
  today: {
    signups: number;
    activeUsers: number;
    observationsCreated: number;
  };
  cards: {
    signups: number;
    signupChangePercent: number | null;
    observationWritingRatePercent: number | null;
    observationWritingEligibleUsers: number;
    withdrawals: number;
    unusedWithdrawals: number;
    lifecycleAvailability: Availability;
  };
  dau: {
    current: DailyActiveUsers[];
    comparison: DailyActiveUsers[];
    uniqueActiveUsers: number;
    sevenDayRevisitRatePercent: number | null;
    availability: Availability;
  };
  featureUsage: {
    observationOnly: FeatureUsageShare;
    observationAndCommunity: FeatureUsageShare;
    communityOnly: FeatureUsageShare;
    browseOnly: FeatureUsageShare;
    availability: Availability;
  };
  regeneration: {
    created: number;
    regenerated: number;
    ratePercent: number | null;
    warning: {
      yesterdayRatePercent: number | null;
      previousSevenDayRatePercent: number | null;
      warning: boolean;
    };
    availability: Availability;
  };
  aiUsage: {
    calls: number;
    successes: number;
    failures: number;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    averageDurationMs: number | null;
    availability: Availability;
  };
  recentPosts: DashboardRecentPost[];
  dataQuality: {
    degraded: boolean;
  };
}
