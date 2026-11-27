import { NextResponse } from "next/server";
import { getActionReceipts, saveActionReceipt, ActionReceipt } from "@/lib/supabase";

function toReceiptLogItem(r: ActionReceipt) {
  return {
    id: r.id || `rcpt-${Date.now()}`,
    vaultOwner: r.vault_owner,
    targetWallet: r.target_wallet,
    projectUrl: r.project_url ?? undefined,
    amountSol: Number(r.amount_sol),
    grade: r.grade,
    status: r.status,
    errorReason: r.error_reason ?? undefined,
    txSignature: r.tx_signature ?? undefined,
    reportId: r.report_id ?? undefined,
    createdAt: r.created_at || new Date().toISOString(),
  };
}

/**
 * GET /api/receipts
 * Fetch recent action receipts, optionally filtered by ?vaultOwner=<pubkey>
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vaultOwner = searchParams.get("vaultOwner");
    const rows = await getActionReceipts(vaultOwner);
    return NextResponse.json({ receipts: rows.map(toReceiptLogItem) });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch receipts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/receipts
 * Persist an execution outcome (CONFIRMED or BLOCKED_ON_CHAIN)
 * Accepts both snake_case (ActionReceipt) and camelCase (ReceiptLogItem) payloads.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    const vaultOwner = body?.vault_owner ?? body?.vaultOwner ?? "anonymous";
    const targetWallet = body?.target_wallet ?? body?.targetWallet;
    const projectUrl = body?.project_url ?? body?.projectUrl ?? null;
    const amountSol = body?.amount_sol ?? body?.amountSol;
    const grade = body?.grade;
    const status = body?.status;
    const errorReason = body?.error_reason ?? body?.errorReason ?? null;
    const txSignature = body?.tx_signature ?? body?.txSignature ?? null;
    const reportId = body?.report_id ?? body?.reportId ?? null;
    const createdAt = body?.created_at ?? body?.createdAt;

    if (!targetWallet || amountSol === undefined || !grade || !status) {
      return NextResponse.json(
        { error: "Missing required fields: targetWallet, amountSol, grade, status" },
        { status: 400 }
      );
    }

    if (status !== "CONFIRMED" && status !== "BLOCKED_ON_CHAIN") {
      return NextResponse.json(
        { error: "Invalid status: must be 'CONFIRMED' or 'BLOCKED_ON_CHAIN'" },
        { status: 400 }
      );
    }

    const payload: ActionReceipt = {
      vault_owner: String(vaultOwner),
      target_wallet: String(targetWallet),
      project_url: projectUrl ? String(projectUrl) : null,
      amount_sol: Number(amountSol),
      grade: String(grade),
      status,
      error_reason: errorReason ? String(errorReason) : null,
      tx_signature: txSignature ? String(txSignature) : null,
      report_id: reportId ? String(reportId) : null,
      ...(createdAt ? { created_at: String(createdAt) } : {}),
    };

    const saved = await saveActionReceipt(payload);
    return NextResponse.json({ receipt: toReceiptLogItem(saved) }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
