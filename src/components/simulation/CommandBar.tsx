import { WorldState } from '@/types/simulation';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { SkipForward, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandBarProps {
  worldState: WorldState;
  isProcessing: boolean;
  currentPhase: string;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function CommandBar({
  worldState,
  isProcessing,
  currentPhase,
  onToggle,
  onStep,
  onReset,
}: CommandBarProps) {
  return (
    <div className="flex items-center h-12 px-4 border-b bg-background gap-4">
      {/* Left: Day + Phase */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-mono font-bold text-sm whitespace-nowrap">
          DAY {worldState.day}
        </span>
        <Separator orientation="vertical" className="h-4" />
        {isProcessing && currentPhase ? (
          <span className="text-xs text-emerald-400 animate-pulse truncate flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            {currentPhase}
          </span>
        ) : worldState.is_running ? (
          <span className="text-xs text-emerald-400 truncate">Running</span>
        ) : (
          <span className="text-xs text-muted-foreground truncate">Paused</span>
        )}
      </div>

      {/* Center: Health bar */}
      <div className="flex-1 flex items-center justify-center gap-2 max-w-xs mx-auto">
        <span className="text-[10px] text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Health
        </span>
        <Progress
          value={worldState.city_health}
          className="h-1.5 flex-1"
        />
        <span className={cn(
          "text-xs font-mono font-medium whitespace-nowrap",
          worldState.city_health < 40 && "text-red-400"
        )}>
          {worldState.city_health}%
        </span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onStep}
          disabled={isProcessing || worldState.is_running}
          title="Step one day"
        >
          <SkipForward className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8",
            worldState.is_running && "text-emerald-400 hover:text-emerald-300"
          )}
          onClick={onToggle}
          disabled={isProcessing}
          title={worldState.is_running ? "Pause" : "Start"}
        >
          {worldState.is_running ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onReset}
          disabled={isProcessing}
          title="Reset world"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
