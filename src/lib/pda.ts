import { PublicKey } from "@solana/web3.js";
import { SOLVOX_PROGRAM_ID } from "./constants";

export function getVaultPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.toBuffer()],
    SOLVOX_PROGRAM_ID
  );
}

export function getTrustEntryPda(target: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("trust"), target.toBuffer()],
    SOLVOX_PROGRAM_ID
  );
}

export function getReceiptPda(vault: PublicKey, nonce: bigint): [PublicKey, number] {
  const nonceBytes = Buffer.alloc(8);
  nonceBytes.writeBigUInt64LE(nonce, 0);
  return PublicKey.findProgramAddressSync(
    [Buffer.from("receipt"), vault.toBuffer(), nonceBytes],
    SOLVOX_PROGRAM_ID
  );
}
