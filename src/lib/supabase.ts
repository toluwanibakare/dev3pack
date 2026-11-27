import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type VerificationReport = {
  id?: string;
  wallet: string;
  project_url: string;
  grade: string;
  grade_numeric: number;
  score: number;
  red_flags: string[];
  wash_loop_metrics: {
    walletAgeDays?: number;
    txCount?: number;
    uniqueCounterparties?: number;
    reciprocalRatio?: number;
    circularPingPongTxs?: number;
    [key: string]: unknown;
  };
  citations: { title: string; url: string }[];
  attest_tx_signature?: string | null;
  created_at?: string;
};

export type ActionReceipt = {
  id?: string;
  vault_owner: string;
  target_wallet: string;
  project_url?: string | null;
  amount_sol: number;
  grade: string;
  status: "CONFIRMED" | "BLOCKED_ON_CHAIN";
  error_reason?: string | null;
  tx_signature?: string | null;
  report_id?: string | null;
  created_at?: string;
};

// In-memory fallback stores for development when Supabase credentials are not yet configured
const inMemoryReports: VerificationReport[] = [];
const inMemoryReceipts: ActionReceipt[] = [];

let cachedClient: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!cachedClient) {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cachedClient;
}

/**
 * Save an action receipt (on-chain block or confirmed transfer).
 */
export async function saveActionReceipt(receipt: ActionReceipt): Promise<ActionReceipt> {
  const supabase = getSupabaseServerClient();
  const receiptRecord: ActionReceipt = {
    ...receipt,
    created_at: receipt.created_at || new Date().toISOString(),
  };

  if (!supabase) {
    const fallbackItem: ActionReceipt = {
      ...receiptRecord,
      id: "mem-" + Math.random().toString(36).substring(2, 10),
    };
    inMemoryReceipts.unshift(fallbackItem);
    return fallbackItem;
  }

  const { data, error } = await supabase
    .from("action_receipts")
    .insert([receiptRecord])
    .select()
    .single();

  if (error) {
    console.error("[Supabase saveActionReceipt] Error, falling back to memory:", error.message);
    const fallbackItem: ActionReceipt = {
      ...receiptRecord,
      id: "mem-" + Math.random().toString(36).substring(2, 10),
    };
    inMemoryReceipts.unshift(fallbackItem);
    return fallbackItem;
  }

  return data as ActionReceipt;
}

/**
 * Fetch action receipts for a vault owner or all recent receipts.
 */
export async function getActionReceipts(vaultOwner?: string | null): Promise<ActionReceipt[]> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    if (vaultOwner) {
      return inMemoryReceipts.filter((r) => r.vault_owner === vaultOwner);
    }
    return inMemoryReceipts;
  }

  let query = supabase
    .from("action_receipts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (vaultOwner) {
    query = query.eq("vault_owner", vaultOwner);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[Supabase getActionReceipts] Error, returning memory store:", error.message);
    if (vaultOwner) {
      return inMemoryReceipts.filter((r) => r.vault_owner === vaultOwner);
    }
    return inMemoryReceipts;
  }

  return (data || []) as ActionReceipt[];
}

/**
 * Save a verification report generated during target analysis.
 */
export async function saveVerificationReport(report: VerificationReport): Promise<VerificationReport> {
  const supabase = getSupabaseServerClient();
  const record: VerificationReport = {
    ...report,
    created_at: report.created_at || new Date().toISOString(),
  };

  if (!supabase) {
    const fallbackItem: VerificationReport = {
      ...record,
      id: "mem-" + Math.random().toString(36).substring(2, 10),
    };
    inMemoryReports.unshift(fallbackItem);
    return fallbackItem;
  }

  const { data, error } = await supabase
    .from("verification_reports")
    .insert([record])
    .select()
    .single();

  if (error) {
    console.error("[Supabase saveVerificationReport] Error, using memory:", error.message);
    const fallbackItem: VerificationReport = {
      ...record,
      id: "mem-" + Math.random().toString(36).substring(2, 10),
    };
    inMemoryReports.unshift(fallbackItem);
    return fallbackItem;
  }

  return data as VerificationReport;
}
