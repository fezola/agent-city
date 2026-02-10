import { DecoType } from './cityGridData';

interface EnvironmentSpriteProps {
  type: DecoType;
}

export function EnvironmentSprite({ type }: EnvironmentSpriteProps) {
  switch (type) {
    case 'tree': return <TreeSprite />;
    case 'lantern': return <LanternSprite />;
    case 'barrel': return <BarrelSprite />;
    case 'crate': return <CrateSprite />;
    case 'bush': return <BushSprite />;
    case 'flower': return <FlowerSprite />;
    case 'coral': return <CoralSprite />;
    case 'well': return <WellSprite />;
    case 'sign': return <SignSprite />;
    case 'torch': return <TorchSprite />;
    case 'bench': return <BenchSprite />;
    case 'cart': return <CartSprite />;
    case 'flag': return <FlagSprite />;
    case 'mushroom': return <MushroomSprite />;
    case 'rock': return <RockSprite />;
    case 'campfire': return <CampfireSprite />;
    default: return null;
  }
}

function TreeSprite() {
  return (
    <svg width="28" height="36" viewBox="0 0 14 18" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Trunk */}
      <rect x="6" y="12" width="2" height="6" fill="#8b4513" />
      {/* Canopy layers */}
      <rect x="5" y="10" width="4" height="2" fill="#2e7d32" />
      <rect x="3" y="8" width="8" height="2" fill="#388e3c" />
      <rect x="2" y="6" width="10" height="2" fill="#43a047" />
      <rect x="3" y="4" width="8" height="2" fill="#388e3c" />
      <rect x="4" y="2" width="6" height="2" fill="#2e7d32" />
      <rect x="5" y="0" width="4" height="2" fill="#1b5e20" />
    </svg>
  );
}

function LanternSprite() {
  return (
    <svg width="16" height="32" viewBox="0 0 8 16" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Post */}
      <rect x="3" y="6" width="2" height="10" fill="#5d4037" />
      {/* Arm */}
      <rect x="4" y="4" width="3" height="1" fill="#5d4037" />
      {/* Lantern body */}
      <rect x="5" y="2" width="3" height="4" fill="#4e342e" />
      {/* Glow */}
      <rect x="6" y="3" width="1" height="2" fill="#ffab40" className="animate-lantern-flicker" />
      {/* Hook */}
      <rect x="6" y="1" width="1" height="1" fill="#5d4037" />
    </svg>
  );
}

function BarrelSprite() {
  return (
    <svg width="18" height="20" viewBox="0 0 9 10" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="1" width="5" height="8" fill="#8d6e63" />
      <rect x="1" y="2" width="7" height="6" fill="#a1887f" />
      <rect x="1" y="3" width="7" height="1" fill="#6d4c41" />
      <rect x="1" y="6" width="7" height="1" fill="#6d4c41" />
      <rect x="3" y="0" width="3" height="1" fill="#8d6e63" />
      <rect x="3" y="9" width="3" height="1" fill="#8d6e63" />
    </svg>
  );
}

function CrateSprite() {
  return (
    <svg width="18" height="18" viewBox="0 0 9 9" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="9" height="9" fill="#a1887f" />
      <rect x="1" y="1" width="7" height="7" fill="#bcaaa4" />
      {/* Cross pattern */}
      <rect x="4" y="1" width="1" height="7" fill="#8d6e63" />
      <rect x="1" y="4" width="7" height="1" fill="#8d6e63" />
      {/* Nails */}
      <rect x="1" y="1" width="1" height="1" fill="#ffd54f" />
      <rect x="7" y="1" width="1" height="1" fill="#ffd54f" />
      <rect x="1" y="7" width="1" height="1" fill="#ffd54f" />
      <rect x="7" y="7" width="1" height="1" fill="#ffd54f" />
    </svg>
  );
}

function BushSprite() {
  return (
    <svg width="20" height="14" viewBox="0 0 10 7" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="3" width="6" height="4" fill="#2e7d32" />
      <rect x="1" y="4" width="8" height="2" fill="#388e3c" />
      <rect x="3" y="2" width="4" height="1" fill="#43a047" />
      <rect x="0" y="5" width="10" height="2" fill="#1b5e20" />
      {/* Small berries */}
      <rect x="3" y="4" width="1" height="1" fill="#e53935" />
      <rect x="6" y="3" width="1" height="1" fill="#e53935" />
    </svg>
  );
}

