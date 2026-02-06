import { DayNarrative, ChaosEvent, EmergenceLog, CollapseEvaluation, Wager, Agent, Building, BUILDING_LABELS, BUILDING_MAINTENANCE, OnchainTransaction } from '@/types/simulation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnchainActivity } from './OnchainActivity';
import { cn } from '@/lib/utils';

interface SecondaryPanelsProps {
  narratives: DayNarrative[];
  chaosEvents: ChaosEvent[];
  emergenceLogs: EmergenceLog[];
  collapseEvaluations: CollapseEvaluation[];
  wagers: Wager[];
  agents: Agent[];
  buildings: Building[];
  onchainTransactions: OnchainTransaction[];
  currentDay: number;
}

const predictionLabels: Record<string, string> = {
  tax_up: 'Tax Increase',
  tax_down: 'Tax Decrease',
  salary_up: 'Salary Increase',
  salary_down: 'Salary Cut',
  collapse: 'City Collapse',
  stability: 'City Stability',
};

const chaosLabels: Record<string, string> = {
  emergency_tax_hike: 'Emergency Tax Hike',
  inflation_spike: 'Inflation Spike',
  treasury_leak: 'Treasury Leak',
  merchant_supply_shock: 'Supply Shock',
  worker_strike: 'Worker Strike',
  external_demand_boom: 'Demand Boom',
  no_event: 'No Event',
};

function NarrativeTab({ narratives }: { narratives: DayNarrative[] }) {
  const sorted = [...narratives].sort((a, b) => b.day - a.day);

  if (sorted.length === 0) {
    return <EmptyState text="No narratives generated yet" />;
  }

  return (
    <div className="space-y-0">
      {sorted.map((n, i) => (
        <div key={n.id} className="px-3 py-2 border-b border-border/20">
          <span className="text-[10px] font-mono text-muted-foreground">Day {n.day}</span>
          <p className={cn(
            "text-xs mt-0.5 leading-relaxed",
            i === 0 ? "text-foreground" : "text-muted-foreground"
          )}>
            {n.summary}
          </p>
        </div>
      ))}
    </div>
  );
}

