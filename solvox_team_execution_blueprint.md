# Dev3pack × Solana Hackathon — Final Project Decision & Execution Blueprint

**Selected Project:** **SolVox** *(Enhanced with Assay’s On-Chain Trust & Wash-Loop Firewall Thesis)*  
**Location:** Dev3pack Build Station (Lagos) — Web3Bridge, Ikorodu  
**Team Size:** 3 Builders (Eligible for **Global Tracks** + **Dev3pack Local — Nigeria: $500 USDC**)  
**Hard Cutoff:** **Sunday, Nov 29, 2026 @ 06:00 WAT** *(Target code freeze: Saturday, Nov 28 @ 18:00 WAT)*

---

## 1. The Decision: Why We Are Building SolVox

After evaluating all 35 SendAI board ideas, the **Assay** shortlist thesis, and our internal top 3 (`SolVox`, `PayAnchor`, `RugGuard`), **SolVox** is the strongest pick to win both global sponsor bounties and the Nigeria local track.

### Strategic Advantages
1. **Maximum Prize Pool Coverage (6 Tracks, 1 Core Loop):**
   * **Best App Overall on Solana** ($5,000)
   * **Best Solana App using Firecrawl** ($1,197 per team member)
   * **Best Solana App built with ElevenLabs** ($897 per team member)
   * **Dev3pack Local — Nigeria** ($500 USDC)
   * **Best Agentic App on Solana** ($250 pool)
   * **Best Solana App using Supabase** ($100 per team member in credits)
2. **Assay's Winning Thesis Without Infrastructure Bloat:**
   * Pure Assay requires building a full graph indexer, Solana Blinks, and compressed NFT badges in 45 hours—high risk of unfinished infrastructure.
   * **SolVox** takes Assay’s core breakthrough (*detecting wash-loop/fake wallet activity and scoring wallets A–F to block bad payments before money moves*) and enforces it directly inside a lean, reliable Anchor smart contract.
3. **Disciplined Smart Contract Scope for a First Solana Build:**
   * Only **1 Anchor program** (`solvox`) and **3 PDAs** (`PolicyVault`, `TrustRegistry`, `ActionReceipt`), using native devnet SOL transfers. Zero SPL Associated Token Account (ATA) headaches, clean code for Stage 2 repository inspection, and an unmistakable on-chain rejection moment for the demo video.

---

## 2. Core Product Loop & Architecture

**One-Line Pitch:**  
> *SolVox is an on-chain Trust & Policy Firewall for Solana. Speak a goal—our agent audits the recipient’s live web footprint (Firecrawl) and on-chain wash-loop history (Helius/RPC), writes an A–F trust grade on-chain, and enforces your spending and safety rules inside an Anchor vault before a single lamport moves.*

### System Flow
1. **Voice Command (ElevenLabs Scribe STT):** User speaks a command (e.g., *"Verify this wallet and send 0.25 SOL if it passes my safety policy"*).
2. **Dual Verification Engine (Off-Chain TypeScript Worker):**
   * **Web Intelligence (Firecrawl `search` + `scrape`):** Checks live domain, project docs, and security/social mentions, returning cited URLs.
   * **On-Chain Wash-Loop Scorer (Helius / Solana RPC):** Analyzes recent transaction signatures (`getSignaturesForAddress` / `getParsedTransactions`), wallet age, counterparty diversity, and circular ping-pong transfer ratios to compute an **A–F Trust Grade** (`A=5, B=4, C=3, D=2, F=1`).
3. **On-Chain Attestation & Guarded Execution (Anchor Program `solvox`):**
   * **`TrustRegistry` PDA:** Backend attestor signs `set_trust_grade(target_wallet, grade, risk_flags_hash)`.
   * **`PolicyVault` PDA:** Holds user-deposited devnet SOL along with `daily_spend_limit`, `spent_today`, `last_reset_ts`, `min_trust_grade`, `delegate_agent`, and `paused`.
   * **`execute_guarded_action(amount)`:** **CRITICAL RULE** — The AI/caller *never* passes the trust grade as an instruction argument. The Rust program reads `TrustRegistry.grade` directly on-chain and reverts if `grade < PolicyVault.min_trust_grade` or `spent_today + amount > daily_spend_limit`. If valid, it transfers SOL from the vault PDA and initializes an immutable **`ActionReceipt` PDA**.
4. **Audit Trail & Voice Feedback (Supabase + ElevenLabs TTS):**
   * Logs full verification report, Firecrawl citations, and Solana Explorer tx links to Supabase.
   * ElevenLabs (`eleven_v4_turbo`) narrates the risk grade, block reason, or confirmed tx signature.

---

## 3. Team Role Split (3 Lanes)

### Person 1 — On-Chain Lead (Rust / Anchor / Devnet)
* **Deliverables:**
  * Initialize Anchor project (`solvox`) and deploy to **Solana Devnet**.
  * Implement PDAs: `PolicyVault`, `TrustRegistry`, and `ActionReceipt`.
  * Implement instructions: `initialize_vault`, `deposit_vault`, `update_policy`, `set_trust_grade`, `execute_guarded_action`, and `withdraw_vault`.
  * Write Anchor TypeScript tests proving **1 valid transfer** and **2 on-chain rejections** (`InsufficientTrustGrade` and `DailyLimitExceeded`).
  * Export IDL (`solvox.json`) and deployed `PROGRAM_ID` to the team repo.

