'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DailyActiveUsers } from '@/types/dashboard.type';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const WEEK_LENGTH = 7;
const DAILY_MAX_DAYS = 31;
const PRIMARY = 'var(--color-primary-600)';

interface DauPoint {
  label: string;
  tooltipLabel: string;
  count: number | null;
  comparisonCount: number | null;
}

interface DauChartProps {
  current: DailyActiveUsers[];
  comparison: DailyActiveUsers[];
}

interface DauTooltipProps {
  active?: boolean;
  payload?: { payload: DauPoint }[];
}

function formatAxisDate(date: string) {
  return date.slice(5).replace('-', '.');
}

function formatTooltipDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${formatAxisDate(date)} (${weekday})`;
}

function averageCount(days: DailyActiveUsers[]) {
  const counts = days.flatMap(({ count }) => (count === null ? [] : [count]));
  if (counts.length === 0) return null;
  return Math.round(counts.reduce((sum, count) => sum + count, 0) / counts.length);
}

function toDailyPoints(current: DailyActiveUsers[], comparison: DailyActiveUsers[]): DauPoint[] {
  return current.map(({ date, count }, index) => ({
    label: formatAxisDate(date),
    tooltipLabel: formatTooltipDate(date),
    count,
    comparisonCount: comparison[index]?.count ?? null,
  }));
}

// 어제부터 거꾸로 7일씩 묶어 주 평균을 냅니다. 가장 오래된 주는 7일보다 짧을 수 있습니다.
function toWeeklyPoints(current: DailyActiveUsers[], comparison: DailyActiveUsers[]): DauPoint[] {
  const points: DauPoint[] = [];
  for (let end = current.length; end > 0; end -= WEEK_LENGTH) {
    const start = Math.max(0, end - WEEK_LENGTH);
    const week = current.slice(start, end);
    const from = formatAxisDate(week[0].date);
    points.unshift({
      label: from,
      tooltipLabel: `${from} ~ ${formatAxisDate(week[week.length - 1].date)} 평균`,
      count: averageCount(week),
      comparisonCount: averageCount(comparison.slice(start, end)),
    });
  }
  return points;
}

function DauTooltip({ active, payload }: DauTooltipProps) {
  if (!active || !payload?.length) return null;
  const { tooltipLabel, count, comparisonCount } = payload[0].payload;
  const format = (value: number | null) =>
    value === null ? '수집 전' : `${value.toLocaleString()}명`;

  return (
    <div className="min-w-36 rounded-xl bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
      <p className="text-gray-400">{tooltipLabel}</p>
      <p className="mt-1 flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary-400" />
        <span className="text-gray-300">활성 사용자</span>
        <span className="ml-auto pl-4 font-semibold tabular-nums">{format(count)}</span>
      </p>
      <p className="mt-1 flex items-center gap-1.5">
        <span className="w-2.5 border-t-2 border-dashed border-gray-500" />
        <span className="text-gray-300">이전 기간</span>
        <span className="ml-auto pl-4 font-semibold tabular-nums">{format(comparisonCount)}</span>
      </p>
    </div>
  );
}

export default function DauChart({ current, comparison }: DauChartProps) {
  const data =
    current.length > DAILY_MAX_DAYS
      ? toWeeklyPoints(current, comparison)
      : toDailyPoints(current, comparison);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="dauFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.22} />
            <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="var(--color-gray-100)" strokeDasharray="3 3" />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }}
          interval="preserveStartEnd"
          minTickGap={40}
          dy={6}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }}
        />
        <Tooltip
          content={<DauTooltip />}
          cursor={{ stroke: 'var(--color-gray-300)', strokeDasharray: '3 3' }}
          isAnimationActive={false}
        />
        <Line
          dataKey="comparisonCount"
          stroke="var(--color-gray-300)"
          strokeWidth={1.5}
          strokeDasharray="4 4"
          dot={false}
          activeDot={false}
          isAnimationActive={false}
        />
        <Area
          dataKey="count"
          stroke={PRIMARY}
          strokeWidth={2.5}
          fill="url(#dauFill)"
          dot={false}
          activeDot={{ r: 5, stroke: 'white', strokeWidth: 2, fill: PRIMARY }}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
