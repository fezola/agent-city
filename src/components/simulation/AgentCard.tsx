import { Agent, AgentMemory, Mood, CIV_TOKEN } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Crown, Hammer, ShoppingCart, Brain, TrendingUp, TrendingDown, Minus, Skull } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AgentCardProps {
  agent: Agent;
  memories?: AgentMemory[];
  isHighlighted?: boolean;
}

const moodEmoji: Record<Mood, string> = {
  ecstatic: '😄',
  happy: '🙂',
  neutral: '😐',
  frustrated: '😤',
  desperate: '😰',
};

const moodColor: Record<Mood, string> = {
  ecstatic: 'bg-green-500',
  happy: 'bg-green-400',
  neutral: 'bg-gray-400',
  frustrated: 'bg-orange-500',
  desperate: 'bg-red-500',
};

export function AgentCard({ agent, memories = [], isHighlighted }: AgentCardProps) {
  const getIcon = () => {
    switch (agent.agent_type) {
      case 'governor':
        return <Crown className="h-5 w-5 text-amber-500" />;
      case 'worker':
        return <Hammer className="h-5 w-5 text-blue-500" />;
      case 'merchant':
        return <ShoppingCart className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTypeColor = () => {
    switch (agent.agent_type) {
      case 'governor':
        return 'from-amber-950/80 to-amber-900/40 border-amber-700/50';
      case 'worker':
        return 'from-blue-950/80 to-blue-900/40 border-blue-700/50';
      case 'merchant':
        return 'from-purple-950/80 to-purple-900/40 border-purple-700/50';
    }
  };

  const getActionIcon = () => {
    if (!agent.last_action) return null;
    
    if (agent.last_action.includes('increase') || agent.last_action.includes('raise')) {
      return <TrendingUp className="h-4 w-4 text-green-400" />;
    }
    if (agent.last_action.includes('decrease') || agent.last_action.includes('cut') || agent.last_action.includes('lower')) {
      return <TrendingDown className="h-4 w-4 text-red-400" />;
    }
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  if (!agent.is_alive) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 opacity-60">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <Skull className="h-5 w-5 text-gray-500" />
              <span className="line-through text-gray-500">{agent.name}</span>
            </div>
            <Badge variant="destructive" className="text-xs">Expelled</Badge>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${getTypeColor()} transition-all duration-300 ${isHighlighted ? 'ring-2 ring-primary scale-[1.02]' : ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <div className="flex items-center gap-2">
            {getIcon()}
            <span>{agent.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{moodEmoji[agent.mood]}</span>
            <Badge variant="secondary" className="text-xs capitalize">
              {agent.agent_type}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Balance (not for governor) */}
        {agent.agent_type !== 'governor' && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Balance</span>
            <span className="font-mono font-bold text-lg">
              {agent.balance.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">{CIV_TOKEN.symbol}</span>
            </span>
          </div>
        )}

        {/* Confidence meter */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Brain className="h-3 w-3" /> Confidence
            </span>
            <span>{(agent.confidence * 100).toFixed(0)}%</span>
          </div>
          <Progress value={agent.confidence * 100} className="h-1.5" />
        </div>

        {/* Mood indicator */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Mood</span>
          <div className={`h-2 w-2 rounded-full ${moodColor[agent.mood]}`} />
          <span className="text-xs capitalize">{agent.mood}</span>
        </div>

        {/* Merchant price modifier */}
        {agent.agent_type === 'merchant' && agent.current_price_modifier && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Price Modifier</span>
            <span className={`font-mono ${agent.current_price_modifier > 1 ? 'text-red-400' : agent.current_price_modifier < 1 ? 'text-green-400' : ''}`}>
              {(agent.current_price_modifier * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Last Action */}
        {agent.last_action && (
          <div className="bg-black/20 rounded-md p-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              {getActionIcon()}
              <span className="capitalize">{agent.last_action.replace(/_/g, ' ')}</span>
            </div>
            {agent.last_action_reason && (
              <p className="text-xs italic text-muted-foreground/80 line-clamp-2">
                "{agent.last_action_reason}"
              </p>
            )}
          </div>
        )}

        {/* Recent Memories */}
        {memories.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Recent Memories</div>
            <ScrollArea className="h-16">
              <div className="space-y-1">
                {memories.slice(0, 3).map((mem) => (
                  <div 
                    key={mem.id} 
                    className={`text-xs px-2 py-1 rounded ${
                      mem.impact === 'positive' ? 'bg-green-900/30 text-green-300' :
                      mem.impact === 'negative' ? 'bg-red-900/30 text-red-300' :
                      'bg-gray-900/30 text-gray-300'
                    }`}
                  >
                    Day {mem.day}: {mem.event}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
