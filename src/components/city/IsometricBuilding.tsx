import { Building, BuildingType, BUILDING_LABELS } from '@/types/simulation';
import { Home, Factory, Store, Building2, Zap, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IsometricBuildingProps {
  building?: Building;
  /** Show empty plot indicator */
  showEmptyPlot?: boolean;
  /** Newly constructed this turn */
  isNew?: boolean;
}

const LEVEL_CONFIG: Record<number, { height: number; width: number }> = {
  1: { height: 24, width: 40 },
  2: { height: 40, width: 44 },
  3: { height: 56, width: 48 },
};

const BUILDING_COLORS: Record<BuildingType, { top: string; front: string; side: string }> = {
  housing: { top: 'bg-blue-400', front: 'bg-blue-600', side: 'bg-blue-700' },
  factory: { top: 'bg-orange-400', front: 'bg-orange-600', side: 'bg-orange-700' },
  market: { top: 'bg-purple-400', front: 'bg-purple-600', side: 'bg-purple-700' },
  gate: { top: 'bg-emerald-400', front: 'bg-emerald-600', side: 'bg-emerald-700' },
  power_hub: { top: 'bg-yellow-400', front: 'bg-yellow-600', side: 'bg-yellow-700' },
};

const BUILDING_ICONS: Record<BuildingType, typeof Home> = {
  housing: Home,
  factory: Factory,
  market: Store,
  gate: Building2,
  power_hub: Zap,
};

export function IsometricBuilding({ building, showEmptyPlot, isNew }: IsometricBuildingProps) {
  if (!building && showEmptyPlot) {
    return (
      <div className="absolute inset-2 flex items-center justify-center">
        <div className="w-10 h-10 border border-dashed border-zinc-600/50 rounded flex items-center justify-center">
          <Plus className="h-3 w-3 text-zinc-600/50" />
        </div>
      </div>
    );
  }

  if (!building) return null;

  const config = LEVEL_CONFIG[building.level] || LEVEL_CONFIG[1];
  const colors = BUILDING_COLORS[building.building_type];
  const Icon = BUILDING_ICONS[building.building_type];
  const inactive = !building.is_active;

  const offsetX = (64 - config.width) / 2;
  const offsetY = 64 - config.width; // bottom-align in tile

  return (
    <div
      className={cn(
        'absolute',
        isNew && 'building-new',
        inactive && 'opacity-40 grayscale',
      )}
      style={{
        left: offsetX,
        top: offsetY,
        width: config.width,
        height: config.width,
        transformStyle: 'preserve-3d',
        ['--build-height' as string]: `${config.height}px`,
      }}
      title={`${BUILDING_LABELS[building.building_type]} Lv.${building.level}${inactive ? ' (Inactive)' : ''}`}
    >
      {/* Top face */}
      <div
        className={cn('absolute', colors.top, inactive && 'bg-zinc-500')}
        style={{
          width: config.width,
          height: config.width,
          transform: `translateZ(${config.height}px)`,
        }}
      >
        <div className="iso-label absolute inset-0 flex items-center justify-center">
          <Icon className="h-4 w-4 text-white/90 drop-shadow" />
        </div>
      </div>

      {/* Front face */}
      <div
        className={cn('absolute bottom-0 left-0', colors.front, inactive && 'bg-zinc-600')}
        style={{
          width: config.width,
          height: config.height,
          transformOrigin: 'bottom center',
          transform: 'rotateX(-90deg)',
        }}
      >
        {/* Level dots */}
        <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                i < building.level ? 'bg-white/60' : 'bg-white/20',
              )}
            />
          ))}
        </div>
      </div>

      {/* Side face */}
      <div
        className={cn('absolute bottom-0 right-0', colors.side, inactive && 'bg-zinc-700')}
        style={{
          width: config.height,
          height: config.width,
          transformOrigin: 'center right',
          transform: 'rotateY(90deg)',
        }}
      />
    </div>
  );
}
