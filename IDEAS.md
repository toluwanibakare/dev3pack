# Dev3pack × Solana Hackathon — Top 3 Project Ideas

**Hackathon:** Dev3pack × Solana Global Online Hackathon  
**Team:** 3 People · Nigeria (eligible for **Dev3pack Local — Nigeria: $500 USDC**)  
**Hard Deadline:** **Sunday 29 Nov 2026, 06:00 WAT** *(per schedule; FAQ states 11:59 PM EST — treat 06:00 WAT as the real cutoff)*

### Mandatory Rules (Every Idea Must Satisfy)
- **Open-source repo** with `README.md` (setup, Program ID, demo video, and sponsor integrations explained)
- **Deployed Solana program** (Anchor/Rust on devnet or mainnet) invoked in the app's **core flow** (not idle)
- **Live on-chain transactions** + wallet connect + token/balance ops + in-app tx signatures, status, and history
- **Sponsor tools must be core features**, never bolt-ons
- **Multi-track rule:** One project can enter multiple tracks, **cannot win twice**
- **Video demo** showing the real app end-to-end with live on-chain transactions (no mock-only demos, no slide-only videos)

---

## Top 3 Comparison

| Rank | Idea | Core Loop | Target Tracks | Feasibility (3 ppl / ~45h) | Verdict |
|---|---|---|---|---|---|
| **1** | **SolVox** *(Top Pick)* | Voice (ElevenLabs) → Web & On-Chain Trust Check (Firecrawl + RPC) → Anchor `PolicyVault` Guard | Overall ($5k), Firecrawl ($1,197/member), ElevenLabs ($897/member), Agentic ($250), Supabase ($100/member credits), Nigeria Local ($500) | High *(with strict build order)* | **Highest prize ceiling & strongest demo** |
| **2** | **PayAnchor** *(Safest Ship)* | Pollar Checkout/Links → Anchor Milestone Escrow PDA → Supabase Receipts | Overall ($5k), Pollar ($500), Supabase ($100/member credits), Nigeria Local ($500) | Very High | **Lowest integration risk; verify Pollar docs first** |
| **3** | **RugGuard** *(No-Voice Alternative)* | Firecrawl Risk Scan → Anchor `GuardVault` Auto-Exit / DeFi Guard | Overall ($5k), Firecrawl ($1,197/member), DeFi ($250), Nigeria Local ($500) | High | **Best fallback if voice/agent loop feels heavy** |

---

## 1. SolVox — Voice-First Web-Aware Solana Trust & Policy Agent *(Top Pick)*

**Tagline:** Speak a Solana goal. An agent verifies the wallet and the web, an on-chain program enforces the limits, and it executes on devnet.

### Target Tracks
- **Best App Overall on Solana** ($5,000) — *Primary*
- **Best Solana app using Firecrawl** ($1,197 per member)
- **Best Solana app built with ElevenLabs** ($897 per member)
- **Best Agentic App on Solana** ($250 pool)
- **Best Solana app using Supabase** ($100 per member in credits)
- **Dev3pack Local — Nigeria** ($500 USDC, Top 1) — *Bonus*

### Problem
On-chain actions on Solana require checking protocol docs, token/project credibility, and wallet history before signing. Existing "AI wallet" demos are just chatbots wrapped around a transfer button with no live web context and no real on-chain guardrails.

### Core Mechanism & Critical Design Rule
1. **Voice Interface (ElevenLabs — Core):** Scribe STT takes spoken commands (*"Check this wallet and send 0.25 SOL if it's safe"*); `eleven_v4_turbo` TTS narrates findings, risk grade, and final tx signature.
2. **Dual Verification (Firecrawl + On-Chain Scorer — Core):**
   - **Firecrawl (`search` + `scrape`):** Pulls live site, docs, and social/security signals into cited findings.
   - **On-Chain Heuristic Scorer:** Inspects Solana RPC / Helius history (wallet age, tx count, concentration, simple wash-loop detection) to compute an **A–F Trust Grade**.
3. **On-Chain Enforcement (Single Anchor Program `solvox` with 3 PDAs — Core):**
   - **`TrustRegistry` PDA:** Backend attestor writes each wallet's grade on-chain (`set_grade`). *(Critical rule: the LLM never passes the grade as an argument — the program reads `TrustRegistry` directly so the AI cannot spoof a passing grade. Document single-attestor centralization honestly in the README.)*
   - **`PolicyVault` PDA:** Stores `daily_spend_limit`, `spent_today`, `min_trust_grade`, `paused`, and `delegate_agent`.
   - **`execute_guarded_action`:** Reads `TrustRegistry` + `PolicyVault`; rejects on-chain if `grade < min_trust_grade` or `amount > daily_spend_limit`, otherwise executes and writes an **`ActionReceipt` PDA**.
4. **Persistence & UI (Next.js + Solana Wallet Adapter + Supabase):** Wallet connect, policy controls, live reasoning timeline with Firecrawl citations, trust grade card, and devnet tx signatures/history.

