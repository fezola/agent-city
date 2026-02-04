import { useMemo } from 'react';
import { BalanceHistory, Agent } from '@/types/simulation';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';

interface EconomyChartProps {
  balanceHistory: BalanceHistory[];
  agents: Agent[];
}

export function EconomyChart({ balanceHistory, agents }: EconomyChartProps) {
  const chartData = useMemo(() => {
    const byDay = new Map<number, Record<string, number>>();

    balanceHistory.forEach((h) => {
      if (!byDay.has(h.day)) {
        byDay.set(h.day, { day: h.day });
      }
      const dayData = byDay.get(h.day)!;

      if (h.treasury_balance !== undefined) {
        dayData.treasury = h.treasury_balance;
      }
      if (h.worker_satisfaction !== undefined) {
        dayData.satisfaction = h.worker_satisfaction;
      }
      if (h.city_health !== undefined) {
        dayData.health = h.city_health;
      }
    });

    return Array.from(byDay.values()).sort((a, b) => a.day - b.day);
  }, [balanceHistory]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-8 border-b bg-background shrink-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Economy
        </span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[9px] text-muted-foreground">Treasury</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-foreground/70" />
            <span className="text-[9px] text-muted-foreground">Health</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-0.5 bg-muted-foreground/50" />
            <span className="text-[9px] text-muted-foreground">Satisfaction</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 p-2">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                strokeOpacity={0.5}
              />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                tickFormatter={(v) => `${v}`}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                  fontSize: '11px',
                  padding: '6px 10px',
                }}
                labelFormatter={(v) => `Day ${v}`}
              />
              <Area
                type="monotone"
                dataKey="treasury"
                stroke="#34d399"
                fill="#34d399"
                fillOpacity={0.15}
                strokeWidth={1.5}
                name="Treasury"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="health"
                stroke="hsl(var(--foreground))"
                strokeWidth={1}
                strokeDasharray="4 3"
                strokeOpacity={0.7}
                dot={false}
                name="Health %"
              />
              <Line
                type="monotone"
                dataKey="satisfaction"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth={1}
                strokeDasharray="4 3"
                strokeOpacity={0.5}
                dot={false}
                name="Satisfaction %"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
