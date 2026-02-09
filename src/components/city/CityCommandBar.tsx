import { WorldState } from '@/types/simulation';
import { SkipForward, Play, Pause, RotateCcw, Loader2, Shield, Users, Clock } from 'lucide-react';
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
    <div className="rpg-panel flex items-center h-12 px-4 gap-4 flex-shrink-0 border-b-2 border-rpg-panel-border">
      {/* Location banner */}
      <div className="flex items-center gap-2">
        <span className="font-pixel text-[10px] text-rpg-gold neon-text tracking-wider">
          AGENT CITY
        </span>
        <span className="font-pixel text-[7px] bg-rpg-safe-green/20 text-rpg-safe-green px-1.5 py-0.5 pixel-border">
          SAFE
        </span>
      </div>

      <div className="w-px h-6 bg-rpg-panel-border" />

      {/* World status indicators */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-rpg-panel-glow" />
          <span className="font-retro text-sm text-rpg-panel-glow">
            TICK {worldState.day}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-rpg-gold" />
          <span className="font-retro text-sm text-rpg-gold">
            HP {Math.round(worldState.city_health)}%
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Users className="h-3 w-3 text-rpg-mana-blue" />
          <span className="font-retro text-sm text-rpg-mana-blue">
            POP 7
          </span>
        </div>

        {/* Phase indicator */}
        <div className="flex-1 min-w-0">
          {isProcessing && currentPhase ? (
            <span className="font-retro text-sm text-rpg-hp-green flex items-center gap-1.5 truncate">
              <Loader2 className="h-3 w-3 animate-spin flex-shrink-0" />
              {currentPhase}
            </span>
          ) : worldState.is_running ? (
            <span className="font-retro text-sm text-rpg-hp-green">RUNNING</span>
          ) : worldState.is_collapsed ? (
            <span className="font-pixel text-[8px] text-rpg-hp-red neon-text uppercase tracking-wider">
              COLLAPSED
            </span>
          ) : (
            <span className="font-retro text-sm text-zinc-400">PAUSED</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-1">
        <button
          className={cn(
            'rpg-btn h-8 w-8 flex items-center justify-center',
            (isProcessing || worldState.is_running || worldState.is_collapsed) && 'opacity-30 cursor-not-allowed',
          )}
          onClick={onStep}
          disabled={isProcessing || worldState.is_running || worldState.is_collapsed}
          title="Step one day"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <button
          className={cn(
            'rpg-btn h-8 w-8 flex items-center justify-center',
            worldState.is_running && 'border-rpg-hp-green text-rpg-hp-green',
            (isProcessing || worldState.is_collapsed) && 'opacity-30 cursor-not-allowed',
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
        </button>
        <button
          className={cn(
            'rpg-btn h-8 w-8 flex items-center justify-center',
            isProcessing && 'opacity-30 cursor-not-allowed',
          )}
          onClick={onReset}
          disabled={isProcessing}
          title="Reset world"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
