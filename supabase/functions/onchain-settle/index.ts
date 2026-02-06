import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getTreasuryWallet,
  deriveAgentAddress,
  simCivToWei,
  sendCivTransfer,
  CIV_TOKEN_SYMBOL,
} from "../_shared/civ-balance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentSettlement {
  agentId: string;
  agentName: string;
  agentType: string;
  earnings: number;      // net salary/profit earned this day
  buildingCost: number;  // building purchase cost (if any)
  wagerPayout: number;   // wager winnings (if any)
}

interface SettlementRequest {
  worldId: string;
  day: number;
  settlements: AgentSettlement[];
}

interface TxResult {
  agentName: string;
  txType: string;
  amount: number;
  txHash: string;
  success: boolean;
  error?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { worldId, day, settlements } = (await req.json()) as SettlementRequest;

    if (!worldId || !day || !settlements?.length) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client for logging
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Initialize treasury wallet
    let wallet;
    try {
      wallet = getTreasuryWallet();
    } catch (err) {
      console.error("Wallet init failed:", err);
      return new Response(
        JSON.stringify({
          error: "Treasury wallet not configured",
          results: [],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const treasuryAddress = await wallet.getAddress();
    let currentNonce = await wallet.getNonce();

    const results: TxResult[] = [];
    const dbRecords: Record<string, unknown>[] = [];

    console.log(`Settlement for Day ${day}: ${settlements.length} agents, nonce=${currentNonce}`);

    for (const agent of settlements) {
      const agentAddress = deriveAgentAddress(agent.agentName);

      // Update agent's onchain address in DB
      await supabase
        .from("agents")
        .update({ onchain_address: agentAddress })
        .eq("id", agent.agentId);

      // 1. Salary/profit earnings → treasury sends CIV to agent
      if (agent.earnings > 0) {
        const amountWei = simCivToWei(agent.earnings);
        const result = await sendCivTransfer(wallet, agentAddress, amountWei, currentNonce);
        currentNonce++;

        results.push({
          agentName: agent.agentName,
          txType: "salary_payment",
          amount: agent.earnings,
          txHash: result.txHash,
          success: result.success,
          error: result.error,
        });

        dbRecords.push({
          world_id: worldId,
          day,
          tx_type: "salary_payment",
          from_address: treasuryAddress,
          to_address: agentAddress,
          amount_civ: agent.earnings / 1000, // real CIV (scaled down)
          amount_wei: amountWei.toString(),
          tx_hash: result.txHash || null,
          status: result.success ? "confirmed" : "failed",
          agent_id: agent.agentId,
          agent_name: agent.agentName,
          error_message: result.error || null,
        });

        if (!result.success) {
          console.error(`Salary transfer failed for ${agent.agentName}: ${result.error}`);
        } else {
          console.log(`Salary: ${agent.earnings} sim ${CIV_TOKEN_SYMBOL} → ${agent.agentName} (${result.txHash})`);
        }
      }

      // 2. Building purchase → treasury sends CIV to infrastructure address
      if (agent.buildingCost > 0) {
        // Use a deterministic "city infrastructure" address
        const infraAddress = deriveAgentAddress("CityInfrastructure");
        const amountWei = simCivToWei(agent.buildingCost);
        const result = await sendCivTransfer(wallet, infraAddress, amountWei, currentNonce);
        currentNonce++;

        results.push({
          agentName: agent.agentName,
          txType: "building_purchase",
          amount: agent.buildingCost,
          txHash: result.txHash,
          success: result.success,
          error: result.error,
        });

        dbRecords.push({
          world_id: worldId,
          day,
          tx_type: "building_purchase",
          from_address: treasuryAddress,
          to_address: infraAddress,
          amount_civ: agent.buildingCost / 1000,
          amount_wei: amountWei.toString(),
          tx_hash: result.txHash || null,
          status: result.success ? "confirmed" : "failed",
          agent_id: agent.agentId,
          agent_name: agent.agentName,
          error_message: result.error || null,
        });
      }

      // 3. Wager payout → treasury sends CIV to agent
      if (agent.wagerPayout > 0) {
        const amountWei = simCivToWei(agent.wagerPayout);
        const result = await sendCivTransfer(wallet, agentAddress, amountWei, currentNonce);
        currentNonce++;

        results.push({
          agentName: agent.agentName,
          txType: "wager_payout",
          amount: agent.wagerPayout,
          txHash: result.txHash,
          success: result.success,
          error: result.error,
        });

        dbRecords.push({
          world_id: worldId,
          day,
          tx_type: "wager_payout",
          from_address: treasuryAddress,
          to_address: agentAddress,
          amount_civ: agent.wagerPayout / 1000,
          amount_wei: amountWei.toString(),
          tx_hash: result.txHash || null,
          status: result.success ? "confirmed" : "failed",
          agent_id: agent.agentId,
          agent_name: agent.agentName,
          error_message: result.error || null,
        });
      }
    }

    // Batch insert all transaction records
    if (dbRecords.length > 0) {
      const { error: insertError } = await supabase
        .from("onchain_transactions")
        .insert(dbRecords);

      if (insertError) {
        console.error("Failed to log transactions:", insertError);
      }
    }

    const confirmed = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    console.log(`Settlement complete: ${confirmed} confirmed, ${failed} failed`);

    return new Response(
      JSON.stringify({
        day,
        total: results.length,
        confirmed,
        failed,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Settlement error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        results: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
