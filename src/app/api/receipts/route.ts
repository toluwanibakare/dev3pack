import { NextResponse } from "next/server";
import { getActionReceipts, saveActionReceipt, ActionReceipt } from "@/lib/supabase";

/**
 * GET /api/receipts
 * Fetch recent action receipts, optionally filtered by ?vaultOwner=<pubkey>
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const vaultOwner = searchParams.get("vaultOwner");
    const receipts = await getActionReceipts(vaultOwner);
    return NextResponse.json({ receipts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch receipts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * POST /api/receipts
 * Persist an execution outcome (CONFIRMED or BLOCKED_ON_CHAIN)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body?.vault_owner || !body?.target_wallet || body?.amount_sol === undefined || !body?.grade || !body?.status) {
      return NextResponse.json(
        { error: "Missing required fields: vault_owner, target_wallet, amount_sol, grade, status" },
        { status: 400 }
      );
    }

    if (body.status !== "CONFIRMED" && body.status !== "BLOCKED_ON_CHAIN") {
      return NextResponse.json(
        { error: "Invalid status: must be 'CONFIRMED' or 'BLOCKED_ON_CHAIN'" },
        { status: 400 }
      );
    }

    const payload: ActionReceipt = {
      vault_owner: String(body.vault_owner),
      target_wallet: String(body.target_wallet),
      project_url: body.project_url ? String(body.project_url) : null,
      amount_sol: Number(body.amount_sol),
      grade: String(body.grade),
      status: body.status,
      error_reason: body.error_reason ? String(body.error_reason) : null,
      tx_signature: body.tx_signature ? String(body.tx_signature) : null,
      report_id: body.report_id ? String(body.report_id) : null,
    };

    const saved = await saveActionReceipt(payload);
    return NextResponse.json({ receipt: saved }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to record receipt";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
