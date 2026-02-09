/**
 * Zone building sprites - permanent architectural structures that appear
 * on zone tiles to make districts look like actual city areas.
 * These are NOT player-constructed buildings, they're the district architecture.
 */

interface ZoneBuildingProps {
  variant?: number; // Different building styles within same zone
}

// ==================== WORKER DISTRICT BUILDINGS ====================

export function WorkerHouseSprite({ variant = 0 }: ZoneBuildingProps) {
  if (variant === 1) return <WorkerHouse2 />;
  if (variant === 2) return <WorkerWorkshop />;
  if (variant === 3) return <WorkerBarracks />;
  return <WorkerHouse1 />;
}

function WorkerHouse1() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Roof */}
      <rect x="20" y="4" width="4" height="2" fill="#5d4037" />
      <rect x="16" y="6" width="12" height="2" fill="#6d4c41" />
      <rect x="12" y="8" width="20" height="2" fill="#795548" />
      <rect x="10" y="10" width="24" height="2" fill="#8d6e63" />
      {/* Walls */}
      <rect x="12" y="12" width="20" height="18" fill="#b0bec5" />
      <rect x="12" y="12" width="1" height="18" fill="#90a4ae" />
      <rect x="31" y="12" width="1" height="18" fill="#78909c" />
      {/* Windows - warm glow */}
      <rect x="15" y="16" width="4" height="4" fill="#263238" />
      <rect x="16" y="17" width="2" height="2" fill="#ffb74d" className="animate-lantern-flicker" />
      <rect x="25" y="16" width="4" height="4" fill="#263238" />
      <rect x="26" y="17" width="2" height="2" fill="#ffb74d" className="animate-lantern-flicker" />
      {/* Door */}
      <rect x="20" y="24" width="4" height="6" fill="#4e342e" />
      <rect x="23" y="27" width="1" height="1" fill="#ffd54f" />
      {/* Foundation */}
      <rect x="10" y="30" width="24" height="2" fill="#546e7a" />
      {/* Chimney */}
      <rect x="14" y="2" width="3" height="6" fill="#546e7a" />
      <rect x="14" y="1" width="3" height="1" fill="#607d8b" />
      {/* Smoke */}
      <rect x="15" y="0" width="1" height="1" fill="#9e9e9e" opacity="0.4" className="animate-smoke-rise" />
      {/* Lantern by door */}
      <rect x="18" y="22" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
    </svg>
  );
}

function WorkerHouse2() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Flat roof */}
      <rect x="10" y="8" width="24" height="2" fill="#546e7a" />
      <rect x="10" y="8" width="24" height="1" fill="#607d8b" />
      {/* Walls - brick tone */}
      <rect x="10" y="10" width="24" height="20" fill="#8d6e63" />
      {/* Brick lines */}
      <rect x="10" y="14" width="24" height="1" fill="#795548" />
      <rect x="10" y="18" width="24" height="1" fill="#795548" />
      <rect x="10" y="22" width="24" height="1" fill="#795548" />
      <rect x="10" y="26" width="24" height="1" fill="#795548" />
      <rect x="22" y="10" width="1" height="4" fill="#795548" />
      <rect x="16" y="14" width="1" height="4" fill="#795548" />
      <rect x="28" y="14" width="1" height="4" fill="#795548" />
      {/* Windows */}
      <rect x="13" y="12" width="4" height="4" fill="#263238" />
      <rect x="14" y="13" width="2" height="2" fill="#ffcc80" className="animate-lantern-flicker" />
      <rect x="27" y="12" width="4" height="4" fill="#263238" />
      <rect x="28" y="13" width="2" height="2" fill="#ffcc80" className="animate-lantern-flicker" />
      {/* Big window */}
      <rect x="19" y="12" width="6" height="5" fill="#263238" />
      <rect x="20" y="13" width="4" height="3" fill="#90caf9" />
      <rect x="22" y="13" width="1" height="3" fill="#263238" />
      {/* Door */}
      <rect x="19" y="24" width="6" height="6" fill="#3e2723" />
      <rect x="20" y="25" width="4" height="4" fill="#4e342e" />
      <rect x="24" y="27" width="1" height="1" fill="#ffd54f" />
      {/* Steps */}
      <rect x="17" y="30" width="10" height="2" fill="#757575" />
      {/* Foundation */}
      <rect x="8" y="30" width="28" height="2" fill="#616161" />
    </svg>
  );
}