function FlowerSprite() {
  return (
    <svg width="12" height="16" viewBox="0 0 6 8" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Stem */}
      <rect x="2" y="4" width="1" height="4" fill="#388e3c" />
      {/* Leaf */}
      <rect x="3" y="5" width="2" height="1" fill="#43a047" />
      {/* Petals */}
      <rect x="2" y="1" width="1" height="1" fill="#f48fb1" />
      <rect x="1" y="2" width="1" height="1" fill="#f48fb1" />
      <rect x="3" y="2" width="1" height="1" fill="#f48fb1" />
      <rect x="2" y="3" width="1" height="1" fill="#f48fb1" />
      {/* Center */}
      <rect x="2" y="2" width="1" height="1" fill="#ffeb3b" />
    </svg>
  );
}

function CoralSprite() {
  return (
    <svg width="18" height="16" viewBox="0 0 9 8" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="5" width="1" height="3" fill="#e040fb" />
      <rect x="3" y="3" width="3" height="2" fill="#ce93d8" />
      <rect x="2" y="1" width="2" height="2" fill="#ab47bc" />
      <rect x="5" y="2" width="2" height="2" fill="#ba68c8" />
      <rect x="1" y="0" width="1" height="2" fill="#7b1fa2" />
      <rect x="7" y="1" width="1" height="2" fill="#9c27b0" />
      {/* Glow */}
      <rect x="3" y="2" width="1" height="1" fill="#e1bee7" className="animate-pulse" />
    </svg>
  );
}

function WellSprite() {
  return (
    <svg width="22" height="24" viewBox="0 0 11 12" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Roof */}
      <rect x="4" y="0" width="3" height="1" fill="#5d4037" />
      <rect x="3" y="1" width="5" height="1" fill="#6d4c41" />
      {/* Supports */}
      <rect x="2" y="2" width="1" height="5" fill="#5d4037" />
      <rect x="8" y="2" width="1" height="5" fill="#5d4037" />
      {/* Bucket rope */}
      <rect x="5" y="2" width="1" height="3" fill="#8d6e63" />
      {/* Well body */}
      <rect x="1" y="7" width="9" height="3" fill="#9e9e9e" />
      <rect x="2" y="7" width="7" height="1" fill="#bdbdbd" />
      {/* Water inside */}
      <rect x="3" y="8" width="5" height="1" fill="#42a5f5" />
      {/* Base */}
      <rect x="0" y="10" width="11" height="2" fill="#757575" />
    </svg>
  );
}

function SignSprite() {
  return (
    <svg width="18" height="22" viewBox="0 0 9 11" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Post */}
      <rect x="1" y="4" width="1" height="7" fill="#5d4037" />
      {/* Sign board */}
      <rect x="2" y="1" width="6" height="5" fill="#a1887f" />
      <rect x="3" y="2" width="4" height="3" fill="#d7ccc8" />
      {/* Text marks */}
      <rect x="3" y="2" width="3" height="1" fill="#5d4037" />
      <rect x="3" y="4" width="2" height="1" fill="#5d4037" />
      {/* Arrow */}
      <rect x="6" y="3" width="2" height="1" fill="#e040fb" />
    </svg>
  );
}

function TorchSprite() {
  return (
    <svg width="10" height="24" viewBox="0 0 5 12" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Pole */}
      <rect x="2" y="5" width="1" height="7" fill="#5d4037" />
      {/* Torch head */}
      <rect x="1" y="4" width="3" height="2" fill="#4e342e" />
      {/* Flame */}
      <rect x="1" y="2" width="3" height="2" fill="#ff6d00" className="animate-lantern-flicker" />
      <rect x="2" y="1" width="1" height="1" fill="#ffab40" className="animate-lantern-flicker" />
      <rect x="2" y="0" width="1" height="1" fill="#fff176" />
    </svg>
  );
}

