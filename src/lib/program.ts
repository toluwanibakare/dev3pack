import {
  Connection,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { SOLVOX_PROGRAM_ID } from "./constants";
import { getReceiptPda, getTrustEntryPda, getVaultPda } from "./pda";
import { PolicyVaultData, TrustEntryData } from "./types";

async function anchorIxDiscriminator(name: string): Promise<Buffer> {
  const data = new TextEncoder().encode(`global:${name}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
  return Buffer.from(new Uint8Array(hashBuffer).slice(0, 8));
}

function u64LE(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(value, 0);
  return buf;
}

export function isProgramConfigured(): boolean {
  return Boolean(SOLVOX_PROGRAM_ID);
}

export async function fetchPolicyVault(
  connection: Connection,
  owner: PublicKey
): Promise<PolicyVaultData | null> {
  const [vaultPda] = getVaultPda(owner);
  const info = await connection.getAccountInfo(vaultPda);
  if (!info || info.data.length < 99) return null;

  const data = info.data;
  let offset = 8; // skip Anchor discriminator
  const ownerKey = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;
  const delegateAgent = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;
  const dailySpendLimitLamports = data.readBigUInt64LE(offset);
  offset += 8;
  const spentTodayLamports = data.readBigUInt64LE(offset);
  offset += 8;
  const lastResetTs = Number(data.readBigInt64LE(offset));
  offset += 8;
  const minTrustGrade = data.readUInt8(offset);
  offset += 1;
  const paused = data.readUInt8(offset) === 1;
  offset += 1;
  const bump = data.readUInt8(offset);

  return {
    address: vaultPda,
    owner: ownerKey,
    delegateAgent,
    dailySpendLimitLamports,
    spentTodayLamports,
    lastResetTs,
    minTrustGrade,
    paused,
    bump,
    lamports: info.lamports,
  };
}

export async function fetchTrustEntry(
  connection: Connection,
  target: PublicKey
): Promise<TrustEntryData | null> {
  const [trustPda] = getTrustEntryPda(target);
  const info = await connection.getAccountInfo(trustPda);
  if (!info || info.data.length < 114) return null;

  const data = info.data;
  let offset = 8;
  const targetKey = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;
  const attestor = new PublicKey(data.subarray(offset, offset + 32));
  offset += 32;
  const grade = data.readUInt8(offset);
  offset += 1;
  const reportHashHex = Buffer.from(data.subarray(offset, offset + 32)).toString("hex");
  offset += 32;
  const updatedAt = Number(data.readBigInt64LE(offset));
  offset += 8;
  const bump = data.readUInt8(offset);

  return {
    address: trustPda,
    target: targetKey,
    attestor,
    grade,
    reportHashHex,
    updatedAt,
    bump,
  };
}

export async function buildInitializeVaultIx(
  owner: PublicKey,
  dailySpendLimitLamports: bigint,
  minTrustGrade: number,
  delegateAgent: PublicKey
): Promise<TransactionInstruction> {
  const [vaultPda] = getVaultPda(owner);
  const disc = await anchorIxDiscriminator("initialize_vault");
  const data = Buffer.concat([
    disc,
    u64LE(dailySpendLimitLamports),
    Buffer.from([minTrustGrade]),
    delegateAgent.toBuffer(),
  ]);

  return new TransactionInstruction({
    programId: SOLVOX_PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function buildDepositVaultIx(
  owner: PublicKey,
  amountLamports: bigint
): Promise<TransactionInstruction> {
  const [vaultPda] = getVaultPda(owner);
  const disc = await anchorIxDiscriminator("deposit_vault");
  const data = Buffer.concat([disc, u64LE(amountLamports)]);

  return new TransactionInstruction({
    programId: SOLVOX_PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

export async function buildUpdatePolicyIx(
  owner: PublicKey,
  dailySpendLimitLamports: bigint,
  minTrustGrade: number,
  paused: boolean
): Promise<TransactionInstruction> {
  const [vaultPda] = getVaultPda(owner);
  const disc = await anchorIxDiscriminator("update_policy");
  const data = Buffer.concat([
    disc,
    u64LE(dailySpendLimitLamports),
    Buffer.from([minTrustGrade, paused ? 1 : 0]),
  ]);

  return new TransactionInstruction({
    programId: SOLVOX_PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: false },
    ],
    data,
  });
}

export async function buildWithdrawVaultIx(
  owner: PublicKey,
  amountLamports: bigint
): Promise<TransactionInstruction> {
  const [vaultPda] = getVaultPda(owner);
  const disc = await anchorIxDiscriminator("withdraw_vault");
  const data = Buffer.concat([disc, u64LE(amountLamports)]);

  return new TransactionInstruction({
    programId: SOLVOX_PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: true, isWritable: true },
    ],
    data,
  });
}

export async function buildExecuteGuardedActionIx(
  owner: PublicKey,
  target: PublicKey,
  payer: PublicKey,
  amountLamports: bigint,
  nonce: bigint
): Promise<TransactionInstruction> {
  const [vaultPda] = getVaultPda(owner);
  const [trustPda] = getTrustEntryPda(target);
  const [receiptPda] = getReceiptPda(vaultPda, nonce);
  const disc = await anchorIxDiscriminator("execute_guarded_action");
  const data = Buffer.concat([disc, u64LE(amountLamports), u64LE(nonce)]);

  return new TransactionInstruction({
    programId: SOLVOX_PROGRAM_ID,
    keys: [
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: trustPda, isSigner: false, isWritable: false },
      { pubkey: receiptPda, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: target, isSigner: false, isWritable: true },
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

const ANCHOR_ERROR_MAP: Record<string, string> = {
  "0x1770": "InvalidGrade: Trust grade must be between 1 (F) and 5 (A).",
  "0x1771": "InvalidAmount: Amount must be greater than zero.",
  "0x1772": "VaultPaused: PolicyVault is currently paused.",
  "0x1773": "UnauthorizedCaller: Caller is not authorized for this vault.",
  "0x1774": "InsufficientTrustGrade: Blocked on-chain — target wallet grade is below PolicyVault minimum.",
  "0x1775": "DailyLimitExceeded: Blocked on-chain — transfer exceeds PolicyVault daily spend limit.",
  "0x1776": "InsufficientVaultBalance: Insufficient SOL balance in PolicyVault.",
};

export function parseSolVoxError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  for (const [hex, readable] of Object.entries(ANCHOR_ERROR_MAP)) {
    if (msg.includes(hex) || msg.includes(readable.split(":")[0])) {
      return readable;
    }
  }
  if (msg.includes("AccountNotInitialized") || msg.includes("0xbc4")) {
    return "AccountNotInitialized: Target wallet has no on-chain TrustEntry yet. Click 'Verify & Attest Grade' first.";
  }
  return msg;
}
