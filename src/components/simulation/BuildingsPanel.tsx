import { Agent, Building, BUILDING_LABELS, BUILDING_COSTS, BUILDING_MAINTENANCE, BuildingType } from '@/types/simulation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Home, Factory, Store, Building2, Zap, TrendingUp, Wrench, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BuildingsPanelProps {
  buildings: Building[];
  agents: Agent[];
  currentDay: number;
}

const BUILDING_ICONS: Record<BuildingType, React.ReactNode> = {
  housing: <Home className="h-4 w-4" />,
  factory: <Factory className="h-4 w-4" />,
  market: <Store className="h-4 w-4" />,
  gate: <Building2 className="h-4 w-4" />,
  power_hub: <Zap className="h-4 w-4" />,
};

const BUILDING_EFFECTS: Record<BuildingType, string> = {
  housing: '+5% worker satisfaction/level/day',
  factory: '+15 earnings/level/day when working',
  market: '+10% profit/level',
  gate: '+3% city health/level/day',
  power_hub: '-10% maintenance costs/level for all',
};

const BUILDING_COLORS: Record<BuildingType, string> = {
  housing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  factory: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  market: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  gate: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  power_hub: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
};

export function BuildingsPanel({ buildings, agents, currentDay }: BuildingsPanelProps) {
  const getOwnerName = (ownerId: string) => {
    const agent = agents.find(a => a.id === ownerId);
    return agent?.name || 'Unknown';
  };

  const getOwnerType = (ownerId: string) => {
    const agent = agents.find(a => a.id === ownerId);
    return agent?.agent_type || 'unknown';
  };

  const sortedBuildings = [...buildings].sort((a, b) => b.built_day - a.built_day);

  const totalMaintenanceCost = buildings.reduce((sum, b) => {
    const baseCost = BUILDING_MAINTENANCE[b.building_type as BuildingType] || 0;
    return sum + baseCost * b.level;
  }, 0);

  const buildingsByType = buildings.reduce((acc, b) => {
    const type = b.building_type as BuildingType;
    if (!acc[type]) acc[type] = { count: 0, totalLevel: 0 };
    acc[type].count++;
    acc[type].totalLevel += b.level;
    return acc;
  }, {} as Record<BuildingType, { count: number; totalLevel: number }>);

  if (buildings.length === 0) {
    return (
      <Card className="bg-background/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            City Buildings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No buildings constructed yet</p>
            <p className="text-xs mt-1">Agents will build when they have enough tokens</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-background/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            City Buildings
          </span>
          <Badge variant="outline" className="text-xs">
            {buildings.length} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-muted-foreground">Daily Maintenance</div>
            <div className="text-lg font-semibold text-destructive">
              -{totalMaintenanceCost} tokens
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2">
            <div className="text-muted-foreground">Building Types</div>
            <div className="text-lg font-semibold">
              {Object.keys(buildingsByType).length} types
            </div>
          </div>
        </div>

        {/* Building type breakdown */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground mb-2">Infrastructure Overview</div>
          <div className="grid gap-1">
            {Object.entries(buildingsByType).map(([type, stats]) => (
              <div
                key={type}
                className={`flex items-center justify-between p-2 rounded-md border ${BUILDING_COLORS[type as BuildingType]}`}
              >
                <div className="flex items-center gap-2">
                  {BUILDING_ICONS[type as BuildingType]}
                  <span className="text-sm font-medium">{BUILDING_LABELS[type as BuildingType]}</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span>{stats.count}x</span>
                  <span className="text-muted-foreground">Lvl {stats.totalLevel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Individual buildings list */}
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground mb-2">All Buildings</div>
          <ScrollArea className="h-[200px]">
            <div className="space-y-2 pr-3">
              {sortedBuildings.map((building) => {
                const type = building.building_type as BuildingType;
                const ownerName = getOwnerName(building.owner_id);
                const ownerType = getOwnerType(building.owner_id);
                const maintenance = BUILDING_MAINTENANCE[type] * building.level;
                const daysSinceBuilt = currentDay - building.built_day;

                return (
                  <div
                    key={building.id}
                    className={`p-3 rounded-lg border ${BUILDING_COLORS[type]} transition-all hover:scale-[1.02]`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {BUILDING_ICONS[type]}
                        <div>
                          <div className="font-medium text-sm">
                            {BUILDING_LABELS[type]}
                            {building.level > 1 && (
                              <span className="ml-1 text-xs opacity-70">Lv.{building.level}</span>
                            )}
                          </div>
                          <div className="text-xs opacity-70">
                            Owned by {ownerName}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {building.is_active ? (
                          <Badge variant="outline" className="text-xs bg-primary/20 text-primary border-primary/30">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-destructive/20 text-destructive border-destructive/30">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="h-3 w-3" />
                          {BUILDING_EFFECTS[type]}
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>Built Day {building.built_day} ({daysSinceBuilt} days ago)</span>
                      <span className="flex items-center gap-1">
                        <Wrench className="h-3 w-3" />
                        -{maintenance}/day
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
