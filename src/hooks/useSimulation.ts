import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  WorldState, 
  Agent, 
  WorldEvent, 
  AgentMemory, 
  Wager,
  BalanceHistory,
  DEFAULT_CONFIG,
  SimulationConfig 
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
      .eq('world_id', worldId)
      .eq('resolved', false);

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
          balance: 0, // Governor doesn't have personal balance
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

      // Record initial balance history
      await recordBalanceHistory(worldData.id, 1, worldData.treasury_balance, 75, 100);

      await loadWorldState();
      await loadAgents(worldData.id);
      await loadEvents(worldData.id);

      toast.success('New world initialized!');
    } catch (error) {
      console.error('Error initializing world:', error);
      toast.error('Failed to initialize world');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('');
    }
  }, [config, loadWorldState, loadAgents, loadEvents]);

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

  // Process a single day
  const processDay = useCallback(async () => {
    if (!worldState || isProcessing || worldState.is_collapsed) return;

    setIsProcessing(true);
    
    try {
      const aliveAgents = agents.filter(a => a.is_alive);
      const governor = aliveAgents.find(a => a.agent_type === 'governor');
      const workers = aliveAgents.filter(a => a.agent_type === 'worker');
      const merchants = aliveAgents.filter(a => a.agent_type === 'merchant');

      // Phase 1: Collect participation fees
      setCurrentPhase('💰 Collecting participation fees...');
      await collectFees(workers, merchants);
      await new Promise(r => setTimeout(r, 1500));

      // Phase 2: Governor decision
      if (governor) {
        setCurrentPhase('🏛️ Governor contemplating policy...');
        await processGovernorDecision(governor);
        await new Promise(r => setTimeout(r, 2000));
      }

      // Phase 3: Worker decisions
      setCurrentPhase('👷 Workers making decisions...');
      for (const worker of workers.filter(w => w.is_alive)) {
        await processWorkerDecision(worker);
        await new Promise(r => setTimeout(r, 800));
      }

      // Phase 4: Merchant decisions
      setCurrentPhase('🛒 Merchants adjusting prices...');
      for (const merchant of merchants.filter(m => m.is_alive)) {
        await processMerchantDecision(merchant);
        await new Promise(r => setTimeout(r, 800));
      }

      // Phase 5: Resolve wagers
      setCurrentPhase('🎲 Resolving wagers...');
      await resolveWagers();
      await new Promise(r => setTimeout(r, 1000));

      // Phase 6: Update world state
      setCurrentPhase('📊 Updating world state...');
      await updateWorldState();

      // Check for collapse
      const updatedWorld = await loadWorldState();
      if (updatedWorld && (updatedWorld.city_health <= 0 || updatedWorld.treasury_balance <= 0)) {
        await supabase.from('world_state').update({ is_collapsed: true, is_running: false }).eq('id', worldState.id);
        await supabase.from('world_events').insert({
          world_id: worldState.id,
          day: worldState.day,
          event_type: 'collapse',
          description: '💀 The economy has collapsed! The simulation has ended.',
        });
        toast.error('The economy has collapsed!');
      }

      await loadAgents(worldState.id);
      await loadEvents(worldState.id);
      await loadBalanceHistory(worldState.id);
      await loadWagers(worldState.id);

    } catch (error) {
      console.error('Error processing day:', error);
      toast.error('Error during simulation');
    } finally {
      setIsProcessing(false);
      setCurrentPhase('');
    }
  }, [worldState, agents, isProcessing, loadWorldState, loadAgents, loadEvents, loadBalanceHistory, loadWagers]);

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
      } else {
        await supabase.from('agents').update({ balance: newBalance }).eq('id', agent.id);
        collectedFees += fee;
      }
    }

    // Add fees to treasury
    await supabase.from('world_state').update({
      treasury_balance: worldState.treasury_balance + collectedFees,
    }).eq('id', worldState.id);
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

    } catch (error) {
      console.error('Governor decision error:', error);
      // Fallback to hold
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
          const earnings = worldState.salary_rate * (1 - worldState.tax_rate);
          newBalance += earnings;
          eventDescription = `💼 ${worker.name} worked and earned ${earnings.toFixed(0)} tokens`;
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
          break;
      }

      // Handle wager
      if (decision.wager && decision.wager.prediction !== 'none' && decision.wager.amount > 0) {
        const wagerAmount = Math.min(decision.wager.amount, newBalance * 0.3); // Max 30% of balance
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

      // Update satisfaction
      if (satisfactionChange !== 0) {
        await supabase.from('world_state').update({
          worker_satisfaction: Math.max(0, Math.min(100, worldState.worker_satisfaction + satisfactionChange)),
        }).eq('id', worldState.id);
      }

    } catch (error) {
      console.error('Worker decision error:', error);
      // Fallback: work
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
          profit = 50 * newPriceModifier * (workers.length * 0.3); // Less customers but higher margin
          eventDescription = `📈 ${merchant.name} raised prices by ${decision.price_change_percent}%`;
          break;
        case 'lower_prices':
          newPriceModifier = Math.max(0.5, newPriceModifier * (1 - Math.abs(decision.price_change_percent) / 100));
          profit = 30 * newPriceModifier * (workers.length * 0.7); // More customers but lower margin
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

      const newBalance = merchant.balance + profit;

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
      
      // Check prediction against current state
      switch (wager.prediction) {
        case 'tax_up':
          won = worldState.tax_rate > 0.15; // Original rate
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

      // Pay out to winner
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
        }
      }
    }
  };

  // Update world state at end of day
  const updateWorldState = async () => {
    if (!worldState) return;

    const aliveWorkers = agents.filter(a => a.agent_type === 'worker' && a.is_alive);
    const protestingWorkers = aliveWorkers.filter(a => a.last_action === 'protest');
    
    // Calculate city health changes
    let healthChange = 0;
    healthChange -= protestingWorkers.length * 5; // Protests hurt health
    healthChange += worldState.worker_satisfaction > 60 ? 2 : -3;
    healthChange += worldState.treasury_balance > 5000 ? 1 : -2;

    const newHealth = Math.max(0, Math.min(100, worldState.city_health + healthChange));
    const newDay = worldState.day + 1;

    await supabase.from('world_state').update({
      day: newDay,
      city_health: newHealth,
    }).eq('id', worldState.id);

    // Record history
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
        ]);
        const agentData = await supabase.from('agents').select('id').eq('world_id', world.id);
        if (agentData.data) {
          await loadMemories(agentData.data.map(a => a.id));
        }
      }
    };
    init();
  }, [loadWorldState, loadAgents, loadEvents, loadBalanceHistory, loadWagers, loadMemories]);

  return {
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
  };
}
