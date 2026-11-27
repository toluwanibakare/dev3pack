import { PublicKey } from "@solana/web3.js";

export const SOLVOX_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_SOLVOX_PROGRAM_ID ||
    "GQqUyuyVnf9vHG3hzHztPt53nZyRSjnrmjLSmEabRNjc"
);

export const GRADE_LABELS: Record<number, string> = {
  5: "A",
  4: "B",
  3: "C",
  2: "D",
  1: "F",
};

export const GRADE_VALUES: Record<string, number> = {
  A: 5,
  B: 4,
  C: 3,
  D: 2,
  F: 1,
};

export function gradeToLabel(grade: number): string {
  return GRADE_LABELS[grade] || "?";
}

export function explorerTxUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}?cluster=devnet`;
}

export function explorerAddressUrl(address: string): string {
  return `https://explorer.solana.com/address/${address}?cluster=devnet`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
}