### 90-Second Demo Flow (Wow Moment at ~40%)
1. Connect Phantom/Solflare on devnet → Initialize `PolicyVault` with `1 SOL` daily cap and `min_trust_grade = B` (`tx #1`).
2. Speak: *"Check this wallet and send 0.25 SOL if it is safe."*
3. **Firecrawl** scrapes live web presence + scorer computes **Grade F** (flagged wash-loop wallet).
4. Confirm the flagged transfer → **`solvox` Anchor program rejects it on-chain** *(stage wow moment)*.
5. Send to a clean **Grade A/B** wallet within cap → executes on devnet, logs `ActionReceipt`, and **ElevenLabs** narrates the tx signature (`tx #2`).

### 3-Person Team Split
- **P1 (On-Chain):** Single Anchor program `solvox` (`PolicyVault`, `TrustRegistry`, `ActionReceipt`), devnet deploy, tests.
- **P2 (Agent + Scorer + Voice):** TypeScript agent orchestration, Helius/RPC trust heuristic + grade writes, Firecrawl `search`/`scrape`, ElevenLabs STT/TTS.
- **P3 (Frontend + Data + Pitch):** Next.js + Wallet Adapter, policy controls, reasoning timeline with citations, trust score card, tx history, Supabase persistence, demo video, README.

### Build Order & Cut List (Protects the Demo)
1. **Friday:** `solvox` Anchor program deployed on devnet + `TrustRegistry` + on-chain rejection/execution working end-to-end.
2. **Saturday AM:** Scorer heuristic + Firecrawl research feeding the UI report.
3. **Saturday PM:** ElevenLabs STT/TTS wired in + Supabase persistence.
4. **Saturday Night / Sunday Pre-06:00 WAT:** Timed demo rehearsal, video recording, README, and submission.
- **Cut order if time slips:** (1) SPL receipt mint → (2) TTS narration (keep STT) → (3) Supabase shareable link → (4) Trust layer (ship `PolicyVault` alone). **Never cut** the deployed program + on-chain enforcement demo.

---

## 2. PayAnchor — Cross-Border Milestone & Subscription Escrow *(Safest Ship)*

**Tagline:** Pollar-powered crypto checkout & subscriptions backed by an on-chain Solana milestone escrow.

### Target Tracks
- **Best App Overall on Solana** ($5,000)
- **Best Solana app powered by Pollar** ($500)
- **Best Solana app using Supabase** ($100 per member in credits)
- **Dev3pack Local — Nigeria** ($500 USDC, Top 1)

### Problem
Nigerian freelancers, agencies, and creators working globally face payment friction, high fees, and trust gaps: clients hesitate to pay upfront, and builders risk delivering without settlement.

### Core Mechanism
1. **Pollar Checkout / Payment Links / Subscriptions (Core):** Clients pay invoices or retainers via Pollar. *(Verify `docs.pollar.com` endpoints in Hour 1 before committing.)*
2. **Anchor Program (`payanchor_escrow`):** Milestone escrow PDA holding SOL/SPL USDC (`create_escrow`, `fund_milestone`, `submit_deliverable`, `approve_and_release`, `refund_expired`).
3. **Supabase + Next.js:** Stores milestone metadata, deliverable links, and syncs live on-chain tx signatures/receipts.

### 60-Second Demo Flow
Freelancer creates a milestone contract & Pollar link → Client funds escrow on devnet (`tx #1`) → Freelancer submits deliverable → Client clicks **Approve & Release** → instant on-chain payout + verifiable receipt (`tx #2`).

---

## 3. RugGuard — Live Web-Intelligence DeFi Risk Monitor & Auto-Exit Vault *(No-Voice Alternative)*

**Tagline:** Continuous web & docs risk intelligence paired with an Anchor Guard Vault that protects user deposits on-chain.

### Target Tracks
- **Best App Overall on Solana** ($5,000)
- **Best Solana app using Firecrawl** ($1,197 per member)
- **Best DeFi App on Solana** ($250 pool)
- **Dev3pack Local — Nigeria** ($500 USDC, Top 1)

### Problem
DeFi users lose funds when exploit news, rug warnings, or governance changes break across docs and socials faster than they can manually withdraw.

### Core Mechanism
1. **Firecrawl Risk Engine (Core):** Scrapes and extracts structured risk signals from token pages, protocol docs, and security feeds into a cited **0–100 Risk Score**.
2. **Anchor Program (`rugguard_vault`):** User deposits SOL/SPL into a personal Guard Vault PDA with a `max_risk_threshold` and `safe_destination`. `trigger_protective_exit` sweeps funds on-chain when risk breaches threshold.
3. **Next.js + Wallet Adapter:** Live risk scanner with Firecrawl citations, vault position manager, and devnet tx history.

### 60-Second Demo Flow
Deposit 1 devnet SOL with risk threshold `70/100` (`tx #1`) → Run Firecrawl scan → Threshold breach triggers `trigger_protective_exit` on devnet, sweeping funds to safety with tx signature logged (`tx #2`).
