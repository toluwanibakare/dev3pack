import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import crypto from "crypto";

export type AttestationResult = {
  attestTxSignature: string;
  reportHash: string;
  trustEntryPda: string;
  isSimulated: boolean;
};

/**
 * Derives the TrustEntry PDA for a target wallet: seeds = [b"trust", target.key().as_ref()]
 */
export function deriveTrustEntryPda(targetPubkey: PublicKey, programId: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from("trust"), targetPubkey.toBuffer()], programId);
}

/**
 * Computes Anchor 8-byte instruction discriminator: sha256("global:<method_name>")[0..8]
 */
function getInstructionDiscriminator(methodName: string): Buffer {
  const hash = crypto.createHash("sha256").update(`global:${methodName}`).digest();
  return hash.subarray(0, 8);
}

/**
 * Submits solvox::set_trust_grade on Solana Devnet using the backend attestor keypair.
 */
export async function attestTrustGradeOnChain(
  targetWallet: string,
  gradeNumeric: number,
  reportData: Record<string, unknown>
): Promise<AttestationResult> {
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.devnet.solana.com";
  const programIdStr = process.env.NEXT_PUBLIC_SOLVOX_PROGRAM_ID;
  const privateKeyStr = process.env.ATTESTOR_PRIVATE_KEY;

  // Compute 32-byte SHA-256 hash of the report data
  const reportJson = JSON.stringify(reportData);
  const reportHashBytes = crypto.createHash("sha256").update(reportJson).digest();
  const reportHashHex = reportHashBytes.toString("hex");

  const targetPubkey = new PublicKey(targetWallet);

  // If no program ID or attestor keypair is configured, return simulated attestation
  if (!programIdStr || !privateKeyStr) {
    const fallbackProgramId = new PublicKey("SoLVoX1111111111111111111111111111111111111");
    const [pda] = deriveTrustEntryPda(targetPubkey, fallbackProgramId);
    return {
      attestTxSignature: "simulated_attest_" + reportHashHex.slice(0, 24),
      reportHash: "0x" + reportHashHex,
      trustEntryPda: pda.toBase58(),
      isSimulated: true,
    };
  }

  try {
    const programId = new PublicKey(programIdStr);
    const [trustEntryPda] = deriveTrustEntryPda(targetPubkey, programId);

    // Load attestor keypair from base58 string or JSON array
    const attestorKeypair = parseKeypair(privateKeyStr);
    const connection = new Connection(rpcUrl, "confirmed");

    // Anchor discriminator for "set_trust_grade"
    const discriminator = getInstructionDiscriminator("set_trust_grade");

    // Instruction payload: discriminator (8 bytes) + grade (u8, 1 byte) + report_hash ([u8; 32], 32 bytes)
    const gradeBuf = Buffer.from([gradeNumeric]);
    const instructionData = Buffer.concat([discriminator, gradeBuf, reportHashBytes]);

    const instruction = new TransactionInstruction({
      programId,
      keys: [
        { pubkey: trustEntryPda, isSigner: false, isWritable: true },
        { pubkey: targetPubkey, isSigner: false, isWritable: false },
        { pubkey: attestorKeypair.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      ],
      data: instructionData,
    });

    const transaction = new Transaction().add(instruction);
    const signature = await sendAndConfirmTransaction(connection, transaction, [attestorKeypair], {
      commitment: "confirmed",
    });

    return {
      attestTxSignature: signature,
      reportHash: "0x" + reportHashHex,
      trustEntryPda: trustEntryPda.toBase58(),
      isSimulated: false,
    };
  } catch (err) {
    console.warn("[Attestor] On-chain submission failed, returning simulated attestation:", err);
    const fallbackProgramId = new PublicKey("SoLVoX1111111111111111111111111111111111111");
    const [pda] = deriveTrustEntryPda(targetPubkey, fallbackProgramId);
    return {
      attestTxSignature: "simulated_attest_" + reportHashHex.slice(0, 24),
      reportHash: "0x" + reportHashHex,
      trustEntryPda: pda.toBase58(),
      isSimulated: true,
    };
  }
}

/**
 * Parses a private key from either JSON byte array or base58 string.
 */
function parseKeypair(secret: string): Keypair {
  const trimmed = secret.trim();
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const bytes = Uint8Array.from(JSON.parse(trimmed));
    return Keypair.fromSecretKey(bytes);
  }

  // Fallback to bs58 decode
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const bs58 = require("bs58");
  return Keypair.fromSecretKey(bs58.decode(trimmed));
}
