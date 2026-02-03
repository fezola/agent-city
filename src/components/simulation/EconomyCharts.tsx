import { useMemo } from 'react';
import { BalanceHistory, Agent } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, Heart, DollarSign, Users } from 'lucide-react';

interface EconomyChartsProps {
  balanceHistory: BalanceHistory[];
  agents: Agent[];
}

export function EconomyCharts({ balanceHistory, agents }: EconomyChartsProps) {
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

  const agentStats = useMemo(() => {
    const alive = agents.filter(a => a.is_alive);
    const workers = alive.filter(a => a.agent_type === 'worker');
    const merchants = alive.filter(a => a.agent_type === 'merchant');
    const expelled = agents.filter(a => !a.is_alive);

    return {
      totalAlive: alive.length,
      workers: workers.length,
      merchants: merchants.length,
      expelled: expelled.length,
      avgWorkerBalance: workers.length > 0 
        ? workers.reduce((sum, w) => sum + w.balance, 0) / workers.length 
        : 0,
      avgMerchantBalance: merchants.length > 0
        ? merchants.reduce((sum, m) => sum + m.balance, 0) / merchants.length
        : 0,
    };
  }, [agents]);

  return (
    <Card className="bg-background/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5" />
          Economy Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `D${v}`}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="treasury"
                    stroke="hsl(142, 76%, 36%)"
                    fill="hsl(142, 76%, 36%)"
                    fillOpacity={0.3}
                    name="Treasury"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 10 }}
                    tickFormatter={(v) => `D${v}`}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="health"
                    stroke="hsl(0, 84%, 60%)"
                    strokeWidth={2}
                    dot={false}
                    name="City Health"
                  />
                  <Line
                    type="monotone"
                    dataKey="satisfaction"
                    stroke="hsl(217, 91%, 60%)"
                    strokeWidth={2}
                    dot={false}
                    name="Satisfaction"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <Users className="h-3 w-3" />
                  Active Agents
                </div>
                <div className="text-2xl font-bold mt-1">{agentStats.totalAlive}</div>
                <div className="text-xs text-muted-foreground">
                  {agentStats.workers}W / {agentStats.merchants}M
                </div>
              </div>

              <div className="bg-red-950/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-red-400/70 text-xs">
                  <Heart className="h-3 w-3" />
                  Expelled
                </div>
                <div className="text-2xl font-bold text-red-400 mt-1">
                  {agentStats.expelled}
                </div>
              </div>

              <div className="bg-blue-950/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-blue-400/70 text-xs">
                  <DollarSign className="h-3 w-3" />
                  Avg Worker $
                </div>
                <div className="text-xl font-bold text-blue-400 mt-1">
                  {agentStats.avgWorkerBalance.toFixed(0)}
                </div>
              </div>

              <div className="bg-purple-950/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-purple-400/70 text-xs">
                  <DollarSign className="h-3 w-3" />
                  Avg Merchant $
                </div>
                <div className="text-xl font-bold text-purple-400 mt-1">
                  {agentStats.avgMerchantBalance.toFixed(0)}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
