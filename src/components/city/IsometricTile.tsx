import { ReactNode, useMemo } from 'react';
import { CellType, TILE_SIZE } from './cityGridData';
import { cn } from '@/lib/utils';

interface IsometricTileProps {
  type: CellType;
  row: number;
  col: number;
  highlight?: string;
  children?: ReactNode;
}

// Better visual tile styles with SVG rendering
const TILE_STYLES: Record<CellType, {
  fill: string;
  stroke: string;
  pattern?: string;
  glow?: boolean;
}> = {
  grass: { fill: '#166534', stroke: '#15803d', pattern: 'grass' },
  road: { fill: '#3f3f46', stroke: '#52525b', pattern: 'road' },
  government: { fill: '#78350f', stroke: '#92400e', glow: true },
  worker: { fill: '#1e3a8a', stroke: '#1d4ed8' },
  merchant: { fill: '#581c87', stroke: '#7c3aed' },
  park: { fill: '#14532d', stroke: '#22c55e', pattern: 'park' },
  water: { fill: '#0e7490', stroke: '#06b6d4', pattern: 'water' },
};

export function IsometricTile({ type, row, col, highlight, children }: IsometricTileProps) {
  const style = TILE_STYLES[type];
  const tileId = `tile-${row}-${col}`;

  // Create isometric diamond shape
  const halfW = TILE_SIZE / 2;
  const halfH = TILE_SIZE / 2;
  const points = `${halfW},0 ${TILE_SIZE},${halfH} ${halfW},${TILE_SIZE} 0,${halfH}`;

  return (
    <div
      className={cn(
        'iso-tile relative',
        type === 'water' && 'water-cell',
        highlight,
      )}
      style={{ width: TILE_SIZE, height: TILE_SIZE }}
    >
      <svg 
        width={TILE_SIZE} 
        height={TILE_SIZE} 
        viewBox={`0 0 ${TILE_SIZE} ${TILE_SIZE}`}
        className="absolute inset-0"
      >
        <defs>
          {/* Grass pattern */}
          <pattern id={`grass-${tileId}`} patternUnits="userSpaceOnUse" width="12" height="12">
            <rect width="12" height="12" fill={style.fill} />
            <circle cx="3" cy="3" r="1" fill="#22c55e" opacity="0.3" />
            <circle cx="9" cy="8" r="0.8" fill="#22c55e" opacity="0.4" />
            <circle cx="6" cy="11" r="0.6" fill="#16a34a" opacity="0.3" />
          </pattern>

          {/* Road pattern */}
          <pattern id={`road-${tileId}`} patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill={style.fill} />
            <line x1="0" y1="4" x2="8" y2="4" stroke="#52525b" strokeWidth="0.5" strokeDasharray="2,2" />
          </pattern>

          {/* Park pattern */}
          <pattern id={`park-${tileId}`} patternUnits="userSpaceOnUse" width="16" height="16">
            <rect width="16" height="16" fill={style.fill} />
            <circle cx="4" cy="4" r="2" fill="#22c55e" opacity="0.5" />
            <circle cx="12" cy="12" r="2.5" fill="#16a34a" opacity="0.4" />
            <path d="M8,2 L9,6 L8,5 L7,6 Z" fill="#15803d" opacity="0.6" />
          </pattern>

          {/* Water pattern with animation */}
          <pattern id={`water-${tileId}`} patternUnits="userSpaceOnUse" width="20" height="10">
            <rect width="20" height="10" fill={style.fill} />
            <path d="M0,5 Q5,2 10,5 T20,5" fill="none" stroke="#22d3ee" strokeWidth="0.8" opacity="0.4">
              <animate attributeName="d" 
                values="M0,5 Q5,2 10,5 T20,5;M0,5 Q5,8 10,5 T20,5;M0,5 Q5,2 10,5 T20,5" 
                dur="3s" 
                repeatCount="indefinite" 
              />
            </path>
          </pattern>

          {/* Glow filter for government */}
          {style.glow && (
            <filter id={`glow-${tileId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feFlood floodColor="#fbbf24" floodOpacity="0.3" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Tile base with 3D effect */}
        <g>
          {/* Bottom shadow for depth */}
          <polygon
            points={points}
            fill="rgba(0,0,0,0.3)"
            transform="translate(2, 3)"
          />
          
          {/* Main tile face */}
          <polygon
            points={points}
            fill={style.pattern ? `url(#${style.pattern}-${tileId})` : style.fill}
            stroke={style.stroke}
            strokeWidth="1.5"
            filter={style.glow ? `url(#glow-${tileId})` : undefined}
          />

          {/* Highlight edge for 3D effect */}
          <line 
            x1={halfW} y1="0" 
            x2={TILE_SIZE} y2={halfH} 
            stroke="rgba(255,255,255,0.15)" 
            strokeWidth="1"
          />
          <line 
            x1={halfW} y1="0" 
            x2="0" y2={halfH} 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="1"
          />

          {/* Dark edge for depth */}
          <line 
            x1="0" y1={halfH} 
            x2={halfW} y2={TILE_SIZE} 
            stroke="rgba(0,0,0,0.2)" 
            strokeWidth="1"
          />
          <line 
            x1={TILE_SIZE} y1={halfH} 
            x2={halfW} y2={TILE_SIZE} 
            stroke="rgba(0,0,0,0.25)" 
            strokeWidth="1"
          />
        </g>

        {/* Special decorations per type */}
        {type === 'park' && (
          <g>
            {/* Tree */}
            <ellipse cx={halfW} cy={halfH - 5} rx="8" ry="6" fill="#166534" />
            <ellipse cx={halfW} cy={halfH - 8} rx="6" ry="5" fill="#22c55e" />
            <rect x={halfW - 1.5} y={halfH - 2} width="3" height="8" fill="#78350f" />
          </g>
        )}

        {type === 'government' && (
          <g>
            {/* Flag pole and flag */}
            <rect x={halfW - 1} y={halfH - 20} width="2" height="25" fill="#78350f" />
            <polygon 
              points={`${halfW + 1},${halfH - 20} ${halfW + 12},${halfH - 16} ${halfW + 1},${halfH - 12}`}
              fill="#dc2626"
            />
          </g>
        )}
      </svg>

      {/* Content overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
