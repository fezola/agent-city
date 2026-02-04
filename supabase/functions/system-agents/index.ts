import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface WorldState {
  day: number;
  treasury_balance: number;
  tax_rate: number;
  salary_rate: number;
  participation_fee: number;
  city_health: number;
  worker_satisfaction: number;
  merchant_stability: number;
  inflation: number;
}

interface SystemMemory {
  day: number;
  content: Record<string, unknown>;
}

interface DayEvents {
  governor_decisions: string[];
  worker_decisions: string[];
  merchant_decisions: string[];
  chaos_event?: string;
  expulsions: string[];
  wager_results: string[];
}

// ==================== CHAOS ORCHESTRATOR ====================
function buildChaosPrompt(worldState: WorldState, memories: SystemMemory[]): string {
  const memoryStr = memories.slice(0, 5).map(m =>
    `Day ${m.day}: ${JSON.stringify(m.content)}`
  ).join('\n');

  return `You are the Chaos Orchestrator for a gated autonomous agent world.

Your purpose:
- Introduce disruptive but plausible events
- Stress-test agent coordination
- Reveal emergent behavior
- Avoid instant collapse unless system is already fragile

Rules:
- Chaos events must be rare but impactful
- Do not repeat the same event twice in a row
- Consider current city health before acting
- Events must have economic consequences
- If city health is above 70%, you can be more aggressive
- If city health is below 40%, prefer no_event to avoid total collapse

Memory of recent chaos:
${memoryStr || 'No chaos events yet.'}

Current World State:
- Day: ${worldState.day}
- Treasury Balance: ${worldState.treasury_balance}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- Participation Fee: ${worldState.participation_fee}
- Inflation: ${worldState.inflation}
- City Health: ${worldState.city_health}%
- Worker Satisfaction: ${worldState.worker_satisfaction}%
- Merchant Stability: ${worldState.merchant_stability}%

Possible Events:
- emergency_tax_hike: Government forced to raise taxes suddenly
- inflation_spike: Currency loses value rapidly
- treasury_leak: Funds mysteriously disappear from treasury
- merchant_supply_shock: Goods become scarce, prices spike
- worker_strike: Organized labor action reduces productivity
- external_demand_boom: Outside demand increases merchant profits
- no_event: Nothing unusual happens

Decide if chaos should occur today.`;
}

const chaosTool = {
  type: "function",
  function: {
    name: "chaos_decision",
    description: "Decide whether to inject a chaos event",
    parameters: {
      type: "object",
      properties: {
        event: {
          type: "string",
          enum: ["emergency_tax_hike", "inflation_spike", "treasury_leak", "merchant_supply_shock", "worker_strike", "external_demand_boom", "no_event"],
          description: "The chaos event to inject"
        },
        severity: {
          type: "number",
          description: "How severe the event is (0.0-1.0)"
        },
        reason: {
          type: "string",
          description: "Why this event was chosen"
        }
      },
      required: ["event", "severity", "reason"],
      additionalProperties: false
    }
  }
};

// ==================== COLLAPSE EVALUATOR ====================
function buildCollapsePrompt(worldState: WorldState, exitRate: number): string {
  return `You are the Collapse Evaluator for an autonomous agent world.

Your role:
- Assess systemic stability
- Declare collapse only when recovery is unlikely
- Reward resilience and coordination

Collapse Indicators:
- City health critically low (below 20%)
- Treasury insolvency (below 1000)
- Mass agent exit (exit rate above 0.5)
- Sustained unrest (satisfaction below 30%)
- Economic paralysis (multiple indicators red)

Current World Metrics:
- Day: ${worldState.day}
- City Health: ${worldState.city_health}%
- Treasury Balance: ${worldState.treasury_balance}
- Agent Exit Rate: ${(exitRate * 100).toFixed(0)}%
- Worker Satisfaction: ${worldState.worker_satisfaction}%
- Merchant Stability: ${worldState.merchant_stability}%

Rules:
- Collapse should feel inevitable, not random
- Borderline cases may continue (status: unstable)
- Collapse ends the simulation
- Be conservative - only declare collapse if multiple indicators are critical`;
}

const collapseTool = {
  type: "function",
  function: {
    name: "collapse_evaluation",
    description: "Evaluate if the world should collapse",
    parameters: {
      type: "object",
      properties: {
        status: {
          type: "string",
          enum: ["stable", "unstable", "collapsed"],
          description: "Current system stability status"
        },
        confidence: {
          type: "number",
          description: "Confidence in this assessment (0.0-1.0)"
        },
        reason: {
          type: "string",
          description: "Explanation for the status"
        }
      },
      required: ["status", "confidence", "reason"],
      additionalProperties: false
    }
  }
};

// ==================== NARRATIVE SUMMARIZER ====================
function buildNarrativePrompt(worldState: WorldState, dayEvents: DayEvents): string {
  const eventsStr = [
    ...dayEvents.governor_decisions.map(d => `Governor: ${d}`),
    ...dayEvents.worker_decisions.map(d => `Worker: ${d}`),
    ...dayEvents.merchant_decisions.map(d => `Merchant: ${d}`),
    ...(dayEvents.chaos_event ? [`CHAOS: ${dayEvents.chaos_event}`] : []),
    ...dayEvents.expulsions.map(e => `EXPELLED: ${e}`),
    ...dayEvents.wager_results.map(w => `Wager: ${w}`),
  ].join('\n');

  return `You are the Narrative Summarizer for an autonomous agent world.

Your job:
- Translate raw events into a human-readable story
- Highlight cause-and-effect
- Make emergent behavior obvious

Today's Events (Day ${worldState.day}):
${eventsStr || 'A quiet day with no major events.'}

End of Day Metrics:
- Treasury: ${worldState.treasury_balance}
- City Health: ${worldState.city_health}%
- Worker Satisfaction: ${worldState.worker_satisfaction}%

Rules:
- One paragraph only (2-4 sentences)
- No technical jargon
- Focus on consequences and what it means for the city
- Be neutral, not overly dramatic
- Write like a news brief or journal entry`;
}

