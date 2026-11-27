# SolVox — Technical Product Requirements Document (PRD)

**Project:** SolVox — On-Chain Trust & Policy Firewall for Solana  
**Hackathon:** Dev3pack × Solana Global Online Hackathon  
**Team:** 3 Builders (Nigeria — Eligible for Global Tracks + Dev3pack Local Nigeria)  
**Hard Cutoff:** Sunday, Nov 29, 2026 @ **06:00 WAT** *(Target Code Freeze: Saturday, Nov 28 @ 18:00 WAT)*

---

## 1. Product Summary

**One-Sentence Pitch:**  
> *SolVox is a safety lock for sending crypto on Solana, run by an AI assistant that investigates both the recipient's live project website (Firecrawl) and on-chain wash-loop history (Helius/RPC) first—while an Anchor smart contract enforces spending and trust rules on-chain so nobody (including the AI) can bypass them.*

### Target Tracks
- **Best App Overall on Solana** ($5,000) — *Primary*
- **Best Solana app using Firecrawl** ($1,197 per team member)
- **Best Solana app built with ElevenLabs** ($897 per team member)
- **Dev3pack Local — Nigeria** ($500 USDC, Top 1)
- **Best Agentic App on Solana** ($250 pool)
- **Best Solana app using Supabase** ($100 per team member in credits)

---

## 2. System Architecture & Core Loop

```
[User Voice / UI Input: wallet + projectUrl + amount]
        │
        ▼ (1. ElevenLabs Scribe STT)
[Next.js API: /api/analyze-target]
   ├──► Firecrawl (scrape/search projectUrl for red flags & citations)
   └──► Helius / Solana RPC (wallet age, counterparty diversity, wash-loop ratio)
        │
        ▼ (2. Compute Grade A=5 .. F=1)
[Backend Attestor Keypair] ──► solana devnet: solvox::set_trust_grade(target, grade, report_hash)
        │
        ▼ (3. User clicks Confirm / Execute in UI)
[Phantom / Solflare Wallet] ──► solana devnet: solvox::execute_guarded_action(amount)
   ├── Reads PolicyVault PDA (daily_spend_limit, spent_today, min_trust_grade, paused)
   ├── Reads TrustEntry PDA (grade)  <-- NEVER passed as an AI/instruction arg!
   ├── FAIL: Reverts on-chain (InsufficientTrustGrade / DailyLimitExceeded)
   └── PASS: Transfers native devnet SOL + creates ActionReceipt PDA
        │
        ▼ (4. Audit & Narration)
[Supabase Audit Log] + [ElevenLabs eleven_v4_turbo TTS speaks verdict & tx signature]
```

### Critical Security Invariant
- The LLM/frontend **never** passes `grade` as an argument to `execute_guarded_action`.
- `execute_guarded_action` reads `TrustEntry.grade` directly from the on-chain PDA attested by the backend `attestor` keypair.
- **Known Trade-off (Documented in README):** Single backend attestor keypair is a hackathon centralization trade-off; decentralized/ZK attestation is the post-hackathon roadmap.

---

## 3. On-Chain Specification (Anchor Program: `solvox`)

- **Network:** Solana Devnet (`native SOL` transfers to avoid SPL ATA complexity in a 44h sprint).
- **Single Program, 3 PDAs:**

### 3.1 Accounts (PDAs)

1. **`PolicyVault`** — Seeds: `[b"vault", owner.key().as_ref()]`
   - `owner: Pubkey` (32)
   - `delegate_agent: Pubkey` (32)
   - `daily_spend_limit: u64` (8) — lamports
   - `spent_today: u64` (8) — lamports
   - `last_reset_ts: i64` (8) — Unix timestamp
   - `min_trust_grade: u8` (1) — `1=F, 2=D, 3=C, 4=B, 5=A`
   - `paused: bool` (1)
   - `bump: u8` (1)
   - *Space:* `8 + 32 + 32 + 8 + 8 + 8 + 1 + 1 + 1 = 99 bytes`

