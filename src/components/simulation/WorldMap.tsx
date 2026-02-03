import { useMemo } from 'react';
import { Agent, WorldState } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Hammer, ShoppingCart, Skull, ArrowRight } from 'lucide-react';

interface WorldMapProps {
  agents: Agent[];
  worldState: WorldState | null;
}

interface AgentNode {
  agent: Agent;
  x: number;
  y: number;
  size: number;
}

export function WorldMap({ agents, worldState }: WorldMapProps) {
  const nodes = useMemo(() => {
    const alive = agents.filter(a => a.is_alive);
    const governor = alive.find(a => a.agent_type === 'governor');
    const workers = alive.filter(a => a.agent_type === 'worker');
    const merchants = alive.filter(a => a.agent_type === 'merchant');

    const result: AgentNode[] = [];
    const centerX = 150;
    const centerY = 120;
    const radius = 80;

    // Governor at center
    if (governor) {
      result.push({
        agent: governor,
        x: centerX,
        y: centerY,
        size: 24,
      });
    }

    // Workers in a circle around
    workers.forEach((w, i) => {
      const angle = (i / workers.length) * Math.PI * 2 - Math.PI / 2;
      result.push({
        agent: w,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius,
        size: 16,
      });
    });

    // Merchants in outer ring
    merchants.forEach((m, i) => {
      const angle = (i / merchants.length) * Math.PI * 2;
      result.push({
        agent: m,
        x: centerX + Math.cos(angle) * (radius + 40),
        y: centerY + Math.sin(angle) * (radius + 40),
        size: 18,
      });
    });

    return result;
  }, [agents]);

  const getAgentColor = (agent: Agent) => {
    const moodColors: Record<string, string> = {
      ecstatic: '#22c55e',
      happy: '#4ade80',
      neutral: '#9ca3af',
      frustrated: '#f97316',
      desperate: '#ef4444',
    };
    return moodColors[agent.mood] || '#9ca3af';
  };

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'governor':
        return <Crown className="h-3 w-3" />;
      case 'worker':
        return <Hammer className="h-3 w-3" />;
      case 'merchant':
        return <ShoppingCart className="h-3 w-3" />;
      default:
        return null;
    }
  };

  const governor = nodes.find(n => n.agent.agent_type === 'governor');
  const expelledCount = agents.filter(a => !a.is_alive).length;

  return (
    <Card className="bg-background/50">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-lg">
          <span>World Map</span>
          {expelledCount > 0 && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <Skull className="h-3 w-3" /> {expelledCount} expelled
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox="0 0 300 240" className="w-full h-auto">
          {/* Background */}
          <defs>
            <radialGradient id="worldGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.1)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          <circle cx="150" cy="120" r="110" fill="url(#worldGradient)" />

          {/* Connection lines from governor to workers */}
          {governor && nodes.filter(n => n.agent.agent_type === 'worker').map((node) => (
            <line
              key={`line-${node.agent.id}`}
              x1={governor.x}
              y1={governor.y}
              x2={node.x}
              y2={node.y}
              stroke="hsl(var(--muted-foreground) / 0.2)"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
          ))}

          {/* Connection lines from workers to merchants */}
          {nodes.filter(n => n.agent.agent_type === 'worker').map((worker) => 
            nodes.filter(n => n.agent.agent_type === 'merchant').map((merchant) => (
              <line
                key={`line-${worker.agent.id}-${merchant.agent.id}`}
                x1={worker.x}
                y1={worker.y}
                x2={merchant.x}
                y2={merchant.y}
                stroke="hsl(var(--muted-foreground) / 0.1)"
                strokeWidth="0.5"
              />
            ))
          )}

          {/* Agent nodes */}
          {nodes.map((node) => (
            <g key={node.agent.id} transform={`translate(${node.x}, ${node.y})`}>
              {/* Outer glow based on mood */}
              <circle
                r={node.size + 4}
                fill={getAgentColor(node.agent)}
                opacity={0.2}
              />
              {/* Main circle */}
              <circle
                r={node.size}
                fill={`hsl(var(--${node.agent.agent_type === 'governor' ? 'amber' : node.agent.agent_type === 'worker' ? 'blue' : 'purple'}-950))`}
                stroke={getAgentColor(node.agent)}
                strokeWidth="2"
              />
              {/* Balance indicator (size of inner dot) */}
              {node.agent.agent_type !== 'governor' && (
                <circle
                  r={Math.min(node.size - 4, (node.agent.balance / 500) * (node.size - 4))}
                  fill={getAgentColor(node.agent)}
                  opacity={0.6}
                />
              )}
              {/* Icon placeholder */}
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={node.size * 0.6}
                fill="currentColor"
              >
                {node.agent.agent_type === 'governor' ? '👑' : 
                 node.agent.agent_type === 'worker' ? '🔨' : '🛒'}
              </text>
            </g>
          ))}

          {/* Legend */}
          <g transform="translate(10, 220)">
            <text fontSize="8" fill="hsl(var(--muted-foreground))">
              🟢 Happy   🟡 Neutral   🔴 Desperate
            </text>
          </g>

          {/* Token flow indicator */}
          {worldState?.is_running && (
            <g className="animate-pulse">
              <circle cx="270" cy="20" r="8" fill="hsl(var(--primary))" opacity="0.5" />
              <text x="260" y="35" fontSize="8" fill="hsl(var(--primary))">LIVE</text>
            </g>
          )}
        </svg>

        {/* Participation fee flow */}
        {worldState && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <span>Agents</span>
            <ArrowRight className="h-3 w-3" />
            <span className="text-amber-500">{worldState.participation_fee} tokens/day</span>
            <ArrowRight className="h-3 w-3" />
            <span>Treasury</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
