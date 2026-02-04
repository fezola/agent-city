import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Memory {
  day: number;
  event: string;
  impact: string;
  emotion: string;
}

interface BuildingInfo {
  building_type: string;
  level: number;
  is_active: boolean;
}

interface WorldState {
  day: number;
  balance?: number;
  treasury_balance?: number;
  tax_rate: number;
  salary_rate?: number;
  participation_fee: number;
  city_health: number;
  worker_satisfaction?: number;
  inflation?: number;
  existing_building?: BuildingInfo | null;
  world_building_count: number;
  has_power_hub: boolean;
}

function buildWorkerBuildingPrompt(worldState: WorldState, memories: Memory[]): string {
  const memoryStr = memories.slice(0, 10).map(m =>
    `Day ${m.day}: ${m.event} (${m.impact}, felt ${m.emotion})`
  ).join('\n');

  const existingBuilding = worldState.existing_building;
  const buildingStatus = existingBuilding
    ? `You own a Level ${existingBuilding.level} ${existingBuilding.building_type} (${existingBuilding.is_active ? 'active' : 'inactive'}). You can upgrade it (cost: ${existingBuilding.building_type === 'housing' ? 200 : 350} × ${existingBuilding.level} = ${(existingBuilding.building_type === 'housing' ? 200 : 350) * existingBuilding.level} tokens) if level < 3.`
    : 'You do not own any building yet.';

  return `You are a Worker Agent considering a building investment.

You can build ONE of these structures:
- HOUSING (cost: 200 tokens): Boosts worker satisfaction by +5% per level per day. Maintenance: 10/day per level.
- FACTORY (cost: 350 tokens): Gives you +15 bonus earnings per level each day you work. Maintenance: 20/day per level.

${buildingStatus}

Memory:
${memoryStr || 'No significant memories yet.'}

Current State:
- Day: ${worldState.day}
- Your Balance: ${worldState.balance}
- Salary: ${worldState.salary_rate}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- Participation Fee: ${worldState.participation_fee}
- City Health: ${worldState.city_health}%

Consider:
- Can you afford the building AND still pay daily fees?
- Will the ongoing benefit outweigh the maintenance cost?
- Housing helps the whole city; Factory helps only you.
- Skip if your balance is too low or the investment is risky.`;
}

function buildMerchantBuildingPrompt(worldState: WorldState, memories: Memory[]): string {
  const memoryStr = memories.slice(0, 10).map(m =>
    `Day ${m.day}: ${m.event} (${m.impact}, felt ${m.emotion})`
  ).join('\n');

  const existingBuilding = worldState.existing_building;
  const buildingStatus = existingBuilding
    ? `You own a Level ${existingBuilding.level} Market (${existingBuilding.is_active ? 'active' : 'inactive'}). You can upgrade it (cost: ${300 * existingBuilding.level} tokens) if level < 3.`
    : 'You do not own any building yet.';

  return `You are a Merchant Agent considering a building investment.

You can build:
- MARKET (cost: 300 tokens): Boosts your profit by +10% per level. Maintenance: 15/day per level.

${buildingStatus}

Memory:
${memoryStr || 'No significant memories yet.'}

Current State:
- Day: ${worldState.day}
- Your Balance: ${worldState.balance}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- Participation Fee: ${worldState.participation_fee}
- Worker Satisfaction: ${worldState.worker_satisfaction}%
- City Health: ${worldState.city_health}%

Consider:
- Can you afford the market AND still pay daily fees?
- Higher profit multiplier compounds over time.
- Skip if your balance is too low or market conditions are unstable.`;
}

function buildGovernorBuildingPrompt(worldState: WorldState, memories: Memory[]): string {
  const memoryStr = memories.slice(0, 10).map(m =>
    `Day ${m.day}: ${m.event} (${m.impact}, felt ${m.emotion})`
  ).join('\n');

  const existingBuilding = worldState.existing_building;
  const buildingStatus = existingBuilding
    ? `You have a Level ${existingBuilding.level} ${existingBuilding.building_type === 'gate' ? 'City Gate' : 'Power Hub'} (${existingBuilding.is_active ? 'active' : 'inactive'}). You can upgrade it (cost: ${existingBuilding.building_type === 'gate' ? 500 : 800} × ${existingBuilding.level} = ${(existingBuilding.building_type === 'gate' ? 500 : 800) * existingBuilding.level} tokens from treasury) if level < 3.`
    : 'You have not built any infrastructure yet.';

  return `You are the Governor Agent considering infrastructure investment from the city treasury.

You can build ONE of these structures:
- GATE (cost: 500 from treasury): Improves city health by +3% per level per day. Maintenance: 25/day per level from treasury.
- POWER_HUB (cost: 800 from treasury): Reduces ALL building maintenance costs in the city by 10% per level. Maintenance: 40/day per level from treasury.

${buildingStatus}

Memory:
${memoryStr || 'No significant memories yet.'}

Current State:
- Day: ${worldState.day}
- Treasury: ${worldState.treasury_balance}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- City Health: ${worldState.city_health}%
- Worker Satisfaction: ${worldState.worker_satisfaction}%
- Total Buildings in City: ${worldState.world_building_count}
- Power Hub Exists: ${worldState.has_power_hub ? 'Yes' : 'No'}

Consider:
- Can the treasury afford this AND still sustain operations?
- Gate directly improves city health, critical if health is low.
- Power Hub benefits all building owners by reducing their costs.
- Skip if the treasury is stretched thin.`;
}

const buildingTool = {
  type: "function",
  function: {
    name: "building_decision",
    description: "Return the building/construction decision",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["build", "upgrade", "skip"],
          description: "Whether to build a new building, upgrade existing, or skip"
        },
        building_type: {
          type: "string",
          enum: ["housing", "factory", "market", "gate", "power_hub"],
          description: "The type of building to build or upgrade (required if action is build)"
        },
        reason: {
          type: "string",
          description: "Short explanation for the decision"
        }
      },
      required: ["action", "reason"],
      additionalProperties: false
    }
  }
};

const defaultDecision = { action: 'skip', reason: 'AI unavailable' };

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, agentId, worldState, memories } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      return new Response(
        JSON.stringify({ decision: defaultDecision }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt: string;

    switch (agentType) {
      case 'worker':
        systemPrompt = buildWorkerBuildingPrompt(worldState, memories || []);
        break;
      case 'merchant':
        systemPrompt = buildMerchantBuildingPrompt(worldState, memories || []);
        break;
      case 'governor':
        systemPrompt = buildGovernorBuildingPrompt(worldState, memories || []);
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log(`Processing building decision for ${agentType} agent ${agentId}`);

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
          { role: "user", content: "Decide whether to build, upgrade, or skip construction this day. Consider your financial situation carefully." }
        ],
        tools: [buildingTool],
        tool_choice: { type: "function", function: { name: "building_decision" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error (${response.status}):`, errorText);

      return new Response(
        JSON.stringify({ decision: defaultDecision }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ decision: defaultDecision }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const decision = JSON.parse(toolCall.function.arguments);
    console.log(`${agentType} building decision:`, decision);

    return new Response(
      JSON.stringify({ decision }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Building decision error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        decision: defaultDecision
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
