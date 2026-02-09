// City grid layout constants and agent slot assignments

export type CellType = 'grass' | 'road' | 'government' | 'worker' | 'merchant' | 'park' | 'water' | 'plaza';

export interface GridCell {
  row: number;
  col: number;
  type: CellType;
}

// Decoration types for environmental sprites
export type DecoType = 'tree' | 'lantern' | 'barrel' | 'crate' | 'bush' | 'flower' | 'coral' | 'well' | 'sign' | 'torch' | 'bench' | 'cart' | 'flag' | 'mushroom' | 'rock' | 'campfire';

export interface DecoPlacement {
  row: number;
  col: number;
  type: DecoType;
}

// 16x12 grid layout — Expanded RPG pixel-art town
// G=Government  W=Worker  M=Merchant  R=Road  P=Park  ~=Water  .=Grass  X=Plaza
const GRID_TEMPLATE: string[][] = [
  ['.', '.', '.', '.', '.', 'G', 'G', 'G', 'G', 'G', 'G', '.', '.', '.', '.', '.'],
  ['.', '.', '.', '.', 'R', 'G', 'G', 'G', 'G', 'G', 'G', 'R', '.', '.', '.', '.'],
  ['.', '.', 'W', 'W', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'M', 'M', '.', '.'],
  ['.', '.', 'W', 'W', 'R', '.', '.', '.', '.', '.', '.', 'R', 'M', 'M', '.', '.'],
  ['.', '.', 'W', 'W', 'R', '.', 'X', 'P', 'P', 'X', '.', 'R', 'M', 'M', '.', '.'],
  ['.', '.', 'W', 'W', 'R', '.', 'P', 'P', 'P', 'P', '.', 'R', 'M', 'M', '.', '.'],
  ['.', '.', 'W', 'W', 'R', '.', 'X', 'P', 'P', 'X', '.', 'R', 'M', 'M', '.', '.'],
  ['.', '.', '.', '.', 'R', '.', '.', '.', '.', '.', '.', 'R', '.', '.', '.', '.'],
  ['.', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', '.'],
  ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.'],
  ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
];

export const GRID_ROWS = 12;
export const GRID_COLS = 16;
export const TILE_SIZE = 48; // px — pixel-art RPG feel

const CHAR_TO_TYPE: Record<string, CellType> = {
  '.': 'grass',
  'R': 'road',
  'G': 'government',
  'W': 'worker',
  'M': 'merchant',
  'P': 'park',
  '~': 'water',
  'X': 'plaza',
};

export const GRID_CELLS: GridCell[] = GRID_TEMPLATE.flatMap((row, r) =>
  row.map((char, c) => ({
    row: r,
    col: c,
    type: CHAR_TO_TYPE[char] || 'grass',
  }))
);

// Environmental decorations placed on specific cells
export const DECORATIONS: DecoPlacement[] = [
  // Trees around the edges
  { row: 0, col: 0, type: 'tree' },
  { row: 0, col: 1, type: 'tree' },
  { row: 0, col: 2, type: 'bush' },
  { row: 0, col: 14, type: 'tree' },
  { row: 0, col: 15, type: 'tree' },
  { row: 1, col: 0, type: 'bush' },
  { row: 1, col: 1, type: 'flower' },
  { row: 1, col: 14, type: 'flower' },
  { row: 1, col: 15, type: 'bush' },
  { row: 9, col: 0, type: 'tree' },
  { row: 9, col: 1, type: 'bush' },
  { row: 9, col: 2, type: 'rock' },
  { row: 9, col: 13, type: 'rock' },
  { row: 9, col: 14, type: 'bush' },
  { row: 9, col: 15, type: 'tree' },
  // Lanterns along roads
  { row: 2, col: 5, type: 'lantern' },
  { row: 2, col: 10, type: 'lantern' },
  { row: 8, col: 3, type: 'lantern' },
  { row: 8, col: 12, type: 'lantern' },
  // Barrels and crates in worker/merchant zones  
  { row: 3, col: 5, type: 'barrel' },
  { row: 7, col: 5, type: 'crate' },
  { row: 3, col: 10, type: 'crate' },
  { row: 7, col: 10, type: 'barrel' },
  // Park decorations
  { row: 4, col: 6, type: 'well' },
  { row: 4, col: 9, type: 'bench' },
  { row: 6, col: 6, type: 'bench' },
  { row: 6, col: 9, type: 'campfire' },
  // Torches at government zone
  { row: 0, col: 5, type: 'torch' },
  { row: 0, col: 10, type: 'torch' },
  // Signs near merchant area
  { row: 1, col: 13, type: 'sign' },
  // Mushrooms and flowers near water
  { row: 9, col: 5, type: 'mushroom' },
  { row: 9, col: 6, type: 'flower' },
  { row: 9, col: 9, type: 'flower' },
  { row: 9, col: 10, type: 'mushroom' },
  // Coral in water
  { row: 10, col: 3, type: 'coral' },
  { row: 10, col: 7, type: 'coral' },
  { row: 10, col: 12, type: 'coral' },
  { row: 11, col: 5, type: 'coral' },
  { row: 11, col: 10, type: 'coral' },
  // Extra atmosphere
  { row: 0, col: 3, type: 'rock' },
  { row: 0, col: 12, type: 'rock' },
  { row: 7, col: 0, type: 'tree' },
  { row: 7, col: 15, type: 'tree' },
  { row: 3, col: 0, type: 'tree' },
  { row: 3, col: 15, type: 'tree' },
  { row: 1, col: 2, type: 'flag' },
  { row: 1, col: 13, type: 'flag' },
  // Cart near market
  { row: 3, col: 14, type: 'cart' },
];

// Cell type -> CSS colors (now handled in IsometricTile.tsx with CSS classes)
export const CELL_COLORS: Record<CellType, string> = {
  grass: 'bg-emerald-900',
  road: 'bg-zinc-700',
  government: 'bg-amber-900',
  worker: 'bg-blue-900',
  merchant: 'bg-purple-900',
  park: 'bg-green-800',
  water: 'bg-cyan-900',
  plaza: 'bg-amber-800',
};

export const CELL_BORDERS: Record<CellType, string> = {
  grass: 'border-emerald-700',
  road: 'border-zinc-500',
  government: 'border-amber-600',
  worker: 'border-blue-600',
  merchant: 'border-purple-600',
  park: 'border-green-600',
  water: 'border-cyan-700',
  plaza: 'border-amber-500',
};

// Fixed agent slot assignments: agentName -> [row, col]
export const AGENT_SLOTS: Record<string, [number, number]> = {
  'Governor Marcus': [0, 7],
  'Alice': [3, 2],
  'Bob': [3, 3],
  'Charlie': [4, 2],
  'Diana': [4, 3],
  'Zhao': [3, 12],
  'Kumar': [3, 13],
};

// Building placement cells
export const BUILDING_CELLS: Record<string, [number, number]> = {
  'Governor Marcus': [1, 8],
  'Alice': [5, 2],
  'Bob': [5, 3],
  'Charlie': [6, 2],
  'Diana': [6, 3],
  'Zhao': [5, 12],
  'Kumar': [5, 13],
};

// Zone labels to show on the grid
export const ZONE_LABELS: { row: number; col: number; label: string; color: string }[] = [
  { row: 0, col: 7, label: 'TOWN HALL', color: 'text-amber-400' },
  { row: 2, col: 2, label: 'WORKER QUARTER', color: 'text-blue-400' },
  { row: 2, col: 12, label: 'MARKET DISTRICT', color: 'text-purple-400' },
  { row: 5, col: 7, label: 'TOWN SQUARE', color: 'text-green-400' },
];

// Legend entries for the city map
export const ZONE_LEGEND: { type: CellType; label: string; color: string }[] = [
  { type: 'government', label: 'Government', color: 'bg-amber-700' },
  { type: 'worker', label: 'Workers', color: 'bg-blue-700' },
  { type: 'merchant', label: 'Merchants', color: 'bg-purple-700' },
  { type: 'road', label: 'Roads', color: 'bg-zinc-500' },
  { type: 'park', label: 'Park', color: 'bg-green-700' },
  { type: 'water', label: 'River', color: 'bg-cyan-700' },
];

// Agent role descriptions for the guide
export interface AgentInfo {
  name: string;
  role: string;
  type: 'governor' | 'worker' | 'merchant';
  description: string;
  actions: string[];
  canBuild: string[];
}

export const AGENT_INFO: AgentInfo[] = [
  {
    name: 'Governor Marcus',
    role: 'Governor',
    type: 'governor',
    description: 'Runs the city. Controls taxes, salaries, and fees. Manages the treasury.',
    actions: ['Raise/lower taxes', 'Adjust salaries', 'Change fees', 'Hold steady'],
    canBuild: ['City Gate (+3% health/level)', 'Power Hub (-10% maintenance/level)'],
  },
  {
    name: 'Alice',
    role: 'Worker',
    type: 'worker',
    description: 'Earns salary each day. Can work, protest, negotiate, or leave the city.',
    actions: ['Work (earn salary)', 'Protest (reduce satisfaction)', 'Negotiate', 'Exit city'],
    canBuild: ['Housing (+5% satisfaction/level)', 'Factory (+15 earnings/level)'],
  },
  {
    name: 'Bob',
    role: 'Worker',
    type: 'worker',
    description: 'Earns salary each day. Can work, protest, negotiate, or leave the city.',
    actions: ['Work (earn salary)', 'Protest (reduce satisfaction)', 'Negotiate', 'Exit city'],
    canBuild: ['Housing (+5% satisfaction/level)', 'Factory (+15 earnings/level)'],
  },
  {
    name: 'Charlie',
    role: 'Worker',
    type: 'worker',
    description: 'Earns salary each day. Can work, protest, negotiate, or leave the city.',
    actions: ['Work (earn salary)', 'Protest (reduce satisfaction)', 'Negotiate', 'Exit city'],
    canBuild: ['Housing (+5% satisfaction/level)', 'Factory (+15 earnings/level)'],
  },
  {
    name: 'Diana',
    role: 'Worker',
    type: 'worker',
    description: 'Earns salary each day. Can work, protest, negotiate, or leave the city.',
    actions: ['Work (earn salary)', 'Protest (reduce satisfaction)', 'Negotiate', 'Exit city'],
    canBuild: ['Housing (+5% satisfaction/level)', 'Factory (+15 earnings/level)'],
  },
  {
    name: 'Zhao',
    role: 'Merchant',
    type: 'merchant',
    description: 'Trades goods for profit. Pays participation fees. Sets prices.',
    actions: ['Raise prices', 'Lower prices', 'Stabilize', 'Negotiate'],
    canBuild: ['Market (+10% profit/level)'],
  },
  {
    name: 'Kumar',
    role: 'Merchant',
    type: 'merchant',
    description: 'Trades goods for profit. Pays participation fees. Sets prices.',
    actions: ['Raise prices', 'Lower prices', 'Stabilize', 'Negotiate'],
    canBuild: ['Market (+10% profit/level)'],
  },
];
