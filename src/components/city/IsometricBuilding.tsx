import { Building, BUILDING_LABELS } from '@/types/simulation';
import { cn } from '@/lib/utils';

interface IsometricBuildingProps {
  building: Building;
  isNew?: boolean;
}

/**
 * Pixel-art front-facing SVG building renderer.
 * Each building_type maps to a unique pixel sprite drawn with crispEdges rects.
 */
export function IsometricBuilding({ building, isNew }: IsometricBuildingProps) {
  const inactive = !building.is_active;
  const level = building.level;

  return (
    <div
      className={cn(
        'absolute bottom-1 left-1/2 -translate-x-1/2 pointer-events-auto cursor-pointer transition-transform duration-200 hover:scale-110',
        isNew && 'building-new',
        inactive && 'opacity-50',
      )}
      style={{
        imageRendering: 'pixelated',
        filter: inactive ? 'grayscale(1)' : undefined,
      }}
      title={`${BUILDING_LABELS[building.building_type]} Lv.${level}${inactive ? ' (Inactive)' : ''}`}
    >
      {/* Level stars above building */}
      <div className="flex justify-center gap-[2px] mb-[1px]">
        {Array.from({ length: level }).map((_, i) => (
          <svg key={i} width="7" height="7" viewBox="0 0 7 7" style={{ imageRendering: 'pixelated' }}>
            <rect shapeRendering="crispEdges" x="3" y="0" width="1" height="1" fill="#ffd700" />
            <rect shapeRendering="crispEdges" x="1" y="1" width="5" height="1" fill="#ffd700" />
            <rect shapeRendering="crispEdges" x="2" y="2" width="3" height="1" fill="#ffd700" />
            <rect shapeRendering="crispEdges" x="1" y="3" width="2" height="1" fill="#ffd700" />
            <rect shapeRendering="crispEdges" x="4" y="3" width="2" height="1" fill="#ffd700" />
          </svg>
        ))}
      </div>

      {/* Building sprite */}
      {renderBuilding(building)}

      {/* Building label */}
      <div
        className="text-center font-retro text-[9px] text-white leading-none mt-[1px] pointer-events-none"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
      >
        {BUILDING_LABELS[building.building_type]}
      </div>
    </div>
  );
}

