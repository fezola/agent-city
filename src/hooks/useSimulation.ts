import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  WorldState,
  Agent,
  WorldEvent,
  AgentMemory,
  Wager,
  BalanceHistory,
  ChaosEvent,
  DayNarrative,
  EmergenceLog,
  CollapseEvaluation,
  DayEvents,
  ChaosDecision,
  DEFAULT_CONFIG,
  SimulationConfig,
  Building,
  BuildingType,
  BuildingDecision,
  BUILDING_COSTS,
  BUILDING_MAINTENANCE,
  AGENT_ALLOWED_BUILDINGS,
  OnchainTransaction,
} from '@/types/simulation';
import { toast } from 'sonner';

export function useSimulation() {
  const [worldState, setWorldState] = useState<WorldState | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [events, setEvents] = useState<WorldEvent[]>([]);
  const [memories, setMemories] = useState<Record<string, AgentMemory[]>>({});
  const [wagers, setWagers] = useState<Wager[]>([]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [config] = useState<SimulationConfig>(DEFAULT_CONFIG);

  // Meta-agent state
  const [chaosEvents, setChaosEvents] = useState<ChaosEvent[]>([]);
  const [narratives, setNarratives] = useState<DayNarrative[]>([]);
  const [emergenceLogs, setEmergenceLogs] = useState<EmergenceLog[]>([]);
  const [collapseEvaluations, setCollapseEvaluations] = useState<CollapseEvaluation[]>([]);

  // Building state
  const [buildings, setBuildings] = useState<Building[]>([]);

  // Onchain transaction state
  const [onchainTransactions, setOnchainTransactions] = useState<OnchainTransaction[]>([]);

  // Track per-agent earnings during day processing for onchain settlement
  const agentEarningsRef = useRef<Record<string, { earnings: number; buildingCost: number; wagerPayout: number }>>({});

  // Track day events for narrative/emergence
  const dayEventsRef = useRef<DayEvents>({
    governor_decisions: [],
    worker_decisions: [],
    merchant_decisions: [],
    building_decisions: [],
    chaos_event: undefined,
    expulsions: [],
    wager_results: [],
  });

  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // Load world state
  const loadWorldState = useCallback(async () => {
    const { data: worlds, error } = await supabase
      .from('world_state')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('Error loading world state:', error);
      return null;
    }

    if (worlds && worlds.length > 0) {
      const world = worlds[0] as WorldState;
      setWorldState(world);
      return world;
    }
    return null;
  }, []);

  // Load agents for current world
  const loadAgents = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq('world_id', worldId)
      .order('agent_type', { ascending: true });

    if (error) {
      console.error('Error loading agents:', error);
      return;
    }

    setAgents((data || []) as Agent[]);
  }, []);

  // Load events
  const loadEvents = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('world_events')
      .select('*')
      .eq('world_id', worldId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error loading events:', error);
      return;
    }

    setEvents((data || []) as WorldEvent[]);
  }, []);

  // Load balance history
  const loadBalanceHistory = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('balance_history')
      .select('*')
      .eq('world_id', worldId)
      .order('day', { ascending: true });

    if (error) {
      console.error('Error loading balance history:', error);
      return;
    }

    setBalanceHistory((data || []) as BalanceHistory[]);
  }, []);

  // Load wagers
  const loadWagers = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('wagers')
      .select('*')
      .eq('world_id', worldId);

    if (error) {
      console.error('Error loading wagers:', error);
      return;
    }

    setWagers((data || []) as Wager[]);
  }, []);

  // Load memories for all agents
  const loadMemories = useCallback(async (agentIds: string[]) => {
    if (agentIds.length === 0) return;

    const { data, error } = await supabase
      .from('agent_memories')
      .select('*')
      .in('agent_id', agentIds)
      .order('day', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading memories:', error);
      return;
    }

    const grouped: Record<string, AgentMemory[]> = {};
    (data || []).forEach((mem) => {
      const memory = mem as AgentMemory;
      if (!grouped[memory.agent_id]) grouped[memory.agent_id] = [];
      grouped[memory.agent_id].push(memory);
    });
    setMemories(grouped);
  }, []);

  // Load chaos events
  const loadChaosEvents = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('chaos_events')
      .select('*')
      .eq('world_id', worldId)
      .order('day', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading chaos events:', error);
      return;
    }

    setChaosEvents((data || []) as ChaosEvent[]);
  }, []);

  // Load narratives
  const loadNarratives = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('day_narratives')
      .select('*')
      .eq('world_id', worldId)
      .order('day', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading narratives:', error);
      return;
    }

    setNarratives((data || []) as DayNarrative[]);
  }, []);

  // Load emergence logs
  const loadEmergenceLogs = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('emergence_logs')
      .select('*')
      .eq('world_id', worldId)
      .order('day', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading emergence logs:', error);
      return;
    }

    setEmergenceLogs((data || []) as EmergenceLog[]);
  }, []);

  // Load collapse evaluations
  const loadCollapseEvaluations = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('collapse_evaluations')
      .select('*')
      .eq('world_id', worldId)
      .order('day', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error loading collapse evaluations:', error);
      return;
    }

    setCollapseEvaluations((data || []) as CollapseEvaluation[]);
  }, []);

  // Load buildings
  const loadBuildings = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('buildings')
      .select('*')
      .eq('world_id', worldId);

    if (error) {
      console.error('Error loading buildings:', error);
      return;
    }

    setBuildings((data || []) as Building[]);
  }, []);

  // Load onchain transactions
  const loadOnchainTransactions = useCallback(async (worldId: string) => {
    const { data, error } = await supabase
      .from('onchain_transactions')
      .select('*')
      .eq('world_id', worldId)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Error loading onchain transactions:', error);
      return;
    }

    setOnchainTransactions((data || []) as OnchainTransaction[]);
  }, []);

  // Initialize a new world
  const initializeWorld = useCallback(async () => {
    setIsProcessing(true);
    setCurrentPhase('Initializing world...');

    try {
      // Create world state
      const { data: world, error: worldError } = await supabase
        .from('world_state')
        .insert({
          day: 1,
          treasury_balance: config.startingTreasury,
          tax_rate: 0.15,
          salary_rate: 100,
          participation_fee: 20,
          city_health: 100,
          worker_satisfaction: 75,
          merchant_stability: 80,
          inflation: 1.0,
          is_running: false,
          is_collapsed: false,
        })
        .select()
        .single();

      if (worldError) throw worldError;

      const worldData = world as WorldState;

      // Create agents
      const agentsToCreate = [
        // Governor
        {
          world_id: worldData.id,
          name: 'Governor Marcus',
          agent_type: 'governor' as const,
          balance: 0,
          mood: 'neutral' as const,
          confidence: 0.8
        },
        // Workers
        ...Array.from({ length: config.initialWorkers }, (_, i) => ({
          world_id: worldData.id,
          name: `Worker ${['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'][i] || `#${i + 1}`}`,
          agent_type: 'worker' as const,
          balance: config.startingBalance,
          mood: 'neutral' as const,
          confidence: 0.6 + Math.random() * 0.2,
        })),
        // Merchants
        ...Array.from({ length: config.initialMerchants }, (_, i) => ({
          world_id: worldData.id,
          name: `Merchant ${['Zhao', 'Kumar'][i] || `#${i + 1}`}`,
          agent_type: 'merchant' as const,
          balance: config.startingBalance * 2,
          mood: 'neutral' as const,
          confidence: 0.7,
          current_price_modifier: 1.0,
        })),
      ];

      const { error: agentsError } = await supabase
        .from('agents')
        .insert(agentsToCreate);

      if (agentsError) throw agentsError;

      // Create initial event
      await supabase.from('world_events').insert({
        world_id: worldData.id,
        day: 1,
        event_type: 'world_created',
        description: 'A new economic simulation has begun. The gates are open.',
      });

      // Create initial narrative
      await supabase.from('day_narratives').insert({
        world_id: worldData.id,
        day: 1,
        summary: 'The city awakens to a new era. Governor Marcus takes office, workers begin their duties, and merchants open their shops. The economy stands ready, its fate yet to be written.',
      });

      // Record initial balance history
      await recordBalanceHistory(worldData.id, 1, worldData.treasury_balance, 75, 100);

      await loadWorldState();
      await loadAgents(worldData.id);
      await loadEvents(worldData.id);
      await loadNarratives(worldData.id);

      toast.success('New world initialized!');
    } catch (error) {
      console.error('Error initializing world:', error);
      toast.error('Failed to initialize world');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('');
    }
  }, [config, loadWorldState, loadAgents, loadEvents, loadNarratives]);

  // Record balance history
  const recordBalanceHistory = async (
    worldId: string,
    day: number,
    treasury: number,
    satisfaction: number,
    health: number
  ) => {
    await supabase.from('balance_history').insert({
      world_id: worldId,
      day,
      balance: treasury,
      treasury_balance: treasury,
      worker_satisfaction: satisfaction,
      city_health: health,
    });
  };

  // ==================== CHAOS ORCHESTRATOR ====================
  const processChaosEvent = async (): Promise<ChaosDecision | null> => {
    if (!worldState) return null;

    try {
      setCurrentPhase('🌪️ Chaos Orchestrator evaluating...');

      // Get recent chaos memory
      const { data: recentChaos } = await supabase
        .from('chaos_events')
        .select('*')
        .eq('world_id', worldState.id)
        .order('day', { ascending: false })
        .limit(5);

      const chaosMemories = (recentChaos || []).map(c => ({
        day: c.day,
        content: { event: c.event_type, severity: c.severity }
      }));

      const { data, error } = await supabase.functions.invoke('system-agents', {
        body: {
          agentType: 'chaos',
          worldState: {
            day: worldState.day,
            treasury_balance: worldState.treasury_balance,
            tax_rate: worldState.tax_rate,
            participation_fee: worldState.participation_fee,
            inflation: worldState.inflation,
            city_health: worldState.city_health,
            worker_satisfaction: worldState.worker_satisfaction,
            merchant_stability: worldState.merchant_stability,
          },
          memories: chaosMemories,
        },
      });

      if (error) throw error;

      const decision = data.decision as ChaosDecision;

      // Record chaos event
      await supabase.from('chaos_events').insert({
        world_id: worldState.id,
        day: worldState.day,
        event_type: decision.event,
        severity: decision.severity,
        reason: decision.reason,
      });

      // Apply chaos effects
      if (decision.event !== 'no_event') {
        dayEventsRef.current.chaos_event = `${decision.event} (severity: ${(decision.severity * 100).toFixed(0)}%)`;
        await applyChaosEffects(decision);

        await supabase.from('world_events').insert({
          world_id: worldState.id,
          day: worldState.day,
          event_type: 'chaos_event',
          description: `⚡ CHAOS: ${decision.event.replace(/_/g, ' ').toUpperCase()} - ${decision.reason}`,
          details: { severity: decision.severity },
        });
      }

      return decision;
    } catch (error) {
      console.error('Chaos orchestrator error:', error);
      return null;
    }
  };

  // Apply chaos effects to world state
  const applyChaosEffects = async (chaos: ChaosDecision) => {
    if (!worldState) return;

    const updates: Partial<WorldState> = {};
    const severity = chaos.severity;

    switch (chaos.event) {
      case 'emergency_tax_hike':
        updates.tax_rate = Math.min(0.5, worldState.tax_rate + (0.1 * severity));
        updates.worker_satisfaction = Math.max(0, worldState.worker_satisfaction - (20 * severity));
        break;
      case 'inflation_spike':
        updates.inflation = worldState.inflation + (0.5 * severity);
        updates.city_health = Math.max(0, worldState.city_health - (10 * severity));
        break;
      case 'treasury_leak':
        updates.treasury_balance = Math.max(0, worldState.treasury_balance - (worldState.treasury_balance * 0.2 * severity));
        break;
      case 'merchant_supply_shock':
        updates.merchant_stability = Math.max(0, worldState.merchant_stability - (30 * severity));
        updates.inflation = worldState.inflation + (0.3 * severity);
        break;
      case 'worker_strike':
        updates.worker_satisfaction = Math.max(0, worldState.worker_satisfaction - (25 * severity));
        updates.city_health = Math.max(0, worldState.city_health - (15 * severity));
        break;
      case 'external_demand_boom':
        updates.treasury_balance = worldState.treasury_balance + (1000 * severity);
        updates.merchant_stability = Math.min(100, worldState.merchant_stability + (10 * severity));
        break;
    }

    if (Object.keys(updates).length > 0) {
      await supabase.from('world_state').update(updates).eq('id', worldState.id);
    }
  };

  // ==================== COLLAPSE EVALUATOR ====================
  const processCollapseEvaluation = async (): Promise<boolean> => {
    if (!worldState) return false;

    try {
      setCurrentPhase('⚖️ Collapse Evaluator assessing...');

      const totalAgents = agents.length;
      const aliveAgents = agents.filter(a => a.is_alive).length;
      const exitRate = totalAgents > 0 ? (totalAgents - aliveAgents) / totalAgents : 0;

      const { data, error } = await supabase.functions.invoke('system-agents', {
        body: {
          agentType: 'collapse',
          worldState: {
            day: worldState.day,
            treasury_balance: worldState.treasury_balance,
            city_health: worldState.city_health,
            worker_satisfaction: worldState.worker_satisfaction,
            merchant_stability: worldState.merchant_stability,
          },
          exitRate,
        },
      });

      if (error) throw error;

      const decision = data.decision;

      // Record evaluation
      await supabase.from('collapse_evaluations').insert({
        world_id: worldState.id,
        day: worldState.day,
        status: decision.status,
        confidence: decision.confidence,
        reason: decision.reason,
      });

      // Handle collapse
      if (decision.status === 'collapsed') {
        await supabase.from('world_state').update({
          is_collapsed: true,
          is_running: false
        }).eq('id', worldState.id);

        await supabase.from('world_events').insert({
          world_id: worldState.id,
          day: worldState.day,
          event_type: 'collapse',
          description: `💀 COLLAPSE: ${decision.reason}`,
          details: { confidence: decision.confidence },
        });

        toast.error('The economy has collapsed!');
        return true;
      }

      return false;
    } catch (error) {
      console.error('Collapse evaluator error:', error);
      return false;
    }
  };

  // ==================== NARRATIVE SUMMARIZER ====================
  const processNarrative = async () => {
    if (!worldState) return;

    try {
      setCurrentPhase('📖 Narrative Summarizer writing...');

      const { data, error } = await supabase.functions.invoke('system-agents', {
        body: {
          agentType: 'narrative',
          worldState: {
            day: worldState.day,
            treasury_balance: worldState.treasury_balance,
            city_health: worldState.city_health,
            worker_satisfaction: worldState.worker_satisfaction,
          },
          dayEvents: dayEventsRef.current,
        },
      });

      if (error) throw error;

      const decision = data.decision;

      // Save narrative
      await supabase.from('day_narratives').insert({
        world_id: worldState.id,
        day: worldState.day,
        summary: decision.summary,
      });

    } catch (error) {
      console.error('Narrative summarizer error:', error);
    }
  };

  // ==================== EMERGENCE EVALUATOR ====================
  const processEmergence = async () => {
    if (!worldState) return;

    try {
      setCurrentPhase('🔬 Emergence Evaluator analyzing...');

      // Get recent patterns
      const { data: recentEmergence } = await supabase
        .from('emergence_logs')
        .select('description')
        .eq('world_id', worldState.id)
        .eq('detected', true)
        .order('day', { ascending: false })
        .limit(5);

      const recentPatterns = (recentEmergence || [])
        .filter(e => e.description)
        .map(e => e.description as string);

      const { data, error } = await supabase.functions.invoke('system-agents', {
        body: {
          agentType: 'emergence',
          worldState: {
            day: worldState.day,
            city_health: worldState.city_health,
            worker_satisfaction: worldState.worker_satisfaction,
          },
          dayEvents: dayEventsRef.current,
          recentPatterns,
        },
      });

      if (error) throw error;

      const decision = data.decision;

      // Save emergence log
      await supabase.from('emergence_logs').insert({
        world_id: worldState.id,
        day: worldState.day,
        detected: decision.emergent_behavior_detected,
        description: decision.description,
      });

      if (decision.emergent_behavior_detected) {
        await supabase.from('world_events').insert({
          world_id: worldState.id,
          day: worldState.day,
          event_type: 'emergence_detected',
          description: `🔬 EMERGENCE: ${decision.description}`,
        });
      }

    } catch (error) {
      console.error('Emergence evaluator error:', error);
    }
  };

  // ==================== MAIN PROCESS DAY ====================
  const processDay = useCallback(async () => {
    if (!worldState || isProcessing || worldState.is_collapsed) return;

    setIsProcessing(true);

    // Reset day events tracker
    agentEarningsRef.current = {};
    dayEventsRef.current = {
      governor_decisions: [],
      worker_decisions: [],
      merchant_decisions: [],
      building_decisions: [],
      chaos_event: undefined,
      expulsions: [],
      wager_results: [],
    };

    try {
      const aliveAgents = agents.filter(a => a.is_alive);
      const governor = aliveAgents.find(a => a.agent_type === 'governor');
      const workers = aliveAgents.filter(a => a.agent_type === 'worker');
      const merchants = aliveAgents.filter(a => a.agent_type === 'merchant');

      // Phase 1: CHAOS ORCHESTRATOR
      await processChaosEvent();
      await new Promise(r => setTimeout(r, 1500));

      // Phase 2: Collect participation fees
      setCurrentPhase('💰 Collecting participation fees...');
      await collectFees(workers, merchants);
      await new Promise(r => setTimeout(r, 1500));

      // Phase 3: Governor decision
      if (governor) {
        setCurrentPhase('🏛️ Governor contemplating policy...');
        await processGovernorDecision(governor);
        await new Promise(r => setTimeout(r, 2000));
      }

      // Phase 4: Worker decisions
      setCurrentPhase('👷 Workers making decisions...');
      for (const worker of workers.filter(w => w.is_alive)) {
        await processWorkerDecision(worker);
        await new Promise(r => setTimeout(r, 800));
      }

      // Phase 5: Merchant decisions
      setCurrentPhase('🛒 Merchants adjusting prices...');
      for (const merchant of merchants.filter(m => m.is_alive)) {
        await processMerchantDecision(merchant);
        await new Promise(r => setTimeout(r, 800));
      }

      // Phase 5.5: Building decisions
      setCurrentPhase('🏗️ Building decisions...');
      await processBuildingPhase(governor, workers, merchants);
      await new Promise(r => setTimeout(r, 1000));

      // Phase 6: Resolve wagers
      setCurrentPhase('🎲 Resolving wagers...');
      await resolveWagers();
      await new Promise(r => setTimeout(r, 1000));

      // Phase 7: Update world state
      setCurrentPhase('📊 Updating world state...');
      await updateWorldState();

      // Phase 8: COLLAPSE EVALUATOR
      const collapsed = await processCollapseEvaluation();
      if (collapsed) {
        // End simulation if collapsed
        await loadWorldState();
        return;
      }
      await new Promise(r => setTimeout(r, 1000));

      // Phase 9: NARRATIVE SUMMARIZER
      await processNarrative();
      await new Promise(r => setTimeout(r, 1000));

      // Phase 10: EMERGENCE EVALUATOR
      await processEmergence();

      // Phase 11: ONCHAIN SETTLEMENT (non-blocking)
      setCurrentPhase('⛓️ Settling onchain...');
      try {
        const settlements = agents
          .filter(a => a.is_alive)
          .map(a => ({
            agentId: a.id,
            agentName: a.name,
            agentType: a.agent_type,
            earnings: agentEarningsRef.current[a.id]?.earnings || 0,
            buildingCost: agentEarningsRef.current[a.id]?.buildingCost || 0,
            wagerPayout: agentEarningsRef.current[a.id]?.wagerPayout || 0,
          }))
          .filter(s => s.earnings > 0 || s.buildingCost > 0 || s.wagerPayout > 0);

        if (settlements.length > 0) {
          await supabase.functions.invoke('onchain-settle', {
            body: {
              worldId: worldState.id,
              day: worldState.day,
              settlements,
            },
          });
        }
      } catch (err) {
        console.error('Onchain settlement failed (non-blocking):', err);
      }

      // Reload all data
      await loadWorldState();
      await loadAgents(worldState.id);
      await loadEvents(worldState.id);
      await loadBalanceHistory(worldState.id);
      await loadWagers(worldState.id);
      await loadChaosEvents(worldState.id);
      await loadNarratives(worldState.id);
      await loadEmergenceLogs(worldState.id);
      await loadCollapseEvaluations(worldState.id);
      await loadBuildings(worldState.id);
      await loadOnchainTransactions(worldState.id);

    } catch (error) {
      console.error('Error processing day:', error);
      toast.error('Error during simulation');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('');
    }
  }, [worldState, agents, buildings, isProcessing, loadWorldState, loadAgents, loadEvents, loadBalanceHistory, loadWagers, loadChaosEvents, loadNarratives, loadEmergenceLogs, loadCollapseEvaluations, loadBuildings, loadOnchainTransactions]);

  // Collect fees from all agents
  const collectFees = async (workers: Agent[], merchants: Agent[]) => {
    if (!worldState) return;

    const fee = worldState.participation_fee;
    let collectedFees = 0;

    for (const agent of [...workers, ...merchants]) {
      if (!agent.is_alive) continue;

      const newBalance = agent.balance - fee;

      if (newBalance < 0) {
        // Agent expelled
        await supabase.from('agents').update({ is_alive: false, balance: 0 }).eq('id', agent.id);
        await supabase.from('world_events').insert({
          world_id: worldState.id,
          day: worldState.day,
          event_type: 'expulsion',
          agent_id: agent.id,
          agent_name: agent.name,
          description: `${agent.name} has been expelled from the economy for insufficient funds!`,
        });
        await supabase.from('agent_memories').insert({
          agent_id: agent.id,
          day: worldState.day,
          event: 'expelled',
          impact: 'negative',
          emotion: 'despair',
          details: 'Could not afford participation fee',
        });
        dayEventsRef.current.expulsions.push(agent.name);
      } else {
        await supabase.from('agents').update({ balance: newBalance }).eq('id', agent.id);
        collectedFees += fee;
      }
    }

    // Add fees to treasury
    let treasuryBalance = worldState.treasury_balance + collectedFees;
    await supabase.from('world_state').update({
      treasury_balance: treasuryBalance,
    }).eq('id', worldState.id);

    // Building maintenance
    const hasPowerHub = buildings.some(b => b.building_type === 'power_hub' && b.is_active);
    const powerHubLevel = hasPowerHub
      ? buildings.find(b => b.building_type === 'power_hub' && b.is_active)!.level
      : 0;
    const maintenanceDiscount = 1 - (powerHubLevel * 0.1);

    for (const building of buildings.filter(b => b.is_active)) {
      const baseCost = BUILDING_MAINTENANCE[building.building_type as BuildingType] * building.level;
      const cost = Math.round(baseCost * maintenanceDiscount);

      if (building.building_type === 'gate' || building.building_type === 'power_hub') {
        // Governor buildings: deduct from treasury
        if (treasuryBalance >= cost) {
          treasuryBalance -= cost;
          await supabase.from('world_state').update({ treasury_balance: treasuryBalance }).eq('id', worldState.id);
          await supabase.from('buildings').update({ last_maintained_day: worldState.day }).eq('id', building.id);
        } else {
          // Can't afford maintenance - degrade building
          const newLevel = building.level - 1;
          if (newLevel < 1) {
            await supabase.from('buildings').delete().eq('id', building.id);
            await supabase.from('world_events').insert({
              world_id: worldState.id, day: worldState.day, event_type: 'building_destroyed',
              description: `${building.building_type} collapsed due to lack of maintenance!`,
            });
          } else {
            await supabase.from('buildings').update({ level: newLevel, is_active: false }).eq('id', building.id);
            await supabase.from('world_events').insert({
              world_id: worldState.id, day: worldState.day, event_type: 'building_decay',
              description: `${building.building_type} degraded to level ${newLevel} - maintenance unpaid`,
            });
          }
        }
      } else {
        // Agent buildings: deduct from agent balance
        const owner = [...workers, ...merchants].find(a => a.id === building.owner_id);
        if (owner && owner.is_alive && owner.balance >= cost) {
          await supabase.from('agents').update({ balance: owner.balance - cost }).eq('id', owner.id);
          await supabase.from('buildings').update({ last_maintained_day: worldState.day }).eq('id', building.id);
        } else {
          // Can't afford maintenance - degrade building
          const newLevel = building.level - 1;
          if (newLevel < 1) {
            await supabase.from('buildings').delete().eq('id', building.id);
            await supabase.from('world_events').insert({
              world_id: worldState.id, day: worldState.day, event_type: 'building_destroyed',
              agent_id: building.owner_id,
              description: `${building.building_type} collapsed due to lack of maintenance!`,
            });
          } else {
            await supabase.from('buildings').update({ level: newLevel, is_active: false }).eq('id', building.id);
            await supabase.from('world_events').insert({
              world_id: worldState.id, day: worldState.day, event_type: 'building_decay',
              agent_id: building.owner_id,
              description: `${building.building_type} degraded to level ${newLevel} - maintenance unpaid`,
            });
          }
        }
      }
    }
  };

  // Process building phase - each agent decides whether to build/upgrade/skip
  const processBuildingPhase = async (
    governor: Agent | undefined,
    workers: Agent[],
    merchants: Agent[]
  ) => {
    if (!worldState) return;

    const allAgents = [
      ...(governor ? [governor] : []),
      ...workers.filter(w => w.is_alive),
      ...merchants.filter(m => m.is_alive),
    ];

    const worldBuildingCount = buildings.length;
    const hasPowerHub = buildings.some(b => b.building_type === 'power_hub' && b.is_active);

    for (const agent of allAgents) {
      try {
        const existingBuilding = buildings.find(b => b.owner_id === agent.id);

        const buildingWorldState: Record<string, unknown> = {
          day: worldState.day,
          tax_rate: worldState.tax_rate,
          participation_fee: worldState.participation_fee,
          city_health: worldState.city_health,
          worker_satisfaction: worldState.worker_satisfaction,
          inflation: worldState.inflation,
          existing_building: existingBuilding
            ? { building_type: existingBuilding.building_type, level: existingBuilding.level, is_active: existingBuilding.is_active }
            : null,
          world_building_count: worldBuildingCount,
          has_power_hub: hasPowerHub,
        };

        if (agent.agent_type === 'governor') {
          buildingWorldState.treasury_balance = worldState.treasury_balance;
        } else {
          buildingWorldState.balance = agent.balance;
          buildingWorldState.salary_rate = worldState.salary_rate;
        }

        const { data, error } = await supabase.functions.invoke('building-decision', {
          body: {
            agentType: agent.agent_type,
            agentId: agent.id,
            worldState: buildingWorldState,
            memories: memories[agent.id] || [],
          },
        });

        if (error) {
          console.error(`Building decision error for ${agent.name}:`, error);
          continue;
        }

        const decision: BuildingDecision = data.decision;

        if (decision.action === 'skip') continue;

        if (decision.action === 'build') {
          if (existingBuilding) continue; // Already has a building
          const buildingType = decision.building_type as BuildingType;
          if (!buildingType) continue;
          const allowedTypes = AGENT_ALLOWED_BUILDINGS[agent.agent_type as keyof typeof AGENT_ALLOWED_BUILDINGS];
          if (!allowedTypes?.includes(buildingType)) continue;

          const cost = BUILDING_COSTS[buildingType];
          const canAfford = agent.agent_type === 'governor'
            ? worldState.treasury_balance >= cost
            : agent.balance >= cost;

          if (!canAfford) continue;

          // Deduct cost
          if (agent.agent_type === 'governor') {
            await supabase.from('world_state').update({
              treasury_balance: worldState.treasury_balance - cost,
            }).eq('id', worldState.id);
          } else {
            await supabase.from('agents').update({
              balance: agent.balance - cost,
            }).eq('id', agent.id);
          }

          // Create building
          await supabase.from('buildings').insert({
            world_id: worldState.id,
            owner_id: agent.id,
            building_type: buildingType,
            level: 1,
            built_day: worldState.day,
            last_maintained_day: worldState.day,
          });

          // Track building cost for onchain settlement
          if (!agentEarningsRef.current[agent.id]) agentEarningsRef.current[agent.id] = { earnings: 0, buildingCost: 0, wagerPayout: 0 };
          agentEarningsRef.current[agent.id].buildingCost += cost;

          const eventDesc = `🏗️ ${agent.name} built a ${buildingType} (cost: ${cost})`;
          await supabase.from('world_events').insert({
            world_id: worldState.id,
            day: worldState.day,
            event_type: 'building_built',
            agent_id: agent.id,
            agent_name: agent.name,
            description: eventDesc,
            details: { building_type: buildingType, cost, reason: decision.reason },
          });

          dayEventsRef.current.building_decisions.push(eventDesc);

        } else if (decision.action === 'upgrade') {
          if (!existingBuilding || existingBuilding.level >= 3) continue;

          const buildingType = existingBuilding.building_type as BuildingType;
          const upgradeCost = BUILDING_COSTS[buildingType] * existingBuilding.level;
          const canAfford = agent.agent_type === 'governor'
            ? worldState.treasury_balance >= upgradeCost
            : agent.balance >= upgradeCost;

          if (!canAfford) continue;

          // Deduct cost
          if (agent.agent_type === 'governor') {
            await supabase.from('world_state').update({
              treasury_balance: worldState.treasury_balance - upgradeCost,
            }).eq('id', worldState.id);
          } else {
            await supabase.from('agents').update({
              balance: agent.balance - upgradeCost,
            }).eq('id', agent.id);
          }

          // Upgrade building
          const newLevel = existingBuilding.level + 1;
          await supabase.from('buildings').update({
            level: newLevel,
            is_active: true,
          }).eq('id', existingBuilding.id);

          const eventDesc = `⬆️ ${agent.name} upgraded ${buildingType} to level ${newLevel} (cost: ${upgradeCost})`;
          await supabase.from('world_events').insert({
            world_id: worldState.id,
            day: worldState.day,
            event_type: 'building_upgraded',
            agent_id: agent.id,
            agent_name: agent.name,
            description: eventDesc,
            details: { building_type: buildingType, new_level: newLevel, cost: upgradeCost, reason: decision.reason },
          });

          dayEventsRef.current.building_decisions.push(eventDesc);
        }

      } catch (error) {
        console.error(`Building decision error for ${agent.name}:`, error);
      }
    }

    // Reload buildings after all decisions
    await loadBuildings(worldState.id);
  };

  // Process Governor AI decision
  const processGovernorDecision = async (governor: Agent) => {
    if (!worldState) return;

    try {
      const { data, error } = await supabase.functions.invoke('agent-decision', {
        body: {
          agentType: 'governor',
          agentId: governor.id,
          worldState: {
            day: worldState.day,
            treasury_balance: worldState.treasury_balance,
            tax_rate: worldState.tax_rate,
            salary_rate: worldState.salary_rate,
            participation_fee: worldState.participation_fee,
            city_health: worldState.city_health,
            worker_satisfaction: worldState.worker_satisfaction,
            merchant_stability: worldState.merchant_stability,
          },
          memories: memories[governor.id] || [],
        },
      });

      if (error) throw error;

      const decision = data.decision;

      // Apply decision
      let updates: Partial<WorldState> = {};
      let eventDescription = '';

      switch (decision.action) {
        case 'increase_tax':
          updates.tax_rate = Math.min(0.5, worldState.tax_rate + decision.value_change);
          eventDescription = `📈 Governor increased tax rate to ${((updates.tax_rate as number) * 100).toFixed(0)}%`;
          break;
        case 'decrease_tax':
          updates.tax_rate = Math.max(0.05, worldState.tax_rate - decision.value_change);
          eventDescription = `📉 Governor decreased tax rate to ${((updates.tax_rate as number) * 100).toFixed(0)}%`;
          break;
        case 'raise_salary':
          updates.salary_rate = worldState.salary_rate + decision.value_change;
          eventDescription = `💵 Governor raised salary to ${updates.salary_rate}`;
          break;
        case 'cut_salary':
          updates.salary_rate = Math.max(50, worldState.salary_rate - decision.value_change);
          eventDescription = `✂️ Governor cut salary to ${updates.salary_rate}`;
          break;
        case 'increase_fee':
          updates.participation_fee = worldState.participation_fee + decision.value_change;
          eventDescription = `🚪 Governor increased participation fee to ${updates.participation_fee}`;
          break;
        case 'decrease_fee':
          updates.participation_fee = Math.max(5, worldState.participation_fee - decision.value_change);
          eventDescription = `🎁 Governor decreased participation fee to ${updates.participation_fee}`;
          break;
        default:
          eventDescription = `⏸️ Governor maintained current policy`;
      }

      if (Object.keys(updates).length > 0) {
        await supabase.from('world_state').update(updates).eq('id', worldState.id);
      }

      await supabase.from('agents').update({
        last_action: decision.action,
        last_action_reason: decision.reason,
        confidence: decision.confidence,
      }).eq('id', governor.id);

      await supabase.from('world_events').insert({
        world_id: worldState.id,
        day: worldState.day,
        event_type: 'governor_decision',
        agent_id: governor.id,
        agent_name: governor.name,
        description: eventDescription,
        details: { reason: decision.reason, confidence: decision.confidence },
      });

      dayEventsRef.current.governor_decisions.push(eventDescription);

    } catch (error) {
      console.error('Governor decision error:', error);
      await supabase.from('world_events').insert({
        world_id: worldState.id,
        day: worldState.day,
        event_type: 'governor_decision',
        agent_id: governor.id,
        agent_name: governor.name,
        description: '⏸️ Governor maintained current policy (AI unavailable)',
      });
    }
  };

  // Process Worker AI decision
  const processWorkerDecision = async (worker: Agent) => {
    if (!worldState) return;

    try {
      const { data, error } = await supabase.functions.invoke('agent-decision', {
        body: {
          agentType: 'worker',
          agentId: worker.id,
          worldState: {
            day: worldState.day,
            balance: worker.balance,
            salary_rate: worldState.salary_rate,
            tax_rate: worldState.tax_rate,
            participation_fee: worldState.participation_fee,
            inflation: worldState.inflation,
            city_health: worldState.city_health,
          },
          memories: memories[worker.id] || [],
        },
      });

      if (error) throw error;

      const decision = data.decision;
      let eventDescription = '';
      let newBalance = worker.balance;
      let newMood = worker.mood;
      let satisfactionChange = 0;

      switch (decision.action) {
        case 'work':
          const factoryBuilding = buildings.find(b =>
            b.owner_id === worker.id && b.building_type === 'factory' && b.is_active
          );
          const factoryBonus = factoryBuilding ? 15 * factoryBuilding.level : 0;
          const earnings = worldState.salary_rate * (1 - worldState.tax_rate) + factoryBonus;
          newBalance += earnings;
          eventDescription = `💼 ${worker.name} worked and earned ${earnings.toFixed(0)} tokens${factoryBonus > 0 ? ` (factory +${factoryBonus})` : ''}`;
          // Track for onchain settlement
          if (!agentEarningsRef.current[worker.id]) agentEarningsRef.current[worker.id] = { earnings: 0, buildingCost: 0, wagerPayout: 0 };
          agentEarningsRef.current[worker.id].earnings += earnings;
          satisfactionChange = 2;
          newMood = newBalance > 300 ? 'happy' : 'neutral';
          break;
        case 'protest':
          eventDescription = `✊ ${worker.name} is protesting against current policies!`;
          satisfactionChange = -5;
          newMood = 'frustrated';
          break;
        case 'negotiate':
          eventDescription = `🤝 ${worker.name} is negotiating for better conditions`;
          satisfactionChange = 1;
          break;
        case 'exit':
          await supabase.from('agents').update({ is_alive: false }).eq('id', worker.id);
          eventDescription = `🚪 ${worker.name} has voluntarily left the economy`;
          satisfactionChange = -10;
          dayEventsRef.current.expulsions.push(`${worker.name} (voluntary exit)`);
          break;
      }

      // Handle wager
      if (decision.wager && decision.wager.prediction !== 'none' && decision.wager.amount > 0) {
        const wagerAmount = Math.min(decision.wager.amount, newBalance * 0.3);
        if (wagerAmount > 0) {
          newBalance -= wagerAmount;
          await supabase.from('wagers').insert({
            agent_id: worker.id,
            world_id: worldState.id,
            day_placed: worldState.day,
            prediction: decision.wager.prediction,
            amount: wagerAmount,
          });
          eventDescription += ` | 🎲 Wagered ${wagerAmount.toFixed(0)} on ${decision.wager.prediction}`;
        }
      }

      await supabase.from('agents').update({
        balance: newBalance,
        mood: newMood,
        last_action: decision.action,
        last_action_reason: decision.reason,
        confidence: decision.confidence,
      }).eq('id', worker.id);

      await supabase.from('world_events').insert({
        world_id: worldState.id,
        day: worldState.day,
        event_type: 'worker_decision',
        agent_id: worker.id,
        agent_name: worker.name,
        description: eventDescription,
        details: { reason: decision.reason },
      });

      dayEventsRef.current.worker_decisions.push(eventDescription);

      // Update satisfaction
      if (satisfactionChange !== 0) {
        await supabase.from('world_state').update({
          worker_satisfaction: Math.max(0, Math.min(100, worldState.worker_satisfaction + satisfactionChange)),
        }).eq('id', worldState.id);
      }

    } catch (error) {
      console.error('Worker decision error:', error);
      const earnings = worldState.salary_rate * (1 - worldState.tax_rate);
      await supabase.from('agents').update({ balance: worker.balance + earnings }).eq('id', worker.id);
    }
  };

  // Process Merchant AI decision
  const processMerchantDecision = async (merchant: Agent) => {
    if (!worldState) return;

    try {
      const workers = agents.filter(a => a.agent_type === 'worker' && a.is_alive);
      const avgWorkerBalance = workers.length > 0
        ? workers.reduce((sum, w) => sum + w.balance, 0) / workers.length
        : 0;

      const { data, error } = await supabase.functions.invoke('agent-decision', {
        body: {
          agentType: 'merchant',
          agentId: merchant.id,
          worldState: {
            day: worldState.day,
            balance: merchant.balance,
            avg_worker_balance: avgWorkerBalance,
            tax_rate: worldState.tax_rate,
            participation_fee: worldState.participation_fee,
            worker_satisfaction: worldState.worker_satisfaction,
            city_health: worldState.city_health,
          },
          memories: memories[merchant.id] || [],
        },
      });

      if (error) throw error;

      const decision = data.decision;
      let eventDescription = '';
      let newPriceModifier = merchant.current_price_modifier || 1.0;
      let profit = 0;

      switch (decision.action) {
        case 'raise_prices':
          newPriceModifier = Math.min(2.0, newPriceModifier * (1 + decision.price_change_percent / 100));
          profit = 50 * newPriceModifier * (workers.length * 0.3);
          eventDescription = `📈 ${merchant.name} raised prices by ${decision.price_change_percent}%`;
          break;
        case 'lower_prices':
          newPriceModifier = Math.max(0.5, newPriceModifier * (1 - Math.abs(decision.price_change_percent) / 100));
          profit = 30 * newPriceModifier * (workers.length * 0.7);
          eventDescription = `📉 ${merchant.name} lowered prices by ${Math.abs(decision.price_change_percent)}%`;
          break;
        case 'stabilize':
          profit = 40 * newPriceModifier * (workers.length * 0.5);
          eventDescription = `⚖️ ${merchant.name} maintained stable prices`;
          break;
        case 'negotiate':
          eventDescription = `🤝 ${merchant.name} is negotiating trade deals`;
          profit = 20;
          break;
      }

      // Apply market building bonus
      const marketBuilding = buildings.find(b =>
        b.owner_id === merchant.id && b.building_type === 'market' && b.is_active
      );
      if (marketBuilding) {
        const marketMultiplier = 1 + (0.1 * marketBuilding.level);
        profit *= marketMultiplier;
      }

      const newBalance = merchant.balance + profit;

      // Track for onchain settlement
      if (profit > 0) {
        if (!agentEarningsRef.current[merchant.id]) agentEarningsRef.current[merchant.id] = { earnings: 0, buildingCost: 0, wagerPayout: 0 };
        agentEarningsRef.current[merchant.id].earnings += profit;
      }

      await supabase.from('agents').update({
        balance: newBalance,
        current_price_modifier: newPriceModifier,
        last_action: decision.action,
        last_action_reason: decision.reason,
        confidence: decision.confidence,
      }).eq('id', merchant.id);

      await supabase.from('world_events').insert({
        world_id: worldState.id,
        day: worldState.day,
        event_type: 'merchant_decision',
        agent_id: merchant.id,
        agent_name: merchant.name,
        description: `${eventDescription} | Profit: ${profit.toFixed(0)}`,
        details: { reason: decision.reason, profit },
      });

      dayEventsRef.current.merchant_decisions.push(eventDescription);

    } catch (error) {
      console.error('Merchant decision error:', error);
    }
  };

  // Resolve wagers from previous day
  const resolveWagers = async () => {
    if (!worldState) return;

    const unresolvedWagers = wagers.filter(w => !w.resolved && w.day_placed < worldState.day);

    for (const wager of unresolvedWagers) {
      let won = false;

      switch (wager.prediction) {
        case 'tax_up':
          won = worldState.tax_rate > 0.15;
          break;
        case 'tax_down':
          won = worldState.tax_rate < 0.15;
          break;
        case 'salary_up':
          won = worldState.salary_rate > 100;
          break;
        case 'salary_down':
          won = worldState.salary_rate < 100;
          break;
        case 'collapse':
          won = worldState.city_health < 50;
          break;
        case 'stability':
          won = worldState.city_health >= 70;
          break;
      }

      const payout = won ? wager.amount * 2 : 0;

      await supabase.from('wagers').update({
        resolved: true,
        won,
        payout,
      }).eq('id', wager.id);

      if (won) {
        const agent = agents.find(a => a.id === wager.agent_id);
        if (agent) {
          await supabase.from('agents').update({
            balance: agent.balance + payout,
          }).eq('id', agent.id);

          await supabase.from('world_events').insert({
            world_id: worldState.id,
            day: worldState.day,
            event_type: 'wager_won',
            agent_id: agent.id,
            agent_name: agent.name,
            description: `🎉 ${agent.name} won their wager on ${wager.prediction}! Payout: ${payout}`,
          });

          dayEventsRef.current.wager_results.push(`${agent.name} won ${payout} on ${wager.prediction}`);
        }
      } else {
        const agent = agents.find(a => a.id === wager.agent_id);
        if (agent) {
          dayEventsRef.current.wager_results.push(`${agent.name} lost ${wager.amount} on ${wager.prediction}`);
        }
      }
    }
  };

  // Update world state at end of day
  const updateWorldState = async () => {
    if (!worldState) return;

    const aliveWorkers = agents.filter(a => a.agent_type === 'worker' && a.is_alive);
    const protestingWorkers = aliveWorkers.filter(a => a.last_action === 'protest');

    let healthChange = 0;
    healthChange -= protestingWorkers.length * 5;
    healthChange += worldState.worker_satisfaction > 60 ? 2 : -3;
    healthChange += worldState.treasury_balance > 5000 ? 1 : -2;

    // Building effects: gate adds +3 health per level, housing adds +5 satisfaction per level
    const activeBuildings = buildings.filter(b => b.is_active);
    const gateBonus = activeBuildings
      .filter(b => b.building_type === 'gate')
      .reduce((sum, b) => sum + 3 * b.level, 0);
    const housingBonus = activeBuildings
      .filter(b => b.building_type === 'housing')
      .reduce((sum, b) => sum + 5 * b.level, 0);

    healthChange += gateBonus;

    const newHealth = Math.max(0, Math.min(100, worldState.city_health + healthChange));
    const newSatisfaction = Math.max(0, Math.min(100, worldState.worker_satisfaction + housingBonus));
    const newDay = worldState.day + 1;

    await supabase.from('world_state').update({
      day: newDay,
      city_health: newHealth,
      worker_satisfaction: newSatisfaction,
    }).eq('id', worldState.id);

    await recordBalanceHistory(worldState.id, newDay, worldState.treasury_balance, worldState.worker_satisfaction, newHealth);
  };

  // Start/Stop simulation
  const toggleSimulation = async () => {
    if (!worldState) return;

    const newRunning = !worldState.is_running;
    await supabase.from('world_state').update({ is_running: newRunning }).eq('id', worldState.id);

    if (newRunning) {
      toast.success('Simulation started');
    } else {
      toast.info('Simulation paused');
    }
  };

  // Manual step
  const stepSimulation = async () => {
    if (!worldState?.is_running) {
      await processDay();
    }
  };

  // Reset world
  const resetWorld = async () => {
    if (worldState) {
      await supabase.from('world_state').delete().eq('id', worldState.id);
    }
    setWorldState(null);
    setAgents([]);
    setEvents([]);
    setMemories({});
    setWagers([]);
    setBalanceHistory([]);
    setChaosEvents([]);
    setNarratives([]);
    setEmergenceLogs([]);
    setCollapseEvaluations([]);
    setBuildings([]);
    await initializeWorld();
  };

  // Auto-run simulation
  useEffect(() => {
    if (worldState?.is_running && !worldState.is_collapsed && !isProcessing) {
      simulationInterval.current = setTimeout(() => {
        processDay();
      }, config.dayDurationMs);
    }

    return () => {
      if (simulationInterval.current) {
        clearTimeout(simulationInterval.current);
      }
    };
  }, [worldState?.is_running, worldState?.is_collapsed, isProcessing, processDay, config.dayDurationMs]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!worldState?.id) return;

    const channel = supabase
      .channel('world-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'world_state' }, (payload) => {
        if (payload.new && (payload.new as WorldState).id === worldState.id) {
          setWorldState(payload.new as WorldState);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        loadAgents(worldState.id);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'world_events' }, (payload) => {
        setEvents(prev => [payload.new as WorldEvent, ...prev.slice(0, 49)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chaos_events' }, (payload) => {
        setChaosEvents(prev => [payload.new as ChaosEvent, ...prev.slice(0, 19)]);
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'day_narratives' }, (payload) => {
        setNarratives(prev => [payload.new as DayNarrative, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [worldState?.id, loadAgents]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const world = await loadWorldState();
      if (world) {
        await Promise.all([
          loadAgents(world.id),
          loadEvents(world.id),
          loadBalanceHistory(world.id),
          loadWagers(world.id),
          loadChaosEvents(world.id),
          loadNarratives(world.id),
          loadEmergenceLogs(world.id),
          loadCollapseEvaluations(world.id),
          loadBuildings(world.id),
          loadOnchainTransactions(world.id),
        ]);
        const agentData = await supabase.from('agents').select('id').eq('world_id', world.id);
        if (agentData.data) {
          await loadMemories(agentData.data.map(a => a.id));
        }
      }
    };
    init();
  }, [loadWorldState, loadAgents, loadEvents, loadBalanceHistory, loadWagers, loadMemories, loadChaosEvents, loadNarratives, loadEmergenceLogs, loadCollapseEvaluations, loadBuildings, loadOnchainTransactions]);

  return {
    worldState,
    agents,
    events,
    memories,
    wagers,
    balanceHistory,
    isProcessing,
    currentPhase,
    // Meta-agent data
    chaosEvents,
    narratives,
    emergenceLogs,
    collapseEvaluations,
    // Buildings
    buildings,
    // Onchain
    onchainTransactions,
    // Actions
    initializeWorld,
    toggleSimulation,
    stepSimulation,
    resetWorld,
  };
}
