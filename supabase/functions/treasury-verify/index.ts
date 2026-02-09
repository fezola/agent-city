import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getTreasuryCivBalance,
  getCivConfig,
  CIV_TOKEN_SYMBOL,
  CIV_TOKEN_NAME,
  CIV_CONTRACT_ADDRESS,
  CIV_CHAIN,
  deriveAgentAddress,
} from "../_shared/civ-balance.ts";
import { ethers } from "https://esm.sh/ethers@6.13.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ERC-20 balanceOf(address) function selector
const BALANCE_OF_SELECTOR = "0x70a08231";

function encodeBalanceOfCall(address: string): string {
  const cleanAddress = address.replace("0x", "").toLowerCase();
  return BALANCE_OF_SELECTOR + cleanAddress.padStart(64, "0");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body: Record<string, unknown> = {};
    try {
      body = await req.json();
    } catch {
      // No body — default to treasury check
    }

    const action = body.action as string | undefined;

    // ===== AGENT WALLET LOOKUP =====
    if (action === "agent-wallet") {
      const agentName = body.agentName as string;
      if (!agentName) {
        return new Response(
          JSON.stringify({ error: "agentName required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const cfg = getCivConfig();
      const address = deriveAgentAddress(agentName);
      const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);

      // Fetch MON balance (native token)
      let monBalance = "0";
      try {
        const monRaw = await provider.getBalance(address);
        monBalance = ethers.formatEther(monRaw);
        // Truncate to 4 decimal places
        monBalance = parseFloat(monBalance).toFixed(4);
      } catch (err) {
        console.error(`Failed to get MON balance for ${agentName}:`, err);
      }

      // Fetch CIV balance (ERC-20)
      let civBalance = "0";
      let civRaw = "0";
      try {
        const callData = encodeBalanceOfCall(address);
        const response = await fetch(cfg.rpcUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "eth_call",
            params: [{ to: cfg.tokenContract, data: callData }, "latest"],
          }),
        });
        const json = await response.json();
        if (!json.error && json.result && json.result !== "0x") {
          const raw = BigInt(json.result);
          civRaw = raw.toString();
          const decimals = 18;
          const divisor = 10n ** BigInt(decimals);
          const whole = raw / divisor;
          const fractional = (raw % divisor).toString().padStart(decimals, "0").slice(0, 4);
          civBalance = `${whole}.${fractional}`;
        }
      } catch (err) {
        console.error(`Failed to get CIV balance for ${agentName}:`, err);
      }

      return new Response(
        JSON.stringify({
          address,
          civBalance,
          civRaw,
          monBalance,
          agentName,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ===== DEFAULT: TREASURY CHECK =====
    const config = getCivConfig();
    const balance = await getTreasuryCivBalance(config);

    return new Response(
      JSON.stringify({
        token: {
          name: CIV_TOKEN_NAME,
          symbol: CIV_TOKEN_SYMBOL,
          contract: CIV_CONTRACT_ADDRESS,
          chain: CIV_CHAIN,
        },
        treasury: {
          wallet: config.treasuryWallet,
          balance_raw: balance.raw.toString(),
          balance_formatted: balance.formatted,
          success: balance.success,
          error: balance.error,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