function WorkerWorkshop() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Sloped roof */}
      <rect x="8" y="6" width="28" height="2" fill="#455a64" />
      <rect x="10" y="4" width="24" height="2" fill="#546e7a" />
      <rect x="14" y="2" width="16" height="2" fill="#607d8b" />
      {/* Walls */}
      <rect x="8" y="8" width="28" height="22" fill="#78909c" />
      <rect x="8" y="8" width="1" height="22" fill="#607d8b" />
      <rect x="35" y="8" width="1" height="22" fill="#546e7a" />
      {/* Workshop sign */}
      <rect x="16" y="9" width="12" height="4" fill="#5d4037" />
      <rect x="17" y="10" width="10" height="2" fill="#8d6e63" />
      {/* Anvil icon on sign */}
      <rect x="20" y="10" width="4" height="1" fill="#424242" />
      <rect x="21" y="11" width="2" height="1" fill="#616161" />
      {/* Large workshop door */}
      <rect x="14" y="16" width="16" height="14" fill="#3e2723" />
      <rect x="15" y="17" width="14" height="12" fill="#4e342e" />
      <rect x="22" y="17" width="1" height="12" fill="#3e2723" />
      {/* Window in door */}
      <rect x="17" y="19" width="4" height="3" fill="#263238" />
      <rect x="18" y="20" width="2" height="1" fill="#ff8f00" className="animate-lantern-flicker" />
      {/* Tools by door */}
      <rect x="10" y="24" width="2" height="6" fill="#757575" />
      <rect x="9" y="23" width="4" height="2" fill="#9e9e9e" />
      {/* Foundation */}
      <rect x="6" y="30" width="32" height="2" fill="#455a64" />
    </svg>
  );
}

function WorkerBarracks() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Long flat roof */}
      <rect x="6" y="8" width="32" height="2" fill="#546e7a" />
      {/* Walls */}
      <rect x="6" y="10" width="32" height="20" fill="#78909c" />
      {/* Multiple windows in a row */}
      <rect x="9" y="14" width="3" height="3" fill="#263238" />
      <rect x="10" y="15" width="1" height="1" fill="#ffe082" className="animate-lantern-flicker" />
      <rect x="15" y="14" width="3" height="3" fill="#263238" />
      <rect x="16" y="15" width="1" height="1" fill="#ffe082" className="animate-lantern-flicker" />
      <rect x="21" y="14" width="3" height="3" fill="#263238" />
      <rect x="26" y="14" width="3" height="3" fill="#263238" />
      <rect x="27" y="15" width="1" height="1" fill="#ffe082" className="animate-lantern-flicker" />
      <rect x="32" y="14" width="3" height="3" fill="#263238" />
      <rect x="33" y="15" width="1" height="1" fill="#ffe082" className="animate-lantern-flicker" />
      {/* Doors */}
      <rect x="12" y="22" width="4" height="8" fill="#4e342e" />
      <rect x="28" y="22" width="4" height="8" fill="#4e342e" />
      {/* Fence posts */}
      <rect x="8" y="28" width="1" height="4" fill="#5d4037" />
      <rect x="20" y="28" width="1" height="4" fill="#5d4037" />
      <rect x="36" y="28" width="1" height="4" fill="#5d4037" />
      {/* Foundation */}
      <rect x="4" y="30" width="36" height="2" fill="#455a64" />
      {/* Blue worker banner */}
      <rect x="22" y="6" width="1" height="6" fill="#5d4037" />
      <rect x="23" y="6" width="4" height="3" fill="#1565c0" />
    </svg>
  );
}

// ==================== MERCHANT DISTRICT BUILDINGS ====================

export function MerchantShopSprite({ variant = 0 }: ZoneBuildingProps) {
  if (variant === 1) return <MerchantShop2 />;
  if (variant === 2) return <MerchantTavern />;
  if (variant === 3) return <MerchantWarehouse />;
  return <MerchantShop1 />;
}

