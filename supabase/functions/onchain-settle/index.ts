import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  getTreasuryWallet,
  deriveAgentAddress,
  deriveAgentWallet,
  simCivToWei,
  sendCivTransfer,
  sendAgentToAgentTransfer,
  CIV_TOKEN_SYMBOL,
  getCivConfig,
} from "../_shared/civ-balance.ts";
import { ethers } from "https://esm.sh/ethers@6.13.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface AgentSettlement {
  agentId: string;
  agentName: string;
  agentType: string;
  earnings: number;
  buildingCost: number;
  wagerPayout: number;
}

interface AgentTransfer {
  fromAgentId: string;
  fromAgentName: string;
  toAgentId: string;
  toAgentName: string;
  amount: number;
  txType: string; // 'trade' | 'gift' | 'bribe' | 'service_payment'
  reason?: string;
}

interface SettlementRequest {
  worldId: string;
  day: number;
  settlements: AgentSettlement[];
  agentTransfers?: AgentTransfer[];
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
    const { worldId, day, settlements, agentTransfers } = (await req.json()) as SettlementRequest;

    if (!worldId || !day || (!settlements?.length && !agentTransfers?.length)) {
      return new Response(
        JSON.stringify({ error: "Missing required fields", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let wallet;
    try {
      wallet = getTreasuryWallet();
    } catch (err) {
      console.error("Wallet init failed:", err);
      return new Response(
        JSON.stringify({ error: "Treasury wallet not configured", results: [] }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const treasuryAddress = await wallet.getAddress();
    let currentNonce = await wallet.getNonce();

    const results: TxResult[] = [];
    const dbRecords: Record<string, unknown>[] = [];

    console.log(`Settlement for Day ${day}: ${settlements?.length || 0} agents, ${agentTransfers?.length || 0} transfers, nonce=${currentNonce}`);

    // ===== FUND AGENT WALLETS WITH MON FOR GAS =====
    // Each agent needs a small amount of MON to pay gas fees for P2P transfers
    const MIN_MON_BALANCE = ethers.parseEther("0.001"); // 0.001 MON minimum
    const MON_FUNDING_AMOUNT = ethers.parseEther("0.005"); // Fund with 0.005 MON

    const allAgentNames = new Set<string>();
    for (const s of (settlements || [])) allAgentNames.add(s.agentName);
    for (const t of (agentTransfers || [])) {
      allAgentNames.add(t.fromAgentName);
      allAgentNames.add(t.toAgentName);
    }

    for (const agentName of allAgentNames) {
      try {
        const agentAddress = deriveAgentAddress(agentName);
        const cfg = getCivConfig();
        const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);
        const monBalance = await provider.getBalance(agentAddress);

        if (monBalance < MIN_MON_BALANCE) {
          console.log(`Funding ${agentName} (${agentAddress}) with MON for gas — current: ${ethers.formatEther(monBalance)} MON`);
          const tx = await wallet.sendTransaction({
            to: agentAddress,
            value: MON_FUNDING_AMOUNT,
            nonce: currentNonce,
          });
          await tx.wait(1);
          currentNonce++;
          console.log(`Funded ${agentName} with 0.005 MON (tx: ${tx.hash})`);
        }
      } catch (err) {
        console.error(`Failed to fund ${agentName} with MON:`, err instanceof Error ? err.message : err);
        // Non-blocking: continue settlement even if gas funding fails
      }
    }

    // ===== TREASURY → AGENT SETTLEMENTS =====
    for (const agent of (settlements || [])) {
      const agentAddress = deriveAgentAddress(agent.agentName);

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
          amount_civ: agent.earnings / 1000,
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

    // ===== AGENT → AGENT TRANSFERS =====
    for (const transfer of (agentTransfers || [])) {
      const amountWei = simCivToWei(transfer.amount);

      console.log(`Agent transfer: ${transfer.fromAgentName} → ${transfer.toAgentName} (${transfer.amount} sim CIV, type: ${transfer.txType})`);

      const result = await sendAgentToAgentTransfer(
        transfer.fromAgentName,
        transfer.toAgentName,
        amountWei,
      );

      results.push({
        agentName: transfer.fromAgentName,
        txType: transfer.txType,
        amount: transfer.amount,
        txHash: result.txHash,
        success: result.success,
        error: result.error,
      });

      dbRecords.push({
        world_id: worldId,
        day,
        tx_type: transfer.txType,
        from_address: result.fromAddress,
        to_address: result.toAddress,
        amount_civ: transfer.amount / 1000,
        amount_wei: amountWei.toString(),
        tx_hash: result.txHash || null,
        status: result.success ? "confirmed" : "failed",
        agent_id: transfer.fromAgentId,
        agent_name: `${transfer.fromAgentName} → ${transfer.toAgentName}`,
        error_message: result.error || null,
      });

      if (!result.success) {
        console.error(`Agent transfer failed ${transfer.fromAgentName} → ${transfer.toAgentName}: ${result.error}`);
      } else {
        console.log(`Transfer: ${transfer.amount} sim ${CIV_TOKEN_SYMBOL} ${transfer.fromAgentName} → ${transfer.toAgentName} (${result.txHash})`);
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