### Person 2 — Intelligence, Scorer & Voice Lead (Backend / APIs)
* **Deliverables:**
  * Set up API keys: Helius Devnet RPC, Firecrawl, ElevenLabs, and Attestor Keypair.
  * Build `/api/analyze-target`: runs Firecrawl `search`/`scrape` + Solana RPC wash-loop detector in parallel, outputs structured A–F grade + reasoning + citations, and submits `set_trust_grade` on-chain.
  * Build `/api/voice/transcribe` (ElevenLabs STT) and `/api/voice/speak` (ElevenLabs TTS).
  * Prepare **3 seeded devnet demo wallets**:
    1. **Wallet A (Grade A — Safe):** Clean history + real web footprint.
    2. **Wallet B (Grade F — Wash-Loop Scammer):** Pre-seeded with 10+ circular ping-pong SOL transfers between two wallets + zero credible web footprint.
    3. **Wallet C (Grade A — Over Limit):** Safe target, used to trigger `DailyLimitExceeded` when requesting > daily cap.

### Person 3 — Frontend, Persistence & Pitch Lead (Next.js / Supabase / Video)
* **Deliverables:**
  * Scaffold Next.js App Router + `@solana/wallet-adapter-react` (Phantom/Solflare on Devnet).
  * Build the 3-panel command center:
    1. **Policy Vault Card:** Deposit devnet SOL, set Daily Limit & Minimum Trust Grade (`B` or `A`), view live vault balance.
    2. **Voice & Target Inspector:** Hold-to-speak mic button, live A–F Trust Grade badge, wash-loop metrics, and clickable Firecrawl source citations.
    3. **On-Chain Execution & Receipt Feed:** Live tx status, Solana Explorer links, and Supabase-backed audit log.
  * Write `README.md` (architecture diagram, deployed `PROGRAM_ID`, local setup, sponsor integration notes) and record the **< 2:30 min demo video**.

---

## 4. 44-Hour Execution Schedule (Web3Bridge Sprint)

### Friday, Nov 27 (Today — Build Station 09:00 – 19:00 WAT)
* **09:30 – 10:30:** Complete Dev3pack portal setup, create shared GitHub repo, provision Helius/Firecrawl/ElevenLabs/Supabase keys, airdrop devnet SOL.
* **10:30 – 15:00:**
  * **P1:** Write & deploy `solvox` Anchor program to devnet; verify on-chain rejection via CLI test. *(Ask Web3Bridge Rust mentors immediately if stuck on PDA seeds).*
  * **P2:** Build wash-loop RPC heuristic + Firecrawl scraper endpoint; seed the 3 demo wallets on devnet.
  * **P3:** Build Next.js dashboard shell + Wallet Adapter + Supabase schema.
* **15:00 – 19:00:** Connect P2's `/api/analyze-target` to P1's `TrustRegistry` on devnet and render live grades + citations in P3's UI before leaving Web3Bridge.

### Saturday, Nov 28 (Integration, Polish & Recording)
* **09:00 – 13:00:** Wire ElevenLabs STT (voice command parsing) and TTS (spoken verdict/tx confirmation) + Supabase receipt persistence.
* **13:00 – 17:00:** End-to-end integration testing across all 3 demo scenarios (Grade F on-chain block, Over-Limit on-chain block, Grade A successful execution).
* **17:00 – 18:00:** **HARD CODE FREEZE.** Fix UI edge cases only.
* **18:00 – 22:00:** Rehearse and record the final demo video (under 3 minutes), finalize `README.md`, and push clean open-source code.

### Sunday, Nov 29 (Submission Cutoff: 06:00 WAT)
* **Before 04:00 WAT:** Submit repo URL, live deployment link, demo video, and track selections on the Dev3pack portal (2-hour buffer before the 06:00 WAT cutoff).

---

## 5. Emergency Cut List (If Time Slips on Saturday)

Never compromise the deployed Anchor program or the live on-chain rejection demo. If behind schedule, cut in this exact order:
1. **Cut first:** ElevenLabs TTS audio playback (keep ElevenLabs Scribe STT voice input + text verdict).
2. **Cut second:** Public shareable Supabase receipt pages (keep internal Supabase audit log table).
3. **Cut third:** Complex multi-hop graph scoring (keep direct reciprocal wash-loop ratio + wallet age + Firecrawl live web check).
4. **NEVER CUT:** Deployed devnet Anchor program (`PolicyVault` + `TrustRegistry`), live Phantom/Solflare wallet connect, real devnet tx signatures, and live Firecrawl citations.

---

## 6. 2-Minute Demo Video Script (Stage Wow Flow)

1. **[0:00 – 0:25] The Hook:** *"AI agents and crypto users are losing millions to fake volume, wash-traded projects, and unconstrained wallets. SolVox is an on-chain Trust & Policy Firewall on Solana."*
2. **[0:25 – 0:45] Policy Setup (Tx #1):** Connect Phantom on devnet. Show `PolicyVault` configured with a `1.0 SOL` daily limit and `Minimum Trust Grade: B`.
3. **[0:45 – 1:25] The Wow Moment — Blocking a Wash-Loop Wallet:** Speak into SolVox: *"Check Wallet B and send 0.25 SOL."* Show Firecrawl finding zero credible web presence while our RPC scorer detects 85% circular wash-loop transfers and assigns **Grade F** on-chain. Attempt execution → **Anchor `solvox` program blocks the transaction on-chain** (`InsufficientTrustGrade`), and ElevenLabs speaks the security alert.
4. **[1:25 – 2:00] Verified Execution (Tx #2):** Speak: *"Check Wallet A and send 0.25 SOL."* Firecrawl cites live project docs, RPC confirms clean organic history (**Grade A**). SolVox executes the transfer on devnet, creates an `ActionReceipt` PDA, logs the Solana Explorer signature, and narrates confirmation.
5. **[2:00 – 2:15] Close:** Recap open-source Anchor program ID, Firecrawl + ElevenLabs + Supabase architecture, and readiness for Solana Mobile / Seeker.