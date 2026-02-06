import { useSimulationContext } from '@/contexts/SimulationContext';
import { CommandBar } from '@/components/simulation/CommandBar';
import { StatsStrip } from '@/components/simulation/StatsStrip';
import { AgentTable } from '@/components/simulation/AgentTable';
import { EconomyChart } from '@/components/simulation/EconomyChart';
import { EventLog } from '@/components/simulation/EventLog';
import { SecondaryPanels } from '@/components/simulation/SecondaryPanels';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Simulation() {
  const {
    worldState,
    agents,
    events,
    memories,
    wagers,
    balanceHistory,
    isProcessing,
    currentPhase,
    chaosEvents,
    narratives,
    emergenceLogs,
    collapseEvaluations,
    buildings,
    onchainTransactions,
    initializeWorld,
    toggleSimulation,
    stepSimulation,
    resetWorld,
  } = useSimulationContext();

  // No world exists yet
  if (!worldState) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">No Simulation Running</h2>
          <p className="text-sm text-muted-foreground">Start a new simulation to see it here</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={initializeWorld} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Start Simulation'
              )}
            </Button>
            <Link to="/">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col overflow-hidden">
      {/* Command Bar */}
      <CommandBar
        worldState={worldState}
        isProcessing={isProcessing}
        currentPhase={currentPhase}
        onToggle={toggleSimulation}
        onStep={stepSimulation}
        onReset={resetWorld}
      />

      {/* Stats Strip */}
      <StatsStrip worldState={worldState} />

      {/* Collapse Banner */}
      {worldState.is_collapsed && (
        <div className="flex-shrink-0 flex items-center justify-center h-8 bg-red-950/80 border-b border-red-900">
          <span className="text-xs font-medium text-red-400 uppercase tracking-wider">
            Economy Collapsed
          </span>
        </div>
      )}

      {/* Main 3-column grid */}
      <div className="flex-1 min-h-0 grid grid-cols-1 xl:grid-cols-[minmax(280px,2fr)_minmax(300px,3fr)_minmax(220px,1.5fr)]">
        {/* Left: Agent Table */}
        <div className="xl:border-r overflow-hidden">
          <AgentTable
            agents={agents}
            memories={memories}
            isProcessing={isProcessing}
            currentPhase={currentPhase}
          />
        </div>

        {/* Center: Chart + Secondary Panels */}
        <div className="xl:border-r overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 border-b">
            <EconomyChart balanceHistory={balanceHistory} agents={agents} />
          </div>
          <div className="flex-1 min-h-0">
            <SecondaryPanels
              narratives={narratives}
              chaosEvents={chaosEvents}
              emergenceLogs={emergenceLogs}
              collapseEvaluations={collapseEvaluations}
              wagers={wagers}
              agents={agents}
              buildings={buildings}
              onchainTransactions={onchainTransactions}
              currentDay={worldState.day}
            />
          </div>
        </div>

        {/* Right: Event Log */}
        <div className="overflow-hidden">
          <EventLog events={events} />
        </div>
      </div>
    </div>
  );
}
