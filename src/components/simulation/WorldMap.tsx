import { useMemo } from 'react';
import { Agent, WorldState, Building, BUILDING_LABELS, BuildingType } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Hammer, ShoppingCart, Skull, ArrowRight, Home, Factory, Store, Building2, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WorldMapProps {
  agents: Agent[];
  worldState: WorldState | null;
  buildings?: Building[];
}

interface AgentNode {
  agent: Agent;
  x: number;
  y: number;
  size: number;
}

const BUILDING_ICONS: Record<BuildingType, React.ReactNode> = {
  housing: <Home className="h-3 w-3" />,
  factory: <Factory className="h-3 w-3" />,
  market: <Store className="h-3 w-3" />,
  gate: <Building2 className="h-3 w-3" />,
  power_hub: <Zap className="h-3 w-3" />,
};

const BUILDING_EMOJI: Record<BuildingType, string> = {
  housing: '🏠',
  factory: '🏭',
  market: '🏪',
  gate: '🚪',
  power_hub: '⚡',
};

export function WorldMap({ agents, worldState, buildings = [] }: WorldMapProps) {
  // Group buildings by owner
  const buildingsByOwner = useMemo(() => {
    const grouped: Record<string, Building[]> = {};
    buildings.forEach(b => {
      if (!grouped[b.owner_id]) grouped[b.owner_id] = [];
      grouped[b.owner_id].push(b);
    });
    return grouped;
  }, [buildings]);

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
      ecstatic: 'hsl(142 76% 36%)',
      happy: 'hsl(142 69% 58%)',
      neutral: 'hsl(220 9% 46%)',
      frustrated: 'hsl(24 94% 53%)',
      desperate: 'hsl(0 84% 60%)',
    };
    return moodColors[agent.mood] || 'hsl(220 9% 46%)';
  };

  const governor = nodes.find(n => n.agent.agent_type === 'governor');
  const expelledCount = agents.filter(a => !a.is_alive).length;
  const totalBuildings = buildings.length;

  return (
    <TooltipProvider>
      <Card className="bg-background/50">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center gap-2">
              World Map
              {totalBuildings > 0 && (
                <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                  {totalBuildings} building{totalBuildings !== 1 ? 's' : ''}
                </span>
              )}
            </span>
            {expelledCount > 0 && (
              <span className="text-xs text-destructive flex items-center gap-1">
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
              {/* Building glow filter */}
              <filter id="buildingGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
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
            {nodes.map((node) => {
              const agentBuildings = buildingsByOwner[node.agent.id] || [];
              const hasBuildings = agentBuildings.length > 0;
              
              return (
                <g key={node.agent.id} transform={`translate(${node.x}, ${node.y})`}>
                  {/* Building indicator ring - shown if agent has buildings */}
                  {hasBuildings && (
                    <circle
                      r={node.size + 8}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeDasharray="4 2"
                      opacity={0.6}
                      filter="url(#buildingGlow)"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0"
                        to="360"
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  )}
                  
                  {/* Outer glow based on mood */}
                  <circle
                    r={node.size + 4}
                    fill={getAgentColor(node.agent)}
                    opacity={0.2}
                  />
                  {/* Main circle */}
                  <circle
                    r={node.size}
                    fill="hsl(var(--card))"
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

                  {/* Building indicators around the agent */}
                  {agentBuildings.map((building, i) => {
                    const buildingAngle = (i / Math.max(agentBuildings.length, 1)) * Math.PI * 2 - Math.PI / 2;
                    const buildingRadius = node.size + 14;
                    const bx = Math.cos(buildingAngle) * buildingRadius;
                    const by = Math.sin(buildingAngle) * buildingRadius;
                    
                    return (
                      <g key={building.id} transform={`translate(${bx}, ${by})`}>
                        {/* Building background */}
                        <circle
                          r="8"
                          fill="hsl(var(--background))"
                          stroke={building.is_active ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'}
                          strokeWidth="1.5"
                        />
                        {/* Building emoji */}
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fontSize="8"
                        >
                          {BUILDING_EMOJI[building.building_type as BuildingType]}
                        </text>
                        {/* Level indicator */}
                        {building.level > 1 && (
                          <g transform="translate(6, -6)">
                            <circle r="4" fill="hsl(var(--primary))" />
                            <text
                              textAnchor="middle"
                              dominantBaseline="central"
                              fontSize="5"
                              fill="hsl(var(--primary-foreground))"
                              fontWeight="bold"
                            >
                              {building.level}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  })}
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(10, 215)">
              <text fontSize="8" fill="hsl(var(--muted-foreground))">
                🟢 Happy   🟡 Neutral   🔴 Desperate
              </text>
              <text fontSize="7" fill="hsl(var(--muted-foreground))" y="10">
                🏠 Housing  🏭 Factory  🏪 Market  🚪 Gate  ⚡ Power
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
              <span className="text-primary">{worldState.participation_fee} tokens/day</span>
              <ArrowRight className="h-3 w-3" />
              <span>Treasury</span>
            </div>
          )}

          {/* Building summary */}
          {totalBuildings > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">City Buildings:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(
                  buildings.reduce((acc, b) => {
                    const type = b.building_type as BuildingType;
                    if (!acc[type]) acc[type] = 0;
                    acc[type]++;
                    return acc;
                  }, {} as Record<BuildingType, number>)
                ).map(([type, count]) => (
                  <span
                    key={type}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-xs"
                  >
                    {BUILDING_EMOJI[type as BuildingType]}
                    <span>{count}x {BUILDING_LABELS[type as BuildingType]}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
