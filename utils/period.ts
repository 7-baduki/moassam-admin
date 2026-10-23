import { Period } from '@/types/period.type';
import { formatDate } from './formatDate';

export function getDaysPeriod(days: number, offsetDays = 0): Period {
  const end = new Date();
  end.setDate(end.getDate() - offsetDays);
  const start = new Date(end);
  start.setDate(end.getDate() - (days - 1));
  return { startDate: formatDate(start), endDate: formatDate(end) };
}
