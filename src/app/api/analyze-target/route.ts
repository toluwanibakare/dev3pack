import { NextResponse } from "next/server";
import { PublicKey } from "@solana/web3.js";
import { analyzeWashLoop } from "@/lib/washLoopScorer";
import { analyzeProjectWebPresence } from "@/lib/firecrawl";
import { computeTrustGrade } from "@/lib/trustScorer";
import { attestTrustGradeOnChain } from "@/lib/attestor";
import { saveVerificationReport, VerificationReport } from "@/lib/supabase";

/**
 * POST /api/analyze-target
 * Core intelligence pipeline:
 * 1. Analyzes Solana on-chain history for wash loops (Helius / Solana RPC)
 * 2. Scrapes & inspects project domain for red flags (Firecrawl API)
 * 3. Computes weighted Trust Grade (A-F) & score (0-100)
 * 4. Submits on-chain attestation via solvox::set_trust_grade
 * 5. Persists report to Supabase verification_reports
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.wallet || !body?.projectUrl) {
      return NextResponse.json(
        { error: "Both wallet and projectUrl are required." },
        { status: 400 }
      );
    }

    const walletStr = String(body.wallet).trim();
    const projectUrl = String(body.projectUrl).trim();

    // Validate Solana address format
    try {
      new PublicKey(walletStr);
    } catch {
      return NextResponse.json(
        { error: "Invalid Solana wallet public key format." },
        { status: 400 }
      );
    }

    // Run on-chain wash-loop analysis and web footprint inspection in parallel
    const [washLoopMetrics, firecrawlAnalysis] = await Promise.all([
      analyzeWashLoop(walletStr),
      analyzeProjectWebPresence(projectUrl),
    ]);

    // Compute composite grade and score
    const report = computeTrustGrade(walletStr, projectUrl, washLoopMetrics, firecrawlAnalysis);

    // Attest trust grade on Solana Devnet
    const attestation = await attestTrustGradeOnChain(walletStr, report.gradeNumeric, {
      wallet: walletStr,
      projectUrl,
      grade: report.grade,
      score: report.score,
      redFlags: report.redFlags,
      washLoopMetrics: report.washLoopMetrics,
    });

    // Save to Supabase audit database
    const supabasePayload: VerificationReport = {
      wallet: walletStr,
      project_url: projectUrl,
      grade: report.grade,
      grade_numeric: report.gradeNumeric,
      score: report.score,
      red_flags: report.redFlags,
      wash_loop_metrics: report.washLoopMetrics,
      citations: report.citations,
      attest_tx_signature: attestation.attestTxSignature,
    };

    const savedReport = await saveVerificationReport(supabasePayload);

    return NextResponse.json({
      id: savedReport.id,
      wallet: walletStr,
      projectUrl,
      grade: report.grade,
      gradeNumeric: report.gradeNumeric,
      score: report.score,
      redFlags: report.redFlags,
      washLoopMetrics: report.washLoopMetrics,
      citations: report.citations,
      reportHash: attestation.reportHash,
      attestTxSignature: attestation.attestTxSignature,
      isSimulatedAttestation: attestation.isSimulated,
      summary: report.summary,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal analysis error";
    console.error("[/api/analyze-target] Error:", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
