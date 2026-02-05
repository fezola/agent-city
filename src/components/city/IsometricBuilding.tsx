import { Building, BuildingType, BUILDING_LABELS } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface IsometricBuildingProps {
  building?: Building;
  showEmptyPlot?: boolean;
  isNew?: boolean;
}

// Building configurations by type and level
const BUILDING_CONFIGS: Record<BuildingType, {
  baseHeight: number;
  heightPerLevel: number;
  width: number;
  depth: number;
  colors: { roof: string; front: string; side: string; accent: string };
  hasRoof: boolean;
  roofStyle: 'flat' | 'peaked' | 'dome' | 'industrial';
  windows: boolean;
  chimney: boolean;
}> = {
  housing: {
    baseHeight: 35,
    heightPerLevel: 15,
    width: 48,
    depth: 40,
    colors: { roof: '#c2410c', front: '#fed7aa', side: '#fdba74', accent: '#9a3412' },
    hasRoof: true,
    roofStyle: 'peaked',
    windows: true,
    chimney: true,
  },
  factory: {
    baseHeight: 40,
    heightPerLevel: 20,
    width: 56,
    depth: 48,
    colors: { roof: '#525252', front: '#a3a3a3', side: '#737373', accent: '#f97316' },
    hasRoof: true,
    roofStyle: 'industrial',
    windows: true,
    chimney: false,
  },
  market: {
    baseHeight: 30,
    heightPerLevel: 12,
    width: 52,
    depth: 44,
    colors: { roof: '#7c3aed', front: '#e9d5ff', side: '#c4b5fd', accent: '#5b21b6' },
    hasRoof: true,
    roofStyle: 'flat',
    windows: true,
    chimney: false,
  },
  gate: {
    baseHeight: 55,
    heightPerLevel: 20,
    width: 60,
    depth: 32,
    colors: { roof: '#166534', front: '#bbf7d0', side: '#86efac', accent: '#15803d' },
    hasRoof: true,
    roofStyle: 'peaked',
    windows: false,
    chimney: false,
  },
  power_hub: {
    baseHeight: 50,
    heightPerLevel: 18,
    width: 50,
    depth: 50,
    colors: { roof: '#eab308', front: '#fef08a', side: '#fde047', accent: '#ca8a04' },
    hasRoof: true,
    roofStyle: 'dome',
    windows: true,
    chimney: false,
  },
};

