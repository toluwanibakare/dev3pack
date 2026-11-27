import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const require = createRequire(import.meta.url);

function loadEnvLocal(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    throw new Error(".env.local not found in project root");
  }
  const env: Record<string, string> = {};
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

function parseKeypair(secret: string): Keypair {
  const trimmed = secret.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    return Keypair.fromSecretKey(Uint8Array.from(JSON.parse(trimmed)));
  }
  const bs58 = require("bs58") as { decode: (s: string) => Uint8Array };
  return Keypair.fromSecretKey(bs58.decode(trimmed));
}

async function transferSol(
  connection: Connection,
  from: Keypair,
  to: Keypair,
  lamports: number
): Promise<string> {
  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports,
    })
  );
  return sendAndConfirmTransaction(connection, tx, [from], { commitment: "confirmed" });
}

async function analyzeTarget(baseUrl: string, wallet: string, projectUrl: string) {
  const res = await fetch(`${baseUrl}/api/analyze-target`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ wallet, projectUrl }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(`analyze-target failed (${res.status}): ${JSON.stringify(data)}`);
  }
  return data;
}

async function main() {
  const env = loadEnvLocal();
  const rpcUrl = env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const attestorSecret = env.ATTESTOR_PRIVATE_KEY || process.env.ATTESTOR_PRIVATE_KEY;
  const apiBaseUrl = process.env.SOLVOX_API_URL || "http://localhost:3000";

  if (!attestorSecret) {
    throw new Error("ATTESTOR_PRIVATE_KEY is missing in .env.local");
  }

  const connection = new Connection(rpcUrl, "confirmed");
  const attestor = parseKeypair(attestorSecret);
  const balance = await connection.getBalance(attestor.publicKey);
  console.log(`Attestor: ${attestor.publicKey.toBase58()} (${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL)`);

  if (balance < 0.1 * LAMPORTS_PER_SOL) {
    throw new Error("Attestor balance too low (< 0.1 SOL) to fund demo wallets");
  }

  // Generate 3 demo wallets + 1 wash-loop partner wallet
  const walletA = Keypair.generate();
  const walletB = Keypair.generate();
  const walletBPartner = Keypair.generate();
  const walletC = Keypair.generate();

  console.log("\n1) Funding Wallet A (Clean -> Grade A)...");
  await transferSol(connection, attestor, walletA, Math.round(0.01 * LAMPORTS_PER_SOL));

  console.log("2) Funding Wallet B & Partner, then executing 8 circular wash-loop transfers...");
  await transferSol(connection, attestor, walletB, Math.round(0.03 * LAMPORTS_PER_SOL));
  await transferSol(connection, attestor, walletBPartner, Math.round(0.03 * LAMPORTS_PER_SOL));

  const pingPongLamports = Math.round(0.002 * LAMPORTS_PER_SOL);
  for (let i = 0; i < 4; i++) {
    await transferSol(connection, walletB, walletBPartner, pingPongLamports);
    await transferSol(connection, walletBPartner, walletB, pingPongLamports);
    console.log(`   - Ping-pong round ${i + 1}/4 complete`);
  }

  console.log("3) Funding Wallet C (Clean -> Grade A for daily-limit test)...");
  await transferSol(connection, attestor, walletC, Math.round(0.01 * LAMPORTS_PER_SOL));

  console.log(`\n4) Running POST ${apiBaseUrl}/api/analyze-target for all 3 wallets...`);
  const resA = await analyzeTarget(apiBaseUrl, walletA.publicKey.toBase58(), "https://jup.ag");
  const resB = await analyzeTarget(apiBaseUrl, walletB.publicKey.toBase58(), "https://solpepe-airdrop.fake");
  const resC = await analyzeTarget(apiBaseUrl, walletC.publicKey.toBase58(), "https://solana.com");

  console.log("\n=== Seeded Devnet Demo Targets ===");
  console.log(JSON.stringify({
    walletA: {
      publicKey: walletA.publicKey.toBase58(),
      projectUrl: "https://jup.ag",
      grade: resA.grade,
      score: resA.score,
      reportId: resA.id,
      attestTxSignature: resA.attestTxSignature,
    },
    walletB: {
      publicKey: walletB.publicKey.toBase58(),
      partnerPublicKey: walletBPartner.publicKey.toBase58(),
      projectUrl: "https://solpepe-airdrop.fake",
      grade: resB.grade,
      score: resB.score,
      washLoopMetrics: resB.washLoopMetrics,
      reportId: resB.id,
      attestTxSignature: resB.attestTxSignature,
    },
    walletC: {
      publicKey: walletC.publicKey.toBase58(),
      projectUrl: "https://solana.com",
      grade: resC.grade,
      score: resC.score,
      reportId: resC.id,
      attestTxSignature: resC.attestTxSignature,
    },
  }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
