import { ReactNode, useMemo } from 'react';
import { GRID_CELLS, GRID_COLS, GRID_ROWS, TILE_SIZE, ZONE_LABELS } from './cityGridData';
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

  // Build zone label lookup
  const zoneLabelMap = useMemo(() => {
    const map: Record<string, { label: string; color: string }> = {};
    for (const zl of ZONE_LABELS) {
      map[`${zl.row}-${zl.col}`] = { label: zl.label, color: zl.color };
    }
    return map;
  }, []);

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
        const zoneLabel = zoneLabelMap[key];

        return (
          <IsometricTile
            key={key}
            type={cell.type}
            row={cell.row}
            col={cell.col}
            highlight={tileHighlights?.[key]}
          >
            {/* Zone label */}
            {zoneLabel && !tileContent?.[key] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="iso-label">
                  <span className={cn(
                    'text-[8px] font-bold uppercase tracking-widest whitespace-nowrap opacity-60',
                    zoneLabel.color,
                  )}>
                    {zoneLabel.label}
                  </span>
                </div>
              </div>
            )}
            {tileContent?.[key]}
          </IsometricTile>
        );
      })}
    </div>
  );
}
