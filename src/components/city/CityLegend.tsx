import { ZONE_LEGEND } from './cityGridData';

const ZONE_TILE_CLASSES: Record<string, string> = {
  government: 'tile-government',
  worker: 'tile-worker',
  merchant: 'tile-merchant',
  road: 'tile-road',
  park: 'tile-park',
  water: 'tile-water',
};

export function CityLegend() {
  return (
    <div className="absolute bottom-3 right-3 z-20 rpg-panel p-3">
      <div className="font-pixel text-[7px] text-rpg-gold uppercase tracking-wider mb-2">
        ZONES
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {ZONE_LEGEND.map(({ type, label }) => (
          <div key={type} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${ZONE_TILE_CLASSES[type] || 'tile-grass'}`} style={{ imageRendering: 'pixelated' }} />
            <span className="font-retro text-sm text-zinc-200">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
