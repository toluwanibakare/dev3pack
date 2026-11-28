# SolVox — Vercel Deployment Instructions (Frontend + Backend APIs)

SolVox runs as a unified **Next.js 15 App Router** application (`next: ^15.1.6`), meaning the UI (`/`, `/dashboard`, `/dashboard/console`) and all backend serverless API routes (`/api/analyze-target`, `/api/receipts`, `/api/voice/speak`, `/api/voice/transcribe`) deploy together in a single Vercel project.

---

## 1. Prerequisites

Before deploying to Vercel, confirm:
- **Solana Program ID (Devnet):** `GQqUyuyVnf9vHG3hzHztPt53nZyRSjnrmjLSmEabRNjc`
- **Funded Attestor Keypair (Devnet):** `ATTESTOR_PRIVATE_KEY` has Devnet SOL (at least `0.5+ SOL`) to pay transaction fees for `set_trust_grade`.
- **Supabase Tables:** `verification_reports` and `action_receipts` exist in your Supabase project (see `PRD.md` / Supabase SQL editor).
- **API Keys Ready:** Firecrawl, ElevenLabs, Supabase, and Solana Devnet RPC (Helius or `https://api.devnet.solana.com`).

---

## 2. Create & Configure the Vercel Project

1. Go to **[vercel.com/new](https://vercel.com/new)** and import **`toluwanibakare/dev3pack`** (branch: `main`).
2. Leave the build settings at Next.js defaults:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Node.js Version:** `20.x` or `22.x`

---

## 3. Environment Variables (Vercel → Settings → Environment Variables)

Add the following variables for **Production** (and **Preview** if testing PR previews):

| Variable | Required | Notes / Example |
|---|---|---|
| `NEXT_PUBLIC_SOLANA_RPC_URL` | Yes | Devnet RPC URL, e.g. `https://devnet.helius-rpc.com/?api-key=...` or `https://api.devnet.solana.com` |
| `NEXT_PUBLIC_SOLVOX_PROGRAM_ID` | Yes | `GQqUyuyVnf9vHG3hzHztPt53nZyRSjnrmjLSmEabRNjc` |
| `ATTESTOR_PRIVATE_KEY` | Yes | 64-byte JSON array `[180,159,...]` (recommended over base58) for a funded Devnet keypair |
| `FIRECRAWL_API_KEY` | Yes | `fc-...` key for live website inspection in `/api/analyze-target` |
| `ELEVENLABS_API_KEY` | Yes | `sk_...` key for `/api/voice/speak` (`eleven_turbo_v2_5`) and `/api/voice/transcribe` (`scribe_v1`) |
| `ELEVENLABS_VOICE_ID` | Optional | Defaults to `JBFqnCBsd6RMkjVDRZzb` (George) if omitted |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase `anon` public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-side Supabase `service_role` key used by `src/lib/supabase.ts` |
| `NEXT_PUBLIC_SITE_URL` | Optional | Your deployed Vercel URL (e.g. `https://solvox.vercel.app`) for OpenGraph metadata |

> **Important:** Whenever you add or update any environment variable in Vercel, trigger a **Redeploy** so serverless functions pick up the new values.

---

## 4. Deploy & Verify Backend Endpoints

Click **Deploy** (or run `vercel --prod` if using the Vercel CLI), then verify each backend route against your live `<VERCEL_URL>`:

### A. Check Supabase Receipts (`GET /api/receipts`)
```bash
curl -s https://<VERCEL_URL>/api/receipts
```
Expected: HTTP `200` with `{"receipts":[...]}` from Supabase (not `mem-...` IDs).

### B. Check ElevenLabs TTS (`POST /api/voice/speak`)
```bash
curl -i -X POST https://<VERCEL_URL>/api/voice/speak \
  -H "Content-Type: application/json" \
  -d '{"text":"SolVox policy firewall online."}' \
  --output /tmp/solvox-test.mp3
```
Expected: HTTP `200` with `content-type: audio/mpeg` (if it returns `application/json` with `"isMock": true`, `ELEVENLABS_API_KEY` is missing or needs a redeploy).

### C. Check Target Analysis + On-Chain Attestation (`POST /api/analyze-target`)
```bash
curl -s -X POST https://<VERCEL_URL>/api/analyze-target \
  -H "Content-Type: application/json" \
  -d '{"wallet":"<DEVNET_TARGET_PUBKEY>","projectUrl":"https://jup.ag"}'
```
Expected:
- HTTP `200` JSON with `grade`, `score`, `washLoopMetrics`, `citations`, `reportHash`, and `attestTxSignature`.
- Confirm `"isSimulatedAttestation": false` and verify `attestTxSignature` on **Solana Explorer (Devnet)**.

### D. Browser E2E Verification (`/dashboard/console`)
1. Connect Phantom/Solflare on **Devnet**.
2. Initialize & deposit into your `PolicyVault`.
3. Test **Wallet B** (low trust grade) → verify `BLOCKED ON-CHAIN` (`InsufficientTrustGrade`).
4. Test **Wallet C** (amount > daily cap) → verify `BLOCKED ON-CHAIN` (`DailyLimitExceeded`).
5. Test **Wallet A** (high trust grade, within cap) → verify `CONFIRMED ON-CHAIN`, Explorer link, ElevenLabs voice playback, and persistence after page refresh.

---

## 5. Troubleshooting

- **`isSimulatedAttestation: true` in `/api/analyze-target`:**
  - Verify `ATTESTOR_PRIVATE_KEY` and `NEXT_PUBLIC_SOLVOX_PROGRAM_ID` are set in Vercel and redeployed.
  - Verify the attestor wallet still has Devnet SOL.
  - Use the 64-byte JSON array format `[...]` for `ATTESTOR_PRIVATE_KEY` to avoid base58 decode issues.
- **Function timeouts on `/api/analyze-target`:**
  - Hobby plans default to `10s` (configurable up to `60s` in Vercel Project Settings → Functions). Firecrawl + RPC + Devnet `sendAndConfirmTransaction` usually finishes in 3–8s, so bump the timeout if needed.
- **Receipts disappearing on refresh (`id: "mem-..."`):**
  - `SUPABASE_SERVICE_ROLE_KEY` or `NEXT_PUBLIC_SUPABASE_URL` is missing/invalid, causing `src/lib/supabase.ts` to fall back to in-memory storage.
