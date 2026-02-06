import { Agent, WorldEvent, Building, BUILDING_LABELS, Mood, AgentType, CIV_TOKEN, OnchainTransaction } from '@/types/simulation';
import { AGENT_INFO } from './cityGridData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { OnchainActivity } from '@/components/simulation/OnchainActivity';
import { Crown, Hammer, ShoppingCart, Home, Factory, Store, Building2, Zap, Skull, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CitySidePanelProps {
  agents: Agent[];
  buildings: Building[];
  events: WorldEvent[];
  onchainTransactions: OnchainTransaction[];
  currentDay: number;
}

const MOOD_DOT: Record<Mood, string> = {
  ecstatic: 'bg-emerald-400',
  happy: 'bg-green-500',
  neutral: 'bg-gray-400',
  frustrated: 'bg-orange-400',
  desperate: 'bg-red-500',
};

const MOOD_LABEL: Record<Mood, string> = {
  ecstatic: 'Ecstatic',
  happy: 'Happy',
  neutral: 'Neutral',
  frustrated: 'Frustrated',
  desperate: 'Desperate',
};

const TYPE_ICONS: Record<string, typeof Crown> = {
  governor: Crown,
  worker: Hammer,
  merchant: ShoppingCart,
};

const TYPE_COLORS: Record<AgentType, string> = {
  governor: 'text-amber-400',
  worker: 'text-blue-400',
  merchant: 'text-purple-400',
};

const BUILDING_ICONS: Record<string, typeof Home> = {
  housing: Home,
  factory: Factory,
  market: Store,
  gate: Building2,
  power_hub: Zap,
};

const ACTION_LABELS: Record<string, string> = {
  work: 'Working',
  protest: 'Protesting',
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

export function CitySidePanel({ agents, buildings, events, onchainTransactions, currentDay }: CitySidePanelProps) {
  const recentEvents = events
    .filter((e) => e.day >= currentDay - 2)
    .sort((a, b) => b.day - a.day || new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 30);

  return (
    <div className="w-[300px] border-l border-zinc-700 flex flex-col h-full bg-zinc-900">
      <Tabs defaultValue="guide" className="flex flex-col h-full">
        <TabsList className="w-full justify-start rounded-none border-b border-zinc-700 bg-zinc-900 h-10 px-2">
          <TabsTrigger value="guide" className="text-xs h-7 px-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            <HelpCircle className="h-3 w-3 mr-1" />
            Guide
          </TabsTrigger>
          <TabsTrigger value="agents" className="text-xs h-7 px-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Agents ({agents.filter((a) => a.is_alive).length})
          </TabsTrigger>
          <TabsTrigger value="buildings" className="text-xs h-7 px-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Build ({buildings.filter((b) => b.is_active).length})
          </TabsTrigger>
          <TabsTrigger value="events" className="text-xs h-7 px-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Log
          </TabsTrigger>
          <TabsTrigger value="chain" className="text-xs h-7 px-2 data-[state=active]:bg-zinc-700 data-[state=active]:text-white">
            Chain
          </TabsTrigger>
        </TabsList>

        {/* GUIDE TAB */}
        <TabsContent value="guide" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-5">
              <div>
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-2">
                  How Agent City Works
                </h3>
                <p className="text-sm text-zinc-200 leading-relaxed">
                  An AI-powered economy simulation. Each day, autonomous AI agents make decisions
                  about taxes, wages, prices, and buildings. Watch the economy thrive or collapse.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Daily Cycle
                </h3>
                <div className="space-y-1.5 text-sm text-zinc-200">
                  <div className="flex gap-2"><span className="text-amber-400 font-bold">1.</span> Governor sets policy</div>
                  <div className="flex gap-2"><span className="text-blue-400 font-bold">2.</span> Workers decide: work or protest</div>
                  <div className="flex gap-2"><span className="text-purple-400 font-bold">3.</span> Merchants set prices</div>
                  <div className="flex gap-2"><span className="text-emerald-400 font-bold">4.</span> Building decisions</div>
                  <div className="flex gap-2"><span className="text-red-400 font-bold">5.</span> Chaos events may strike</div>
                  <div className="flex gap-2"><span className="text-zinc-300 font-bold">6.</span> Economy updates</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">
                  The 7 Agents
                </h3>
                <div className="space-y-2.5">
                  {AGENT_INFO.map((info) => {
                    const Icon = TYPE_ICONS[info.type];
                    const liveAgent = agents.find((a) => a.name === info.name);
                    return (
                      <div
                        key={info.name}
                        className="bg-zinc-800 border border-zinc-600 rounded-lg p-3"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className={cn('h-4 w-4', TYPE_COLORS[info.type])} />
                          <span className="text-sm font-bold text-white">{info.name}</span>
                          <span className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded',
                            info.type === 'governor' && 'bg-amber-800 text-amber-200',
                            info.type === 'worker' && 'bg-blue-800 text-blue-200',
                            info.type === 'merchant' && 'bg-purple-800 text-purple-200',
                          )}>
                            {info.role}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mb-2 leading-relaxed">{info.description}</p>

                        {liveAgent && (
                          <div className="flex items-center gap-2 text-xs mb-1.5">
                            <div className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              liveAgent.is_alive ? MOOD_DOT[liveAgent.mood as Mood] : 'bg-zinc-600',
                            )} />
                            <span className="text-zinc-200">
                              {liveAgent.is_alive ? MOOD_LABEL[liveAgent.mood as Mood] : 'Dead'}
                            </span>
                            <span className="text-zinc-500">|</span>
                            <span className="text-zinc-200 font-mono">
                              {liveAgent.balance.toLocaleString()} {CIV_TOKEN.symbol}
                            </span>
                            {liveAgent.last_action && (
                              <>
                                <span className="text-zinc-500">|</span>
                                <span className="text-emerald-400 font-medium">
                                  {ACTION_LABELS[liveAgent.last_action] || liveAgent.last_action}
                                </span>
                              </>
                            )}
                          </div>
                        )}

                        <div className="text-[11px] text-zinc-400">
                          Can build: {info.canBuild.join(', ')}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Controls
                </h3>
                <div className="space-y-1.5 text-sm text-zinc-200">
                  <div><span className="text-white font-semibold">Left-drag</span> - Pan the city view</div>
                  <div><span className="text-white font-semibold">Right-drag</span> - Rotate the view (any angle)</div>
                  <div><span className="text-white font-semibold">Scroll</span> - Zoom in/out</div>
                  <div><span className="text-white font-semibold">Hover agents</span> - See details</div>
                  <div><span className="text-white font-semibold">Reset View</span> - Snap back to default</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                  Mood Colors
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-400" />
                    <span className="text-zinc-200">Ecstatic</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-green-500" />
                    <span className="text-zinc-200">Happy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-400" />
                    <span className="text-zinc-200">Neutral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-orange-400" />
                    <span className="text-zinc-200">Frustrated</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500" />
                    <span className="text-zinc-200">Desperate</span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>

        {/* AGENTS TAB */}
        <TabsContent value="agents" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {agents.map((agent) => {
                const Icon = agent.is_alive ? TYPE_ICONS[agent.agent_type] : Skull;
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      'px-3 py-2.5 rounded-lg text-sm',
                      'bg-zinc-800 border border-zinc-600',
                      !agent.is_alive && 'opacity-50',
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={cn(
                        'w-3 h-3 rounded-full flex-shrink-0',
                        agent.is_alive ? MOOD_DOT[agent.mood as Mood] : 'bg-zinc-600',
                      )} />
                      <Icon className={cn('h-4 w-4 flex-shrink-0', TYPE_COLORS[agent.agent_type])} />
                      <span className="font-bold text-white truncate flex-1">{agent.name}</span>
                      <span className="text-zinc-300 font-mono text-xs">
                        {agent.balance.toLocaleString()} {CIV_TOKEN.symbol}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 ml-7 text-xs text-zinc-300">
                      <span>{agent.is_alive ? MOOD_LABEL[agent.mood as Mood] : 'Dead'}</span>
                      {agent.last_action && (
                        <>
                          <span className="text-zinc-500">|</span>
                          <span className="text-emerald-400">
                            {ACTION_LABELS[agent.last_action] || agent.last_action}
                          </span>
                        </>
                      )}
                    </div>
                    {agent.last_action_reason && (
                      <div className="ml-7 mt-1 text-xs text-zinc-400 truncate" title={agent.last_action_reason}>
                        {agent.last_action_reason}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* BUILDINGS TAB */}
        <TabsContent value="buildings" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {buildings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-zinc-300 mb-1">No buildings yet</p>
                  <p className="text-xs text-zinc-400">Agents will build during the building phase</p>
                </div>
              ) : (
                buildings.map((b) => {
                  const Icon = BUILDING_ICONS[b.building_type];
                  const owner = agents.find((a) => a.id === b.owner_id);
                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm',
                        'bg-zinc-800 border border-zinc-600',
                        !b.is_active && 'opacity-50',
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 text-zinc-300 flex-shrink-0" />}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white">
                          {BUILDING_LABELS[b.building_type]}
                          {!b.is_active && <span className="text-red-400 ml-1 text-xs">(inactive)</span>}
                        </div>
                        {owner && (
                          <div className="text-xs text-zinc-300">
                            Owner: {owner.name}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              'w-2.5 h-2.5 rounded-full',
                              i < b.level ? 'bg-emerald-400' : 'bg-zinc-600',
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* EVENTS TAB */}
        <TabsContent value="events" className="flex-1 m-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-3 space-y-2">
              {recentEvents.length === 0 ? (
                <div className="text-center text-sm text-zinc-300 py-8">
                  No events yet
                </div>
              ) : (
                recentEvents.map((event) => (
                  <div
                    key={event.id}
                    className="px-3 py-2 rounded-lg text-sm bg-zinc-800 border border-zinc-600"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-zinc-300 font-bold">
                        D{event.day}
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold uppercase">
                        {event.event_type}
                      </span>
                      {event.agent_name && (
                        <span className="text-xs text-zinc-400">
                          - {event.agent_name}
                        </span>
                      )}
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* CHAIN TAB */}
        <TabsContent value="chain" className="flex-1 m-0 overflow-hidden">
          <OnchainActivity transactions={onchainTransactions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
