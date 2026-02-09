// City grid layout constants and agent slot assignments

export type CellType = 'grass' | 'road' | 'government' | 'worker' | 'merchant' | 'park' | 'water';

export interface GridCell {
  row: number;
  col: number;
  type: CellType;
}

// 14x10 grid layout — RPG pixel-art town
// G=Government  W=Worker  M=Merchant  R=Road  P=Park  ~=Water  .=Grass
const GRID_TEMPLATE: string[][] = [
  ['.', '.', '.', '.', 'G', 'G', 'G', 'G', 'G', 'G', '.', '.', '.', '.'],
  ['.', '.', '.', 'R', 'G', 'G', 'G', 'G', 'G', 'G', 'R', '.', '.', '.'],
  ['.', 'W', 'W', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'M', 'M', '.'],
  ['.', 'W', 'W', 'R', '.', '.', '.', '.', '.', '.', 'R', 'M', 'M', '.'],
  ['.', 'W', 'W', 'R', '.', 'P', 'P', 'P', 'P', '.', 'R', 'M', 'M', '.'],
  ['.', 'W', 'W', 'R', '.', 'P', 'P', 'P', 'P', '.', 'R', 'M', 'M', '.'],
  ['.', '.', '.', 'R', '.', '.', '.', '.', '.', '.', 'R', '.', '.', '.'],
  ['.', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', '.'],
  ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
  ['~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~', '~'],
];

export const GRID_ROWS = 10;
export const GRID_COLS = 14;
export const TILE_SIZE = 48; // px — smaller tiles for pixel-art RPG feel

const CHAR_TO_TYPE: Record<string, CellType> = {
  '.': 'grass',
  'R': 'road',
  'G': 'government',
  'W': 'worker',
  'M': 'merchant',
  'P': 'park',
  '~': 'water',
};

export const GRID_CELLS: GridCell[] = GRID_TEMPLATE.flatMap((row, r) =>
  row.map((char, c) => ({
    row: r,
    col: c,
    type: CHAR_TO_TYPE[char] || 'grass',
  }))
);

// Cell type -> CSS colors (now handled in IsometricTile.tsx with CSS classes)
// Keeping these for backwards compatibility
export const CELL_COLORS: Record<CellType, string> = {
  grass: 'bg-emerald-900',
  road: 'bg-zinc-700',
  government: 'bg-amber-900',
  worker: 'bg-blue-900',
  merchant: 'bg-purple-900',
  park: 'bg-green-800',
  water: 'bg-cyan-900',
};

export const CELL_BORDERS: Record<CellType, string> = {
  grass: 'border-emerald-700',
  road: 'border-zinc-500',
  government: 'border-amber-600',
  worker: 'border-blue-600',
  merchant: 'border-purple-600',
  park: 'border-green-600',
  water: 'border-cyan-700',
};

// Fixed agent slot assignments: agentName -> [row, col]
// Governor in government zone, workers in worker quarter, merchants in merchant quarter
export const AGENT_SLOTS: Record<string, [number, number]> = {
  'Governor Marcus': [0, 6],
  'Alice': [2, 1],
  'Bob': [2, 2],
  'Charlie': [3, 1],
  'Diana': [3, 2],
  'Zhao': [2, 11],
  'Kumar': [2, 12],
};

// Building placement cells (where buildings can appear)
// These are DIFFERENT from agent slots so buildings don't overlap with agents
export const BUILDING_CELLS: Record<string, [number, number]> = {
  'Governor Marcus': [1, 7],   // Government zone, different from agent slot
  'Alice': [4, 1],             // Worker zone
  'Bob': [4, 2],               // Worker zone
  'Charlie': [5, 1],           // Worker zone
  'Diana': [5, 2],             // Worker zone
  'Zhao': [4, 11],             // Merchant zone
  'Kumar': [4, 12],            // Merchant zone
};

// Zone labels to show on the grid (placed at specific cells)
export const ZONE_LABELS: { row: number; col: number; label: string; color: string }[] = [
  { row: 0, col: 5, label: 'TOWN HALL', color: 'text-amber-400' },
  { row: 3, col: 1, label: 'WORKER QUARTER', color: 'text-blue-400' },
  { row: 3, col: 11, label: 'MARKET DISTRICT', color: 'text-purple-400' },
  { row: 4, col: 6, label: 'TOWN SQUARE', color: 'text-green-400' },
];

// Legend entries for the city map
export const ZONE_LEGEND: { type: CellType; label: string; color: string }[] = [
  { type: 'government', label: 'Government', color: 'bg-amber-700' },
  { type: 'worker', label: 'Workers', color: 'bg-blue-700' },
  { type: 'merchant', label: 'Merchants', color: 'bg-purple-700' },
  { type: 'road', label: 'Roads', color: 'bg-zinc-500' },
  { type: 'park', label: 'Park', color: 'bg-green-700' },
  { type: 'water', label: 'Water', color: 'bg-cyan-700' },
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
