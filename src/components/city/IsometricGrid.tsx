import { ReactNode, useMemo } from 'react';
import { GRID_CELLS, GRID_COLS, GRID_ROWS, TILE_SIZE } from './cityGridData';
import { IsometricTile } from './IsometricTile';
import { cn } from '@/lib/utils';

interface IsometricGridProps {
  tileContent?: Record<string, ReactNode>;
  tileHighlights?: Record<string, string>;
  className?: string;
  isCollapsed?: boolean;
}

export function IsometricGrid({
  tileContent,
  tileHighlights,
  className,
  isCollapsed,
}: IsometricGridProps) {
  const cells = useMemo(() => GRID_CELLS, []);

  return (
    <div
      className={cn(
        'isometric-grid',
        isCollapsed && 'collapsed-filter',
        className,
      )}
      style={{
        gridTemplateColumns: `repeat(${GRID_COLS}, ${TILE_SIZE}px)`,
        gridTemplateRows: `repeat(${GRID_ROWS}, ${TILE_SIZE}px)`,
      }}
    >
      {cells.map((cell) => {
        const key = `${cell.row}-${cell.col}`;

        return (
          <IsometricTile
            key={key}
            type={cell.type}
            row={cell.row}
            col={cell.col}
            highlight={tileHighlights?.[key]}
          >
            {tileContent?.[key]}
          </IsometricTile>
        );
      })}
    </div>
  );
}
