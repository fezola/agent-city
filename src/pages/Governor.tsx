import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { AgentCard } from '@/components/simulation/AgentCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  TrendingUp,
  TrendingDown,
  Coins,
  Percent,
  DollarSign,
  DoorOpen,
  ArrowLeft,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Governor() {
  const {
    worldState,
    agents,
    events,
    memories,
    balanceHistory,
    getAgentsByType,
    getEventsForAgent,
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

  const governor = getAgentsByType('governor')[0];
  const governorEvents = governor ? getEventsForAgent(governor.id) : [];
  const governorMemories = governor ? memories[governor.id] || [] : [];

  // Filter for policy decisions
  const policyEvents = events.filter(e => e.event_type === 'governor_decision');

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
            <Crown className="h-8 w-8 text-amber-500" />
            Governor
          </h1>
          <p className="text-muted-foreground">Policy controls and treasury analytics</p>
        </div>
      </div>

      {/* Governor Agent Card */}
      {governor && (
        <Link to={`/agent/${governor.id}`}>
          <AgentCard
            agent={governor}
            memories={governorMemories}
          />
        </Link>
      )}

      {/* Policy Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Tax Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(worldState.tax_rate * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue from worker earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Salary Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{worldState.salary_rate}</div>
            <p className="text-xs text-muted-foreground">
              Base pay per work action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DoorOpen className="h-4 w-4" />
              Participation Fee
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{worldState.participation_fee}</div>
            <p className="text-xs text-muted-foreground">
              Daily cost to stay in economy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Treasury
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {worldState.treasury_balance.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              City's total funds
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Treasury History Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Treasury History</CardTitle>
            <CardDescription>Balance over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceHistory}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    className="text-xs"
                    tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  />
                  <YAxis
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
                    dataKey="treasury_balance"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                    name="Treasury"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Policy Decision History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Policy Decisions
            </CardTitle>
            <CardDescription>Recent Governor actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {policyEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No policy decisions yet</p>
              ) : (
                policyEvents.slice(0, 10).map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-2 rounded-md bg-muted/30"
                  >
                    <Badge variant="outline" className="shrink-0">
                      Day {event.day}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{event.description}</p>
                      {(event.details as Record<string, unknown>)?.reason && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Reasoning: {String((event.details as Record<string, unknown>).reason)}
                        </p>
                      )}
                    </div>
                    {event.description?.includes('increased') || event.description?.includes('raised') ? (
                      <TrendingUp className="h-4 w-4 text-green-500 shrink-0" />
                    ) : event.description?.includes('decreased') || event.description?.includes('cut') ? (
                      <TrendingDown className="h-4 w-4 text-red-500 shrink-0" />
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Governor Memories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Governor Memories</CardTitle>
          <CardDescription>Past experiences influencing decisions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {governorMemories.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-full">No memories recorded yet</p>
            ) : (
              governorMemories.slice(0, 6).map((memory) => (
                <div
                  key={memory.id}
                  className="p-3 rounded-md border bg-card"
                >
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary">Day {memory.day}</Badge>
                    <span className={`text-xs ${
                      memory.impact === 'positive' ? 'text-green-500' :
                      memory.impact === 'negative' ? 'text-red-500' : 'text-muted-foreground'
                    }`}>
                      {memory.emotion}
                    </span>
                  </div>
                  <p className="text-sm">{memory.event}</p>
                  {memory.details && (
                    <p className="text-xs text-muted-foreground mt-1">{memory.details}</p>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