2. **`TrustEntry`** — Seeds: `[b"trust", target.key().as_ref()]`
   - `target: Pubkey` (32)
   - `attestor: Pubkey` (32)
   - `grade: u8` (1) — `1..=5` (`F..=A`)
   - `report_hash: [u8; 32]` (32) — SHA-256 of Firecrawl + RPC report JSON
   - `updated_at: i64` (8)
   - `bump: u8` (1)
   - *Space:* `8 + 32 + 32 + 1 + 32 + 8 + 1 = 114 bytes`

3. **`ActionReceipt`** — Seeds: `[b"receipt", vault.key().as_ref(), &nonce.to_le_bytes()]`
   - `vault: Pubkey` (32)
   - `target: Pubkey` (32)
   - `amount: u64` (8)
   - `grade_at_execution: u8` (1)
   - `timestamp: i64` (8)
   - `nonce: u64` (8)
   - `bump: u8` (1)
   - *Space:* `8 + 32 + 32 + 8 + 1 + 8 + 8 + 1 = 98 bytes`

### 3.2 Instructions

1. `initialize_vault(daily_spend_limit: u64, min_trust_grade: u8, delegate_agent: Pubkey)`
   - Creates `PolicyVault` PDA for `owner` signer.
2. `deposit_vault(amount: u64)`
   - Transfers `amount` lamports from `owner` into `PolicyVault` PDA via `system_program::transfer`.
3. `update_policy(daily_spend_limit: u64, min_trust_grade: u8, paused: bool)`
   - `owner`-only policy update.
4. `set_trust_grade(grade: u8, report_hash: [u8; 32])`
   - `init_if_needed` on `TrustEntry` for `target`; signed by `attestor` (validated against `TRUSTED_ATTESTOR` pubkey constant or stored config).
5. `execute_guarded_action(amount: u64, nonce: u64)`
   - Checks `!vault.paused`.
   - Resets `spent_today = 0` if `Clock::get()?.unix_timestamp - vault.last_reset_ts >= 86_400`.
   - Reads `trust_entry.grade`: requires `trust_entry.grade >= vault.min_trust_grade` (else `InsufficientTrustGrade`).
   - Checks `vault.spent_today + amount <= vault.daily_spend_limit` (else `DailyLimitExceeded`).
   - Checks vault lamport balance above rent-exempt minimum (else `InsufficientVaultBalance`).
   - Transfers `amount` lamports from `PolicyVault` PDA to `target` account and writes `ActionReceipt` PDA.
6. `withdraw_vault(amount: u64)`
   - `owner`-only withdrawal from `PolicyVault` PDA back to `owner`.

### 3.3 Custom Error Codes
- `InvalidGrade` (grade not in `1..=5`)
- `VaultPaused`
- `UnauthorizedAttestor`
- `InsufficientTrustGrade`
- `DailyLimitExceeded`
- `InsufficientVaultBalance`

---

## 4. Backend API Specification (Next.js Route Handlers — Olamzy)

### 4.1 `POST /api/analyze-target`
**Request:**
```json
{
  "wallet": "Base58Pubkey...",
  "projectUrl": "https://example.com"
}
```
**Behavior:**
1. Run **Firecrawl** (`scrape` on `projectUrl` + `search` for project/scam mentions) → extract team presence, docs presence, copied-site/red-flag signals, and source URLs.
2. Run **Helius / Solana RPC** (`getSignaturesForAddress` + parsed txs) → compute wallet age (days), tx count, unique counterparties, and reciprocal wash-loop ratio.
3. Combine into `score` (0–100) and `grade` (`A=5, B=4, C=3, D=2, F=1`).
4. Sign & submit `solvox::set_trust_grade` to Devnet using `ATTESTOR_PRIVATE_KEY`.
5. Save report to Supabase `verification_reports`.

**Response (`200 OK`):**
```json
{
  "wallet": "...",
  "projectUrl": "...",
  "grade": "F",
  "gradeNumeric": 1,
  "score": 14,
  "redFlags": [
    "No documentation or named team found on project site",
    "85% circular ping-pong transfers with 1 counterparty"
  ],
  "washLoopMetrics": {
    "walletAgeDays": 3,
    "txCount": 24,
    "uniqueCounterparties": 2,
    "reciprocalRatio": 0.85
  },
  "citations": [
    { "title": "SolPepe Landing Page", "url": "https://..." }
  ],
  "reportHash": "0x...",
  "attestTxSignature": "5x..."
}
```

