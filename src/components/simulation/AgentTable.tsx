import { useNavigate } from 'react-router-dom';
import { Agent, AgentMemory, Mood } from '@/types/simulation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface AgentTableProps {
  agents: Agent[];
  memories: Record<string, AgentMemory[]>;
  isProcessing: boolean;
  currentPhase: string;
}

const moodDot: Record<Mood, string> = {
  ecstatic: 'bg-emerald-400',
  happy: 'bg-emerald-400',
  neutral: 'bg-muted-foreground',
  frustrated: 'bg-red-400',
  desperate: 'bg-red-400',
};

const moodLabel: Record<Mood, string> = {
  ecstatic: 'Ecstatic',
  happy: 'Happy',
  neutral: 'Neutral',
  frustrated: 'Frustrated',
  desperate: 'Desperate',
};

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="px-3 py-1.5 bg-muted/30 border-b border-border/50">
      <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

function AgentRow({
  agent,
  isHighlighted,
  onClick,
}: {
  agent: Agent;
  isHighlighted: boolean;
  onClick: () => void;
}) {
  if (!agent.is_alive) {
    return (
      <div
        className="flex items-center px-3 py-2 border-b border-border/20 opacity-40 cursor-pointer hover:bg-muted/30"
        onClick={onClick}
      >
        <span className="flex-1 text-sm line-through text-muted-foreground">{agent.name}</span>
        <span className="text-[10px] text-red-400 font-medium">expelled</span>
      </div>
    );
  }

  const actionText = agent.last_action
    ? agent.last_action.replace(/_/g, ' ')
    : '—';

  return (
    <div
      className={cn(
        "flex items-center px-3 py-2 border-b border-border/20 cursor-pointer hover:bg-muted/50 transition-colors",
        isHighlighted && "bg-emerald-950/20"
      )}
      onClick={onClick}
    >
      {/* Name */}
      <div className="flex-1 min-w-0 mr-3">
        <span className="text-sm font-medium truncate block">{agent.name}</span>
      </div>

      {/* Balance */}
      <div className="w-16 text-right mr-3">
        {agent.agent_type !== 'governor' ? (
          <span className="text-xs font-mono">{agent.balance.toLocaleString()}</span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>

      {/* Mood */}
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="w-14 flex items-center gap-1.5 mr-3">
            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", moodDot[agent.mood])} />
            <span className="text-[10px] text-muted-foreground truncate capitalize">
              {agent.mood}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          {moodLabel[agent.mood]}
          {agent.agent_type === 'merchant' && agent.current_price_modifier && (
            <> | Price: {(agent.current_price_modifier * 100).toFixed(0)}%</>
          )}
        </TooltipContent>
      </Tooltip>

      {/* Confidence */}
      <div className="w-10 text-right mr-3">
        <span className="text-[10px] font-mono text-muted-foreground">
          {(agent.confidence * 100).toFixed(0)}%
        </span>
      </div>

      {/* Last Action */}
      <div className="w-24 min-w-0 hidden sm:block">
        <span className="text-[10px] text-muted-foreground truncate block capitalize">
          {actionText}
        </span>
      </div>
    </div>
  );
}

export function AgentTable({ agents, memories, isProcessing, currentPhase }: AgentTableProps) {
  const navigate = useNavigate();

  const governor = agents.find(a => a.agent_type === 'governor');
  const workers = agents.filter(a => a.agent_type === 'worker');
  const merchants = agents.filter(a => a.agent_type === 'merchant');
  const aliveCount = agents.filter(a => a.is_alive).length;

  const isAgentHighlighted = (agentType: string) => {
    if (!isProcessing) return false;
    const phaseMap: Record<string, string> = {
      governor: 'Governor',
      worker: 'Worker',
      merchant: 'Merchant',
    };
    return currentPhase.includes(phaseMap[agentType] || '');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-8 border-b bg-background shrink-0">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Agents
        </span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {aliveCount}/{agents.length}
        </span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-3 py-1 border-b border-border/50 bg-muted/10 shrink-0">
        <span className="flex-1 text-[9px] uppercase tracking-wider text-muted-foreground/60">Name</span>
        <span className="w-16 text-right text-[9px] uppercase tracking-wider text-muted-foreground/60 mr-3">Bal</span>
        <span className="w-14 text-[9px] uppercase tracking-wider text-muted-foreground/60 mr-3">Mood</span>
        <span className="w-10 text-right text-[9px] uppercase tracking-wider text-muted-foreground/60 mr-3">Conf</span>
        <span className="w-24 text-[9px] uppercase tracking-wider text-muted-foreground/60 hidden sm:block">Action</span>
      </div>

      {/* Scrollable agent list */}
      <ScrollArea className="flex-1">
        {/* Governor */}
        <SectionHeader label="Government" />
        {governor && (
          <AgentRow
            agent={governor}
            isHighlighted={isAgentHighlighted('governor')}
            onClick={() => navigate(`/agent/${governor.id}`)}
          />
        )}

        {/* Workers */}
        <SectionHeader label={`Workers (${workers.filter(w => w.is_alive).length})`} />
        {workers.map((worker) => (
          <AgentRow
            key={worker.id}
            agent={worker}
            isHighlighted={isAgentHighlighted('worker')}
            onClick={() => navigate(`/agent/${worker.id}`)}
          />
        ))}

        {/* Merchants */}
        <SectionHeader label={`Merchants (${merchants.filter(m => m.is_alive).length})`} />
        {merchants.map((merchant) => (
          <AgentRow
            key={merchant.id}
            agent={merchant}
            isHighlighted={isAgentHighlighted('merchant')}
            onClick={() => navigate(`/agent/${merchant.id}`)}
          />
        ))}
      </ScrollArea>
    </div>
  );
}
