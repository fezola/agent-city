import { ReactNode, useMemo } from 'react';
import { GridCell, TILE_SIZE, ZONE_LABELS } from './cityGridData';
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
};

export function IsometricTile({ cell, children, highlight }: IsometricTileProps) {
  const tileClass = TILE_CLASS[cell.type] ?? 'tile-grass';

  // Check if there's a zone label for this cell
  const zoneLabel = useMemo(
    () => ZONE_LABELS.find((z) => z.row === cell.row && z.col === cell.col),
    [cell.row, cell.col]
  );

  return (
    <div
      className={cn('relative box-border', tileClass, highlight)}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      {/* Zone label text */}
      {zoneLabel && (
        <span
          className={cn(
            'absolute top-0.5 left-0.5 text-[6px] font-bold leading-none pointer-events-none whitespace-nowrap z-10',
            zoneLabel.color,
          )}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
        >
          {zoneLabel.label}
        </span>
      )}

      {/* Content overlay */}
      {children && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          {children}
        </div>
      )}
    </div>
  );
}
