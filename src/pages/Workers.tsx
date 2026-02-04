import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { AgentCard } from '@/components/simulation/AgentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Hammer,
  ArrowLeft,
  Users,
  Smile,
  TrendingUp,
  Coins,
  Filter,
  UserX
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Workers() {
  const [filter, setFilter] = useState<'all' | 'alive' | 'expelled'>('all');
  const {
    worldState,
    agents,
    memories,
    balanceHistory,
    getAgentsByType,
  } = useSimulationContext();

  if (!worldState) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">No simulation running</p>
        <Link to="/">
          <Button variant="link" className="p-0 mt-2">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  const allWorkers = getAgentsByType('worker');
  const aliveWorkers = allWorkers.filter(w => w.is_alive);
  const expelledWorkers = allWorkers.filter(w => !w.is_alive);

  const filteredWorkers = filter === 'all' ? allWorkers :
    filter === 'alive' ? aliveWorkers : expelledWorkers;

  // Calculate aggregate stats
  const avgBalance = aliveWorkers.length > 0
    ? aliveWorkers.reduce((sum, w) => sum + w.balance, 0) / aliveWorkers.length
    : 0;

  const avgConfidence = aliveWorkers.length > 0
    ? aliveWorkers.reduce((sum, w) => sum + (w.confidence || 0), 0) / aliveWorkers.length
    : 0;

  // Sort workers by balance
  const sortedWorkers = [...filteredWorkers].sort((a, b) => b.balance - a.balance);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Hammer className="h-8 w-8 text-blue-500" />
            Workers
          </h1>
          <p className="text-muted-foreground">
            {aliveWorkers.length} active, {expelledWorkers.length} expelled
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Workers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {aliveWorkers.length}
              <span className="text-sm text-muted-foreground font-normal">/{allWorkers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Smile className="h-4 w-4" />
              Satisfaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{worldState.worker_satisfaction}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Avg Balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgBalance.toFixed(0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(avgConfidence * 100).toFixed(0)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Satisfaction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Worker Satisfaction Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={balanceHistory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="day"
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  domain={[0, 100]}
                  className="text-xs"
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="worker_satisfaction"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Satisfaction"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs and Worker Grid */}
      <div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="all" className="gap-2">
                <Users className="h-4 w-4" />
                All ({allWorkers.length})
              </TabsTrigger>
              <TabsTrigger value="alive" className="gap-2">
                <Hammer className="h-4 w-4" />
                Active ({aliveWorkers.length})
              </TabsTrigger>
              <TabsTrigger value="expelled" className="gap-2">
                <UserX className="h-4 w-4" />
                Expelled ({expelledWorkers.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value={filter} className="mt-0">
            {sortedWorkers.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No workers in this category
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedWorkers.map((worker, index) => (
                  <Link key={worker.id} to={`/agent/${worker.id}`}>
                    <div className="relative">
                      {filter === 'all' && worker.is_alive && (
                        <Badge
                          className="absolute -top-2 -right-2 z-10"
                          variant={index === 0 ? "default" : "secondary"}
                        >
                          #{index + 1}
                        </Badge>
                      )}
                      <AgentCard
                        agent={worker}
                        memories={memories[worker.id]}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
