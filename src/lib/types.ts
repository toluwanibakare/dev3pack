import { PublicKey } from "@solana/web3.js";

export interface PolicyVaultData {
  address: PublicKey;
  owner: PublicKey;
  delegateAgent: PublicKey;
  dailySpendLimitLamports: bigint;
  spentTodayLamports: bigint;
  lastResetTs: number;
  minTrustGrade: number;
  paused: boolean;
  bump: number;
  lamports: number;
}

export interface TrustEntryData {
  address: PublicKey;
  target: PublicKey;
  attestor: PublicKey;
  grade: number;
  reportHashHex: string;
  updatedAt: number;
  bump: number;
}

export interface AnalysisResult {
  wallet: string;
  projectUrl: string;
  grade: string;
  gradeNumeric: number;
  score: number;
  redFlags: string[];
  washLoopMetrics: {
    walletAgeDays: number;
    txCount: number;
    uniqueCounterparties: number;
    reciprocalRatio: number;
  };
  citations: { title: string; url: string }[];
  reportHash?: string;
  attestTxSignature?: string;
  reportId?: string;
}

export interface ReceiptLogItem {
  id: string;
  targetWallet: string;
  projectUrl?: string;
  amountSol: number;
  grade: string;
  status: "CONFIRMED" | "BLOCKED_ON_CHAIN";
  errorReason?: string;
  txSignature?: string;
  createdAt: string;
}
