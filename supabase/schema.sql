-- SolVox Supabase Schema (Run in Supabase SQL Editor)

create table if not exists verification_reports (
  id uuid primary key default gen_random_uuid(),
  wallet text not null,
  project_url text not null,
  grade text not null,
  grade_numeric smallint not null,
  score integer not null,
  red_flags jsonb not null default '[]'::jsonb,
  wash_loop_metrics jsonb not null default '{}'::jsonb,
  citations jsonb not null default '[]'::jsonb,
  attest_tx_signature text,
  created_at timestamptz not null default now()
);

create table if not exists action_receipts (
  id uuid primary key default gen_random_uuid(),
  vault_owner text not null,
  target_wallet text not null,
  project_url text,
  amount_sol numeric not null,
  grade text not null,
  status text not null check (status in ('CONFIRMED', 'BLOCKED_ON_CHAIN')),
  error_reason text,
  tx_signature text,
  report_id uuid references verification_reports(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_verification_reports_wallet on verification_reports (wallet);
create index if not exists idx_action_receipts_owner on action_receipts (vault_owner, created_at desc);
