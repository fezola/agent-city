// CIV Token (Civic Credit) — onchain balance reader + transaction sender
// Uses ethers.js for wallet signing and ERC-20 transfers on Monad

import { ethers } from "https://esm.sh/ethers@6.13.4";

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
    rpcUrl: Deno.env.get("MONAD_RPC_URL") || "https://rpc.monad.xyz",
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

// ==================== WALLET & TRANSACTION SIGNING ====================

// 1 simulation CIV = 0.001 real CIV (1e15 wei)
// This conserves token supply across many simulation days
export const CIV_SIMULATION_SCALE = 1000n;

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

/**
 * Create an ethers.js Wallet connected to Monad RPC.
 * Requires TREASURY_PRIVATE_KEY env var.
 */
export function getTreasuryWallet(): ethers.Wallet {
  const raw = Deno.env.get("TREASURY_PRIVATE_KEY");
  if (!raw) throw new Error("TREASURY_PRIVATE_KEY not set");
  // Trim whitespace and ensure 0x prefix
  let privateKey = raw.trim();
  if (!privateKey.startsWith("0x")) privateKey = "0x" + privateKey;
  const cfg = getCivConfig();
  const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);
  return new ethers.Wallet(privateKey, provider);
}

/**
 * Derive a deterministic HD wallet for an agent.
 * Uses keccak256(treasury_private_key + ":" + agentName) as the agent's private key.
 * Each agent gets their own wallet and can sign transactions.
 */
export function deriveAgentWallet(agentName: string): ethers.Wallet {
  const treasuryKey = Deno.env.get("TREASURY_PRIVATE_KEY");
  if (!treasuryKey) throw new Error("TREASURY_PRIVATE_KEY not set");
  const cleanKey = treasuryKey.trim();
  const seed = ethers.keccak256(
    ethers.toUtf8Bytes(`${cleanKey}:agent:${agentName}`)
  );
  const cfg = getCivConfig();
  const provider = new ethers.JsonRpcProvider(cfg.rpcUrl);
  return new ethers.Wallet(seed, provider);
}

/**
 * Derive a deterministic Monad address for an agent (without needing full wallet).
 * Compatible with deriveAgentWallet — same private key derivation.
 */
export function deriveAgentAddress(agentName: string): string {
  const treasuryKey = Deno.env.get("TREASURY_PRIVATE_KEY");
  if (!treasuryKey) throw new Error("TREASURY_PRIVATE_KEY not set");
  const cleanKey = treasuryKey.trim();
  const seed = ethers.keccak256(
    ethers.toUtf8Bytes(`${cleanKey}:agent:${agentName}`)
  );
  const wallet = new ethers.Wallet(seed);
  return wallet.address;
}

/**
 * Send CIV tokens from one agent to another agent.
 * Both agents have HD-derived wallets.
 */
export async function sendAgentToAgentTransfer(
  fromAgentName: string,
  toAgentName: string,
  amountWei: bigint,
  nonce?: number,
): Promise<{ txHash: string; success: boolean; error?: string; fromAddress: string; toAddress: string }> {
  try {
    const fromWallet = deriveAgentWallet(fromAgentName);
    const toWallet = deriveAgentWallet(toAgentName);
    const fromAddress = await fromWallet.getAddress();
    const toAddress = await toWallet.getAddress();

    const cfg = getCivConfig();
    const contract = new ethers.Contract(cfg.tokenContract, ERC20_ABI, fromWallet);

    const txOptions: Record<string, unknown> = {};
    if (nonce !== undefined) txOptions.nonce = nonce;

    const tx = await contract.transfer(toAddress, amountWei, txOptions);
    const receipt = await tx.wait(1);

    return {
      txHash: receipt.hash,
      success: true,
      fromAddress,
      toAddress,
    };
  } catch (err) {
    const fromWallet = deriveAgentWallet(fromAgentName);
    const toWallet = deriveAgentWallet(toAgentName);
    return {
      txHash: "",
      success: false,
      error: err instanceof Error ? err.message : "Agent transfer failed",
      fromAddress: await fromWallet.getAddress(),
      toAddress: await toWallet.getAddress(),
    };
  }
}

/**
 * Convert simulation CIV amount to wei.
 * 1 simulation CIV = 1e15 wei (0.001 real CIV).
 */
export function simCivToWei(simAmount: number): bigint {
  if (simAmount <= 0) return 0n;
  return BigInt(Math.floor(simAmount)) * (10n ** 18n / CIV_SIMULATION_SCALE);
}

/**
 * Send CIV tokens from treasury wallet to a recipient address.
 * Returns tx hash on success.
 */
export async function sendCivTransfer(
  wallet: ethers.Wallet,
  toAddress: string,
  amountWei: bigint,
  nonce?: number,
): Promise<{ txHash: string; success: boolean; error?: string }> {
  try {
    const cfg = getCivConfig();
    const contract = new ethers.Contract(cfg.tokenContract, ERC20_ABI, wallet);

    const txOptions: Record<string, unknown> = {};
    if (nonce !== undefined) txOptions.nonce = nonce;

    const tx = await contract.transfer(toAddress, amountWei, txOptions);
    const receipt = await tx.wait(1); // wait for 1 confirmation

    return {
      txHash: receipt.hash,
      success: true,
    };
  } catch (err) {
    return {
      txHash: "",
      success: false,
      error: err instanceof Error ? err.message : "Transfer failed",
    };
  }
}
