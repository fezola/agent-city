import { ZONE_LEGEND } from './cityGridData';
import { cn } from '@/lib/utils';

export function CityLegend() {
  return (
    <div className="absolute bottom-3 right-3 z-20 bg-zinc-800 border border-zinc-600 rounded-lg p-3">
      <div className="text-xs text-white font-bold uppercase tracking-wider mb-2">
        Zones
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ZONE_LEGEND.map(({ type, label, color }) => (
          <div key={type} className="flex items-center gap-2">
            <div className={cn('w-3 h-3 rounded-sm', color)} />
            <span className="text-xs text-zinc-200">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