const narrativeTool = {
  type: "function",
  function: {
    name: "narrative_summary",
    description: "Create a narrative summary of the day",
    parameters: {
      type: "object",
      properties: {
        summary: {
          type: "string",
          description: "2-4 sentence narrative of what happened"
        }
      },
      required: ["summary"],
      additionalProperties: false
    }
  }
};

// ==================== EMERGENCE EVALUATOR ====================
function buildEmergencePrompt(worldState: WorldState, dayEvents: DayEvents, recentPatterns: string[]): string {
  const patternsStr = recentPatterns.join('\n');

  return `You are the Emergence Evaluator.

Your task:
- Identify behaviors that were not explicitly programmed
- Highlight coordination, adaptation, or failure patterns
- Help observers understand what was surprising

Today's Events Summary:
- Governor actions: ${dayEvents.governor_decisions.length}
- Worker actions: ${dayEvents.worker_decisions.length} (protests: ${dayEvents.worker_decisions.filter(d => d.includes('protest')).length})
- Merchant actions: ${dayEvents.merchant_decisions.length}
- Expulsions: ${dayEvents.expulsions.length}
- Chaos event: ${dayEvents.chaos_event || 'none'}

Recent Patterns Observed:
${patternsStr || 'No patterns established yet.'}

Current State:
- Day: ${worldState.day}
- City Health trend: ${worldState.city_health}%
- Worker satisfaction: ${worldState.worker_satisfaction}%

Look for:
- Coordinated behavior (multiple workers protesting)
- Adaptive responses (governor reacting to unrest)
- Cascade effects (one event causing chain reactions)
- Unexpected stability or instability
- Market self-correction

Rules:
- Do not restate obvious programmed behaviors
- Focus on unexpected outcomes
- Be concise
- Only flag true emergence, not routine actions`;
}

const emergenceTool = {
  type: "function",
  function: {
    name: "emergence_evaluation",
    description: "Detect emergent behaviors",
    parameters: {
      type: "object",
      properties: {
        emergent_behavior_detected: {
          type: "boolean",
          description: "Whether emergence was detected"
        },
        description: {
          type: "string",
          description: "Description of what emerged (if any)"
        }
      },
      required: ["emergent_behavior_detected", "description"],
      additionalProperties: false
    }
  }
};

// ==================== DEFAULT RESPONSES ====================
function getDefaultResponse(agentType: string) {
  switch (agentType) {
    case 'chaos':
      return { event: 'no_event', severity: 0, reason: 'System stable, no intervention needed' };
    case 'collapse':
      return { status: 'stable', confidence: 0.5, reason: 'Unable to evaluate, assuming stable' };
    case 'narrative':
      return { summary: 'The city continued its daily operations without major incident.' };
    case 'emergence':
      return { emergent_behavior_detected: false, description: 'No unexpected patterns observed.' };
    default:
      return { error: 'Unknown agent type' };
  }
}

// ==================== MAIN HANDLER ====================
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, worldState, memories, dayEvents, exitRate, recentPatterns } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ decision: getDefaultResponse(agentType) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt: string;
    let tool: typeof chaosTool | typeof collapseTool | typeof narrativeTool | typeof emergenceTool;
    let toolName: string;

    switch (agentType) {
      case 'chaos':
        systemPrompt = buildChaosPrompt(worldState, memories || []);
        tool = chaosTool;
        toolName = 'chaos_decision';
        break;
      case 'collapse':
        systemPrompt = buildCollapsePrompt(worldState, exitRate || 0);
        tool = collapseTool;
        toolName = 'collapse_evaluation';
        break;
      case 'narrative':
        systemPrompt = buildNarrativePrompt(worldState, dayEvents || {
          governor_decisions: [],
          worker_decisions: [],
          merchant_decisions: [],
          expulsions: [],
          wager_results: []
        });
        tool = narrativeTool;
        toolName = 'narrative_summary';
        break;
      case 'emergence':
        systemPrompt = buildEmergencePrompt(worldState, dayEvents || {
          governor_decisions: [],
          worker_decisions: [],
          merchant_decisions: [],
          expulsions: [],
          wager_results: []
        }, recentPatterns || []);
        tool = emergenceTool;
        toolName = 'emergence_evaluation';
        break;
      default:
        throw new Error(`Unknown system agent type: ${agentType}`);
    }

    console.log(`Processing ${agentType} system agent`);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Analyze the current situation and make your assessment." }
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error (${response.status}):`, errorText);
      return new Response(
        JSON.stringify({ decision: getDefaultResponse(agentType) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ decision: getDefaultResponse(agentType) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const decision = JSON.parse(toolCall.function.arguments);
    console.log(`${agentType} decision:`, decision);

    return new Response(
      JSON.stringify({ decision }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("System agent error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        decision: getDefaultResponse('chaos')
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