function MerchantShop1() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Awning top */}
      <rect x="8" y="8" width="28" height="2" fill="#7b1fa2" />
      <rect x="8" y="10" width="4" height="2" fill="#9c27b0" />
      <rect x="12" y="10" width="4" height="2" fill="#e1bee7" />
      <rect x="16" y="10" width="4" height="2" fill="#9c27b0" />
      <rect x="20" y="10" width="4" height="2" fill="#e1bee7" />
      <rect x="24" y="10" width="4" height="2" fill="#9c27b0" />
      <rect x="28" y="10" width="4" height="2" fill="#e1bee7" />
      <rect x="32" y="10" width="4" height="2" fill="#9c27b0" />
      {/* Walls - warm plaster */}
      <rect x="10" y="12" width="24" height="18" fill="#ffe0b2" />
      <rect x="10" y="12" width="1" height="18" fill="#ffcc80" />
      <rect x="33" y="12" width="1" height="18" fill="#ffb74d" />
      {/* Display window with goods */}
      <rect x="13" y="15" width="8" height="6" fill="#4e342e" />
      <rect x="14" y="16" width="2" height="2" fill="#f44336" />
      <rect x="17" y="16" width="2" height="2" fill="#4caf50" />
      <rect x="14" y="19" width="2" height="1" fill="#2196f3" />
      <rect x="17" y="19" width="2" height="1" fill="#ff9800" />
      {/* Door */}
      <rect x="24" y="18" width="6" height="12" fill="#5d4037" />
      <rect x="25" y="19" width="4" height="10" fill="#6d4c41" />
      <rect x="28" y="24" width="1" height="1" fill="#ffd54f" />
      {/* Hanging sign */}
      <rect x="30" y="10" width="1" height="4" fill="#5d4037" />
      <rect x="31" y="12" width="5" height="4" fill="#8d6e63" />
      <rect x="32" y="13" width="3" height="2" fill="#d7ccc8" />
      {/* Lantern */}
      <rect x="8" y="14" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
      {/* Gold coins on counter */}
      <rect x="14" y="22" width="6" height="2" fill="#5d4037" />
      <rect x="15" y="21" width="1" height="1" fill="#ffd54f" />
      <rect x="17" y="21" width="1" height="1" fill="#ffd54f" />
      {/* Foundation */}
      <rect x="8" y="30" width="28" height="2" fill="#8d6e63" />
    </svg>
  );
}

function MerchantShop2() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Peaked roof with purple */}
      <rect x="18" y="2" width="8" height="2" fill="#4a148c" />
      <rect x="14" y="4" width="16" height="2" fill="#6a1b9a" />
      <rect x="10" y="6" width="24" height="2" fill="#7b1fa2" />
      <rect x="8" y="8" width="28" height="2" fill="#8e24aa" />
      {/* Walls */}
      <rect x="10" y="10" width="24" height="20" fill="#efebe9" />
      <rect x="10" y="10" width="1" height="20" fill="#d7ccc8" />
      <rect x="33" y="10" width="1" height="20" fill="#bcaaa4" />
      {/* Large display window */}
      <rect x="13" y="13" width="18" height="8" fill="#3e2723" />
      <rect x="14" y="14" width="7" height="6" fill="#4e342e" />
      <rect x="23" y="14" width="7" height="6" fill="#4e342e" />
      {/* Goods */}
      <rect x="15" y="16" width="2" height="3" fill="#e91e63" />
      <rect x="18" y="17" width="2" height="2" fill="#00bcd4" />
      <rect x="24" y="16" width="2" height="3" fill="#ff9800" />
      <rect x="27" y="17" width="2" height="2" fill="#8bc34a" />
      {/* Door */}
      <rect x="18" y="24" width="8" height="6" fill="#5d4037" />
      <rect x="19" y="25" width="6" height="4" fill="#6d4c41" />
      <rect x="22" y="25" width="1" height="4" fill="#5d4037" />
      {/* Welcome mat */}
      <rect x="17" y="30" width="10" height="1" fill="#8d6e63" />
      {/* Hanging lanterns */}
      <rect x="12" y="10" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
      <rect x="30" y="10" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
      {/* Foundation */}
      <rect x="8" y="30" width="28" height="2" fill="#795548" />
    </svg>
  );
}

