'use client';

import { TilgungsplanRow } from '@/lib/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';


interface AmortizationChartProps {
  data: TilgungsplanRow[];
}

function formatEur(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm space-y-1" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
      <p className="font-semibold">Jahr {label}</p>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {payload.map((entry: any) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: {formatEur(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function AmortizationChart({ data }: AmortizationChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((row) => ({
    jahr: row.jahr,
    'Zinsen': Math.round(row.zinsanteil),
    'Tilgung': Math.round(row.tilgungsanteil),
    'Restschuld': Math.round(row.restschuld),
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Tilgungsverlauf</h3>
      </div>
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="jahr"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              label={{ value: 'Jahr', position: 'insideBottom', offset: -2, fontSize: 12 }}
            />
            <YAxis
              tickFormatter={(v) => formatEur(v)}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={90}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Zinsen" stackId="a" fill="#ef4444" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Tilgung" stackId="a" fill="#2563eb" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
