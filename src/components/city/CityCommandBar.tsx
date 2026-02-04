import { WorldState } from '@/types/simulation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SkipForward, Play, Pause, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityCommandBarProps {
  worldState: WorldState;
  isProcessing: boolean;
  currentPhase: string;
  onToggle: () => void;
  onStep: () => void;
  onReset: () => void;
}

export function CityCommandBar({
  worldState,
  isProcessing,
  currentPhase,
  onToggle,
  onStep,
  onReset,
}: CityCommandBarProps) {
  return (
    <div className="flex items-center h-12 px-4 border-b border-zinc-700 bg-zinc-900 gap-4 flex-shrink-0">
      {/* Day counter */}
      <div className="flex items-center gap-2">
        <span className="font-mono font-bold text-lg text-emerald-400">
          DAY {worldState.day}
        </span>
      </div>

      <Separator orientation="vertical" className="h-5 bg-zinc-600" />

      {/* Phase indicator */}
      <div className="flex-1 min-w-0">
        {isProcessing && currentPhase ? (
          <span className="text-sm text-emerald-400 animate-pulse truncate flex items-center gap-1.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
            {currentPhase}
          </span>
        ) : worldState.is_running ? (
          <span className="text-sm text-emerald-400 font-medium">Running</span>
        ) : worldState.is_collapsed ? (
          <span className="text-sm text-red-400 font-bold uppercase tracking-wider">Collapsed</span>
        ) : (
          <span className="text-sm text-zinc-300">Paused</span>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-200 hover:text-white hover:bg-zinc-700"
          onClick={onStep}
          disabled={isProcessing || worldState.is_running || worldState.is_collapsed}
          title="Step one day"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 text-zinc-200 hover:text-white hover:bg-zinc-700',
            worldState.is_running && 'text-emerald-400 hover:text-emerald-300',
          )}
          onClick={onToggle}
          disabled={isProcessing || worldState.is_collapsed}
          title={worldState.is_running ? 'Pause' : 'Start'}
        >
          {worldState.is_running ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-zinc-200 hover:text-white hover:bg-zinc-700"
          onClick={onReset}
          disabled={isProcessing}
          title="Reset world"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