function renderBuilding(building: Building) {
  switch (building.building_type) {
    case 'housing':
      return <HousingSprite />;
    case 'factory':
      return <FactorySprite active={building.is_active} />;
    case 'market':
      return <MarketSprite />;
    case 'gate':
      return <GateSprite />;
    case 'power_hub':
      return <PowerHubSprite />;
    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  HOUSING - Small cottage with peaked roof, windows, door, lantern  */
/* ------------------------------------------------------------------ */
function HousingSprite() {
  return (
    <svg
      width="36"
      height="44"
      viewBox="0 0 32 40"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
    >
      {/* Peaked roof - brown */}
      <rect x="14" y="2" width="4" height="2" fill="#8b4513" />
      <rect x="12" y="4" width="8" height="2" fill="#8b4513" />
      <rect x="10" y="6" width="12" height="2" fill="#8b4513" />
      <rect x="8" y="8" width="16" height="2" fill="#a0522d" />
      <rect x="6" y="10" width="20" height="2" fill="#a0522d" />
      <rect x="4" y="12" width="24" height="2" fill="#8b4513" />

      {/* Walls - tan/beige */}
      <rect x="6" y="14" width="20" height="16" fill="#f5deb3" />
      {/* Wall outline */}
      <rect x="6" y="14" width="1" height="16" fill="#d2b48c" />
      <rect x="25" y="14" width="1" height="16" fill="#d2b48c" />
      <rect x="6" y="29" width="20" height="1" fill="#d2b48c" />

      {/* Windows - yellow glow (2x2 each) */}
      <rect x="9" y="18" width="3" height="3" fill="#ffd700" />
      <rect x="9" y="18" width="3" height="1" fill="#ffec8b" />
      <rect x="20" y="18" width="3" height="3" fill="#ffd700" />
      <rect x="20" y="18" width="3" height="1" fill="#ffec8b" />

      {/* Window frames */}
      <rect x="8" y="17" width="5" height="1" fill="#8b4513" />
      <rect x="8" y="21" width="5" height="1" fill="#8b4513" />
      <rect x="19" y="17" width="5" height="1" fill="#8b4513" />
      <rect x="19" y="21" width="5" height="1" fill="#8b4513" />

      {/* Door - brown */}
      <rect x="14" y="24" width="4" height="6" fill="#8b4513" />
      <rect x="14" y="24" width="4" height="1" fill="#a0522d" />
      {/* Door knob */}
      <rect x="17" y="27" width="1" height="1" fill="#ffd700" />

      {/* Hanging lantern on right side */}
      <rect x="27" y="14" width="1" height="4" fill="#8b4513" />
      <rect x="26" y="18" width="3" height="3" fill="#ff8c00" className="animate-lantern-flicker" />
      <rect x="27" y="19" width="1" height="1" fill="#ffec8b" />

      {/* Foundation */}
      <rect x="4" y="30" width="24" height="2" fill="#a0522d" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  FACTORY - Wide building, smokestack, gear, furnace glow           */
/* ------------------------------------------------------------------ */
function FactorySprite({ active }: { active: boolean }) {
  return (
    <svg
      width="40"
      height="44"
      viewBox="0 0 36 44"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
    >
      {/* Smokestack on right */}
      <rect x="28" y="2" width="4" height="22" fill="#555" />
      <rect x="27" y="2" width="6" height="2" fill="#666" />

      {/* Animated smoke puffs (small rects floating up) */}
      {active && (
        <g className="smoke-animate">
          <rect x="28" y="0" width="3" height="2" fill="#999" opacity="0.5" />
          <rect x="30" y="-3" width="2" height="2" fill="#aaa" opacity="0.3" />
          <rect x="27" y="-5" width="2" height="2" fill="#bbb" opacity="0.2" />
        </g>
      )}

      {/* Flat roof - dark gray */}
      <rect x="2" y="10" width="28" height="3" fill="#555" />
      <rect x="2" y="10" width="28" height="1" fill="#666" />

      {/* Walls - gray */}
      <rect x="2" y="13" width="28" height="20" fill="#888" />
      <rect x="2" y="13" width="1" height="20" fill="#777" />
      <rect x="29" y="13" width="1" height="20" fill="#666" />

      {/* Gear icon in window area (orange/brown) */}
      <rect x="10" y="17" width="8" height="8" fill="#555" />
      {/* Gear center */}
      <rect x="13" y="20" width="2" height="2" fill="#d2691e" />
      {/* Gear teeth */}
      <rect x="12" y="19" width="4" height="1" fill="#cd853f" />
      <rect x="12" y="22" width="4" height="1" fill="#cd853f" />
      <rect x="11" y="20" width="1" height="2" fill="#cd853f" />
      <rect x="16" y="20" width="1" height="2" fill="#cd853f" />

      {/* Large industrial windows */}
      <rect x="5" y="16" width="4" height="5" fill="#444" />
      <rect x="5" y="16" width="4" height="1" fill="#555" />
      <rect x="22" y="16" width="4" height="5" fill="#444" />
      <rect x="22" y="16" width="4" height="1" fill="#555" />

      {/* Furnace at base - orange glow */}
      <rect x="6" y="28" width="8" height="5" fill="#333" />
      <rect x="7" y="29" width="6" height="3" fill="#ff6600" />
      <rect x="8" y="30" width="4" height="1" fill="#ffaa00" />

      {/* Foundation */}
      <rect x="1" y="33" width="34" height="2" fill="#444" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  MARKET - Market stall with striped awning, goods, counter, sign   */
/* ------------------------------------------------------------------ */
function MarketSprite() {
  return (
    <svg
      width="36"
      height="44"
      viewBox="0 0 32 40"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
    >
      {/* Sign board on left */}
      <rect x="1" y="6" width="5" height="8" fill="#8b4513" />
      <rect x="2" y="7" width="3" height="6" fill="#f5deb3" />
      <rect x="3" y="8" width="1" height="1" fill="#7b1fa2" />
      <rect x="3" y="10" width="1" height="1" fill="#7b1fa2" />
      {/* Sign post */}
      <rect x="3" y="14" width="1" height="10" fill="#8b4513" />

      {/* Striped awning at top - purple and white alternating */}
      <rect x="6" y="8" width="4" height="4" fill="#9c27b0" />
      <rect x="10" y="8" width="4" height="4" fill="#ffffff" />
      <rect x="14" y="8" width="4" height="4" fill="#9c27b0" />
      <rect x="18" y="8" width="4" height="4" fill="#ffffff" />
      <rect x="22" y="8" width="4" height="4" fill="#9c27b0" />
      {/* Awning edge */}
      <rect x="6" y="12" width="20" height="1" fill="#7b1fa2" />
      {/* Awning supports */}
      <rect x="6" y="8" width="1" height="24" fill="#8b4513" />
      <rect x="25" y="8" width="1" height="24" fill="#8b4513" />

      {/* Open front showing goods (small colored rects) */}
      <rect x="8" y="14" width="3" height="3" fill="#f44336" />
      <rect x="12" y="14" width="3" height="3" fill="#4caf50" />
      <rect x="16" y="14" width="3" height="3" fill="#2196f3" />
      <rect x="20" y="14" width="3" height="3" fill="#ff9800" />
      <rect x="8" y="18" width="3" height="3" fill="#ffeb3b" />
      <rect x="12" y="18" width="3" height="3" fill="#e91e63" />
      <rect x="16" y="18" width="3" height="3" fill="#00bcd4" />
      <rect x="20" y="18" width="3" height="3" fill="#8bc34a" />

      {/* Wooden counter */}
      <rect x="7" y="22" width="18" height="3" fill="#a0522d" />
      <rect x="7" y="22" width="18" height="1" fill="#cd853f" />

      {/* Counter legs */}
      <rect x="8" y="25" width="2" height="7" fill="#8b4513" />
      <rect x="22" y="25" width="2" height="7" fill="#8b4513" />

      {/* Small hanging lantern */}
      <rect x="15" y="6" width="1" height="2" fill="#8b4513" />
      <rect x="14" y="5" width="3" height="1" fill="#8b4513" />
      <rect x="14" y="4" width="3" height="2" fill="#ff8c00" className="animate-lantern-flicker" />

      {/* Ground */}
      <rect x="6" y="32" width="20" height="2" fill="#8b4513" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  GATE - Stone archway with towers, flag, torches                   */
/* ------------------------------------------------------------------ */
function GateSprite() {
  return (
    <svg
      width="36"
      height="44"
      viewBox="0 0 32 44"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
    >
      {/* Green flag on top */}
      <rect x="15" y="0" width="1" height="8" fill="#8b4513" />
      <rect x="16" y="0" width="5" height="2" fill="#4caf50" />
      <rect x="16" y="2" width="4" height="2" fill="#388e3c" />
      <rect x="16" y="4" width="3" height="1" fill="#2e7d32" />

      {/* Left tower */}
      <rect x="2" y="6" width="8" height="30" fill="#808080" />
      <rect x="2" y="6" width="8" height="2" fill="#999" />
      {/* Left tower battlements */}
      <rect x="2" y="4" width="2" height="2" fill="#808080" />
      <rect x="5" y="4" width="2" height="2" fill="#808080" />
      <rect x="8" y="4" width="2" height="2" fill="#808080" />
      {/* Left tower window */}
      <rect x="5" y="14" width="2" height="3" fill="#333" />

      {/* Right tower */}
      <rect x="22" y="6" width="8" height="30" fill="#808080" />
      <rect x="22" y="6" width="8" height="2" fill="#999" />
      {/* Right tower battlements */}
      <rect x="22" y="4" width="2" height="2" fill="#808080" />
      <rect x="25" y="4" width="2" height="2" fill="#808080" />
      <rect x="28" y="4" width="2" height="2" fill="#808080" />
      {/* Right tower window */}
      <rect x="25" y="14" width="2" height="3" fill="#333" />

      {/* Central arch connecting wall */}
      <rect x="10" y="8" width="12" height="4" fill="#999" />
      <rect x="10" y="12" width="12" height="2" fill="#808080" />

      {/* Arch opening */}
      <rect x="10" y="14" width="12" height="22" fill="#808080" />
      {/* Arch inner opening (dark) */}
      <rect x="12" y="16" width="8" height="20" fill="#1a1a2e" />
      {/* Arch top curve (approximated with rects) */}
      <rect x="13" y="14" width="6" height="2" fill="#1a1a2e" />
      <rect x="14" y="13" width="4" height="1" fill="#1a1a2e" />

      {/* Stone texture lines */}
      <rect x="3" y="12" width="6" height="1" fill="#707070" />
      <rect x="3" y="20" width="6" height="1" fill="#707070" />
      <rect x="3" y="28" width="6" height="1" fill="#707070" />
      <rect x="23" y="12" width="6" height="1" fill="#707070" />
      <rect x="23" y="20" width="6" height="1" fill="#707070" />
      <rect x="23" y="28" width="6" height="1" fill="#707070" />

      {/* Torches on sides (orange rects with glow) */}
      <rect x="9" y="18" width="1" height="4" fill="#8b4513" />
      <rect x="8" y="16" width="3" height="3" fill="#ff6600" className="animate-lantern-flicker" />
      <rect x="9" y="17" width="1" height="1" fill="#ffcc00" />

      <rect x="22" y="18" width="1" height="4" fill="#8b4513" />
      <rect x="21" y="16" width="3" height="3" fill="#ff6600" className="animate-lantern-flicker" />
      <rect x="22" y="17" width="1" height="1" fill="#ffcc00" />

      {/* Foundation */}
      <rect x="1" y="36" width="30" height="2" fill="#666" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  POWER HUB - Crystal/energy structure with orb, frame, lightning   */
/* ------------------------------------------------------------------ */
function PowerHubSprite() {
  return (
    <svg
      width="36"
      height="44"
      viewBox="0 0 32 44"
      shapeRendering="crispEdges"
      style={{ imageRendering: 'pixelated', display: 'block', margin: '0 auto' }}
    >
      {/* Lightning bolt pixel icon above (yellow zigzag rects) */}
      <rect x="15" y="0" width="3" height="2" fill="#ffd700" />
      <rect x="13" y="2" width="3" height="2" fill="#ffd700" />
      <rect x="15" y="4" width="3" height="2" fill="#ffec8b" />
      <rect x="13" y="6" width="3" height="2" fill="#ffd700" />
      <rect x="15" y="8" width="2" height="1" fill="#ffec8b" />

      {/* Supporting frame (gray rects) */}
      <rect x="6" y="14" width="2" height="22" fill="#888" />
      <rect x="24" y="14" width="2" height="22" fill="#888" />
      {/* Top crossbar */}
      <rect x="6" y="12" width="20" height="2" fill="#999" />
      {/* Bottom crossbar */}
      <rect x="6" y="34" width="20" height="2" fill="#999" />
      {/* Mid supports */}
      <rect x="8" y="22" width="16" height="1" fill="#777" />

      {/* Central glowing orb (yellow circle approximated as pixel rects) */}
      <g className="animate-pulse">
        <rect x="13" y="16" width="6" height="1" fill="#ffd700" />
        <rect x="12" y="17" width="8" height="1" fill="#ffd700" />
        <rect x="11" y="18" width="10" height="1" fill="#ffec8b" />
        <rect x="11" y="19" width="10" height="2" fill="#fff176" />
        <rect x="11" y="21" width="10" height="1" fill="#ffec8b" />
        <rect x="12" y="22" width="8" height="1" fill="#ffd700" />
        <rect x="13" y="23" width="6" height="1" fill="#ffd700" />
      </g>

      {/* Radiating lines (thin yellow rects) */}
      <rect x="4" y="19" width="6" height="1" fill="#ffd700" opacity="0.6" />
      <rect x="22" y="19" width="6" height="1" fill="#ffd700" opacity="0.6" />
      <rect x="15" y="10" width="1" height="4" fill="#ffd700" opacity="0.6" />
      <rect x="15" y="25" width="1" height="4" fill="#ffd700" opacity="0.6" />
      {/* Diagonal radiations */}
      <rect x="8" y="15" width="2" height="1" fill="#ffd700" opacity="0.4" />
      <rect x="22" y="15" width="2" height="1" fill="#ffd700" opacity="0.4" />
      <rect x="8" y="24" width="2" height="1" fill="#ffd700" opacity="0.4" />
      <rect x="22" y="24" width="2" height="1" fill="#ffd700" opacity="0.4" />

      {/* Lower energy conduits */}
      <rect x="10" y="28" width="12" height="2" fill="#555" />
      <rect x="12" y="30" width="8" height="2" fill="#666" />
      <rect x="13" y="29" width="6" height="1" fill="#ffd700" opacity="0.4" />

      {/* Base platform */}
      <rect x="4" y="36" width="24" height="2" fill="#777" />
      <rect x="2" y="38" width="28" height="2" fill="#666" />
    </svg>
  );
}
