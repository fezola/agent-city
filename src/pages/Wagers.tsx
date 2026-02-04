import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dices,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Clock,
  Coins,
  Target,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Wagers() {
  const [filter, setFilter] = useState<'pending' | 'won' | 'lost' | 'all'>('all');
  const {
    worldState,
    wagers,
    agents,
    getAgent,
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

  // Get all wagers (pending ones are in state, we need to track resolved ones)
  const pendingWagers = wagers.filter(w => !w.resolved);
  const resolvedWagers = wagers.filter(w => w.resolved);
  const wonWagers = resolvedWagers.filter(w => w.won);
  const lostWagers = resolvedWagers.filter(w => !w.won);

  const filteredWagers = filter === 'all' ? wagers :
    filter === 'pending' ? pendingWagers :
    filter === 'won' ? wonWagers : lostWagers;

  // Calculate stats
  const totalWagered = wagers.reduce((sum, w) => sum + w.amount, 0);
  const totalWon = wonWagers.reduce((sum, w) => sum + (w.payout || 0), 0);
  const totalLost = lostWagers.reduce((sum, w) => sum + w.amount, 0);
  const winRate = resolvedWagers.length > 0
    ? (wonWagers.length / resolvedWagers.length * 100).toFixed(0)
    : 0;

  const predictionTypeLabels: Record<string, string> = {
    'tax_up': 'Tax Increase',
    'tax_down': 'Tax Decrease',
    'salary_up': 'Salary Increase',
    'salary_down': 'Salary Decrease',
    'collapse': 'Economy Collapse',
    'stability': 'Economy Stability',
  };

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
            <Dices className="h-8 w-8 text-purple-500" />
            Wagers
          </h1>
          <p className="text-muted-foreground">
            Track predictions and outcomes
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Total Wagered
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalWagered.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Total Won
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{totalWon.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" />
              Total Lost
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{totalLost.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Win Rate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{winRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Wagers List */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              All ({wagers.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              Pending ({pendingWagers.length})
            </TabsTrigger>
            <TabsTrigger value="won" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Won ({wonWagers.length})
            </TabsTrigger>
            <TabsTrigger value="lost" className="gap-2">
              <XCircle className="h-4 w-4" />
              Lost ({lostWagers.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={filter} className="mt-0">
          {filteredWagers.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Dices className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No Wagers</h3>
                <p className="text-sm text-muted-foreground">
                  {filter === 'pending'
                    ? "No pending wagers at the moment"
                    : filter === 'won'
                    ? "No won wagers yet"
                    : filter === 'lost'
                    ? "No lost wagers yet"
                    : "Workers haven't placed any wagers yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWagers.map((wager) => {
                const agent = getAgent(wager.agent_id);
                return (
                  <Card
                    key={wager.id}
                    className={cn(
                      wager.resolved && wager.won && "border-green-500/50",
                      wager.resolved && !wager.won && "border-red-500/50"
                    )}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          {agent ? (
                            <Link
                              to={`/agent/${agent.id}`}
                              className="hover:underline"
                            >
                              {agent.name}
                            </Link>
                          ) : 'Unknown Agent'}
                        </CardTitle>
                        {wager.resolved ? (
                          wager.won ? (
                            <Badge className="bg-green-500">Won</Badge>
                          ) : (
                            <Badge variant="destructive">Lost</Badge>
                          )
                        ) : (
                          <Badge variant="secondary">Pending</Badge>
                        )}
                      </div>
                      <CardDescription>
                        Placed on Day {wager.day_placed}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Prediction:</span>
                          <Badge variant="outline">
                            {predictionTypeLabels[wager.prediction] || wager.prediction}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <span className="font-medium">{wager.amount}</span>
                        </div>
                        {wager.resolved && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Payout:</span>
                            <span className={cn(
                              "font-medium",
                              wager.won ? "text-green-500" : "text-red-500"
                            )}>
                              {wager.won ? `+${wager.payout}` : `-${wager.amount}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Prediction Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prediction Type Stats</CardTitle>
          <CardDescription>Win rate by prediction type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(predictionTypeLabels).map(([key, label]) => {
              const typeWagers = wagers.filter(w => w.prediction === key);
              const typeWon = typeWagers.filter(w => w.resolved && w.won).length;
              const typeResolved = typeWagers.filter(w => w.resolved).length;
              const typeWinRate = typeResolved > 0
                ? (typeWon / typeResolved * 100).toFixed(0)
                : '-';

              return (
                <div
                  key={key}
                  className="p-3 rounded-md border bg-muted/30"
                >
                  <div className="text-sm font-medium">{label}</div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      {typeWagers.length} total
                    </span>
                    <span className="text-sm font-bold">
                      {typeWinRate === '-' ? '-' : `${typeWinRate}%`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
