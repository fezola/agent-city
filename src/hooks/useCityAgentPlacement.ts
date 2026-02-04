import { useMemo } from 'react';
import { Agent, Building } from '@/types/simulation';
import { AGENT_SLOTS, BUILDING_CELLS } from '@/components/city/cityGridData';

interface AgentPlacement {
  agent: Agent;
  row: number;
  col: number;
}

interface BuildingPlacement {
  building: Building;
  row: number;
  col: number;
}

export function useCityAgentPlacement(agents: Agent[], buildings: Building[]) {
  const agentPlacements = useMemo<AgentPlacement[]>(() => {
    return agents
      .map((agent) => {
        const slot = AGENT_SLOTS[agent.name];
        if (!slot) return null;
        return { agent, row: slot[0], col: slot[1] };
      })
      .filter((p): p is AgentPlacement => p !== null);
  }, [agents]);

  const buildingPlacements = useMemo<BuildingPlacement[]>(() => {
    return buildings
      .map((building) => {
        // Find the agent who owns this building to get their building cell
        const ownerAgent = agents.find((a) => a.id === building.owner_id);
        if (!ownerAgent) return null;
        const cell = BUILDING_CELLS[ownerAgent.name];
        if (!cell) return null;
        return { building, row: cell[0], col: cell[1] };
      })
      .filter((p): p is BuildingPlacement => p !== null);
  }, [buildings, agents]);

  // Build lookup maps for quick tile-level access: "row-col" -> placement
  const agentsByCell = useMemo(() => {
    const map: Record<string, AgentPlacement[]> = {};
    for (const p of agentPlacements) {
      const key = `${p.row}-${p.col}`;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    return map;
  }, [agentPlacements]);

  const buildingsByCell = useMemo(() => {
    const map: Record<string, BuildingPlacement> = {};
    for (const p of buildingPlacements) {
      const key = `${p.row}-${p.col}`;
      map[key] = p;
    }
    return map;
  }, [buildingPlacements]);

  return { agentPlacements, buildingPlacements, agentsByCell, buildingsByCell };
}
