import { ReactNode } from 'react';
import { CellType, CELL_COLORS, CELL_BORDERS, TILE_SIZE } from './cityGridData';
import { cn } from '@/lib/utils';

interface IsometricTileProps {
  type: CellType;
  row: number;
  col: number;
  highlight?: string; // extra class for phase highlights
  children?: ReactNode;
}

export function IsometricTile({ type, highlight, children }: IsometricTileProps) {
  return (
    <div
      className={cn(
        'iso-tile',
        CELL_COLORS[type],
        CELL_BORDERS[type],
        type === 'water' && 'water-cell',
        highlight,
      )}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      {children}
    </div>
  );
}