### 4.2 `POST /api/voice/transcribe`
- Accepts `multipart/form-data` (`audio` blob).
- Calls **ElevenLabs Scribe STT** → returns `{ transcript, parsedIntent: { action, amountSol, targetNameOrWallet } }`.

### 4.3 `POST /api/voice/speak`
- Request: `{ text: string }`.
- Calls **ElevenLabs `eleven_v4_turbo` TTS** → returns `audio/mpeg` stream.

### 4.4 `GET /api/receipts` & `POST /api/receipts`
- Reads/writes execution outcomes (both `BLOCKED_ON_CHAIN` with error reason and `CONFIRMED` with Explorer signature) in Supabase `action_receipts`.

---

## 5. Supabase Schema

```sql
create table verification_reports (
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

create table action_receipts (
  id uuid primary key default gen_random_uuid(),
  vault_owner text not null,
  target_wallet text not null,
  project_url text,
  amount_sol numeric not null,
  grade text not null,
  status text not null, -- 'CONFIRMED' | 'BLOCKED_ON_CHAIN'
  error_reason text,
  tx_signature text,
  report_id uuid references verification_reports(id),
  created_at timestamptz not null default now()
);
```

---

## 6. Frontend Specification (Next.js App Router — You)

- **Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS, `@solana/wallet-adapter-react` (Phantom & Solflare on Devnet), `@coral-xyz/anchor`.
- **3-Panel Command Center:**
  1. **Policy Vault Card:** Connect wallet, `Initialize Vault`, `Deposit SOL`, sliders/inputs for `Daily Spend Limit (SOL)` & `Minimum Trust Grade (A/B/C)`, live Vault Balance & `Spent Today` meter.
  2. **Voice & Target Inspector:** Hold-to-speak mic button (ElevenLabs STT) + manual `Target Wallet` & `Project URL` inputs (with quick-select demo presets: **Wallet A**, **Wallet B "SolPepe"**, **Wallet C**). Displays A–F Trust Grade badge, wash-loop metrics, clickable Firecrawl citations, and `Attest Tx` link.
  3. **Execution & Receipt Feed:** `Execute Guarded Transfer` button. Clearly renders **On-Chain Rejection** (`InsufficientTrustGrade` / `DailyLimitExceeded`) in red vs **Confirmed Execution** (`ActionReceipt` + Solana Explorer link) in green, backed by Supabase history.

---

## 7. Demo Targets & QA Scenarios (Ahmad)

1. **Wallet A (Grade A — Safe):** Real project URL with real docs + clean devnet wallet history → passes `min_trust_grade = B` → executes `0.25 SOL` transfer, creates `ActionReceipt`, ElevenLabs narrates signature.
2. **Wallet B (Grade F — "SolPepe" Seeded Scammer):** Simple hosted fake project page (copied text, no docs, no team) + 10+ circular ping-pong devnet SOL transfers → scores **Grade F** → `execute_guarded_action` **reverts on-chain with `InsufficientTrustGrade`** → ElevenLabs speaks security alert. *(Disclose openly in video & README as a seeded devnet scenario.)*
3. **Wallet C (Grade A — Over Limit):** Safe target, request `1.5 SOL` when daily cap is `1.0 SOL` → **reverts on-chain with `DailyLimitExceeded`**.

---

## 8. Environment Variables (`.env.example`)

```env
NEXT_PUBLIC_SOLANA_RPC_URL=https://devnet.helius-rpc.com/?api-key=...
NEXT_PUBLIC_SOLVOX_PROGRAM_ID=
ATTESTOR_PRIVATE_KEY=
FIRECRAWL_API_KEY=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## 9. Emergency Cut List (If Time Slips on Saturday)

1. Cut ElevenLabs TTS playback first (keep Scribe STT input + text verdict).
2. Cut public shareable Supabase report links (keep internal audit log table).
3. Cut complex multi-hop graph scoring (keep direct reciprocal wash-loop ratio + wallet age + Firecrawl live web check).
4. **NEVER CUT:** Deployed Devnet Anchor program (`PolicyVault` + `TrustEntry`), Phantom/Solflare wallet connect, real Devnet tx signatures, on-chain rejection demo, and live Firecrawl citations.
