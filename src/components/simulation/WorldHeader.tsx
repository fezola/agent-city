import { WorldState, CIV_TOKEN } from '@/types/simulation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Play, Pause, SkipForward, RotateCcw, Skull, Crown } from 'lucide-react';

interface WorldHeaderProps {
  worldState: WorldState | null;
  isProcessing: boolean;
  currentPhase: string;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function WorldHeader({
  worldState,
  isProcessing,
  currentPhase,
  onToggle,
  onStep,
  onReset,
}: WorldHeaderProps) {
  if (!worldState) return null;

  const healthColor = worldState.city_health > 70 
    ? 'bg-green-500' 
    : worldState.city_health > 40 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  return (
    <div className="space-y-4">
      {/* Title Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="h-8 w-8 text-amber-500" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Agent Economy</h1>
            <p className="text-sm text-muted-foreground">
              Autonomous agents competing to survive
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onStep}
            disabled={worldState.is_running || isProcessing || worldState.is_collapsed}
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Step
          </Button>
          <Button
            variant={worldState.is_running ? 'destructive' : 'default'}
            size="sm"
            onClick={onToggle}
            disabled={isProcessing || worldState.is_collapsed}
          >
            {worldState.is_running ? (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1" />
                Start
              </>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-gradient-to-br from-amber-950/50 to-amber-900/30 border-amber-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-amber-200/70 uppercase tracking-wide">Day</div>
            <div className="text-3xl font-bold text-amber-100">{worldState.day}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-950/50 to-emerald-900/30 border-emerald-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-emerald-200/70 uppercase tracking-wide">Treasury</div>
            <div className="text-2xl font-bold text-emerald-100">
              {worldState.treasury_balance.toLocaleString()} <span className="text-sm font-normal text-emerald-300/70">{CIV_TOKEN.symbol}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-950/50 to-blue-900/30 border-blue-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-blue-200/70 uppercase tracking-wide">Tax Rate</div>
            <div className="text-2xl font-bold text-blue-100">
              {(worldState.tax_rate * 100).toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-950/50 to-purple-900/30 border-purple-800/50">
          <CardContent className="p-4">
            <div className="text-xs text-purple-200/70 uppercase tracking-wide">Satisfaction</div>
            <div className="text-2xl font-bold text-purple-100">
              {worldState.worker_satisfaction.toFixed(0)}%
            </div>
          </CardContent>
        </Card>

        <Card className={`relative overflow-hidden ${worldState.is_collapsed ? 'bg-red-950' : ''}`}>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              City Health
              {worldState.is_collapsed && <Skull className="h-3 w-3 text-red-500" />}
            </div>
            <div className="mt-2">
              <Progress 
                value={worldState.city_health} 
                className="h-3"
              />
              <div className={`absolute inset-0 ${healthColor} opacity-10`} />
            </div>
            <div className="text-lg font-semibold mt-1">
              {worldState.city_health.toFixed(0)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Phase Indicator */}
      {currentPhase && (
        <div className="bg-primary/10 border border-primary/30 rounded-lg p-3 text-center animate-pulse">
          <span className="text-primary font-medium">{currentPhase}</span>
        </div>
      )}

      {worldState.is_collapsed && (
        <div className="bg-red-950 border border-red-800 rounded-lg p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-red-400">
            <Skull className="h-6 w-6" />
            <span className="text-xl font-bold">ECONOMY COLLAPSED</span>
            <Skull className="h-6 w-6" />
          </div>
          <p className="text-red-300/70 mt-2">The simulation has ended. Reset to try again.</p>
        </div>
      )}
    </div>
  );
}
