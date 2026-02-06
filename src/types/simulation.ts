// Core simulation types

export type AgentType = 'governor' | 'worker' | 'merchant';
export type Mood = 'ecstatic' | 'happy' | 'neutral' | 'frustrated' | 'desperate';
export type Impact = 'positive' | 'negative' | 'neutral';
export type Prediction = 'tax_up' | 'tax_down' | 'salary_up' | 'salary_down' | 'collapse' | 'stability' | 'none';

export type GovernorAction = 'increase_tax' | 'decrease_tax' | 'raise_salary' | 'cut_salary' | 'increase_fee' | 'decrease_fee' | 'hold';
export type WorkerAction = 'work' | 'protest' | 'negotiate' | 'exit';
export type MerchantAction = 'raise_prices' | 'lower_prices' | 'stabilize' | 'negotiate';

export interface WorldState {
  id: string;
  day: number;
  treasury_balance: number;
  tax_rate: number;
  salary_rate: number;
  participation_fee: number;
  city_health: number;
  worker_satisfaction: number;
  merchant_stability: number;
  inflation: number;
  is_running: boolean;
  is_collapsed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Agent {
  id: string;
  world_id: string;
  name: string;
  agent_type: AgentType;
  balance: number;
  is_alive: boolean;
  mood: Mood;
  confidence: number;
  current_price_modifier?: number;
  last_action?: string;
  last_action_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface AgentMemory {
  id: string;
  agent_id: string;
  day: number;
  event: string;
  impact: Impact;
  emotion: string;
  details?: string;
  created_at: string;
}

export interface Wager {
  id: string;
  agent_id: string;
  world_id: string;
  day_placed: number;
  prediction: Prediction;
  amount: number;
  resolved: boolean;
  won?: boolean;
  payout?: number;
  created_at: string;
}

export interface WorldEvent {
  id: string;
  world_id: string;
  day: number;
  event_type: string;
  agent_id?: string;
  agent_name?: string;
  description: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export interface BalanceHistory {
  id: string;
  world_id: string;
  agent_id?: string;
  day: number;
  balance: number;
  treasury_balance?: number;
  worker_satisfaction?: number;
  city_health?: number;
  created_at: string;
}

// AI Decision Response Types
export interface GovernorDecision {
  action: GovernorAction;
  value_change: number;
  reason: string;
  confidence: number;
}

export interface WorkerDecision {
  action: WorkerAction;
  wager: {
    prediction: Prediction;
    amount: number;
  };
  reason: string;
  confidence: number;
}

export interface MerchantDecision {
  action: MerchantAction;
  price_change_percent: number;
  reason: string;
  confidence: number;
}

// ==================== META-AGENT TYPES ====================

// Chaos Event Types
export type ChaosEventType =
  | 'emergency_tax_hike'
  | 'inflation_spike'
  | 'treasury_leak'
  | 'merchant_supply_shock'
  | 'worker_strike'
  | 'external_demand_boom'
  | 'no_event';

export interface ChaosEvent {
  id: string;
  world_id: string;
  day: number;
  event_type: ChaosEventType;
  severity: number;
  reason: string;
  effects_applied?: Record<string, unknown>;
  created_at: string;
}

export interface ChaosDecision {
  event: ChaosEventType;
  severity: number;
  reason: string;
}

// Collapse Evaluation Types
export type CollapseStatus = 'stable' | 'unstable' | 'collapsed';

export interface CollapseEvaluation {
  id: string;
  world_id: string;
  day: number;
  status: CollapseStatus;
  confidence: number;
  reason: string;
  created_at: string;
}

export interface CollapseDecision {
  status: CollapseStatus;
  confidence: number;
  reason: string;
}

// Narrative Types
export interface DayNarrative {
  id: string;
  world_id: string;
  day: number;
  summary: string;
  created_at: string;
}

export interface NarrativeDecision {
  summary: string;
}

// Emergence Types
export interface EmergenceLog {
  id: string;
  world_id: string;
  day: number;
  detected: boolean;
  description?: string;
  created_at: string;
}

export interface EmergenceDecision {
  emergent_behavior_detected: boolean;
  description: string;
}

// System Memory
export type SystemMemoryType = 'chaos' | 'collapse' | 'narrative' | 'emergence';

export interface SystemMemory {
  id: string;
  world_id: string;
  memory_type: SystemMemoryType;
  day: number;
  content: Record<string, unknown>;
  created_at: string;
}

// Day Events for narrative/emergence
export interface DayEvents {
  governor_decisions: string[];
  worker_decisions: string[];
  merchant_decisions: string[];
  building_decisions: string[];
  chaos_event?: string;
  expulsions: string[];
  wager_results: string[];
}

// Simulation Config
export interface SimulationConfig {
  dayDurationMs: number;
  initialWorkers: number;
  initialMerchants: number;
  startingBalance: number;
  startingTreasury: number;
}

export const DEFAULT_CONFIG: SimulationConfig = {
  dayDurationMs: 8000, // 8 seconds per day for dramatic effect
  initialWorkers: 4,
  initialMerchants: 2,
  startingBalance: 500,
  startingTreasury: 10000,
};

// ==================== BUILDING TYPES ====================

export type BuildingType = 'housing' | 'factory' | 'market' | 'gate' | 'power_hub';

export interface Building {
  id: string;
  world_id: string;
  owner_id: string;
  building_type: BuildingType;
  level: number;
  is_active: boolean;
  built_day: number;
  last_maintained_day: number;
  created_at: string;
}

export interface BuildingDecision {
  action: 'build' | 'upgrade' | 'skip';
  building_type?: BuildingType;
  reason: string;
}

export const BUILDING_COSTS: Record<BuildingType, number> = {
  housing: 200,
  factory: 350,
  market: 300,
  gate: 500,
  power_hub: 800,
};

export const BUILDING_MAINTENANCE: Record<BuildingType, number> = {
  housing: 10,
  factory: 20,
  market: 15,
  gate: 25,
  power_hub: 40,
};

export const BUILDING_LABELS: Record<BuildingType, string> = {
  housing: 'Housing',
  factory: 'Factory',
  market: 'Market',
  gate: 'City Gate',
  power_hub: 'Power Hub',
};

export const AGENT_ALLOWED_BUILDINGS: Record<AgentType, BuildingType[]> = {
  worker: ['housing', 'factory'],
  merchant: ['market'],
  governor: ['gate', 'power_hub'],
};

// ==================== CIV TOKEN ====================

export const CIV_TOKEN = {
  name: "Civic Credit",
  symbol: "CIV",
  contract: "0x1B4446578e27bfd27338222B291C8efFc89D7777",
  chain: "Monad",
  decimals: 18,
  explorer: "https://explorer.monad.xyz",
} as const;

// ==================== ONCHAIN TRANSACTION TYPES ====================

export type OnchainTxType =
  | 'salary_payment'
  | 'fee_collection'
  | 'building_purchase'
  | 'wager_payout'
  | 'treasury_distribution'
  | 'chaos_effect';

export type OnchainTxStatus = 'pending' | 'confirmed' | 'failed';

export interface OnchainTransaction {
  id: string;
  world_id: string;
  day: number;
  tx_type: OnchainTxType;
  from_address: string;
  to_address: string;
  amount_civ: number;
  amount_wei?: string;
  tx_hash?: string;
  status: OnchainTxStatus;
  agent_id?: string;
  agent_name?: string;
  error_message?: string;
  created_at: string;
}
