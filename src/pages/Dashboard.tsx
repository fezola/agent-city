import { Link } from 'react-router-dom';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WorldMap } from '@/components/simulation/WorldMap';
import { BuildingsPanel } from '@/components/simulation/BuildingsPanel';
import { NarrativePanel } from '@/components/simulation/NarrativePanel';
import { ChaosPanel } from '@/components/simulation/ChaosPanel';
import { CollapseIndicator } from '@/components/simulation/CollapseIndicator';
import {
  Sparkles,
  Loader2,
  Crown,
  Hammer,
  ShoppingCart,
  Coins,
  Heart,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  AlertTriangle,
  Zap,
  BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const {
    worldState,
    agents,
    events,
    isProcessing,
    initializeWorld,
    getAgentsByType,
    getAliveAgents,
    chaosEvents,
    narratives,
    collapseEvaluations,
    buildings,
  } = useSimulationContext();

  // No world exists yet - show welcome screen
  if (!worldState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Agent Economy
            </h1>
            <p className="text-xl text-muted-foreground">
              Autonomous agents competing to survive
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 text-left space-y-4">
            <h2 className="font-semibold text-lg">How it works:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <Crown className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <span>A <strong>Governor</strong> sets economic policy (taxes, salaries, fees)</span>
              </li>
              <li className="flex gap-2">
                <Hammer className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                <span><strong>Workers</strong> earn wages, pay fees, and can wager on outcomes</span>
              </li>
              <li className="flex gap-2">
                <ShoppingCart className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                <span><strong>Merchants</strong> adjust prices based on market conditions</span>
              </li>
              <li className="flex gap-2">
                <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <span>Agents who can't pay fees are <strong>expelled</strong> from the economy</span>
              </li>
            </ul>
          </div>

          <Button
            size="lg"
            onClick={initializeWorld}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating World...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Start Simulation
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const governor = getAgentsByType('governor')[0];
  const workers = getAgentsByType('worker');
  const merchants = getAgentsByType('merchant');
  const aliveAgents = getAliveAgents();
  const recentEvents = events.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your Agent Economy simulation</p>
      </div>

      {/* Collapse Warning */}
      {collapseEvaluations.length > 0 && collapseEvaluations[0]?.status !== 'stable' && (
        <CollapseIndicator evaluations={collapseEvaluations} compact />
      )}

      {/* Legacy Collapsed Warning */}
      {worldState.is_collapsed && collapseEvaluations.length === 0 && (
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-destructive">Economy Collapsed</h3>
            <p className="text-sm text-muted-foreground">The simulation has ended. Reset to start a new world.</p>
          </div>
        </div>
      )}

      {/* Latest Narrative */}
      {narratives.length > 0 && (
        <NarrativePanel narratives={narratives} compact />
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Current Day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{worldState.day}</div>
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
            <div className={cn(
              "text-3xl font-bold",
              worldState.treasury_balance < 3000 && "text-red-500"
            )}>
              {worldState.treasury_balance.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              City Health
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-3xl font-bold",
              worldState.city_health < 50 && "text-red-500",
              worldState.city_health >= 70 && "text-green-500"
            )}>
              {worldState.city_health}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Agents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {aliveAgents.length}
              <span className="text-sm text-muted-foreground font-normal">/{agents.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agent Summary Cards */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold">Agent Overview</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Governor Card */}
            <Link to="/governor">
              <Card className="hover:border-amber-500/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Crown className="h-4 w-4 text-amber-500" />
                    Governor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    {governor?.name || 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Tax: {(worldState.tax_rate * 100).toFixed(0)}% | Salary: {worldState.salary_rate}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    View details <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Workers Card */}
            <Link to="/workers">
              <Card className="hover:border-blue-500/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Hammer className="h-4 w-4 text-blue-500" />
                    Workers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workers.filter(w => w.is_alive).length}
                    <span className="text-sm text-muted-foreground font-normal">/{workers.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Satisfaction: {worldState.worker_satisfaction}%
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    View all <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Merchants Card */}
            <Link to="/merchants">
              <Card className="hover:border-green-500/50 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ShoppingCart className="h-4 w-4 text-green-500" />
                    Merchants
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {merchants.filter(m => m.is_alive).length}
                    <span className="text-sm text-muted-foreground font-normal">/{merchants.length}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Stability: {worldState.merchant_stability}%
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                    View all <ArrowRight className="h-3 w-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Recent Activity</CardTitle>
                <Link to="/history" className="text-xs text-primary hover:underline flex items-center gap-1">
                  View all <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {recentEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events yet</p>
              ) : (
                <div className="space-y-2">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-2 text-sm border-l-2 border-muted pl-3 py-1"
                    >
                      <span className="text-muted-foreground shrink-0">Day {event.day}</span>
                      <span className="text-muted-foreground">|</span>
                      <span>{event.description}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Map & Chaos */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">World Map</h2>
          <WorldMap agents={agents} worldState={worldState} buildings={buildings} />

          {/* Buildings */}
          {buildings.length > 0 && (
            <BuildingsPanel 
              buildings={buildings} 
              agents={agents} 
              currentDay={worldState.day} 
            />
          )}

          {/* Chaos Events */}
          {chaosEvents.length > 0 && (
            <ChaosPanel chaosEvents={chaosEvents} compact />
          )}

          <Link to="/simulation" className="block">
            <Button variant="outline" className="w-full gap-2">
              <TrendingUp className="h-4 w-4" />
              Go to Live Simulation
            </Button>
          </Link>

          {narratives.length > 0 && (
            <Link to="/story" className="block">
              <Button variant="ghost" className="w-full gap-2">
                <BookOpen className="h-4 w-4" />
                View Full Story
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
