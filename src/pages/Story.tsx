import { useSimulationContext } from '@/contexts/SimulationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { NarrativePanel } from '@/components/simulation/NarrativePanel';
import { ChaosPanel } from '@/components/simulation/ChaosPanel';
import { EmergencePanel } from '@/components/simulation/EmergencePanel';
import { CollapseIndicator } from '@/components/simulation/CollapseIndicator';
import { BookOpen, Zap, Lightbulb, AlertTriangle, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Story() {
  const {
    worldState,
    narratives,
    chaosEvents,
    emergenceLogs,
    collapseEvaluations,
  } = useSimulationContext();

  if (!worldState) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground" />
          <h2 className="text-2xl font-bold">No Story Yet</h2>
          <p className="text-muted-foreground">Start a simulation to see the narrative unfold</p>
        </div>
      </div>
    );
  }

  const sortedNarratives = [...narratives].sort((a, b) => b.day - a.day);
  const activeChaosEvents = chaosEvents.filter(e => e.event_type !== 'no_event');
  const detectedEmergence = emergenceLogs.filter(e => e.detected);
  const latestCollapse = collapseEvaluations[0];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-amber-500" />
          The Story So Far
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-generated narrative of your simulation's history
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Days Chronicled</span>
            </div>
            <div className="text-2xl font-bold mt-1">{narratives.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Chaos Events</span>
            </div>
            <div className="text-2xl font-bold mt-1">{activeChaosEvents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">Emergent Behaviors</span>
            </div>
            <div className="text-2xl font-bold mt-1">{detectedEmergence.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn(
                "h-4 w-4",
                latestCollapse?.status === 'stable' ? "text-green-500" :
                latestCollapse?.status === 'unstable' ? "text-yellow-500" : "text-red-500"
              )} />
              <span className="text-sm text-muted-foreground">System Status</span>
            </div>
            <div className={cn(
              "text-2xl font-bold mt-1 capitalize",
              latestCollapse?.status === 'stable' ? "text-green-500" :
              latestCollapse?.status === 'unstable' ? "text-yellow-500" : "text-red-500"
            )}>
              {latestCollapse?.status || 'Unknown'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collapse Warning if applicable */}
      {latestCollapse && latestCollapse.status !== 'stable' && (
        <CollapseIndicator evaluations={collapseEvaluations} />
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Full Narrative */}
        <div className="lg:col-span-2 space-y-6">
          {/* Full Narrative Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-500" />
                Complete Chronicle
              </CardTitle>
              <CardDescription>
                The full story of your simulation, day by day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {sortedNarratives.length === 0 ? (
                <p className="text-muted-foreground">No narrative entries yet. Run the simulation to generate stories.</p>
              ) : (
                sortedNarratives.map((narrative, index) => (
                  <div
                    key={narrative.id}
                    className={cn(
                      "relative pl-6 pb-4",
                      index !== sortedNarratives.length - 1 && "border-l-2 border-muted"
                    )}
                  >
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-0 -translate-x-1/2 w-3 h-3 rounded-full",
                      index === 0 ? "bg-amber-500" : "bg-muted-foreground/30"
                    )} />

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={index === 0 ? "default" : "outline"}>
                          Day {narrative.day}
                        </Badge>
                        {index === 0 && (
                          <span className="text-xs text-amber-500">Latest</span>
                        )}
                      </div>
                      <p className={cn(
                        "text-sm leading-relaxed",
                        index === 0 ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {narrative.summary}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Chaos & Emergence */}
        <div className="space-y-6">
          {/* Chaos Events */}
          <ChaosPanel chaosEvents={chaosEvents} />

          {/* Emergence Detection */}
          <EmergencePanel emergenceLogs={emergenceLogs} />

          {/* Story Statistics */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Story Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Days</span>
                <span className="font-medium">{worldState.day}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Narratives Generated</span>
                <span className="font-medium">{narratives.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chaos Events</span>
                <span className="font-medium">{activeChaosEvents.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Emergent Behaviors</span>
                <span className="font-medium">{detectedEmergence.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stability Checks</span>
                <span className="font-medium">{collapseEvaluations.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
