import { Agent, AgentType, Mood } from '@/types/simulation';
import { Crown, Hammer, ShoppingCart, Skull } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityAgentAvatarProps {
  agent: Agent;
  isPhaseActive?: boolean;
}

const MOOD_COLORS: Record<Mood, string> = {
  ecstatic: 'bg-emerald-400',
  happy: 'bg-green-500',
  neutral: 'bg-zinc-400',
  frustrated: 'bg-orange-400',
  desperate: 'bg-red-500',
};

const MOOD_RING: Record<Mood, string> = {
  ecstatic: 'ring-emerald-400/60',
  happy: 'ring-green-500/60',
  neutral: 'ring-zinc-400/60',
  frustrated: 'ring-orange-400/60',
  desperate: 'ring-red-500/60',
};

const MOOD_LABELS: Record<Mood, string> = {
  ecstatic: 'Ecstatic',
  happy: 'Happy',
  neutral: 'Neutral',
  frustrated: 'Frustrated',
  desperate: 'Desperate',
};

const TYPE_ICONS: Record<AgentType, typeof Crown> = {
  governor: Crown,
  worker: Hammer,
  merchant: ShoppingCart,
};

const TYPE_BADGE_COLORS: Record<AgentType, string> = {
  governor: 'bg-amber-600 text-amber-100',
  worker: 'bg-blue-600 text-blue-100',
  merchant: 'bg-purple-600 text-purple-100',
};

const ACTION_LABELS: Record<string, string> = {
  work: 'Working',
  protest: 'Protesting!',
  negotiate: 'Negotiating',
  exit: 'Leaving',
  increase_tax: 'Raising Tax',
  decrease_tax: 'Cutting Tax',
  raise_salary: 'Raising Salary',
  cut_salary: 'Cutting Salary',
  increase_fee: 'Raising Fee',
  decrease_fee: 'Cutting Fee',
  hold: 'Holding',
  raise_prices: 'Raising Prices',
  lower_prices: 'Lowering Prices',
  stabilize: 'Stabilizing',
};

export function CityAgentAvatar({ agent, isPhaseActive }: CityAgentAvatarProps) {
  const Icon = agent.is_alive ? TYPE_ICONS[agent.agent_type] : Skull;
  const mood = agent.mood as Mood;
  const actionLabel = agent.last_action ? ACTION_LABELS[agent.last_action] || agent.last_action : null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
      {/* Action badge above avatar */}
      {actionLabel && agent.is_alive && (
        <div className="iso-label absolute -top-2 left-1/2 -translate-x-1/2 z-30">
          <div className={cn(
            'px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap shadow-lg',
            'bg-zinc-900/95 text-zinc-100 border border-zinc-600/60',
            agent.last_action === 'protest' && 'bg-red-900/95 text-red-100 border-red-500/60',
          )}>
            {actionLabel}
          </div>
        </div>
      )}

      {/* Avatar circle - bigger for readability */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center ring-2 shadow-lg',
          agent.is_alive ? MOOD_COLORS[mood] : 'bg-zinc-600',
          agent.is_alive ? MOOD_RING[mood] : 'ring-zinc-600/50',
          !agent.is_alive && 'opacity-40 grayscale',
          isPhaseActive && agent.is_alive && 'animate-pulse-glow',
        )}
        title={`${agent.name} (${agent.agent_type}) - ${MOOD_LABELS[mood]} - Balance: ${agent.balance}`}
      >
        <Icon className="h-4 w-4 text-white drop-shadow" />
      </div>

      {/* Name + role label */}
      <div className="iso-label mt-1 z-20 flex flex-col items-center">
        <span className={cn(
          'text-[9px] font-bold whitespace-nowrap drop-shadow-md',
          agent.is_alive ? 'text-white' : 'text-zinc-500',
        )}>
          {agent.name}
        </span>
        <span className={cn(
          'px-1 rounded text-[7px] font-medium mt-0.5',
          agent.is_alive ? TYPE_BADGE_COLORS[agent.agent_type] : 'bg-zinc-700 text-zinc-400',
        )}>
          {agent.agent_type.charAt(0).toUpperCase() + agent.agent_type.slice(1)}
        </span>
      </div>
    </div>
  );
}
