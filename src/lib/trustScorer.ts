import { WashLoopMetrics } from "./washLoopScorer";
import { FirecrawlAnalysis } from "./firecrawl";

export type CompositeTrustReport = {
  wallet: string;
  projectUrl: string;
  grade: "A" | "B" | "C" | "D" | "F";
  gradeNumeric: number; // 5=A, 4=B, 3=C, 2=D, 1=F
  score: number; // 0 to 100
  redFlags: string[];
  washLoopMetrics: WashLoopMetrics;
  citations: { title: string; url: string }[];
  summary: string;
};

/**
 * Computes a weighted trust grade and composite score from on-chain wash-loop metrics and web intelligence.
 */
export function computeTrustGrade(
  wallet: string,
  projectUrl: string,
  washLoop: WashLoopMetrics,
  firecrawl: FirecrawlAnalysis
): CompositeTrustReport {
  let score = 100;
  const redFlags: string[] = [];

  // --- On-Chain Wash-Loop Scoring (60% weight) ---
  if (washLoop.washLoopDetected) {
    score -= 40;
    redFlags.push(
      `Wash-loop detected: ${(washLoop.reciprocalRatio * 100).toFixed(0)}% circular ping-pong transfer ratio across ${washLoop.uniqueCounterparties} counterparty`
    );
  } else if (washLoop.reciprocalRatio > 0.5) {
    score -= 20;
    redFlags.push(`Elevated reciprocal transfer concentration (${(washLoop.reciprocalRatio * 100).toFixed(0)}%)`);
  }

  if (washLoop.txCount >= 5 && washLoop.uniqueCounterparties <= 2) {
    score -= 20;
    redFlags.push("Abnormally low counterparty diversity for transaction volume");
  }

  if (washLoop.walletAgeDays < 2 && washLoop.txCount > 10) {
    score -= 15;
    redFlags.push(`Very new wallet (${washLoop.walletAgeDays} day) with high immediate activity`);
  }

  // --- Firecrawl Web Intelligence Scoring (40% weight) ---
  for (const signal of firecrawl.suspiciousSignals) {
    score -= 12;
    redFlags.push(signal);
  }

  if (!firecrawl.hasDocs) {
    score -= 10;
  }

  if (!firecrawl.hasNamedTeam) {
    score -= 10;
  }

  if (!firecrawl.hasGithubOrAudit) {
    score -= 10;
  }

  // Clamp score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));

  // Map score to A-F grade (5=A, 4=B, 3=C, 2=D, 1=F)
  let grade: "A" | "B" | "C" | "D" | "F";
  let gradeNumeric: number;

  if (finalScore >= 80 && !washLoop.washLoopDetected) {
    grade = "A";
    gradeNumeric = 5;
  } else if (finalScore >= 65 && !washLoop.washLoopDetected) {
    grade = "B";
    gradeNumeric = 4;
  } else if (finalScore >= 50) {
    grade = "C";
    gradeNumeric = 3;
  } else if (finalScore >= 35) {
    grade = "D";
    gradeNumeric = 2;
  } else {
    grade = "F";
    gradeNumeric = 1;
  }

  // Summary narration for UI and ElevenLabs TTS
  let summary = "";
  if (gradeNumeric >= 4) {
    summary = `Trust Grade ${grade} (${finalScore}/100). Verified web footprint and clean counterparty history. Safe for policy execution.`;
  } else if (gradeNumeric === 3) {
    summary = `Trust Grade ${grade} (${finalScore}/100). Moderate risk profile with limited history. Proceed with caution.`;
  } else {
    summary = `CRITICAL ALERT: Trust Grade ${grade} (${finalScore}/100). ${redFlags[0] || "Severe risk indicators detected."} Smart contract policy will block transfers.`;
  }

  return {
    wallet,
    projectUrl,
    grade,
    gradeNumeric,
    score: finalScore,
    redFlags,
    washLoopMetrics: washLoop,
    citations: firecrawl.citations,
    summary,
  };
}
