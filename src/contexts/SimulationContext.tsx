import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { Agent, AgentType, WorldEvent, AgentMemory, Building, ChaosEvent, DayNarrative, EmergenceLog, CollapseEvaluation } from '@/types/simulation';

// Get the return type of useSimulation
type SimulationHookReturn = ReturnType<typeof useSimulation>;

// Extended context with helper methods
interface SimulationContextValue extends SimulationHookReturn {
  // Helper methods for derived data
  getAgent: (id: string) => Agent | undefined;
  getAgentsByType: (type: AgentType) => Agent[];
  getAliveAgents: () => Agent[];
  getEventsForAgent: (agentId: string) => WorldEvent[];
  getMemoriesForAgent: (agentId: string) => AgentMemory[];
  getBuildingsForAgent: (agentId: string) => Building[];
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulationContext() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulationContext must be used within a SimulationProvider');
  }
  return context;
}

interface SimulationProviderProps {
  children: ReactNode;
}

export function SimulationProvider({ children }: SimulationProviderProps) {
  const simulation = useSimulation();

  const value = useMemo<SimulationContextValue>(() => ({
    ...simulation,

    getAgent: (id: string) => {
      return simulation.agents.find(a => a.id === id);
    },

    getAgentsByType: (type: AgentType) => {
      return simulation.agents.filter(a => a.agent_type === type);
    },

    getAliveAgents: () => {
      return simulation.agents.filter(a => a.is_alive);
    },

    getEventsForAgent: (agentId: string) => {
      return simulation.events.filter(e => e.agent_id === agentId);
    },

    getMemoriesForAgent: (agentId: string) => {
      return simulation.memories[agentId] || [];
    },

    getBuildingsForAgent: (agentId: string) => {
      return simulation.buildings.filter(b => b.owner_id === agentId);
    },
  }), [simulation]);

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}