function BenchSprite() {
  return (
    <svg width="22" height="14" viewBox="0 0 11 7" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Seat */}
      <rect x="1" y="2" width="9" height="2" fill="#8d6e63" />
      <rect x="1" y="2" width="9" height="1" fill="#a1887f" />
      {/* Legs */}
      <rect x="1" y="4" width="1" height="3" fill="#5d4037" />
      <rect x="9" y="4" width="1" height="3" fill="#5d4037" />
      {/* Back */}
      <rect x="1" y="0" width="9" height="1" fill="#6d4c41" />
      <rect x="1" y="1" width="1" height="1" fill="#5d4037" />
      <rect x="9" y="1" width="1" height="1" fill="#5d4037" />
    </svg>
  );
}

function CartSprite() {
  return (
    <svg width="24" height="20" viewBox="0 0 12 10" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Cart body */}
      <rect x="2" y="2" width="8" height="4" fill="#8d6e63" />
      <rect x="2" y="2" width="8" height="1" fill="#a1887f" />
      {/* Goods */}
      <rect x="3" y="1" width="2" height="1" fill="#f44336" />
      <rect x="6" y="1" width="2" height="1" fill="#4caf50" />
      <rect x="5" y="0" width="2" height="1" fill="#ffeb3b" />
      {/* Wheels */}
      <rect x="3" y="6" width="2" height="2" fill="#5d4037" />
      <rect x="7" y="6" width="2" height="2" fill="#5d4037" />
      <rect x="3" y="7" width="1" height="1" fill="#4e342e" />
      <rect x="8" y="7" width="1" height="1" fill="#4e342e" />
      {/* Handle */}
      <rect x="0" y="4" width="2" height="1" fill="#6d4c41" />
      <rect x="0" y="5" width="1" height="2" fill="#6d4c41" />
    </svg>
  );
}

function FlagSprite() {
  return (
    <svg width="14" height="28" viewBox="0 0 7 14" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Pole */}
      <rect x="1" y="0" width="1" height="14" fill="#bdbdbd" />
      {/* Flag */}
      <rect x="2" y="1" width="4" height="4" fill="#7b1fa2" />
      <rect x="2" y="1" width="4" height="1" fill="#9c27b0" />
      {/* Emblem */}
      <rect x="3" y="2" width="2" height="2" fill="#ffd700" />
      {/* Finial */}
      <rect x="0" y="0" width="3" height="1" fill="#ffd700" />
    </svg>
  );
}

function MushroomSprite() {
  return (
    <svg width="14" height="14" viewBox="0 0 7 7" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Stem */}
      <rect x="3" y="4" width="1" height="3" fill="#efebe9" />
      {/* Cap */}
      <rect x="1" y="2" width="5" height="2" fill="#e53935" />
      <rect x="2" y="1" width="3" height="1" fill="#c62828" />
      {/* Spots */}
      <rect x="2" y="2" width="1" height="1" fill="#fff" />
      <rect x="4" y="3" width="1" height="1" fill="#fff" />
    </svg>
  );
}

function RockSprite() {
  return (
    <svg width="18" height="12" viewBox="0 0 9 6" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="2" width="5" height="4" fill="#757575" />
      <rect x="1" y="3" width="7" height="2" fill="#9e9e9e" />
      <rect x="3" y="1" width="3" height="1" fill="#bdbdbd" />
      <rect x="3" y="2" width="2" height="1" fill="#bdbdbd" />
    </svg>
  );
}

function CampfireSprite() {
  return (
    <svg width="18" height="18" viewBox="0 0 9 9" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Logs */}
      <rect x="1" y="6" width="7" height="2" fill="#5d4037" />
      <rect x="2" y="5" width="5" height="1" fill="#6d4c41" />
      {/* Stones */}
      <rect x="0" y="7" width="2" height="2" fill="#757575" />
      <rect x="7" y="7" width="2" height="2" fill="#757575" />
      {/* Fire */}
      <rect x="3" y="3" width="3" height="3" fill="#ff6d00" className="animate-lantern-flicker" />
      <rect x="4" y="2" width="1" height="1" fill="#ffab40" className="animate-lantern-flicker" />
      <rect x="3" y="1" width="2" height="1" fill="#fff176" />
      {/* Sparks */}
      <rect x="2" y="0" width="1" height="1" fill="#ffd54f" className="animate-sparkle" />
      <rect x="6" y="1" width="1" height="1" fill="#ffd54f" className="animate-sparkle" />
    </svg>
  );
}
