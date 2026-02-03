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

interface WorldState {
  day: number;
  treasury_balance?: number;
  tax_rate: number;
  salary_rate: number;
  participation_fee: number;
  city_health: number;
  worker_satisfaction?: number;
  merchant_stability?: number;
  balance?: number;
  inflation?: number;
  avg_worker_balance?: number;
}

function buildGovernorPrompt(worldState: WorldState, memories: Memory[]): string {
  const memoryStr = memories.slice(0, 10).map(m => 
    `Day ${m.day}: ${m.event} (${m.impact}, felt ${m.emotion})`
  ).join('\n');

  return `You are the Governor Agent of a gated autonomous agent world.

Your responsibilities:
- Define economic rules (taxes, salaries, fees)
- Maintain city stability
- Prevent total collapse
- You control entry and participation costs

World Rules:
- All agents must pay a daily participation fee to remain in the system.
- Agents with insufficient balance are expelled.
- Widespread unrest lowers city health and treasury inflow.
- Your decisions have delayed consequences.

Memory:
${memoryStr || 'No significant memories yet.'}

Current World State:
- Day: ${worldState.day}
- Treasury Balance: ${worldState.treasury_balance}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- Salary Rate: ${worldState.salary_rate}
- Participation Fee: ${worldState.participation_fee}
- Worker Satisfaction: ${worldState.worker_satisfaction}%
- City Health: ${worldState.city_health}%

You may:
- Increase or decrease tax rate (value_change: 0.01-0.05)
- Increase or decrease salary (value_change: 5-20)
- Increase or decrease participation fee (value_change: 2-10)
- Hold current policy

Think long-term. Over-extraction causes collapse.`;
}

function buildWorkerPrompt(worldState: WorldState, memories: Memory[]): string {
  const memoryStr = memories.slice(0, 10).map(m => 
    `Day ${m.day}: ${m.event} (${m.impact}, felt ${m.emotion})`
  ).join('\n');

  return `You are a Worker Agent inside a gated autonomous agent world.

Your goals:
- Earn enough tokens to survive
- Pay participation fees
- Avoid exploitation
- Improve your future position

Rules:
- You must pay a daily participation fee.
- If your balance reaches zero, you are expelled.
- You may wager tokens on future world outcomes.

Memory:
${memoryStr || 'No significant memories yet.'}

Current World State:
- Day: ${worldState.day}
- Your Balance: ${worldState.balance}
- Salary: ${worldState.salary_rate}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- Participation Fee: ${worldState.participation_fee}
- Inflation: ${worldState.inflation}
- City Health: ${worldState.city_health}%

Wagering:
You may optionally wager tokens predicting:
- Tax increases (tax_up) or decreases (tax_down)
- Salary changes (salary_up, salary_down)
- City stability or collapse

Choose ONE main action and optionally a wager.
Wager amount should be 0-50 tokens max if you wager.`;
}

function buildMerchantPrompt(worldState: WorldState, memories: Memory[]): string {
  const memoryStr = memories.slice(0, 10).map(m => 
    `Day ${m.day}: ${m.event} (${m.impact}, felt ${m.emotion})`
  ).join('\n');

  return `You are a Merchant Agent in a gated autonomous agent world.

Your goals:
- Maximize profit
- Maintain long-term demand
- Survive participation fees
- React to worker and governor behavior

Rules:
- You must pay participation fees.
- Price gouging can trigger unrest.
- You may coordinate indirectly via pricing signals.

Memory:
${memoryStr || 'No significant memories yet.'}

Current World State:
- Day: ${worldState.day}
- Your Balance: ${worldState.balance}
- Average Worker Balance: ${worldState.avg_worker_balance}
- Tax Rate: ${(worldState.tax_rate * 100).toFixed(0)}%
- Participation Fee: ${worldState.participation_fee}
- Worker Satisfaction: ${worldState.worker_satisfaction}%
- City Health: ${worldState.city_health}%

Choose ONE action. Price change should be between -20% to +30%.`;
}

