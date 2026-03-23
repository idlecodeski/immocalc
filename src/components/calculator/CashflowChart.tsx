'use client';

import { CashflowRow } from '@/lib/types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';

interface CashflowChartProps {
  data: CashflowRow[];
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

export default function CashflowChart({ data }: CashflowChartProps) {
  if (!data || data.length === 0) return null;

  const chartData = data.map((row) => ({
    jahr: row.jahr,
    'Monatl. Cashflow': Math.round(row.cashflow),
    'Kumulierter Cashflow': Math.round(row.kumulierterCashflow),
  }));

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Cashflow-Entwicklung</h3>
      </div>
      <div className="px-5 py-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
            <ReferenceLine y={0} stroke="#888" strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="Monatl. Cashflow"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Kumulierter Cashflow"
              stroke="#16a34a"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
