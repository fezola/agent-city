import { cn } from '@/lib/utils';

interface PhaseOverlayProps {
  phase: string | null;
  isCollapsed: boolean;
}

export function PhaseOverlay({ phase, isCollapsed }: PhaseOverlayProps) {
  return (
    <>
      {/* Chaos red pulse + neon border flash */}
      {phase === 'chaos' && (
        <>
          <div className="absolute inset-0 bg-red-600/8 chaos-overlay pointer-events-none z-10" />
          <div className="absolute inset-0 pointer-events-none z-10 border-2 border-rpg-hp-red animate-neon-pulse" />
        </>
      )}

      {/* Collapse overlay */}
      {isCollapsed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="rpg-panel px-8 py-4 border-rpg-hp-red border-2">
            {/* Pixel skull */}
            <div className="flex items-center gap-3">
              <svg viewBox="0 0 12 12" width="24" height="24" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
                <rect x="3" y="0" width="6" height="2" fill="#ff1744" />
                <rect x="2" y="2" width="8" height="2" fill="#ff1744" />
                <rect x="2" y="4" width="2" height="2" fill="#fff" />
                <rect x="6" y="4" width="2" height="2" fill="#fff" />
                <rect x="2" y="6" width="8" height="2" fill="#ff1744" />
                <rect x="3" y="8" width="2" height="2" fill="#ff1744" />
                <rect x="7" y="8" width="2" height="2" fill="#ff1744" />
                <rect x="4" y="10" width="4" height="2" fill="#ff1744" />
              </svg>
              <span className="font-pixel text-[10px] text-rpg-hp-red neon-text uppercase tracking-widest">
                CITY COLLAPSED
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
