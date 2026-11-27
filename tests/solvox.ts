import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("solvox", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const program = anchor.workspace.solvox as Program<any>;
  const owner = provider.wallet as anchor.Wallet;
  const attestor = owner; // In tests, provider wallet acts as attestor

  const safeTarget = Keypair.generate();
  const scamTarget = Keypair.generate();

  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from("vault"), owner.publicKey.toBuffer()],
    program.programId
  );

  it("initializes vault and deposits 1 SOL", async () => {
    const dailyLimit = new anchor.BN(0.5 * LAMPORTS_PER_SOL);
    const minTrustGrade = 4; // Grade B

    await program.methods
      .initializeVault(dailyLimit, minTrustGrade, owner.publicKey)
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .depositVault(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        vault: vaultPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const vault = await program.account.policyVault.fetch(vaultPda);
    expect(vault.minTrustGrade).to.equal(4);
  });

  it("rejects transfer to Grade F wallet (InsufficientTrustGrade)", async () => {
    const [trustPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust"), scamTarget.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .setTrustGrade(1, Array(32).fill(1))
      .accounts({
        trustEntry: trustPda,
        target: scamTarget.publicKey,
        attestor: attestor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const nonce = new anchor.BN(1);
    const [receiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), vaultPda.toBuffer(), nonce.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    let failed = false;
    try {
      await program.methods
        .executeGuardedAction(new anchor.BN(0.1 * LAMPORTS_PER_SOL), nonce)
        .accounts({
          vault: vaultPda,
          trustEntry: trustPda,
          receipt: receiptPda,
          owner: owner.publicKey,
          target: scamTarget.publicKey,
          payer: owner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (err: unknown) {
      failed = true;
      expect(String(err)).to.include("InsufficientTrustGrade");
    }
    expect(failed).to.equal(true);
  });

  it("rejects transfer exceeding daily limit (DailyLimitExceeded) and allows valid Grade A transfer", async () => {
    const [trustPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trust"), safeTarget.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .setTrustGrade(5, Array(32).fill(2))
      .accounts({
        trustEntry: trustPda,
        target: safeTarget.publicKey,
        attestor: attestor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // 1. Over-limit attempt (0.8 SOL > 0.5 SOL daily limit)
    const overNonce = new anchor.BN(2);
    const [overReceiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), vaultPda.toBuffer(), overNonce.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    let failedOver = false;
    try {
      await program.methods
        .executeGuardedAction(new anchor.BN(0.8 * LAMPORTS_PER_SOL), overNonce)
        .accounts({
          vault: vaultPda,
          trustEntry: trustPda,
          receipt: overReceiptPda,
          owner: owner.publicKey,
          target: safeTarget.publicKey,
          payer: owner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
    } catch (err: unknown) {
      failedOver = true;
      expect(String(err)).to.include("DailyLimitExceeded");
    }
    expect(failedOver).to.equal(true);

    // 2. Valid transfer (0.25 SOL <= 0.5 SOL daily limit)
    const validNonce = new anchor.BN(3);
    const [validReceiptPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("receipt"), vaultPda.toBuffer(), validNonce.toArrayLike(Buffer, "le", 8)],
      program.programId
    );

    await program.methods
      .executeGuardedAction(new anchor.BN(0.25 * LAMPORTS_PER_SOL), validNonce)
      .accounts({
        vault: vaultPda,
        trustEntry: trustPda,
        receipt: validReceiptPda,
        owner: owner.publicKey,
        target: safeTarget.publicKey,
        payer: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const receipt = await program.account.actionReceipt.fetch(validReceiptPda);
    expect(receipt.gradeAtExecution).to.equal(5);
  });
});