export function IsometricBuilding({ building, showEmptyPlot, isNew }: IsometricBuildingProps) {
  if (!building && showEmptyPlot) {
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <svg width="50" height="40" viewBox="0 0 50 40" className="opacity-30">
          <polygon points="25,5 45,18 25,31 5,18" fill="none" stroke="#666" strokeWidth="1" strokeDasharray="3,2" />
          <text x="25" y="22" textAnchor="middle" fontSize="8" fill="#666">+</text>
        </svg>
      </div>
    );
  }

  if (!building) return null;

  const config = BUILDING_CONFIGS[building.building_type];
  const height = config.baseHeight + (building.level - 1) * config.heightPerLevel;
  const { width, depth, colors } = config;
  const inactive = !building.is_active;

  // Isometric projection calculations
  const isoAngle = Math.PI / 6; // 30 degrees
  const topOffset = height;

  return (
    <div
      className={cn(
        'absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer transition-transform duration-200 hover:scale-105',
        isNew && 'building-construct',
        inactive && 'opacity-50 saturate-50',
      )}
      style={{ 
        width: width + 20,
        height: height + 40,
        filter: isNew ? 'drop-shadow(0 0 12px rgba(34, 197, 94, 0.8))' : undefined,
      }}
      title={`${BUILDING_LABELS[building.building_type]} Lv.${building.level}${inactive ? ' (Inactive)' : ''}`}
    >
      <svg 
        width={width + 20} 
        height={height + 40} 
        viewBox={`0 0 ${width + 20} ${height + 40}`}
        className="drop-shadow-lg"
      >
        <defs>
          {/* Gradients for 3D effect */}
          <linearGradient id={`front-${building.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.front} />
            <stop offset="100%" stopColor={colors.side} />
          </linearGradient>
          <linearGradient id={`side-${building.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={colors.side} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
          <linearGradient id={`roof-${building.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.roof} />
            <stop offset="100%" stopColor={colors.accent} />
          </linearGradient>
          
          {/* Glow filter for new buildings */}
          {isNew && (
            <filter id={`glow-${building.id}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feFlood floodColor="#22c55e" floodOpacity="0.6" />
              <feComposite in2="blur" operator="in" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        <g transform={`translate(10, ${height + 5})`} filter={isNew ? `url(#glow-${building.id})` : undefined}>
          {/* Left side face */}
          <polygon
            points={`0,0 ${width/2},-${depth/3} ${width/2},-${depth/3 + height} 0,-${height}`}
            fill={`url(#side-${building.id})`}
            stroke={colors.accent}
            strokeWidth="0.5"
          />

          {/* Right side face */}
          <polygon
            points={`${width/2},-${depth/3} ${width},-0 ${width},-${height} ${width/2},-${depth/3 + height}`}
            fill={`url(#front-${building.id})`}
            stroke={colors.accent}
            strokeWidth="0.5"
          />

          {/* Windows on front face */}
          {config.windows && (
            <g>
              {Array.from({ length: building.level }).map((_, level) => (
                <g key={level}>
                  {Array.from({ length: Math.min(building.level, 3) }).map((_, i) => {
                    const windowY = -15 - level * config.heightPerLevel - i * 12;
                    const windowX = width / 2 + 8 + i * 10;
                    if (windowY < -height + 10) return null;
                    return (
                      <rect
                        key={`${level}-${i}`}
                        x={windowX}
                        y={windowY - (depth / 6) + (i * 2)}
                        width="6"
                        height="8"
                        fill="#fef3c7"
                        stroke={colors.accent}
                        strokeWidth="0.5"
                        rx="0.5"
                      />
                    );
                  })}
                </g>
              ))}
            </g>
          )}

          {/* Door on front */}
          <rect
            x={width / 2 + width / 4 - 5}
            y={-14 - (depth / 6)}
            width="10"
            height="14"
            fill={colors.accent}
            stroke={colors.roof}
            strokeWidth="0.5"
            rx="1"
          />

          {/* Top face / Roof */}
          {config.roofStyle === 'peaked' && (
            <>
              {/* Roof base */}
              <polygon
                points={`0,-${height} ${width/2},-${depth/3 + height} ${width},-${height} ${width/2},-${height + depth/2}`}
                fill={`url(#roof-${building.id})`}
                stroke={colors.accent}
                strokeWidth="0.5"
              />
              {/* Roof peak */}
              <polygon
                points={`${width/4},-${height + 5} ${width/2},-${height + 15} ${width*3/4},-${height + 5} ${width/2},-${height - 3}`}
                fill={colors.roof}
                stroke={colors.accent}
                strokeWidth="0.5"
              />
            </>
          )}

          {config.roofStyle === 'flat' && (
            <polygon
              points={`0,-${height} ${width/2},-${depth/3 + height} ${width},-${height} ${width/2},-${height + depth/3}`}
              fill={`url(#roof-${building.id})`}
              stroke={colors.accent}
              strokeWidth="0.5"
            />
          )}

          {config.roofStyle === 'industrial' && (
            <>
              <polygon
                points={`0,-${height} ${width/2},-${depth/3 + height} ${width},-${height} ${width/2},-${height + depth/3}`}
                fill={colors.roof}
                stroke={colors.accent}
                strokeWidth="0.5"
              />
              {/* Smokestacks */}
              <rect x={width/4} y={-height - 25} width="8" height="25" fill="#404040" stroke="#262626" strokeWidth="0.5" />
              <ellipse cx={width/4 + 4} cy={-height - 25} rx="5" ry="2" fill="#525252" />
              <rect x={width*3/4 - 4} y={-height - 20} width="8" height="20" fill="#404040" stroke="#262626" strokeWidth="0.5" />
              <ellipse cx={width*3/4} cy={-height - 20} rx="5" ry="2" fill="#525252" />
              {/* Smoke effect for active buildings */}
              {!inactive && (
                <g className="smoke-animate">
                  <circle cx={width/4 + 4} cy={-height - 30} r="3" fill="#9ca3af" opacity="0.4" />
                  <circle cx={width/4 + 6} cy={-height - 35} r="2" fill="#9ca3af" opacity="0.3" />
                </g>
              )}
            </>
          )}

          {config.roofStyle === 'dome' && (
            <>
              <polygon
                points={`0,-${height} ${width/2},-${depth/3 + height} ${width},-${height} ${width/2},-${height + depth/3}`}
                fill={colors.front}
                stroke={colors.accent}
                strokeWidth="0.5"
              />
              {/* Dome */}
              <ellipse 
                cx={width/2} 
                cy={-height - 5} 
                rx={width/4} 
                ry={15} 
                fill={colors.roof}
                stroke={colors.accent}
                strokeWidth="0.5"
              />
              {/* Lightning bolt icon for power */}
              <path
                d={`M${width/2 - 3},-${height + 10} L${width/2 + 2},-${height + 3} L${width/2},-${height + 3} L${width/2 + 3},-${height - 4} L${width/2 - 2},-${height + 3} L${width/2},-${height + 3} Z`}
                fill="#fbbf24"
                stroke="#ca8a04"
                strokeWidth="0.5"
              />
            </>
          )}

          {/* Chimney for housing */}
          {config.chimney && (
            <>
              <rect x={width/6} y={-height - 12} width="6" height="12" fill="#78350f" stroke="#451a03" strokeWidth="0.5" />
              <rect x={width/6 - 1} y={-height - 14} width="8" height="3" fill="#92400e" stroke="#451a03" strokeWidth="0.5" />
            </>
          )}

          {/* Level indicator badges */}
          <g transform={`translate(${width - 10}, -12)`}>
            {Array.from({ length: 3 }).map((_, i) => (
              <circle
                key={i}
                cx={0}
                cy={-i * 8}
                r="3.5"
                fill={i < building.level ? '#22c55e' : '#404040'}
                stroke={i < building.level ? '#15803d' : '#262626'}
                strokeWidth="0.5"
              />
            ))}
          </g>

          {/* Building label */}
          <text
            x={width / 2}
            y="18"
            textAnchor="middle"
            fontSize="8"
            fontWeight="bold"
            fill="white"
            className="drop-shadow-md uppercase tracking-wider pointer-events-none"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}
          >
            {BUILDING_LABELS[building.building_type]}
          </text>
          <text
            x={width / 2}
            y="28"
            textAnchor="middle"
            fontSize="7"
            fill="#a3a3a3"
            className="pointer-events-none"
          >
            Lv.{building.level}
          </text>
        </g>

        {/* Construction sparkles for new buildings */}
        {isNew && (
          <g className="construction-sparkles">
            <circle cx="10" cy="20" r="2" fill="#fbbf24" className="sparkle-1" />
            <circle cx={width + 5} cy="15" r="1.5" fill="#22c55e" className="sparkle-2" />
            <circle cx={width / 2} cy="8" r="2" fill="#38bdf8" className="sparkle-3" />
            <circle cx="15" cy={height} r="1.5" fill="#fbbf24" className="sparkle-4" />
          </g>
        )}
      </svg>
    </div>
  );
}
