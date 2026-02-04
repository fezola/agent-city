import { useParams, Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Crown,
  Hammer,
  ShoppingCart,
  Coins,
  Brain,
  History,
  TrendingUp,
  Heart,
  AlertTriangle
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
import { cn } from '@/lib/utils';

const moodEmoji: Record<string, string> = {
  ecstatic: '🤩',
  happy: '😊',
  neutral: '😐',
  frustrated: '😤',
  desperate: '😰',
};

const agentTypeIcon = {
  governor: Crown,
  worker: Hammer,
  merchant: ShoppingCart,
};

const agentTypeColor = {
  governor: 'text-amber-500',
  worker: 'text-blue-500',
  merchant: 'text-green-500',
};

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const {
    worldState,
    agents,
    memories,
    events,
    balanceHistory,
    getAgent,
    getEventsForAgent,
    getMemoriesForAgent,
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

  const agent = id ? getAgent(id) : undefined;

  if (!agent) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Agent Not Found</h1>
            <p className="text-muted-foreground">This agent doesn't exist</p>
          </div>
        </div>
      </div>
    );
  }

  const agentMemories = getMemoriesForAgent(agent.id);
  const agentEvents = getEventsForAgent(agent.id);
  const Icon = agentTypeIcon[agent.agent_type];

  // Get back link based on agent type
  const backLink = agent.agent_type === 'governor' ? '/governor' :
    agent.agent_type === 'worker' ? '/workers' : '/merchants';

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to={backLink}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full",
            agent.is_alive ? "bg-primary/10" : "bg-muted"
          )}>
            <Icon className={cn("h-6 w-6", agentTypeColor[agent.agent_type])} />
          </div>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              {agent.name}
              {!agent.is_alive && (
                <Badge variant="destructive">Expelled</Badge>
              )}
            </h1>
            <p className="text-muted-foreground capitalize">{agent.agent_type}</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Balance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              agent.balance < 100 && "text-red-500"
            )}>
              {agent.balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Mood
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold flex items-center gap-2">
              {moodEmoji[agent.mood] || '😐'}
              <span className="text-lg capitalize">{agent.mood}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Confidence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((agent.confidence || 0) * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Last Action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium capitalize">
              {agent.last_action || 'None'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Action Reasoning */}
      {agent.last_action_reason && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Decision Reasoning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{agent.last_action_reason}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Memories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Memories ({agentMemories.length})
            </CardTitle>
            <CardDescription>Past experiences influencing decisions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {agentMemories.length === 0 ? (
                <p className="text-sm text-muted-foreground">No memories recorded yet</p>
              ) : (
                agentMemories.map((memory) => (
                  <div
                    key={memory.id}
                    className={cn(
                      "p-3 rounded-md border",
                      memory.impact === 'positive' && "border-green-500/30 bg-green-500/5",
                      memory.impact === 'negative' && "border-red-500/30 bg-red-500/5",
                      memory.impact === 'neutral' && "border-muted"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="secondary">Day {memory.day}</Badge>
                      <span className={cn(
                        "text-xs capitalize",
                        memory.impact === 'positive' && "text-green-500",
                        memory.impact === 'negative' && "text-red-500"
                      )}>
                        {memory.emotion}
                      </span>
                    </div>
                    <p className="text-sm font-medium">{memory.event}</p>
                    {memory.details && (
                      <p className="text-xs text-muted-foreground mt-1">{memory.details}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4" />
              Event History ({agentEvents.length})
            </CardTitle>
            <CardDescription>All events involving this agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {agentEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events recorded yet</p>
              ) : (
                agentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-2 rounded-md bg-muted/30"
                  >
                    <Badge variant="outline" className="shrink-0">
                      Day {event.day}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{event.description}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {event.event_type.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Merchant-specific: Price Modifier */}
      {agent.agent_type === 'merchant' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Price Modifier</CardTitle>
            <CardDescription>Current pricing strategy</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">
                {((agent.current_price_modifier || 1) * 100).toFixed(0)}%
              </div>
              <div className="text-sm text-muted-foreground">
                {(agent.current_price_modifier || 1) > 1
                  ? "Prices are elevated above baseline"
                  : (agent.current_price_modifier || 1) < 1
                    ? "Prices are discounted below baseline"
                    : "Prices at baseline level"}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Agent Status */}
      {!agent.is_alive && (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Agent Expelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This agent has been expelled from the economy due to insufficient funds to pay participation fees.
              They can no longer participate in the simulation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
