interface RatioBarItem {
  key: string;
  label: string;
  count: number;
  color: string;
}

interface RatioBarProps {
  items: RatioBarItem[];
  unit?: string;
}

export default function RatioBar({ items, unit = '개' }: RatioBarProps) {
  const total = items.reduce((sum, { count }) => sum + count, 0);

  if (total === 0) {
    return <p className="py-6 text-center text-sm text-gray-400">표시할 데이터가 없습니다.</p>;
  }

  const rows = items.map((item) => ({ ...item, percent: (item.count / total) * 100 }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex h-3 gap-0.5 overflow-hidden rounded-full">
        {rows.map(({ key, color, percent }) => (
          <div key={key} style={{ width: `${percent}%`, background: color }} />
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map(({ key, label, color, count, percent }) => (
          <li key={key} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
            <span className="text-gray-700">{label}</span>
            <span className="ml-auto font-semibold text-gray-900 tabular-nums">
              {percent.toFixed(1)}%
            </span>
            <span className="w-16 text-right text-gray-400 tabular-nums">
              {count.toLocaleString()}
              {unit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
