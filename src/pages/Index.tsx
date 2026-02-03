import { useSimulation } from '@/hooks/useSimulation';
import { WorldHeader } from '@/components/simulation/WorldHeader';
import { AgentCard } from '@/components/simulation/AgentCard';
import { EventFeed } from '@/components/simulation/EventFeed';
import { EconomyCharts } from '@/components/simulation/EconomyCharts';
import { WorldMap } from '@/components/simulation/WorldMap';
import { WagersPanel } from '@/components/simulation/WagersPanel';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';

const Index = () => {
  const {
    worldState,
    agents,
    events,
    memories,
    wagers,
    balanceHistory,
    isProcessing,
    currentPhase,
    initializeWorld,
    toggleSimulation,
    stepSimulation,
    resetWorld,
  } = useSimulation();

  // No world exists yet - show welcome screen
  if (!worldState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-lg text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              Agent Economy
            </h1>
            <p className="text-xl text-muted-foreground">
              Autonomous agents competing to survive
            </p>
          </div>

          <div className="bg-muted/30 rounded-lg p-6 text-left space-y-4">
            <h2 className="font-semibold text-lg">How it works:</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span>👑</span>
                <span>A <strong>Governor</strong> sets economic policy (taxes, salaries, fees)</span>
              </li>
              <li className="flex gap-2">
                <span>🔨</span>
                <span><strong>Workers</strong> earn wages, pay fees, and can wager on outcomes</span>
              </li>
              <li className="flex gap-2">
                <span>🛒</span>
                <span><strong>Merchants</strong> adjust prices based on market conditions</span>
              </li>
              <li className="flex gap-2">
                <span>💀</span>
                <span>Agents who can't pay fees are <strong>expelled</strong> from the economy</span>
              </li>
              <li className="flex gap-2">
                <span>🤖</span>
                <span>All decisions are made by <strong>AI agents</strong> with memories</span>
              </li>
            </ul>
          </div>

          <Button 
            size="lg" 
            onClick={initializeWorld}
            disabled={isProcessing}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating World...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Start Simulation
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  const governor = agents.find(a => a.agent_type === 'governor');
  const workers = agents.filter(a => a.agent_type === 'worker');
  const merchants = agents.filter(a => a.agent_type === 'merchant');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with controls */}
        <WorldHeader
          worldState={worldState}
          isProcessing={isProcessing}
          currentPhase={currentPhase}
          onToggle={toggleSimulation}
          onStep={stepSimulation}
          onReset={resetWorld}
        />

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Agents */}
          <div className="lg:col-span-2 space-y-6">
            {/* Governor */}
            {governor && (
              <div>
                <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                  Government
                </h2>
                <AgentCard 
                  agent={governor} 
                  memories={memories[governor.id]}
                  isHighlighted={isProcessing && currentPhase.includes('Governor')}
                />
              </div>
            )}

            {/* Workers */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Workers ({workers.filter(w => w.is_alive).length} active)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {workers.map((worker) => (
                  <AgentCard
                    key={worker.id}
                    agent={worker}
                    memories={memories[worker.id]}
                    isHighlighted={isProcessing && currentPhase.includes('Worker')}
                  />
                ))}
              </div>
            </div>

            {/* Merchants */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                Merchants ({merchants.filter(m => m.is_alive).length} active)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {merchants.map((merchant) => (
                  <AgentCard
                    key={merchant.id}
                    agent={merchant}
                    memories={memories[merchant.id]}
                    isHighlighted={isProcessing && currentPhase.includes('Merchant')}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Info panels */}
          <div className="space-y-6">
            <WorldMap agents={agents} worldState={worldState} />
            <EconomyCharts balanceHistory={balanceHistory} agents={agents} />
            <WagersPanel 
              wagers={wagers} 
              agents={agents} 
              currentDay={worldState.day} 
            />
            <EventFeed events={events} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