function MerchantTavern() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Roof */}
      <rect x="8" y="4" width="28" height="2" fill="#5d4037" />
      <rect x="10" y="2" width="24" height="2" fill="#6d4c41" />
      <rect x="14" y="0" width="16" height="2" fill="#795548" />
      {/* Walls */}
      <rect x="8" y="6" width="28" height="24" fill="#a1887f" />
      <rect x="8" y="6" width="1" height="24" fill="#8d6e63" />
      <rect x="35" y="6" width="1" height="24" fill="#795548" />
      {/* Timber frames */}
      <rect x="8" y="14" width="28" height="1" fill="#5d4037" />
      <rect x="22" y="6" width="1" height="24" fill="#5d4037" />
      {/* Tavern sign */}
      <rect x="16" y="7" width="5" height="4" fill="#4e342e" />
      <rect x="17" y="8" width="3" height="2" fill="#ff8f00" />
      {/* Mug icon */}
      <rect x="18" y="8" width="1" height="1" fill="#fff" />
      {/* Windows with warm glow */}
      <rect x="11" y="8" width="4" height="4" fill="#263238" />
      <rect x="12" y="9" width="2" height="2" fill="#ffb74d" className="animate-lantern-flicker" />
      <rect x="29" y="8" width="4" height="4" fill="#263238" />
      <rect x="30" y="9" width="2" height="2" fill="#ffb74d" className="animate-lantern-flicker" />
      <rect x="11" y="16" width="4" height="4" fill="#263238" />
      <rect x="12" y="17" width="2" height="2" fill="#ffb74d" className="animate-lantern-flicker" />
      <rect x="29" y="16" width="4" height="4" fill="#263238" />
      <rect x="30" y="17" width="2" height="2" fill="#ffb74d" className="animate-lantern-flicker" />
      {/* Double door */}
      <rect x="16" y="20" width="10" height="10" fill="#4e342e" />
      <rect x="17" y="21" width="4" height="8" fill="#5d4037" />
      <rect x="22" y="21" width="4" height="8" fill="#5d4037" />
      <rect x="21" y="21" width="1" height="8" fill="#3e2723" />
      {/* Door handles */}
      <rect x="20" y="25" width="1" height="1" fill="#ffd54f" />
      <rect x="22" y="25" width="1" height="1" fill="#ffd54f" />
      {/* Barrel by door */}
      <rect x="28" y="24" width="4" height="6" fill="#6d4c41" />
      <rect x="28" y="26" width="4" height="1" fill="#5d4037" />
      {/* Foundation */}
      <rect x="6" y="30" width="32" height="2" fill="#5d4037" />
    </svg>
  );
}

function MerchantWarehouse() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Flat roof */}
      <rect x="6" y="6" width="32" height="2" fill="#6d4c41" />
      {/* Walls - stone */}
      <rect x="6" y="8" width="32" height="22" fill="#a1887f" />
      <rect x="6" y="8" width="1" height="22" fill="#8d6e63" />
      <rect x="37" y="8" width="1" height="22" fill="#795548" />
      {/* Stone lines */}
      <rect x="6" y="14" width="32" height="1" fill="#8d6e63" />
      <rect x="6" y="20" width="32" height="1" fill="#8d6e63" />
      {/* Large cargo doors */}
      <rect x="10" y="14" width="10" height="16" fill="#4e342e" />
      <rect x="11" y="15" width="8" height="14" fill="#5d4037" />
      <rect x="15" y="15" width="1" height="14" fill="#4e342e" />
      {/* Small windows */}
      <rect x="26" y="10" width="4" height="3" fill="#263238" />
      <rect x="32" y="10" width="4" height="3" fill="#263238" />
      {/* Crates and boxes */}
      <rect x="24" y="22" width="6" height="6" fill="#bcaaa4" />
      <rect x="25" y="23" width="4" height="4" fill="#d7ccc8" />
      <rect x="27" y="23" width="1" height="4" fill="#a1887f" />
      <rect x="31" y="24" width="5" height="5" fill="#8d6e63" />
      <rect x="32" y="25" width="3" height="3" fill="#a1887f" />
      {/* Loading sign */}
      <rect x="24" y="8" width="8" height="3" fill="#5d4037" />
      <rect x="25" y="9" width="6" height="1" fill="#d7ccc8" />
      {/* Foundation */}
      <rect x="4" y="30" width="36" height="2" fill="#6d4c41" />
    </svg>
  );
}

