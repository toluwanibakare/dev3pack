import { Connection, PublicKey, ParsedTransactionWithMeta } from "@solana/web3.js";

export type WashLoopMetrics = {
  walletAgeDays: number;
  txCount: number;
  uniqueCounterparties: number;
  reciprocalRatio: number;
  circularPingPongTxs: number;
  washLoopDetected: boolean;
};

/**
 * Analyzes on-chain transaction history for circular ping-pong wash loops and counterparty diversity.
 */
export async function analyzeWashLoop(
  targetWallet: string,
  rpcUrl?: string
): Promise<WashLoopMetrics> {
  const endpoint = rpcUrl || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";

  try {
    const pubkey = new PublicKey(targetWallet);
    const connection = new Connection(endpoint, "confirmed");

    // Fetch up to 50 recent signatures for analysis
    const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 50 });

    if (!signatures || signatures.length === 0) {
      return {
        walletAgeDays: 0,
        txCount: 0,
        uniqueCounterparties: 0,
        reciprocalRatio: 0,
        circularPingPongTxs: 0,
        washLoopDetected: false,
      };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    const oldestTimestamp = signatures[signatures.length - 1].blockTime || nowSec;
    const walletAgeDays = Math.max(1, Math.round((nowSec - oldestTimestamp) / 86400));
    const txCount = signatures.length;

    // Sample the latest 20 transactions to parse counterparties
    const sampleSigs = signatures.slice(0, 20).map((s) => s.signature);
    const parsedTxs = await connection.getParsedTransactions(sampleSigs, {
      maxSupportedTransactionVersion: 0,
    });

    const counterpartyCounts = new Map<string, number>();
    let totalTransfers = 0;

    for (const tx of parsedTxs) {
      if (!tx || !tx.meta) continue;

      const counterparties = extractCounterparties(tx, pubkey.toBase58());
      for (const cp of counterparties) {
        counterpartyCounts.set(cp, (counterpartyCounts.get(cp) || 0) + 1);
        totalTransfers++;
      }
    }

    const uniqueCounterparties = counterpartyCounts.size;

    // Calculate reciprocal concentration (highest counterparty frequency vs total interactions)
    let maxCounterpartyInteractions = 0;
    for (const count of counterpartyCounts.values()) {
      if (count > maxCounterpartyInteractions) {
        maxCounterpartyInteractions = count;
      }
    }

    const reciprocalRatio =
      totalTransfers > 0
        ? Number((maxCounterpartyInteractions / totalTransfers).toFixed(2))
        : 0;

    // Detect circular wash loop when a high percentage of transfers are concentrated in 1 or 2 accounts
    const washLoopDetected =
      txCount >= 5 && (reciprocalRatio >= 0.65 || (uniqueCounterparties <= 2 && txCount >= 8));

    return {
      walletAgeDays,
      txCount,
      uniqueCounterparties,
      reciprocalRatio,
      circularPingPongTxs: washLoopDetected ? Math.round(txCount * reciprocalRatio) : 0,
      washLoopDetected,
    };
  } catch (error) {
    console.error("[WashLoopScorer] Failed to query on-chain history:", error);
    // Graceful fallback metrics
    return {
      walletAgeDays: 1,
      txCount: 1,
      uniqueCounterparties: 1,
      reciprocalRatio: 0,
      circularPingPongTxs: 0,
      washLoopDetected: false,
    };
  }
}

/**
 * Helper to identify distinct counterparty addresses from a parsed Solana transaction.
 */
function extractCounterparties(tx: ParsedTransactionWithMeta, selfAddress: string): string[] {
  const results = new Set<string>();

  try {
    const instructions = tx.transaction.message.instructions;
    for (const ix of instructions) {
      if ("parsed" in ix && ix.parsed && typeof ix.parsed === "object") {
        const info = (ix.parsed as { info?: { source?: string; destination?: string; lamports?: number } }).info;
        if (info) {
          if (info.source && info.source !== selfAddress) {
            results.add(info.source);
          }
          if (info.destination && info.destination !== selfAddress) {
            results.add(info.destination);
          }
        }
      }
    }
  } catch {
    // Ignore parsing anomalies on non-standard instruction formats
  }

  return Array.from(results);
}