function ChaosTab({ chaosEvents }: { chaosEvents: ChaosEvent[] }) {
  const sorted = [...chaosEvents].sort((a, b) => b.day - a.day);
  const active = sorted.filter(e => e.event_type !== 'no_event');

  if (sorted.length === 0) {
    return <EmptyState text="No chaos events yet" />;
  }

  return (
    <div className="space-y-0">
      {sorted.slice(0, 15).map((event) => {
        const isActive = event.event_type !== 'no_event';
        return (
          <div key={event.id} className="px-3 py-2 border-b border-border/20">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground">d{event.day}</span>
              <span className={cn(
                "text-xs font-medium",
                isActive ? "text-foreground" : "text-muted-foreground/50"
              )}>
                {chaosLabels[event.event_type] || event.event_type}
              </span>
              {isActive && (
                <span className="text-[10px] font-mono text-muted-foreground ml-auto">
                  {(event.severity * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 pl-6 line-clamp-1">
              {event.reason}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function EmergenceTab({ emergenceLogs }: { emergenceLogs: EmergenceLog[] }) {
  const sorted = [...emergenceLogs].sort((a, b) => b.day - a.day);

  if (sorted.length === 0) {
    return <EmptyState text="No emergence analysis yet" />;
  }

  return (
    <div className="space-y-0">
      {sorted.slice(0, 15).map((log) => (
        <div key={log.id} className="px-3 py-2 border-b border-border/20">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">d{log.day}</span>
            {log.detected && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
            <span className={cn(
              "text-[10px]",
              log.detected ? "text-emerald-400 font-medium" : "text-muted-foreground/50"
            )}>
              {log.detected ? 'Detected' : 'Normal'}
            </span>
          </div>
          <p className={cn(
            "text-xs mt-0.5 pl-6 line-clamp-2",
            log.detected ? "text-foreground/80" : "text-muted-foreground/50"
          )}>
            {log.description || 'No unusual patterns observed.'}
          </p>
        </div>
      ))}
    </div>
  );
}

function WagersTab({ wagers, agents }: { wagers: Wager[]; agents: Agent[] }) {
  const getAgentName = (agentId: string) => {
    return agents.find(a => a.id === agentId)?.name || 'Unknown';
  };

  const pending = wagers.filter(w => !w.resolved);
  const resolved = wagers.filter(w => w.resolved).slice(0, 10);

  if (wagers.length === 0) {
    return <EmptyState text="No wagers placed yet" />;
  }

  return (
    <div className="space-y-0">
      {pending.length > 0 && (
        <>
          <div className="px-3 py-1 bg-muted/20">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Pending</span>
          </div>
          {pending.map((w) => (
            <div key={w.id} className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2">
              <span className="text-xs font-medium flex-1 truncate">{getAgentName(w.agent_id)}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {predictionLabels[w.prediction] || w.prediction}
              </span>
              <span className="text-[10px] font-mono">{w.amount}</span>
            </div>
          ))}
        </>
      )}
      {resolved.length > 0 && (
        <>
          <div className="px-3 py-1 bg-muted/20">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Resolved</span>
          </div>
          {resolved.map((w) => (
            <div key={w.id} className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2">
              <span className="text-xs flex-1 truncate text-muted-foreground">{getAgentName(w.agent_id)}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {predictionLabels[w.prediction] || w.prediction}
              </span>
              <span className={cn(
                "text-[10px] font-mono font-medium",
                w.won ? "text-emerald-400" : "text-red-400"
              )}>
                {w.won ? `+${w.payout}` : `-${w.amount}`}
              </span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function StabilityTab({ evaluations }: { evaluations: CollapseEvaluation[] }) {
  const sorted = [...evaluations].sort((a, b) => b.day - a.day);
  const latest = sorted[0];

  if (!latest) {
    return <EmptyState text="No stability evaluations yet" />;
  }

  const statusColor = {
    stable: 'text-emerald-400',
    unstable: 'text-foreground',
    collapsed: 'text-red-400',
  };

  return (
    <div className="p-3 space-y-3">
      {/* Current status */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className={cn("text-lg font-bold uppercase", statusColor[latest.status])}>
            {latest.status}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
            {(latest.confidence * 100).toFixed(0)}% confident
          </span>
        </div>
        <p className="text-xs text-muted-foreground">{latest.reason}</p>
      </div>

      {/* Trend dots */}
      {sorted.length > 1 && (
        <div className="space-y-1">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
            Recent trend
          </span>
          <div className="flex gap-1">
            {sorted.slice(0, 10).map((e) => (
              <div
                key={e.id}
                className={cn(
                  "w-2 h-2 rounded-full",
                  e.status === 'stable' && "bg-emerald-400",
                  e.status === 'unstable' && "bg-muted-foreground",
                  e.status === 'collapsed' && "bg-red-400"
                )}
                title={`Day ${e.day}: ${e.status}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* History */}
      {sorted.slice(1, 6).map((e) => (
        <div key={e.id} className="border-t border-border/20 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-muted-foreground">d{e.day}</span>
            <span className={cn("text-xs capitalize", statusColor[e.status])}>{e.status}</span>
            <span className="text-[10px] font-mono text-muted-foreground ml-auto">
              {(e.confidence * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">{e.reason}</p>
        </div>
      ))}
    </div>
  );
}

function BuildingsTab({ buildings, agents }: { buildings: Building[]; agents: Agent[] }) {
  const getOwnerName = (ownerId: string) => {
    return agents.find(a => a.id === ownerId)?.name || 'Unknown';
  };

  const active = buildings.filter(b => b.is_active);
  const inactive = buildings.filter(b => !b.is_active);

  if (buildings.length === 0) {
    return <EmptyState text="No buildings constructed yet" />;
  }

  return (
    <div className="space-y-0">
      {active.length > 0 && (
        <>
          <div className="px-3 py-1 bg-muted/20">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Active ({active.length})</span>
          </div>
          {active.map((b) => (
            <div key={b.id} className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2">
              <span className="text-xs font-medium flex-1 truncate">{getOwnerName(b.owner_id)}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {BUILDING_LABELS[b.building_type as keyof typeof BUILDING_LABELS] || b.building_type}
              </span>
              <div className="flex gap-0.5">
                {Array.from({ length: b.level }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                ))}
                {Array.from({ length: 3 - b.level }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/20" />
                ))}
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">
                {BUILDING_MAINTENANCE[b.building_type as keyof typeof BUILDING_MAINTENANCE] * b.level}/d
              </span>
            </div>
          ))}
        </>
      )}
      {inactive.length > 0 && (
        <>
          <div className="px-3 py-1 bg-muted/20">
            <span className="text-[9px] uppercase tracking-wider text-muted-foreground">Inactive ({inactive.length})</span>
          </div>
          {inactive.map((b) => (
            <div key={b.id} className="px-3 py-1.5 border-b border-border/20 flex items-center gap-2 opacity-50">
              <span className="text-xs flex-1 truncate text-muted-foreground">{getOwnerName(b.owner_id)}</span>
              <span className="text-[10px] text-muted-foreground truncate">
                {BUILDING_LABELS[b.building_type as keyof typeof BUILDING_LABELS] || b.building_type}
              </span>
              <span className="text-[10px] font-mono text-red-400">Lv{b.level}</span>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">
      {text}
    </div>
  );
}

export function SecondaryPanels({
  narratives,
  chaosEvents,
  emergenceLogs,
  collapseEvaluations,
  wagers,
  agents,
  buildings,
  onchainTransactions,
  currentDay,
}: SecondaryPanelsProps) {
  const activeChaos = chaosEvents.filter(e => e.event_type !== 'no_event');
  const detectedEmergence = emergenceLogs.filter(e => e.detected);
  const activeBuildings = buildings.filter(b => b.is_active);
  const confirmedTxs = onchainTransactions.filter(t => t.status === 'confirmed');

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="narrative" className="flex flex-col h-full">
        <div className="shrink-0 border-b bg-background px-1">
          <TabsList className="bg-transparent h-8 w-full justify-start gap-0">
            <TabsTrigger
              value="narrative"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Narrative
            </TabsTrigger>
            <TabsTrigger
              value="chaos"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Chaos{activeChaos.length > 0 && ` (${activeChaos.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="emergence"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Emerge{detectedEmergence.length > 0 && ` (${detectedEmergence.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="wagers"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Wagers
            </TabsTrigger>
            <TabsTrigger
              value="buildings"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Build{buildings.length > 0 && ` (${activeBuildings.length})`}
            </TabsTrigger>
            <TabsTrigger
              value="stability"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Stability
            </TabsTrigger>
            <TabsTrigger
              value="onchain"
              className="text-[10px] h-8 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2"
            >
              Chain{confirmedTxs.length > 0 && ` (${confirmedTxs.length})`}
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0">
          <TabsContent value="narrative" className="h-full m-0">
            <ScrollArea className="h-full">
              <NarrativeTab narratives={narratives} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chaos" className="h-full m-0">
            <ScrollArea className="h-full">
              <ChaosTab chaosEvents={chaosEvents} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="emergence" className="h-full m-0">
            <ScrollArea className="h-full">
              <EmergenceTab emergenceLogs={emergenceLogs} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="wagers" className="h-full m-0">
            <ScrollArea className="h-full">
              <WagersTab wagers={wagers} agents={agents} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="buildings" className="h-full m-0">
            <ScrollArea className="h-full">
              <BuildingsTab buildings={buildings} agents={agents} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="stability" className="h-full m-0">
            <ScrollArea className="h-full">
              <StabilityTab evaluations={collapseEvaluations} />
            </ScrollArea>
          </TabsContent>

          <TabsContent value="onchain" className="h-full m-0">
            <ScrollArea className="h-full">
              <OnchainActivity transactions={onchainTransactions} />
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