// ==================== GOVERNMENT BUILDINGS ====================

export function GovernmentBuildingSprite({ variant = 0 }: ZoneBuildingProps) {
  if (variant === 1) return <GovernmentHall />;
  if (variant === 2) return <GovernmentTower />;
  if (variant === 3) return <GovernmentArchive />;
  return <GovernmentMain />;
}

function GovernmentMain() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Flag on top */}
      <rect x="21" y="0" width="1" height="6" fill="#bdbdbd" />
      <rect x="22" y="0" width="5" height="3" fill="#ffd54f" />
      <rect x="22" y="1" width="3" height="1" fill="#ffb300" />
      {/* Dome */}
      <rect x="16" y="4" width="12" height="2" fill="#ffd54f" />
      <rect x="14" y="6" width="16" height="2" fill="#ffb300" />
      {/* Columns front */}
      <rect x="10" y="8" width="24" height="2" fill="#e0e0e0" />
      <rect x="12" y="10" width="2" height="18" fill="#e0e0e0" />
      <rect x="18" y="10" width="2" height="18" fill="#e0e0e0" />
      <rect x="24" y="10" width="2" height="18" fill="#e0e0e0" />
      <rect x="30" y="10" width="2" height="18" fill="#e0e0e0" />
      {/* Wall behind columns */}
      <rect x="14" y="10" width="16" height="20" fill="#d7ccc8" />
      {/* Grand entrance */}
      <rect x="18" y="20" width="8" height="10" fill="#3e2723" />
      <rect x="19" y="20" width="6" height="1" fill="#ffd54f" />
      <rect x="22" y="21" width="1" height="9" fill="#4e342e" />
      {/* Upper window */}
      <rect x="20" y="13" width="4" height="4" fill="#263238" />
      <rect x="21" y="14" width="2" height="2" fill="#90caf9" />
      {/* Steps */}
      <rect x="8" y="28" width="28" height="2" fill="#bdbdbd" />
      <rect x="6" y="30" width="32" height="2" fill="#9e9e9e" />
      {/* Lanterns at entrance */}
      <rect x="16" y="18" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
      <rect x="26" y="18" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
    </svg>
  );
}

function GovernmentHall() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Spire */}
      <rect x="21" y="0" width="2" height="4" fill="#ffd54f" />
      {/* Tall peaked roof */}
      <rect x="18" y="4" width="8" height="2" fill="#795548" />
      <rect x="14" y="6" width="16" height="2" fill="#8d6e63" />
      <rect x="10" y="8" width="24" height="2" fill="#a1887f" />
      {/* Clock */}
      <rect x="19" y="5" width="6" height="3" fill="#eeeeee" />
      <rect x="21" y="6" width="2" height="1" fill="#333" />
      <rect x="22" y="5" width="1" height="2" fill="#333" />
      {/* Walls */}
      <rect x="10" y="10" width="24" height="20" fill="#efebe9" />
      <rect x="10" y="10" width="1" height="20" fill="#d7ccc8" />
      <rect x="33" y="10" width="1" height="20" fill="#bcaaa4" />
      {/* Windows */}
      <rect x="13" y="13" width="4" height="5" fill="#263238" />
      <rect x="14" y="14" width="2" height="3" fill="#90caf9" />
      <rect x="27" y="13" width="4" height="5" fill="#263238" />
      <rect x="28" y="14" width="2" height="3" fill="#90caf9" />
      {/* Grand window */}
      <rect x="18" y="12" width="8" height="6" fill="#263238" />
      <rect x="19" y="13" width="6" height="4" fill="#64b5f6" />
      <rect x="22" y="13" width="1" height="4" fill="#263238" />
      {/* Door */}
      <rect x="19" y="22" width="6" height="8" fill="#5d4037" />
      <rect x="20" y="23" width="4" height="6" fill="#6d4c41" />
      <rect x="22" y="23" width="1" height="6" fill="#5d4037" />
      {/* Foundation */}
      <rect x="8" y="30" width="28" height="2" fill="#9e9e9e" />
    </svg>
  );
}

