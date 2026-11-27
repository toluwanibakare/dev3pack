# Dashboard overview redesign — design

Date: 2026-11-27
Status: approved by Tolu

## Intent

The dashboard currently opens on a three-card console. It works but does not sell
the product in the first second. Rebuild it as an overview-first dashboard in the
visual language of the supplied reference: left icon rail, soft lavender hero card
with the 3D core, a "My dashboard" strip of four glanceable cards, and a right rail
with wallet identity, week calendar and an upcoming-actions timeline. The three
live tools stay on the same page, one scroll below, so the demo never changes route.

## Goals

- Look like a consumer-grade web3 dashboard, not an admin form.
- Keep every current capability (vault setup, target inspection, guarded execution,
  receipts) on one screen flow.
- All numbers come from the connected wallet's on-chain vault and the receipts API.
  Empty states are designed, never faked.

## Non-goals

- No new data sources, no Supabase wiring, no backend changes.
- No route split or tabbed navigation.
- No change to program instructions or the landing page.

## Anti-goals

- Decorative charts that imply history that does not exist.
- Losing the Wallet Adapter controls or program-status signal.

## Layout

```
rail │ top bar (status + wallet)
     │ ┌─────────────────────────────┐ ┌──────────────┐
     │ │ hero (lavender + 3D core)   │ │ profile      │
     │ ├─────────────────────────────┤ │ (avatar ring)│
     │ │ My dashboard · 4 cards      │ ├──────────────┤
     │ ├─────────────────────────────┤ │ week calendar│
     │ │ 1 Policy vault              │ ├──────────────┤
     │ │ 2 Target inspector          │ │ upcoming     │
     │ │ 3 Execution + receipts      │ │ timeline     │
     │ └─────────────────────────────┘ └──────────────┘
```

- `md+`: fixed 76px rail, content padded left, two-column grid at `xl`
  (`1fr / 340px`), aside sticky.
- Mobile: rail hides, four-icon bottom bar appears, aside stacks after the tools.

## Cards

1. **Hero** — lavender/purple gradient, "Hi, {wallet or friend}", headline
   "Guard your SOL before it moves.", black pill CTA to `#execute`. `Hero3DCore`
   scaled to ~60% on the right, clipped by the card.
2. **Spend today** — SVG ring of `spentToday / dailyLimit`, mint → amber → red.
3. **Daily allowance** — remaining lamports in SOL, reset countdown from
   `lastResetTs`, thin progress bar.
4. **Trust policy** — minimum grade badge, A–F pips with the required grade lit.
5. **Action receipts** — 7-day column chart from `receipts`; when empty, dashed
   baseline + "No actions logged yet" (no invented bars).

## Right rail

- Wallet profile: deterministic identicon from the public key, usage ring,
  truncated address, policy grade, program status.
- Week calendar: current week, today highlighted; rendered after mount to avoid
  hydration drift.
- Upcoming: next reset, required attestation grade, vault armed state; the next
  actionable item is the highlighted card.

## Data flow

`page.tsx` owns `vault` (via `PolicyVaultCard.onVaultChange`), `analysis`
(from `TargetInspectorCard`), and `receipts` (API fetch + new optional
`onReceipt` callback on `ExecutionFeedCard`). Overview and aside are pure props.

## Parts left to the builder

Spacing, exact gradient stops, icon choice, micro-copy. No product decisions.