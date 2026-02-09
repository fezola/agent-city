import { ReactNode, useMemo } from 'react';
import { GridCell, TILE_SIZE, ZONE_LABELS, DECORATIONS, ZONE_BUILDINGS } from './cityGridData';
import { EnvironmentSprite } from './EnvironmentSprites';
import { WorkerHouseSprite, MerchantShopSprite, GovernmentBuildingSprite } from './ZoneBuildingSprites';
import { cn } from '@/lib/utils';

interface IsometricTileProps {
  cell: GridCell;
  children?: ReactNode;
  highlight?: string;
}

const TILE_CLASS: Record<string, string> = {
  grass: 'tile-grass',
  road: 'tile-road',
  government: 'tile-government',
  worker: 'tile-worker',
  merchant: 'tile-merchant',
  park: 'tile-park',
  water: 'tile-water',
  plaza: 'tile-plaza',
};

export function IsometricTile({ cell, children, highlight }: IsometricTileProps) {
  const tileClass = TILE_CLASS[cell.type] ?? 'tile-grass';
  const cellKey = `${cell.row}-${cell.col}`;

  const zoneLabel = useMemo(
    () => ZONE_LABELS.find((z) => z.row === cell.row && z.col === cell.col),
    [cell.row, cell.col]
  );

  const deco = useMemo(
    () => DECORATIONS.find((d) => d.row === cell.row && d.col === cell.col),
    [cell.row, cell.col]
  );

  const zoneBuilding = ZONE_BUILDINGS[cellKey];

  return (
    <div
      className={cn('relative box-border', tileClass, highlight)}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      {/* Zone building (permanent district structure) */}
      {zoneBuilding && !children && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-5">
          {zoneBuilding.zone === 'worker' && <WorkerHouseSprite variant={zoneBuilding.variant} />}
          {zoneBuilding.zone === 'merchant' && <MerchantShopSprite variant={zoneBuilding.variant} />}
          {zoneBuilding.zone === 'government' && <GovernmentBuildingSprite variant={zoneBuilding.variant} />}
        </div>
      )}

      {/* Zone label text */}
      {zoneLabel && (
        <span
          className={cn(
            'absolute top-0.5 left-0.5 text-[6px] font-bold leading-none pointer-events-none whitespace-nowrap z-30',
            zoneLabel.color,
          )}
          style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 6px rgba(0,0,0,0.7)' }}
        >
          {zoneLabel.label}
        </span>
      )}

      {/* Environmental decoration (only if no zone building and no agent/building content) */}
      {deco && !children && !zoneBuilding && (
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none z-5 pb-1">
          <EnvironmentSprite type={deco.type} />
        </div>
      )}

      {/* Content overlay (agents, player-built buildings) */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          {children}
        </div>
      )}
    </div>
  );
}
