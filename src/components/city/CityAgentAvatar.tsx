import { Agent, AgentType, Mood, CIV_TOKEN } from '@/types/simulation';
import { MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CityAgentAvatarProps {
  agent: Agent;
  isPhaseActive?: boolean;
  showSpeech?: boolean;
}

const MOOD_OUTLINE: Record<Mood, string> = {
  ecstatic: '#4caf50',
  happy: '#66bb6a',
  neutral: '#9e9e9e',
  frustrated: '#ff9800',
  desperate: '#f44336',
};

const MOOD_LABELS: Record<Mood, string> = {
  ecstatic: 'Ecstatic',
  happy: 'Happy',
  neutral: 'Neutral',
  frustrated: 'Frustrated',
  desperate: 'Desperate',
};

const SPEECH_BORDER: Record<AgentType, string> = {
  governor: 'border-amber-500',
  worker: 'border-blue-500',
  merchant: 'border-purple-500',
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

const TYPE_BADGE_COLORS: Record<AgentType, string> = {
  governor: 'bg-amber-600 text-amber-100',
  worker: 'bg-blue-600 text-blue-100',
  merchant: 'bg-purple-600 text-purple-100',
};

export function CityAgentAvatar({ agent, isPhaseActive, showSpeech }: CityAgentAvatarProps) {
  const mood = agent.mood as Mood;
  const actionLabel = agent.last_action ? ACTION_LABELS[agent.last_action] || agent.last_action : null;
  const reason = agent.last_action_reason;
  const outlineColor = MOOD_OUTLINE[mood];

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ zIndex: 10 }}>
      {/* Speech bubble */}
      {showSpeech && reason && agent.is_alive && (
        <div className="iso-label absolute -top-8 left-1/2 -translate-x-1/2 z-50">
          <div className={cn(
            'speech-bubble relative bg-zinc-800 border rounded-lg px-2.5 py-1.5 shadow-xl max-w-[180px]',
            SPEECH_BORDER[agent.agent_type],
          )}>
            <div className="flex items-start gap-1.5">
              <MessageCircle className="h-3 w-3 text-zinc-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[9px] font-bold text-white mb-0.5">{agent.name}</div>
                <div className="text-[9px] text-zinc-200 leading-relaxed">
                  {reason.length > 100 ? reason.slice(0, 97) + '...' : reason}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-zinc-800 border-r border-b border-inherit rotate-45" />
          </div>
        </div>
      )}

      {/* Action badge */}
      {actionLabel && agent.is_alive && !showSpeech && (
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

      {/* Pixel character sprite */}
      <div
        className={cn(
          'relative transition-transform duration-200',
          !agent.is_alive && 'opacity-40 grayscale',
          isPhaseActive && agent.is_alive && 'animate-pixel-bounce',
          agent.last_action === 'protest' && 'animate-protest-wave',
        )}
        title={`${agent.name} (${agent.agent_type}) - ${MOOD_LABELS[mood]} - Balance: ${agent.balance} ${CIV_TOKEN.symbol}`}
      >
        {/* Mood indicator ring */}
        {agent.is_alive && (
          <div
            className="absolute -inset-1 rounded-full opacity-60"
            style={{
              boxShadow: `0 0 6px 2px ${outlineColor}`,
            }}
          />
        )}
        <PixelCharacter type={agent.agent_type} isAlive={agent.is_alive} />
      </div>

      {/* Name + role */}
      <div className="iso-label mt-0.5 z-20 flex flex-col items-center">
        <span className={cn(
          'text-[8px] font-bold whitespace-nowrap',
          agent.is_alive ? 'text-white' : 'text-zinc-500',
        )} style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
          {agent.name}
        </span>
        <span className={cn(
          'px-1 rounded text-[6px] font-medium mt-0.5',
          agent.is_alive ? TYPE_BADGE_COLORS[agent.agent_type] : 'bg-zinc-700 text-zinc-400',
        )}>
          {agent.agent_type.charAt(0).toUpperCase() + agent.agent_type.slice(1)}
        </span>
      </div>
    </div>
  );
}

function PixelCharacter({ type, isAlive }: { type: AgentType; isAlive: boolean }) {
  if (!isAlive) return <DeadSprite />;

  switch (type) {
    case 'governor': return <GovernorSprite />;
    case 'worker': return <WorkerSprite />;
    case 'merchant': return <MerchantSprite />;
    default: return <WorkerSprite />;
  }
}

function GovernorSprite() {
  return (
    <svg width="24" height="28" viewBox="0 0 12 14" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Crown */}
      <rect x="3" y="0" width="1" height="2" fill="#ffd700" />
      <rect x="5" y="0" width="2" height="1" fill="#ffd700" />
      <rect x="8" y="0" width="1" height="2" fill="#ffd700" />
      <rect x="3" y="2" width="6" height="1" fill="#ffd700" />
      {/* Head */}
      <rect x="4" y="3" width="4" height="3" fill="#ffcc80" />
      {/* Eyes */}
      <rect x="5" y="4" width="1" height="1" fill="#333" />
      <rect x="7" y="4" width="1" height="1" fill="#333" />
      {/* Body - royal robe */}
      <rect x="3" y="6" width="6" height="5" fill="#b71c1c" />
      <rect x="5" y="6" width="2" height="5" fill="#d32f2f" />
      {/* Gold trim */}
      <rect x="3" y="6" width="6" height="1" fill="#ffd700" />
      {/* Arms */}
      <rect x="2" y="7" width="1" height="3" fill="#b71c1c" />
      <rect x="9" y="7" width="1" height="3" fill="#b71c1c" />
      {/* Feet */}
      <rect x="4" y="11" width="2" height="1" fill="#5d4037" />
      <rect x="7" y="11" width="2" height="1" fill="#5d4037" />
      {/* Scepter */}
      <rect x="10" y="5" width="1" height="5" fill="#ffd700" />
      <rect x="9" y="4" width="3" height="1" fill="#ffab40" />
    </svg>
  );
}