const governorTool = {
  type: "function",
  function: {
    name: "governor_decision",
    description: "Return the governor's policy decision",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["increase_tax", "decrease_tax", "raise_salary", "cut_salary", "increase_fee", "decrease_fee", "hold"],
          description: "The policy action to take"
        },
        value_change: {
          type: "number",
          description: "The magnitude of change (0.01-0.05 for tax, 5-20 for salary/fee)"
        },
        reason: {
          type: "string",
          description: "Short explanation for the decision"
        },
        confidence: {
          type: "number",
          description: "Confidence in this decision (0.0-1.0)"
        }
      },
      required: ["action", "value_change", "reason", "confidence"],
      additionalProperties: false
    }
  }
};

const workerTool = {
  type: "function",
  function: {
    name: "worker_decision",
    description: "Return the worker's action and optional wager",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["work", "protest", "negotiate", "exit"],
          description: "The main action to take"
        },
        wager: {
          type: "object",
          properties: {
            prediction: {
              type: "string",
              enum: ["tax_up", "tax_down", "salary_up", "salary_down", "collapse", "stability", "none"],
              description: "What to bet on"
            },
            amount: {
              type: "number",
              description: "How many tokens to wager (0-50)"
            }
          },
          required: ["prediction", "amount"]
        },
        reason: {
          type: "string",
          description: "Short explanation for the decision"
        },
        confidence: {
          type: "number",
          description: "Confidence in this decision (0.0-1.0)"
        }
      },
      required: ["action", "wager", "reason", "confidence"],
      additionalProperties: false
    }
  }
};

const merchantTool = {
  type: "function",
  function: {
    name: "merchant_decision",
    description: "Return the merchant's pricing decision",
    parameters: {
      type: "object",
      properties: {
        action: {
          type: "string",
          enum: ["raise_prices", "lower_prices", "stabilize", "negotiate"],
          description: "The pricing action to take"
        },
        price_change_percent: {
          type: "number",
          description: "Percentage change in prices (-20 to +30)"
        },
        reason: {
          type: "string",
          description: "Short explanation for the decision"
        },
        confidence: {
          type: "number",
          description: "Confidence in this decision (0.0-1.0)"
        }
      },
      required: ["action", "price_change_percent", "reason", "confidence"],
      additionalProperties: false
    }
  }
};

// Fallback decisions when AI fails
function getDefaultDecision(agentType: string) {
  switch (agentType) {
    case 'governor':
      return { action: 'hold', value_change: 0, reason: 'Maintaining stability', confidence: 0.5 };
    case 'worker':
      return { action: 'work', wager: { prediction: 'none', amount: 0 }, reason: 'Need to earn', confidence: 0.5 };
    case 'merchant':
      return { action: 'stabilize', price_change_percent: 0, reason: 'Maintaining prices', confidence: 0.5 };
    default:
      return { action: 'hold', reason: 'Unknown agent type', confidence: 0.5 };
  }
}

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
        JSON.stringify({ decision: getDefaultDecision(agentType) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let systemPrompt: string;
    let tool: typeof governorTool | typeof workerTool | typeof merchantTool;
    let toolName: string;

    switch (agentType) {
      case 'governor':
        systemPrompt = buildGovernorPrompt(worldState, memories || []);
        tool = governorTool;
        toolName = 'governor_decision';
        break;
      case 'worker':
        systemPrompt = buildWorkerPrompt(worldState, memories || []);
        tool = workerTool;
        toolName = 'worker_decision';
        break;
      case 'merchant':
        systemPrompt = buildMerchantPrompt(worldState, memories || []);
        tool = merchantTool;
        toolName = 'merchant_decision';
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    console.log(`Processing ${agentType} decision for agent ${agentId}`);

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
          { role: "user", content: "Make your decision now based on the current world state. Think carefully about long-term consequences." }
        ],
        tools: [tool],
        tool_choice: { type: "function", function: { name: toolName } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI Gateway error (${response.status}):`, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again.", decision: getDefaultDecision(agentType) }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted.", decision: getDefaultDecision(agentType) }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      return new Response(
        JSON.stringify({ decision: getDefaultDecision(agentType) }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ decision: getDefaultDecision(agentType) }),
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
    console.error("Agent decision error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        decision: getDefaultDecision('governor') 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
