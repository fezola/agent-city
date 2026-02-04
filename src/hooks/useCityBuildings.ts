import { useMemo } from 'react';
import { Agent, Building, BuildingType } from '@/types/simulation';

interface BuildingScheduleEntry {
  minDay: number;
  agentName: string;
  type: BuildingType;
  level: number;
}

// Progressive building schedule - buildings appear as days progress
const BUILDING_SCHEDULE: BuildingScheduleEntry[] = [
  // Initial construction wave
  { minDay: 2, agentName: 'Alice', type: 'housing', level: 1 },
  { minDay: 3, agentName: 'Zhao', type: 'market', level: 1 },
  { minDay: 5, agentName: 'Bob', type: 'factory', level: 1 },
  { minDay: 6, agentName: 'Governor Marcus', type: 'gate', level: 1 },
  { minDay: 8, agentName: 'Charlie', type: 'housing', level: 1 },
  { minDay: 9, agentName: 'Kumar', type: 'market', level: 1 },
  { minDay: 11, agentName: 'Diana', type: 'factory', level: 1 },
  // Level 2 upgrades
  { minDay: 14, agentName: 'Alice', type: 'housing', level: 2 },
  { minDay: 16, agentName: 'Zhao', type: 'market', level: 2 },
  { minDay: 18, agentName: 'Bob', type: 'factory', level: 2 },
  { minDay: 20, agentName: 'Governor Marcus', type: 'gate', level: 2 },
  { minDay: 22, agentName: 'Charlie', type: 'housing', level: 2 },
  { minDay: 24, agentName: 'Kumar', type: 'market', level: 2 },
  { minDay: 26, agentName: 'Diana', type: 'factory', level: 2 },
  // Level 3 upgrades
  { minDay: 30, agentName: 'Alice', type: 'housing', level: 3 },
  { minDay: 32, agentName: 'Zhao', type: 'market', level: 3 },
  { minDay: 34, agentName: 'Bob', type: 'factory', level: 3 },
  { minDay: 36, agentName: 'Governor Marcus', type: 'gate', level: 3 },
];

export function useCityBuildings(
  agents: Agent[],
  realBuildings: Building[],
  day: number
): { buildings: Building[]; newBuildingIds: Set<string> } {
  return useMemo(() => {
    // If real buildings exist from the database, use those
    if (realBuildings.length > 0) {
      return { buildings: realBuildings, newBuildingIds: new Set<string>() };
    }

    if (day <= 0 || agents.length === 0) {
      return { buildings: [], newBuildingIds: new Set<string>() };
    }

    // Build map: agentName -> best building entry for current day
    const agentBest = new Map<string, BuildingScheduleEntry>();
    for (const entry of BUILDING_SCHEDULE) {
      if (day < entry.minDay) continue;
      const existing = agentBest.get(entry.agentName);
      if (!existing || entry.level > existing.level) {
        agentBest.set(entry.agentName, entry);
      }
    }

    const buildings: Building[] = [];
    const newBuildingIds = new Set<string>();

    for (const [agentName, entry] of agentBest) {
      const agent = agents.find((a) => a.name === agentName);
      if (!agent || !agent.is_alive) continue;

      const id = `sim-${agent.id}-${entry.type}`;
      buildings.push({
        id,
        world_id: agent.world_id,
        owner_id: agent.id,
        building_type: entry.type,
        level: entry.level,
        is_active: true,
        built_day: entry.minDay,
        last_maintained_day: day,
        created_at: new Date().toISOString(),
      });

      // Mark as "new" if it just appeared this day
      if (entry.minDay === day) {
        newBuildingIds.add(id);
      }
    }

    return { buildings, newBuildingIds };
  }, [agents, realBuildings, day]);
}
