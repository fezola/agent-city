import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  getTreasuryCivBalance,
  getCivConfig,
  CIV_TOKEN_SYMBOL,
  CIV_TOKEN_NAME,
  CIV_CONTRACT_ADDRESS,
  CIV_CHAIN,
} from "../_shared/civ-balance.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
