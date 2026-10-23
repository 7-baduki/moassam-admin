'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { DailySignup } from '@/types/user.type';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface SignupChartProps {
  data: DailySignup[];
}

interface SignupTooltipProps {
  active?: boolean;
  payload?: { payload: DailySignup }[];
}

function formatAxisDate(date: string) {
  return date.slice(5).replace('-', '.');
}

function formatTooltipDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const weekday = WEEKDAYS[new Date(year, month - 1, day).getDay()];
  return `${formatAxisDate(date)} (${weekday})`;
}

function SignupTooltip({ active, payload }: SignupTooltipProps) {
  if (!active || !payload?.length) return null;
  const { date, count, cumulativeCount } = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-500">{formatTooltipDate(date)}</p>
      <p className="mt-1 flex items-center gap-1.5 font-semibold text-gray-900">
        <span className="h-2 w-2 rounded-sm bg-primary-600" />
        가입 {count.toLocaleString()}명
      </p>
      <p className="mt-0.5 pl-3.5 text-gray-500">누적 {cumulativeCount.toLocaleString()}명</p>
    </div>
  );
}

export default function SignupChart({ data }: SignupChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 8, right: 0, bottom: 0, left: -24 }}>
        <CartesianGrid vertical={false} stroke="var(--color-gray-100)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          tickLine={false}
          axisLine={{ stroke: 'var(--color-gray-200)' }}
          tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }}
          interval="preserveStartEnd"
          minTickGap={24}
        />
        <YAxis
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fill: 'var(--color-gray-400)' }}
        />
        <Tooltip
          content={<SignupTooltip />}
          cursor={{ fill: 'var(--color-gray-100)' }}
          isAnimationActive={false}
        />
        <Bar
          dataKey="count"
          fill="var(--color-primary-600)"
          radius={[4, 4, 0, 0]}
          maxBarSize={16}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
