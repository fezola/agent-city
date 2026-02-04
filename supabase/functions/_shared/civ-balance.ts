// CIV Token (Civic Credit) — onchain balance reader
// Uses raw JSON-RPC eth_call to read ERC-20 balanceOf
// No web3 library dependency — just fetch + ABI encoding

export const CIV_TOKEN_NAME = "Civic Credit";
export const CIV_TOKEN_SYMBOL = "CIV";
export const CIV_CONTRACT_ADDRESS = "0x1B4446578e27bfd27338222B291C8efFc89D7777";
export const CIV_CHAIN = "Monad";

// ERC-20 balanceOf(address) function selector
const BALANCE_OF_SELECTOR = "0x70a08231";

export interface CivTokenConfig {
  rpcUrl: string;
  tokenContract: string;
  treasuryWallet: string;
}

export function getCivConfig(): CivTokenConfig {
  return {
    rpcUrl: Deno.env.get("MONAD_RPC_URL") || "https://testnet-rpc.monad.xyz",
    tokenContract: Deno.env.get("CIV_TOKEN_CONTRACT") || CIV_CONTRACT_ADDRESS,
    treasuryWallet: Deno.env.get("TREASURY_WALLET_ADDRESS") || "",
  };
}

function encodeBalanceOfCall(address: string): string {
  const cleanAddress = address.replace("0x", "").toLowerCase();
  return BALANCE_OF_SELECTOR + cleanAddress.padStart(64, "0");
}

export async function getTreasuryCivBalance(config?: CivTokenConfig): Promise<{
  raw: bigint;
  formatted: string;
  success: boolean;
  error?: string;
}> {
  const cfg = config || getCivConfig();

  if (!cfg.treasuryWallet) {
    return { raw: 0n, formatted: "0", success: false, error: "TREASURY_WALLET_ADDRESS not set" };
  }

  try {
    const callData = encodeBalanceOfCall(cfg.treasuryWallet);

    const response = await fetch(cfg.rpcUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_call",
        params: [
          { to: cfg.tokenContract, data: callData },
          "latest",
        ],
      }),
    });

    const json = await response.json();

    if (json.error) {
      return { raw: 0n, formatted: "0", success: false, error: json.error.message };
    }

    const raw = BigInt(json.result);
    // Standard ERC-20: 18 decimals
    const decimals = 18;
    const divisor = 10n ** BigInt(decimals);
    const whole = raw / divisor;
    const fractional = (raw % divisor).toString().padStart(decimals, "0").slice(0, 4);
    const formatted = `${whole}.${fractional}`;

    return { raw, formatted, success: true };
  } catch (err) {
    return {
      raw: 0n,
      formatted: "0",
      success: false,
      error: err instanceof Error ? err.message : "Unknown RPC error",
    };
  }
}

// Token context block for AI prompts
export function getCivPromptContext(role: "governor" | "worker" | "merchant" | "system"): string {
  const base = `TOKEN REALITY:
This economy runs on ${CIV_TOKEN_NAME} (${CIV_TOKEN_SYMBOL}), a real ERC-20 token on the ${CIV_CHAIN} blockchain.
Contract: ${CIV_CONTRACT_ADDRESS}`;

  switch (role) {
    case "governor":
      return `${base}
All balances represent real onchain-backed tokens. There are no fake balances.
Losing tokens has permanent consequences. You cannot spend more than the treasury holds.`;

    case "worker":
      return `${base}
There are no fake balances. Losing tokens has permanent consequences.
You cannot spend more than you own. Every token you wager or lose is real.`;

    case "merchant":
      return `${base}
All transactions are backed by real tokens. No fake balances exist.
Pricing decisions directly affect your real token balance. Losses are permanent.`;

    case "system":
      return `TOKEN CONTEXT:
This economy uses ${CIV_TOKEN_NAME} (${CIV_TOKEN_SYMBOL}), a real ERC-20 token on the ${CIV_CHAIN} blockchain.
Contract: ${CIV_CONTRACT_ADDRESS}
All balances are backed by real tokens. Token losses are permanent.`;
  }
}
