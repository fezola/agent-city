import { ReactNode, useMemo, useState, useEffect, useCallback } from 'react';
import { useSimulationContext } from '@/contexts/SimulationContext';
import { IsometricGrid } from '@/components/city/IsometricGrid';
import { IsometricViewport } from '@/components/city/IsometricViewport';
import { IsometricBuilding } from '@/components/city/IsometricBuilding';
import { CityAgentAvatar } from '@/components/city/CityAgentAvatar';
import { CityCommandBar } from '@/components/city/CityCommandBar';
import { CitySidePanel } from '@/components/city/CitySidePanel';
import { CityLegend } from '@/components/city/CityLegend';
import { CityEventToasts } from '@/components/city/CityEventToasts';
import { PhaseOverlay } from '@/components/city/PhaseOverlay';
import { DayTransitionBanner } from '@/components/city/DayTransitionBanner';
import { ConstructionParticles } from '@/components/city/ConstructionParticles';
import { StatsStrip } from '@/components/simulation/StatsStrip';
import { useCityAgentPlacement } from '@/hooks/useCityAgentPlacement';
import { useCityBuildings } from '@/hooks/useCityBuildings';
import { GRID_CELLS } from '@/components/city/cityGridData';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function City() {
  const {
    worldState,
    agents,
    events,
    buildings: realBuildings,
    onchainTransactions,
    isProcessing,
    currentPhase,
    initializeWorld,
    toggleSimulation,
    stepSimulation,
    resetWorld,
  } = useSimulationContext();

  // Simulated buildings (used when database buildings haven't been deployed)
  const { buildings: cityBuildings, newBuildingIds } = useCityBuildings(
    agents,
    realBuildings,
    worldState?.day ?? 0
  );

  const { agentsByCell, buildingsByCell } = useCityAgentPlacement(agents, cityBuildings);

  // Speech bubble cycling: rotate through agents with reasons
  const [speechAgentId, setSpeechAgentId] = useState<string | null>(null);

  const agentsWithReasons = useMemo(
    () => agents.filter((a) => a.is_alive && a.last_action_reason),
    [agents]
  );

  const cycleSpeech = useCallback(() => {
    if (agentsWithReasons.length === 0) {
      setSpeechAgentId(null);
      return;
    }
    setSpeechAgentId((prev) => {
      const currentIdx = agentsWithReasons.findIndex((a) => a.id === prev);
      const nextIdx = (currentIdx + 1) % agentsWithReasons.length;
      return agentsWithReasons[nextIdx].id;
    });
  }, [agentsWithReasons]);

  useEffect(() => {
    cycleSpeech(); // Start immediately
    const interval = setInterval(cycleSpeech, 4000);
    return () => clearInterval(interval);
  }, [cycleSpeech]);

  // Determine which phase is active for highlighting
  const activePhaseType = useMemo(() => {
    if (!currentPhase) return null;
    if (currentPhase.includes('Governor')) return 'governor';
    if (currentPhase.includes('Worker') || currentPhase.includes('worker')) return 'worker';
    if (currentPhase.includes('Merchant') || currentPhase.includes('merchant')) return 'merchant';
    if (currentPhase.includes('Building') || currentPhase.includes('building')) return 'building';
    if (currentPhase.includes('Chaos') || currentPhase.includes('chaos')) return 'chaos';
    return null;
  }, [currentPhase]);

  // Build tile highlights based on active phase
  const tileHighlights = useMemo<Record<string, string>>(() => {
    const highlights: Record<string, string> = {};
    if (!activePhaseType) return highlights;

    for (const cell of GRID_CELLS) {
      const key = `${cell.row}-${cell.col}`;
      if (activePhaseType === 'governor' && cell.type === 'government') {
        highlights[key] = 'gov-phase-glow';
      }
      if (activePhaseType === 'worker' && cell.type === 'worker') {
        highlights[key] = 'worker-phase-glow';
      }
      if (activePhaseType === 'merchant' && cell.type === 'merchant') {
        highlights[key] = 'merchant-phase-glow';
      }
    }
    return highlights;
  }, [activePhaseType]);

  // Build tile content (agents + buildings) for each cell
  const tileContent = useMemo<Record<string, ReactNode>>(() => {
    const content: Record<string, ReactNode> = {};

    // Add buildings
    for (const [key, placement] of Object.entries(buildingsByCell)) {
      const isNew = newBuildingIds.has(placement.building.id);
      content[key] = (
        <div key={`bld-${key}`}>
          <IsometricBuilding building={placement.building} isNew={isNew} />
          <ConstructionParticles active={isNew} />
        </div>
      );
    }

    // Add agents (may overlay on top of buildings)
    for (const [key, placements] of Object.entries(agentsByCell)) {
      const existingContent = content[key];
      const agentElements = placements.map((p) => (
        <CityAgentAvatar
          key={p.agent.id}
          agent={p.agent}
          isPhaseActive={activePhaseType === p.agent.agent_type}
          showSpeech={speechAgentId === p.agent.id}
        />
      ));

      content[key] = (
        <>
          {existingContent}
          {agentElements}
        </>
      );
    }

    return content;
  }, [agentsByCell, buildingsByCell, activePhaseType, speechAgentId, newBuildingIds]);

  // Check for chaos phase
  const isChaosActive = activePhaseType === 'chaos';

  // No world exists yet
  if (!worldState) {
    return (
      <div className="h-[calc(100vh-3.5rem)] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold">No Simulation Running</h2>
          <p className="text-sm text-muted-foreground">Start a new simulation to see the city</p>
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
      <CityCommandBar
        worldState={worldState}
        isProcessing={isProcessing}
        currentPhase={currentPhase}
        onToggle={toggleSimulation}
        onStep={stepSimulation}
        onReset={resetWorld}
      />

      {/* Main area: viewport + side panel */}
      <div className="flex-1 min-h-0 flex">
        {/* City viewport */}
        <div className={`flex-1 relative bg-zinc-950 ${isChaosActive ? 'chaos-active' : ''}`}>
          <IsometricViewport>
            <IsometricGrid
              tileContent={tileContent}
              tileHighlights={tileHighlights}
              isCollapsed={worldState.is_collapsed}
            />
          </IsometricViewport>

          {/* Overlays */}
          <PhaseOverlay phase={activePhaseType} isCollapsed={worldState.is_collapsed} />
          <DayTransitionBanner day={worldState.day} />
          <CityEventToasts events={events} currentDay={worldState.day} />
          <CityLegend />
        </div>

        {/* Side panel */}
        <CitySidePanel
          agents={agents}
          buildings={cityBuildings}
          events={events}
          onchainTransactions={onchainTransactions}
          currentDay={worldState.day}
        />
      </div>

      {/* Stats Strip */}
      <StatsStrip worldState={worldState} />
    </div>
  );
}
