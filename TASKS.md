# SolVox — Team Task Plan & Critical Path

**Hackathon:** Dev3pack × Solana Global Online Hackathon  
**Hard Cutoff:** Sunday, Nov 29, 2026 @ **06:00 WAT** *(Code freeze: Saturday @ 18:00 WAT · Submit before 04:00 WAT)*

## Team Ownership
- **You (`Frontend + Web3`):** Anchor `solvox` program + devnet deploy + Next.js + Wallet Adapter + on-chain UI wiring
- **Olamzy (`Backend`):** Firecrawl research + RPC wash-loop scorer + on-chain `set_trust_grade` attestor + ElevenLabs STT/TTS + Supabase
- **Ahmad (`Ops / QA / Pitch`):** Repo & API key setup, 3 seeded devnet demo wallets, end-to-end QA, `README.md`, 2-min demo video, Dev3pack submission

---

## Task List & Dependencies

| ID | Task | Owner | Est. | Depends On | Status |
|---|---|---|---|---|---|
| **T-01** | Create GitHub repo, `.env.example`, Supabase project, & provision Helius, Firecrawl, ElevenLabs keys | **Ahmad** | 1.0h | — | [ ] |
| **T-02** | Write `solvox` Anchor program (`PolicyVault`, `TrustRegistry`, `ActionReceipt` PDAs + 6 instructions) | **You** | 3.0h | — | [ ] |
| **T-03** | Deploy `solvox` to Devnet, run Anchor tests (1 valid tx + `InsufficientTrustGrade` + `DailyLimitExceeded`), export IDL (`solvox.json`) + `PROGRAM_ID` | **You** | 1.5h | T-02 | [ ] |
| **T-04** | Airdrop devnet SOL & seed **3 Demo Wallets** (Wallet A clean, Wallet B 10+ circular ping-pong wash-loop txs, Wallet C over-limit) | **Ahmad** | 1.5h | T-01 | [ ] |
| **T-05** | Build Firecrawl `search`+`scrape` worker & RPC/Helius wash-loop heuristic (`/api/analyze-target` returning A–F grade + citations) | **Olamzy** | 3.0h | T-01 | [ ] |
| **T-06** | Wire backend attestor keypair to call `set_trust_grade` on-chain using `solvox.json` + `PROGRAM_ID` | **Olamzy** | 1.5h | T-03, T-05 | [ ] |
| **T-07** | Build Next.js App Router shell + `@solana/wallet-adapter-react` (Phantom/Solflare Devnet) | **You** | 1.5h | T-01 | [ ] |
| **T-08** | Build **Policy Vault Card** (init vault, deposit SOL, set daily cap & min trust grade, live balance) | **You** | 2.5h | T-03, T-07 | [ ] |
| **T-09** | Build ElevenLabs `/api/voice/transcribe` (Scribe STT) & `/api/voice/speak` (`eleven_v4_turbo` TTS) | **Olamzy** | 2.5h | T-01 | [ ] |
| **T-10** | Set up Supabase audit log table & `/api/receipts` persistence endpoint | **Olamzy** | 1.5h | T-01 | [ ] |
| **T-11** | Build **Voice & Target Inspector Panel** (hold-to-speak mic, A–F badge, wash-loop metrics, Firecrawl citations) | **You** | 2.5h | T-06, T-07, T-09 | [ ] |
| **T-12** | Build **Execution & Receipt Feed** (trigger `execute_guarded_action`, display on-chain block vs success, Explorer links, Supabase log) | **You** | 2.5h | T-08, T-10, T-11 | [ ] |
| **T-13** | End-to-end QA across all 3 demo scenarios (Wallet B block, Wallet C over-limit block, Wallet A success + ElevenLabs narration) | **Ahmad** | 2.0h | T-04, T-12 | [ ] |
| **T-14** | Deploy frontend + backend (Vercel) and verify live devnet flow on production URL | **Olamzy** | 1.0h | T-12 | [ ] |
| **T-15** | Write `README.md` (architecture, `PROGRAM_ID`, Firecrawl/ElevenLabs/Supabase integration, attestor centralization note, Assay credit) | **Ahmad** | 1.5h | T-03, T-13 | [ ] |
| **T-16** | Rehearse & record **< 2:30 min demo video** (live Phantom, Wallet B on-chain block at ~40%, Wallet A execution + narration) | **Ahmad** | 2.5h | T-13, T-14 | [ ] |
| **T-17** | Finalize Dev3pack portal submission (repo, live URL, video, track selections) | **Ahmad** | 1.0h | T-15, T-16 | [ ] |

---

## Critical Path & Milestones
- **Critical Path:** `T-02` → `T-03` → `T-06` → `T-11` → `T-12` → `T-13` → `T-16` → `T-17` *(~18.5h pure build + ~6.5h buffer)*
- **Milestone 1 (Fri 15:00 WAT):** `solvox` deployed on Devnet + IDL shared (`T-03`), 3 demo wallets seeded (`T-04`), `/api/analyze-target` working (`T-05`).
- **Milestone 2 (Fri 19:00 WAT):** Policy Vault UI live (`T-08`) + backend writing `TrustRegistry` grades on-chain (`T-06`).
- **Milestone 3 (Sat 14:00 WAT):** Voice + Firecrawl + Anchor enforcement + Supabase wired end-to-end (`T-12`).
- **Milestone 4 (Sat 18:00 WAT):** **Code Freeze** → QA (`T-13`) & Demo Video (`T-16`).
- **Submission Target (Sun < 04:00 WAT):** Submitted with 2-hour buffer before `06:00 WAT` cutoff (`T-17`).
