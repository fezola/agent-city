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