function WorkerSprite() {
  return (
    <svg width="24" height="28" viewBox="0 0 12 14" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Hard hat */}
      <rect x="3" y="1" width="6" height="2" fill="#fdd835" />
      <rect x="2" y="2" width="8" height="1" fill="#f9a825" />
      {/* Head */}
      <rect x="4" y="3" width="4" height="3" fill="#ffcc80" />
      {/* Eyes */}
      <rect x="5" y="4" width="1" height="1" fill="#333" />
      <rect x="7" y="4" width="1" height="1" fill="#333" />
      {/* Body - work clothes */}
      <rect x="3" y="6" width="6" height="5" fill="#1565c0" />
      <rect x="5" y="6" width="2" height="3" fill="#1976d2" />
      {/* Belt */}
      <rect x="3" y="9" width="6" height="1" fill="#5d4037" />
      {/* Arms */}
      <rect x="2" y="7" width="1" height="3" fill="#1565c0" />
      <rect x="9" y="7" width="1" height="3" fill="#1565c0" />
      {/* Hands */}
      <rect x="2" y="10" width="1" height="1" fill="#ffcc80" />
      <rect x="9" y="10" width="1" height="1" fill="#ffcc80" />
      {/* Feet */}
      <rect x="4" y="11" width="2" height="1" fill="#5d4037" />
      <rect x="7" y="11" width="2" height="1" fill="#5d4037" />
      {/* Hammer */}
      <rect x="10" y="6" width="1" height="4" fill="#8d6e63" />
      <rect x="10" y="5" width="2" height="2" fill="#9e9e9e" />
    </svg>
  );
}

function MerchantSprite() {
  return (
    <svg width="24" height="28" viewBox="0 0 12 14" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Hood/hat */}
      <rect x="3" y="0" width="6" height="1" fill="#6a1b9a" />
      <rect x="2" y="1" width="8" height="2" fill="#7b1fa2" />
      {/* Head */}
      <rect x="4" y="3" width="4" height="3" fill="#ffcc80" />
      {/* Eyes */}
      <rect x="5" y="4" width="1" height="1" fill="#333" />
      <rect x="7" y="4" width="1" height="1" fill="#333" />
      {/* Beard */}
      <rect x="5" y="5" width="2" height="1" fill="#8d6e63" />
      {/* Body - merchant robes */}
      <rect x="3" y="6" width="6" height="5" fill="#4a148c" />
      <rect x="5" y="6" width="2" height="5" fill="#6a1b9a" />
      {/* Gold medallion */}
      <rect x="5" y="7" width="2" height="1" fill="#ffd700" />
      {/* Arms with wide sleeves */}
      <rect x="1" y="7" width="2" height="3" fill="#4a148c" />
      <rect x="9" y="7" width="2" height="3" fill="#4a148c" />
      {/* Bag of coins */}
      <rect x="0" y="9" width="2" height="2" fill="#8d6e63" />
      <rect x="0" y="9" width="1" height="1" fill="#ffd700" />
      {/* Feet */}
      <rect x="4" y="11" width="2" height="1" fill="#5d4037" />
      <rect x="7" y="11" width="2" height="1" fill="#5d4037" />
    </svg>
  );
}

function DeadSprite() {
  return (
    <svg width="24" height="28" viewBox="0 0 12 14" shapeRendering="crispEdges" style={{ imageRendering: 'pixelated' }}>
      {/* Skull */}
      <rect x="3" y="1" width="6" height="5" fill="#bdbdbd" />
      <rect x="4" y="0" width="4" height="1" fill="#9e9e9e" />
      {/* Eye sockets */}
      <rect x="4" y="3" width="1" height="1" fill="#333" />
      <rect x="7" y="3" width="1" height="1" fill="#333" />
      {/* Nose */}
      <rect x="5" y="4" width="2" height="1" fill="#757575" />
      {/* Jaw */}
      <rect x="4" y="6" width="4" height="1" fill="#9e9e9e" />
      {/* Bones */}
      <rect x="2" y="8" width="8" height="1" fill="#e0e0e0" />
      <rect x="3" y="9" width="2" height="1" fill="#bdbdbd" />
      <rect x="7" y="9" width="2" height="1" fill="#bdbdbd" />
      <rect x="4" y="10" width="4" height="1" fill="#e0e0e0" />
    </svg>
  );
}
