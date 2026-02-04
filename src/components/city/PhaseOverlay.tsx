import { cn } from '@/lib/utils';

interface PhaseOverlayProps {
  phase: string | null;
  isCollapsed: boolean;
}

export function PhaseOverlay({ phase, isCollapsed }: PhaseOverlayProps) {
  return (
    <>
      {/* Chaos red pulse */}
      {phase === 'chaos' && (
        <div className="absolute inset-0 bg-red-600/10 chaos-overlay pointer-events-none z-10" />
      )}

      {/* Collapse overlay */}
      {isCollapsed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-red-950 border-2 border-red-600 rounded-lg px-8 py-4 shadow-2xl">
            <span className="text-red-300 font-bold text-xl uppercase tracking-widest">
              COLLAPSED
            </span>
          </div>
        </div>
      )}
    </>
  );
}
