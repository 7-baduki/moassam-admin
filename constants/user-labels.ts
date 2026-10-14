import { UserStatus } from '@/types/user.type';

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  ACTIVE: '정상',
  WITHDRAWN: '탈퇴',
};

export const USER_PROVIDER_LABELS: Record<string, string> = {
  KAKAO: '카카오',
  NAVER: '네이버',
};

export const USER_PROVIDER_COLORS: Record<string, string> = {
  KAKAO: '#FEE500',
  NAVER: '#03C75A',
};