function GovernmentTower() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Tower spire */}
      <rect x="20" y="0" width="4" height="2" fill="#ffd54f" />
      <rect x="18" y="2" width="8" height="2" fill="#8d6e63" />
      <rect x="16" y="4" width="12" height="2" fill="#a1887f" />
      {/* Battlements */}
      <rect x="14" y="6" width="2" height="2" fill="#9e9e9e" />
      <rect x="18" y="6" width="2" height="2" fill="#9e9e9e" />
      <rect x="22" y="6" width="2" height="2" fill="#9e9e9e" />
      <rect x="26" y="6" width="2" height="2" fill="#9e9e9e" />
      <rect x="30" y="6" width="2" height="2" fill="#9e9e9e" />
      {/* Tower body */}
      <rect x="14" y="8" width="16" height="22" fill="#bdbdbd" />
      <rect x="14" y="8" width="1" height="22" fill="#9e9e9e" />
      <rect x="29" y="8" width="1" height="22" fill="#757575" />
      {/* Windows */}
      <rect x="18" y="10" width="3" height="4" fill="#263238" />
      <rect x="23" y="10" width="3" height="4" fill="#263238" />
      <rect x="20" y="18" width="4" height="4" fill="#263238" />
      <rect x="21" y="19" width="2" height="2" fill="#ff8f00" className="animate-lantern-flicker" />
      {/* Arrow slits */}
      <rect x="16" y="14" width="1" height="3" fill="#263238" />
      <rect x="27" y="14" width="1" height="3" fill="#263238" />
      {/* Guard banner */}
      <rect x="32" y="8" width="1" height="8" fill="#8d6e63" />
      <rect x="33" y="8" width="4" height="4" fill="#c62828" />
      <rect x="34" y="9" width="2" height="2" fill="#ffd54f" />
      {/* Base entrance */}
      <rect x="18" y="24" width="8" height="6" fill="#424242" />
      <rect x="19" y="25" width="6" height="4" fill="#333" />
      {/* Foundation */}
      <rect x="12" y="30" width="20" height="2" fill="#757575" />
    </svg>
  );
}

function GovernmentArchive() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Flat roof with parapet */}
      <rect x="8" y="6" width="28" height="2" fill="#9e9e9e" />
      <rect x="8" y="4" width="4" height="2" fill="#bdbdbd" />
      <rect x="16" y="4" width="4" height="2" fill="#bdbdbd" />
      <rect x="24" y="4" width="4" height="2" fill="#bdbdbd" />
      <rect x="32" y="4" width="4" height="2" fill="#bdbdbd" />
      {/* Walls */}
      <rect x="8" y="8" width="28" height="22" fill="#e0e0e0" />
      <rect x="8" y="8" width="1" height="22" fill="#bdbdbd" />
      <rect x="35" y="8" width="1" height="22" fill="#9e9e9e" />
      {/* Arched windows */}
      <rect x="11" y="10" width="4" height="6" fill="#263238" />
      <rect x="12" y="9" width="2" height="1" fill="#263238" />
      <rect x="12" y="11" width="2" height="4" fill="#90caf9" />
      <rect x="19" y="10" width="4" height="6" fill="#263238" />
      <rect x="20" y="9" width="2" height="1" fill="#263238" />
      <rect x="20" y="11" width="2" height="4" fill="#90caf9" />
      <rect x="27" y="10" width="4" height="6" fill="#263238" />
      <rect x="28" y="9" width="2" height="1" fill="#263238" />
      <rect x="28" y="11" width="2" height="4" fill="#90caf9" />
      {/* Door */}
      <rect x="18" y="22" width="8" height="8" fill="#5d4037" />
      <rect x="19" y="23" width="6" height="6" fill="#6d4c41" />
      {/* Scroll/book icon above door */}
      <rect x="20" y="19" width="4" height="2" fill="#ffd54f" />
      {/* Foundation */}
      <rect x="6" y="30" width="32" height="2" fill="#757575" />
    </svg>
  );
}
