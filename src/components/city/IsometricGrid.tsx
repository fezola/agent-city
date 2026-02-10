import { ReactNode } from 'react';
import { GRID_CELLS, GRID_COLS, GRID_ROWS, TILE_SIZE } from './cityGridData';
import { IsometricTile } from './IsometricTile';
import { cn } from '@/lib/utils';

interface IsometricGridProps {
  tileContent: Record<string, ReactNode>;
  tileHighlights: Record<string, string>;
  isCollapsed: boolean;
  className?: string;
}

export function IsometricGrid({
  tileContent,
  tileHighlights,
  isCollapsed,
  className,
}: IsometricGridProps) {
  return (
    <div
      className={cn(
        'rpg-grid relative',
        isCollapsed && 'collapsed-filter',
        className,
      )}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, ${TILE_SIZE}px)`,
        boxShadow: '0 0 60px rgba(255, 171, 64, 0.08), 0 0 120px rgba(255, 171, 64, 0.04)',
      }}
    >
      {GRID_CELLS.map((cell) => {
        const key = `${cell.row}-${cell.col}`;

        return (
          <IsometricTile
            key={key}
            cell={cell}
            highlight={tileHighlights?.[key]}
          >
            {tileContent?.[key]}
          </IsometricTile>
        );
      })}
    </div>
  );
}
