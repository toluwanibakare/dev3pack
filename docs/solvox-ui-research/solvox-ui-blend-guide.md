# SolVox UI Blend Guide

## What this is

This guide blends the UI and animation language of seven Solana websites into one design system for SolVox, and gives you copy-paste prompts to hand to a coding agent. The research was done on 27 Nov 2026 by visiting each site and scrolling through it section by section.

Sites studied:
1. Solana Playground, beta.solpg.io (the IDE)
2. solana.com (homepage, /developers, /ecosystem)
3. Jupiter, jup.ag
4. Magic Eden, magiceden.io
5. Phantom, phantom.com
6. Solscan, solscan.io
7. Orca, orca.so

Target app: SolVox in the dev3pack repo. Next.js 15, React 19, TypeScript, Tailwind CSS 4, lucide-react, Solana wallet adapter, Supabase. Current base is dark (#09090b background, zinc text). The deployed Anchor program is on Devnet, program ID GQqUyuyVnf9vHG3hzHztPt53nZyRSjnrmjLSmEabRNjc. The IDL is in src/idl/solvox.json.

SolVox brand (from the SolVox brand kit in ~/workspace/solvox-brand/): V waveform mark, gradient Solana purple #9945FF to cyan #00D1FF to mint #14F195 on Void #0A0A1A, Montserrat ExtraBold wordmark, tagline "Speak. Verify. Execute."

## How to use this guide

1. Paste Prompt 1 into your agent first. It installs the shared design tokens and the motion system.
2. Then paste Prompts 2 to 7 one at a time, in order, for each surface you want built.
3. Give the agent the screenshots folder alongside the prompts so it can see the references. The capture index is at the end of this guide.
4. After each prompt, ask the agent to run `npm run build` and fix errors before moving to the next prompt.

## The blend at a glance

### Design tokens (the single source of truth)

Use these exact values. Values marked with ~ are visual approximations from the research, not stylesheet values. Confirm them in a browser inspector before final polish.

Colors:
- Background Void: #0A0A1A (SolVox brand, page base)
- Background pure black: #000000 (solana.com base, use for hero and footer)
- Panel dark: #111118 to #1A1A24 (cards on dark, solana.com charcoal range)
- Panel darker: #0B0E0C ~ (Jupiter near-black with a green tint, use for app panels)
- Card border: 1px, #232A25 ~ (Jupiter) or white at 8% opacity on black
- Text primary: #FFFFFF
- Text secondary: #A1A1AA (zinc-400, already in the app) or #B0B0B0 ~ (solana.com body grey)
- Text muted: #6B7280 ~ (Orca grey) for captions and meta
- Gradient brand: linear, #9945FF to #00D1FF to #14F195 (SolVox brand gradient; same family as the Solana logo gradient green to blue to purple)
- Purple accent: #9945FF (Solana purple, confirmed on solana.com buttons)
- Cyan accent: #00D1FF (SolVox cyan; Playground's Build pill reads as ~#2DD4BF cyan, same family)
- Mint accent: #14F195 (Solana green)
- Success green: #22C55E
- Danger red: #EF4444 (or #F87171 ~ for text on dark)
- Warning amber: #F59E0B
- Lime (Jupiter accent, use sparingly for APY-style figures and progress): #A8E635 ~
- Pink (Magic Eden accent, use only for a verified tick or a small highlight): #E42575 ~
- Teal (Solscan accent, use for chart toggles and links): #0D9488 ~

Typography:
- Display and wordmark: Montserrat ExtraBold (SolVox brand). Headlines in Montserrat, sentence case, tight leading (1.0 to 1.05), weight 500 to 700, not heavy black.
- UI and body: a clean geometric sans, Inter or system sans. Body 16 to 18px, line height 1.5, light grey.
- Mono: JetBrains Mono, 14px (Playground editor font, confirmed in its Settings). Use mono for code, wallet addresses, hashes, nonces, terminal output, and numbers in receipts. Truncate hashes with an ellipsis and a copy icon.
- Eyebrows and labels: 12 to 13px, uppercase, wide letter spacing, grey (solana.com and Orca pattern).
- Hero headline: 72 to 100px on desktop, tight leading, left aligned on dark (solana.com pattern). Section headings 40 to 56px. Card titles 20 to 24px.

Shape and spacing:
- Cards: radius 16 to 24px (Jupiter 16 to 24, Phantom 20 to 24).
- Primary buttons: full pill, radius 999px (Phantom, Orca). Secondary buttons on developer surfaces: rounded rectangle, radius 10 to 12px (solana.com/developers).
- Inputs: radius 8 to 12px, 1px dark border, grey placeholder.
- Section rhythm: 120 to 160px vertical gaps on landing, max width container 1500 to 1600px, side padding about 80px on desktop (solana.com pattern).
- Hairlines: 1px dividers between major sections.

Motion (the blend's motion language):
- Landing and marketing surfaces: slow and eased, 300 to 500ms (solana.com, Orca). Scroll reveals: staggered fade and slide up as sections enter the viewport (solana.com terminal list fades in row by row over about 3 seconds). Aurora drift: soft blurred purple and green gradient fields that shift slowly (solana.com Scene bands). Logo marquee: slow continuous horizontal drift (solana.com logo strips). Live counter: numbers that tick upward in real time (solana.com total transactions).
- App and dashboard surfaces: fast and snappy, 150 to 250ms (Jupiter, Solscan). Skeleton shimmer loading cards that resolve into content (Jupiter, Magic Eden). Live streaming rows that update every few seconds (Solscan latest transactions). Hover: subtle lift, brighten, or a purple glow at one corner (solana.com community cards).
- Tool surfaces: instant, VS Code-like, no easing (Playground). Blinking block cursor in terminal areas.
- Always respect prefers-reduced-motion: disable aurora drift, marquees, and parallax when the user asks for reduced motion.

### What each site contributes

| Site | What to steal | What to leave behind |
|---|---|---|
| solana.com | Pure black base, aurora drift, huge light headlines, live ticking stats, logo marquee, staggered scroll reveals, terminal-style numbered list, floating Ask AI pill | The Solana logo and wordmark, institution photography, Breakpoint content |
| Solana Playground | JetBrains Mono everywhere, dark navy slate panels, cyan Build pill, activity bar plus sidebar plus editor plus terminal layout, blinking cursor, instant panel swaps, level badges | The desktop-only fixed IDE grid, the Solana Playground name, the VS Code chrome copied literally |
| Jupiter | Lime on near-black app, centred swap widget as hero component, segmented tabs, token rows with tabular numbers, thin lime progress bars, skeleton loading, "Back to Swap" floating pill | The Jupiter swirl logo, the sidebar nav copied literally, lime as the only accent |
| Magic Eden | Dark purple-black base, hot pink verified ticks, rainbow gradient borders on highlight cards, horizontal carousels cut off at the edge to invite scrolling, fixed live status strip (SOL price, TPS) | NFT art style, pink as a dominant color, the ME logo |
| Phantom | Pale lavender light sections, playful 3D mascot style, full pill buttons, huge light type, tall portrait cards, stacked deck carousel, floating pill nav | The ghost mascot, lavender as the page base (SolVox stays dark) |
| Solscan | Black header plus light body, live streaming tables, stat cards with inset breakdown panels, purple TPS bars and mint ping bars, chart toggles, mono truncated hashes with copy icons | The light body (SolVox stays dark), the Solscan logo |
| Orca | Warm cream-to-yellow light sections, mono eyebrows, yellow pill CTAs, dark product mockups as hero imagery, vertical Discover Deploy Manage stepper, stats band | Cream page base (SolVox stays dark), the orca logo |

## Site by site reference (condensed)

### 1. Solana Playground, beta.solpg.io

Opens straight into the IDE, no landing screen. Full viewport fixed grid: far-left activity bar about 60px (Explorer, Build and Deploy, Test, Tutorials, plus GitHub and Settings pinned at the bottom), sidebar about 380px with small tracked capitals panel headers (EXPLORER, BUILD & DEPLOY, TUTORIALS), centre tab strip over a Monaco-style editor with a minimap on the far right, collapsible terminal panel about 220px at the bottom, status bar about 26px at the very bottom (dark blue, red dot plus "Not connected" when no wallet is connected).

Colours: almost entirely dark navy and slate, low saturation, no Solana purple or green gradient in the IDE chrome. The single loud accent is the bright cyan Build & Deploy pill, full sidebar width, about 48px tall, fully rounded. Syntax highlighting is VS Code Dark+ style: keywords blue, types pink and magenta, strings yellow and amber, numbers orange, function names pale yellow and green, comments dim grey-green italic.

Typography: monospace everywhere in the IDE. Settings confirms JetBrains Mono, size 14. Panel headers are small (12 to 13px), uppercase, wide letter spacing. Hierarchy comes from colour, spacing and caps tracking, not size or weight.

Motion: deliberately minimal. A thin blue arc spinner while the editor loads, instant panel swaps (active activity icon gets a thin white vertical bar at the far left edge), hover brightens icons and washes file rows, blinking block cursor at the terminal prompt. No scroll reveals, parallax, marquees, counters or video.

Tutorials page is the colour exception: pure black card covers with huge two-tone wordmarks (HELLO ANCHOR white and blue, HELLO SEAHORSE salmon pink, HELLO SOLANA mint green and purple), level badges (BEGINNER green, INTERMEDIATE yellow, ADVANCED blue), and playful cartoon illustration.

Captures: 16-playground-ide-explorer.pdf, 17-playground-build-deploy.pdf, 18-playground-settings.pdf, 19-playground-tutorials.pdf.

### 2. solana.com

Pure black base, dark charcoal cards, 1px dark grey hairlines. Sticky top nav about 70px with the 3-bar gradient logo, centre links, search pill with a Command K hint, and a language selector. Hero is full viewport: huge left-aligned headline (about 90 to 100px, two lines, sentence case), subcopy, white "Get started" pill with a black circular arrow badge inside, and a glossy black 3D ribbon or wave on the right with purple and teal rim light. A lavender card peeks at the bottom edge.

Sections in order: logo marquee strip (Western Union, Visa, Worldpay, Circle, PayPal, Fiserv), events carousel, full-bleed aurora "Scene" band (horizontal neon light streaks, green and purple, blurred, on black), stats grid (total transactions ticking live, TPS, active signers, DEX volume, app revenue), "What's happening right now" terminal panel (tab pills, numbered 01 to 10 news list with caps category labels), institutions grid (3 by 2 cards with logo, big stat, caption), second logo strip over another aurora ribbon, news carousel, video carousel ("How we built this"), community grid (2 by 3 dark cards with a purple glow on hover at one corner), footer with 6 link columns.

Developers page: hero "Build on internet capital markets" (about 64px), solid purple #9945FF "Pick a tutorial" button, outline "Read the docs", and a "Paste this into your coding agent" mono prompt box with a purple Copy button. Four tutorial cards with dark mini-UI mockups inside, four dark purple "Why Solana" cards, an "In production at" logo row, and an interactive fee calculator (sliders with purple-filled tracks and round purple thumbs, big result figure), followed by a code block with tabs, line numbers and a copy button.

Ecosystem page: eyebrow "ECOSYSTEM" with a purple dot, hero "Explore Solana builders, events, and categories" (about 88px), violet radial glow over a blue and teal aurora, giant iridescent soap-bubble spheres with green, pink and purple rims.

Motion is the richest of all seven sites: hero fade and slide in, staggered scroll reveals (the terminal list rows were blank on first scroll into view, then faded in over about 3 seconds), a live ticking transaction counter, two slow logo marquees, aurora bands that shift slowly like looping gradient fields, hover glow on community cards, carousels with Previous and Next arrows and disabled states at the ends, and an interactive fee calculator that recomputes live. Transitions feel smooth and eased, about 300 to 500ms.

Captures: 20-solana-com-homepage.pdf, 21-solana-com-developers-hero.pdf, 22-solana-com-developers-calculator.pdf, 23-solana-com-ecosystem-hero.pdf.

### 3. Jupiter, jup.ag

The homepage IS the trading app, not a marketing hero. Fixed left sidebar about 190px, fixed top bar, single centred column about 500px wide on a near-black field with a green tint (~#0B0E0C), right rail is a floating "Your portfolio, at a glance" card. Top bar: logo, collapse icon, "Search anything /" pill, gift and settings icons, lime Connect button. Below it a thin live ticker strip (SOL and JUP prices and percent changes). Then a USDGO promo carousel with dots and pause, the Swap widget (Market, Limit, DCA tabs, Sell and Buy fields, centred circular swap-direction button overlapping the two fields, full-width lime CTA), mini token cards, popular tokens list, Perps sparklines, Lend Vaults (APY in green), Multiply Loops with thin lime progress bars, onchain stocks, and Send. No conventional footer; the page ends with a floating "Back to Swap" pill that appears only after scrolling.

Colours: cards ~#151A17 with a ~1px #232A25 border, radius 16 to 24px, inner inputs ~#232A28, lime accent ~#A8E635, positive green #22C55E, negative red #F87171. Numbers are tabular and right aligned. The swap "0.0" is very large, about 36 to 40px, light grey.

Motion: skeleton and shimmer loading cards that resolve into content, an auto-advancing promo carousel, a live ticker strip, fast snappy transitions (150 to 250ms), app-like not marketing-slow.

Captures: 01-jupiter-hero.pdf, 02-jupiter-perps-lend.pdf, 03-jupiter-lower-send.pdf.

### 4. Magic Eden, magiceden.io

Very dark purple-black base (~#12101A), cards ~#1E1A2A with a ~#2A2438 border, radius about 12px, hot pink accent ~#E42575 (Log In, Buy Packs, toggles, verified ticks), gold beta pill ~#F59E0B, muted lavender-grey secondary text ~#9B93B0. Sticky top nav with a wide search pill ("Search collections — Ctrl K"). Featured carousel: 6 large cards in a horizontal row, cut off at the right edge to invite scrolling. "Top Pack Pulls" cards have thin rainbow gradient borders (pink to yellow to cyan to purple). Top collections table with sortable headers, verified pink ticks, tabular numbers. "Biggest Movers" horizontal card row. Fixed bottom status bar with SOL price and TPS.

Motion: skeleton placeholders while images decode, horizontal carousels with a pink circular arrow at the right edge, live feel from the data itself (floor prices, percent changes, TPS in the status bar). No autoplay marquee, no hero video.

Captures: 04-magic-eden-hero.pdf, 05-magic-eden-movers-footer.pdf, 06-magic-eden-top-collections.pdf.

### 5. Phantom, phantom.com

The most marketing-led homepage, and the only light one. Pale lavender page background (~#EDEAF7), floating white pill nav with a soft shadow, hero is a large rounded rectangle media panel (radius about 24px) with a moving gradient and 3D scene (olive coin with a ghost face, green cash, blue and green gem, sparkles) that drifts and floats. Headline about 72 to 84px, weight 400 to 500, white, tight leading, centred, three lines. "Trading tools for everyone" is a horizontal carousel of 5 tall portrait cards (radius 20 to 24px, illustration filling the lower two thirds, headline top left) with Previous and Next controls. "Spend, Send, & Save" is a 3-slide carousel. Dark purple security section (~#3B2F5B) with a stacked-deck carousel (pastel cards offset behind a white front card). Footer is a large white rounded card with a giant newsletter field ("Enter your email" placeholder at about 56 to 64px) and a lavender pill button.

Buttons are full pills (radius 999px). Card colours alternate lavender (~#A99BFF), black, pale sage (~#E8EDE6), green, yellow, blue, pink. Motion is slow, soft and playful, about 400 to 600ms eases: hero video or canvas drift, carousel slides entering from the right, soft scroll fades, gentle lift and shadow on hover.

Captures: 07-phantom-hero.pdf, 08-phantom-trading-tools.pdf, 09-phantom-security-section.pdf.

### 6. Solscan, solscan.io

Blockchain explorer, light theme, data dense. Black header about 56px (logo in teal with a pink "O", live pill with SOL price and average fee), black hero band with a dotted purple pattern and a wide white search bar ("Search transactions, blocks, programs and tokens" with a "/" key hint), "Top Markets" horizontal ticker strip, 4-up white stat cards (radius 10 to 12px, soft shadow) with light grey inset sub-panels for breakdowns, two-column layout with a Latest Transactions and Latest Blocks table (truncated blue links, "4s ago" times, small grey action pills like "AMM: Sell" and "Fees: Claim", red dot for failed transactions) beside a DeFi Dashboard stacked multi-colour bar chart, Token Dashboard and Top DeFi Protocols tables, TPS chart (purple bars) and Average Ping Time chart (mint teal bars) with tooltips.

Colours: body light grey ~#F5F6F7, cards white with a ~#E5E7EB border, links blue ~#2563EB, epoch number blue ~#0EA5E9, toggle active teal ~#0D9488, TPS bars purple ~#A855F7, ping bars mint ~#5EEAD4.

Motion: the livest page of the five ecosystem sites. The Latest Transactions table updates every few seconds with new rows streaming in, the TPS and ping charts re-render as live time series, the epoch countdown ticks down second by second, the header price pill updates. Hovering a ping bar shows a tooltip card. Fast, about 200ms, data-driven motion, no hero video or marquee.

Captures: 10-solscan-hero-stats.pdf, 11-solscan-tps-ping.pdf, 12-solscan-token-dashboard.pdf.

### 7. Orca, orca.so

Warm light theme. Page background is a warm cream to pale yellow gradient (~#FFF8E6 to #FEF3C7) fading to white at the edges, text near-black, accent yellow ~#FFC800. Top nav on cream with a yellow "Launch App" pill. Centred hero headline about 56 to 64px, weight 600 to 700, two lines, with "Explore Yield" (solid yellow) and "Learn More" (pale yellow) pills below, then a large dark browser-window mockup (candlestick chart, Create Position panel) overlapping a dark phone mockup on the right. Three benefit cards, a black "Trade Smarter With Wavebreak" card with a live token list, a stats band ("2021 Launched", "300K+ Traders", "$500M+ Fees Paid to LPs", "$310B+ Total Volume"), a dark near-black rounded panel (~24px radius) with a vertical Discover, Deploy, Manage stepper (active step has a yellow left rule) beside a dark pools table with 7D sparklines, a black CTA panel, and a pale grey rounded footer panel with a newsletter card.

Typography has a mono accent: the eyebrow "Get Started" and the copyright line are in a monospace font (12 to 13px, grey). Buttons are full pills (radius 999px), yellow solid with black text. Motion is calm, premium and slow: subtle scroll fades (300 to 500ms), generous whitespace, no marquee or ticker, the Wavebreak token list appears to update live.

Captures: 13-orca-hero.pdf, 14-orca-dark-pools.pdf, 15-orca-cta-footer.pdf.

## Copy-paste prompts for your agent

Each prompt assumes the agent is working in the dev3pack repo on the SolVox Next.js app (Next.js 15, React 19, TypeScript, Tailwind CSS 4, lucide-react, Solana wallet adapter). Paste one prompt at a time and let the agent finish and build before the next.

### Prompt 1: Master blend prompt (paste first)

```
You are working in the SolVox Next.js app in this repo (Next.js 15, React 19, TypeScript, Tailwind CSS 4, lucide-react, @solana/wallet-adapter-react). Do not change the Anchor program, the IDL, or any API route. Only change the frontend styling and components.

Apply this design system across the whole app, in src/app/globals.css and a shared theme file:

COLORS (Tailwind v4 @theme tokens): background Void #0A0A1A, pure black #000000 for hero and footer, panel dark #111118 to #1A1A24, panel darker #0B0E0C, card border white at 8% opacity, text primary #FFFFFF, text secondary #A1A1AA, text muted #6B7280, brand gradient linear #9945FF to #00D1FF to #14F195, purple #9945FF, cyan #00D1FF, mint #14F195, success #22C55E, danger #EF4444, warning #F59E0B. Use the gradient sparingly: logo accents, hero aurora, primary CTA borders, and the grade A glow only. Never use a flat purple background for a whole page.

TYPOGRAPHY: Montserrat ExtraBold for the SolVox wordmark and headlines (add the Google Fonts import if it is not already loaded, weights 600, 700, 800). Inter or system sans for UI and body, 16 to 18px, line height 1.5, light grey. JetBrains Mono 14px for wallet addresses, hashes, nonces, code, and terminal output; truncate hashes with an ellipsis and add a copy icon. Eyebrows and labels: 12 to 13px, uppercase, wide letter spacing, grey. Hero headlines 72 to 100px desktop, tight leading 1.0 to 1.05, sentence case, weight 500 to 700. Section headings 40 to 56px. Card titles 20 to 24px.

SHAPE: cards radius 16 to 24px, primary buttons full pill radius 999px, secondary buttons on developer surfaces radius 10 to 12px, inputs radius 8 to 12px with a 1px dark border and grey placeholder. Section rhythm 120 to 160px vertical gaps on landing pages, max width container 1500 to 1600px, 1px hairline dividers between major sections.

MOTION: install framer-motion (motion) and use it for all scroll reveals and page transitions. Landing surfaces: slow eased motion, 300 to 500ms. App surfaces: fast and snappy, 150 to 250ms. Add CSS keyframes for: aurora drift (two large blurred radial gradients, purple and green, slowly translating and scaling on a 24s loop), a slow logo marquee (30s linear infinite), skeleton shimmer (a grey gradient sweeping across a placeholder), and a blinking block cursor. Respect prefers-reduced-motion in every animation: if the user prefers reduced motion, render the final state with no drift, marquee, or parallax.

BRAND RULES: keep the SolVox V waveform mark, the Montserrat wordmark, and the tagline "Speak. Verify. Execute." Do not use the Solana logo, the Solana wordmark, or any other project's logo, mascot, or artwork. Do not copy Jupiter, Magic Eden, Phantom, or Orca branding. The Solana gradient is a colour language to borrow, not a logo to paste.

After applying this, run npm run build and fix every error. Report which files you changed and confirm the build passes.
```

### Prompt 2: Landing page and hero

```
Build the SolVox landing page in src/app/page.tsx, following the solana.com homepage pattern blended with the SolVox brand. Pure black #000000 base. Sticky top nav about 70px with a hairline bottom border: left the SolVox V mark plus "SolVox" in Montserrat ExtraBold, centre links (Product, How it works, Trust grades, Developers), right a search pill with a Command K hint and a gradient-bordered "Connect Wallet" pill that uses the existing wallet adapter.

Hero, full viewport: left-aligned huge headline in Montserrat, about 90px on desktop, two lines, sentence case, "Speak. Verify. Execute." as the idea (write the headline around voice-first guarded payments, do not invent product claims), subcopy in light grey 18 to 20px, a white primary pill "Start speaking" with a black circular arrow badge inside on the right, and a secondary outline pill "Read the docs". On the right side, an aurora: two large blurred radial gradients (purple #9945FF upper right fading to teal and green #14F195 lower right) drifting slowly on a 24s loop, plus a glossy dark 3D ribbon shape made with CSS gradients (no external image). Below the hero, a slow logo marquee strip (text wordmarks only, no logos): "Devnet", "Anchor", "Firecrawl", "ElevenLabs", "Supabase" drifting sideways continuously.

Then, in order: a stats grid of 6 cells with live-feeling numbers (program ID, vaults created, actions guarded, trust grades issued, SOL guarded, receipts issued) where the numbers count up once on scroll into view and the first number ticks upward slowly afterwards; a "What is happening" terminal panel with tab pills (All, Voice, Trust, Vaults, Receipts) and a numbered 01 to 10 list of recent on-chain activity rows that fade in staggered over about 3 seconds when scrolled into view, each row with a caps category label, a short description, and a mono truncated signature link; a "How it works" section as a 3-step vertical stepper (Speak, Verify, Execute) with a gradient left rule on the active step, like the Orca Discover Deploy Manage stepper; a dark community cards grid (2 by 3) where each card gains a purple glow at its bottom-right corner on hover; and a footer with 6 link columns and a floating "Ask SolVox" pill at the bottom right (black pill, thin gradient border).

Use the design tokens from Prompt 1. Section gaps 120 to 160px. All scroll reveals use framer-motion whileInView with a stagger. Respect prefers-reduced-motion. Run npm run build and fix every error.
```

### Prompt 3: App shell and dashboard

```
Build the SolVox app shell and dashboard, blending Jupiter's app layout with Solana Playground's IDE chrome. The app shell is a full viewport layout: a fixed left activity bar about 60px wide (icons: Home, Voice console, Vaults, Receipts, Trust grades, Settings, using lucide-react icons only), a sidebar about 320px with small tracked capitals panel headers (for example "VAULTS", "TRUST GRADES"), a centre content area, and a status bar about 26px at the very bottom showing the cluster (Devnet), the program ID truncated in mono with a copy icon, and the wallet connection state.

The dashboard home is a centred column about 560px wide on the near-black panel background #0B0E0C, like Jupiter's swap column. At the top: a live status strip with SOL price and TPS, updating every few seconds (use a placeholder fetch that degrades gracefully to static values when offline, never crash the page). Then a hero card for the voice console (see Prompt 4), then three rows: "Your vaults" (vault cards with spent-today progress bars, thin 6px track, gradient fill, tabular numbers right aligned), "Recent receipts" (rows with circular grade badges A to F, mono truncated receipt address, amount, time), and "Trust grades" (grade chips with the Magic Eden style verified tick for attested grades).

Cards: radius 16 to 24px, 1px border white at 8% opacity, hover brightens slightly. Buttons: primary pill gradient border, secondary outline pill. All numbers tabular. Loading states: skeleton shimmer cards that resolve into content, never a blank screen. Transitions 150 to 250ms, snappy and app-like. No marketing motion here. Run npm run build and fix every error.
```

### Prompt 4: Voice console, Speak Verify Execute

```
Build the SolVox voice console component, the core of the app, modelled on Jupiter's swap widget as a hero component. One centred card, radius 24px, dark panel, on the dashboard. It has three stages shown as segmented tabs at the top: Speak, Verify, Execute (like Jupiter's Market, Limit, DCA tabs, active tab is a gradient pill).

Stage 1 Speak: a large voice input area with a microphone button (lucide Mic icon) and a waveform animation while listening (animated bars in the brand gradient, CSS only, no audio library needed for the visual). Below it, the transcribed command in large light text, about 28 to 32px. A "Use text instead" link switches to a text input with the same styling.

Stage 2 Verify: a verification panel that appears after a command is captured. It shows the parsed intent (action, target wallet truncated in mono, amount in SOL), the target's trust grade as a large letter badge (A green, B mint, C yellow, D orange, F red) with a short plain-English explanation, the vault policy check (daily limit remaining, minimum grade, paused state) as three check rows with green ticks or red crosses, and a Firecrawl research summary box (2 to 3 lines, grey text). If any check fails, show the exact on-chain error name in mono (for example InsufficientTrustGrade, DailyLimitExceeded) and disable the Execute button.

Stage 3 Execute: a full-width primary pill button "Execute guarded action" with the gradient border. On click it calls the existing Anchor program through the wallet adapter (use the existing program ID and IDL in src/idl/solvox.json, do not hardcode a new one). While the transaction is pending, show a thin gradient progress state and a blinking block cursor in a mono terminal line below. On success, show the ActionReceipt: receipt address truncated in mono with a copy icon, amount, grade at execution, nonce, and a link to view it on Solana Explorer (Devnet). On failure, show the error in plain English plus the on-chain error name in mono.

Keep the whole console in one card. No page navigation between stages. Use the design tokens from Prompt 1. Run npm run build and fix every error.
```

### Prompt 5: Trust grades and receipts, live data

```
Build the SolVox trust grade and receipts surfaces, modelled on Solscan's explorer tables blended with Magic Eden's verified ticks.

Trust grades page: a header with a black band, a dotted purple pattern, and a wide white-on-dark search bar ("Search wallets, grades, and receipts" with a "/" key hint). Below it, a stats row of 4 white-on-dark cards (radius 12px): grades issued, average grade, A grades, F grades, each with a light inset sub-panel for the breakdown. Then a grades table: columns Wallet (mono truncated with copy icon), Grade (large letter badge with colour: A #14F195, B #22C55E, C #F59E0B, D #F97316, F #EF4444), Attestor, Updated, Report hash (mono truncated). Rows have a pink verified tick next to attested grades. Numbers are tabular and right aligned.

Receipts page: a "Latest receipts" table that streams new rows in every few seconds (simulate with the existing data and a 4 second interval, newest first, with a subtle row highlight animation on insert). Columns: Receipt (mono truncated blue link), Time ("4s ago" style), Vault (mono truncated), Target, Amount, Grade at execution, Nonce. Failed or rejected actions show as a separate "Rejected" list with a red dot and the on-chain error name in mono (InsufficientTrustGrade, DailyLimitExceeded, InsufficientVaultBalance). Add a TPS-style bar chart (purple bars) and a grade distribution stacked bar (segments in the grade colours) with 7D and 30D toggles, active toggle in teal #0D9488.

All tables: row separators, hover slightly lightens the row, sortable headers with an arrow indicator. Keep everything dark themed (SolVox Void base, not Solscan's light body). Use the design tokens from Prompt 1. Run npm run build and fix every error.
```

### Prompt 6: Motion and animation system

```
Build the SolVox motion system as a shared module (for example src/app/components/motion.tsx and the keyframes in src/app/globals.css), using framer-motion and CSS, following the motion language from the research. Do not add any new animation library.

Implement these primitives and use them across the app:
1. Reveal: a wrapper component that fades and slides content up 24px when it enters the viewport (whileInView, once, 500ms ease, stagger children by 80ms). Use it for every landing section and card grid.
2. Aurora: a background component with two large blurred radial gradients (purple #9945FF and green #14F195) that translate and scale slowly on a 24s loop. Use it on the hero and on section divider bands. Pure CSS, no canvas, no images.
3. Marquee: a horizontal strip that drifts its children sideways continuously (30s linear infinite, duplicated content for a seamless loop, pause on hover). Use it for the logo strip and for a live activity ticker.
4. CountUp: a component that animates a number from 0 to its value once on scroll into view, then ticks upward slowly for live counters (for example total transactions). Format with tabular numbers.
5. Skeleton: shimmer placeholder cards (a grey gradient sweeping across, 1.5s loop) for every loading state in the dashboard, receipts, and grades pages. Never show a blank screen while data loads.
6. LiveRow: a table row component that highlights briefly (background fades from a purple tint to transparent over 600ms) when a new row is inserted.
7. GlowHover: a card hover effect that adds a soft purple glow at the bottom-right corner and lifts the card 2px, 300ms ease. Use it on landing cards only, not on dense app tables.
8. BlinkCursor: a block cursor that blinks at 1s steps, for terminal and voice console lines.

Every primitive must check prefers-reduced-motion and render the final static state with no animation when the user prefers reduced motion. Write a short usage note at the top of the motion file showing one example per primitive. Run npm run build and fix every error.
```

### Prompt 7: Responsive and mobile

```
Make the SolVox app fully responsive, following the responsive patterns implied by the reference sites. Breakpoints: mobile below 640px, tablet 640 to 1024px, desktop above 1024px.

Landing page: hero headline scales from about 40px on mobile to 90 to 100px on desktop; the aurora stays but is dimmed on mobile for performance; the 6-cell stats grid becomes 2 columns on tablet and 1 column on mobile; the 3 by 2 institution grid and the 2 by 3 community grid become 1 column on mobile; the terminal list keeps its 2-column layout on desktop and stacks to 1 column on mobile; the marquee keeps drifting; the sticky nav collapses to the SolVox mark plus a Connect button plus a hamburger that opens a full-screen dark menu with the same links.

App shell: the left activity bar collapses to a bottom tab bar on mobile (Home, Voice, Vaults, Receipts, Settings, lucide icons with labels); the sidebar becomes a slide-over drawer opened from a menu button; the status bar stays at the bottom and shortens to cluster plus wallet state only; the centred dashboard column becomes full width with 16px side padding; the voice console card keeps its three stages and the microphone button grows to at least 56px for touch; tables become horizontally scrollable with the first column sticky, or collapse to stacked cards on mobile (choose stacked cards for receipts, horizontal scroll for grades).

Playground is desktop-only in the research, so do not copy its fixed pixel grid. Everything must be touch friendly: minimum 44px touch targets, no hover-only information (every hover glow must also have a visible non-hover state). Test at 390px, 768px, and 1440px widths and fix any horizontal overflow. Respect prefers-reduced-motion on mobile too. Run npm run build and fix every error.
```

## Rules for the agent (add to every prompt if needed)

- Do not change the Anchor program, the IDL, the program ID, or any API route. Frontend only.
- Do not use the Solana logo, the Solana wordmark, or any other project's logo, mascot, or artwork. No NFT art, no ghost mascot, no orca, no Jupiter swirl.
- Do not invent product statistics. Use real on-chain values from the program or clearly labelled placeholders.
- Do not invent features that are not live. The live program has: initialize vault, deposit, update policy, set trust grade, execute guarded action, withdraw vault. Trust grades are A (5) to F (1). Daily spend limit and minimum grade are enforced on chain.
- Keep the SolVox brand: V waveform mark, Montserrat ExtraBold wordmark, gradient #9945FF to #00D1FF to #14F195, Void #0A0A1A, tagline "Speak. Verify. Execute."
- Accessibility: minimum contrast, focus states on every interactive element, semantic HTML, alt text on images, keyboard navigation for tabs and carousels.
- Performance: no external images for decoration (CSS gradients only), lazy load below-fold sections, keep the landing page under a reasonable size.
- After every prompt, run `npm run build` and fix errors before the next prompt.

## Capture index (screenshots)

All captures are full-page PDFs in the screenshots folder, numbered in research order. They are page captures, not cropped screenshots.

- 01-jupiter-hero.pdf: Jupiter homepage, swap widget, top bar, ticker strip
- 02-jupiter-perps-lend.pdf: Jupiter Perps, Lend Vaults, Multiply Loops, onchain stocks
- 03-jupiter-lower-send.pdf: Jupiter Send section and Back to Swap pill
- 04-magic-eden-hero.pdf: Magic Eden featured carousel and Top Pack Pulls
- 05-magic-eden-movers-footer.pdf: Magic Eden Biggest Movers, SEO block, footer
- 06-magic-eden-top-collections.pdf: Magic Eden Top collections table
- 07-phantom-hero.pdf: Phantom hero, floating pill nav, moving gradient media panel
- 08-phantom-trading-tools.pdf: Phantom Trading tools carousel, 5 tall cards
- 09-phantom-security-section.pdf: Phantom dark security section, stacked deck carousel
- 10-solscan-hero-stats.pdf: Solscan header, hero search, stat cards, Latest Transactions, DeFi chart
- 11-solscan-tps-ping.pdf: Solscan TPS chart, Average Ping Time chart, footer
- 12-solscan-token-dashboard.pdf: Solscan Token Dashboard and Top DeFi Protocols tables
- 13-orca-hero.pdf: Orca hero, yellow pills, dark browser and phone mockups
- 14-orca-dark-pools.pdf: Orca dark pools section, Discover Deploy Manage stepper
- 15-orca-cta-footer.pdf: Orca CTA panel and footer with newsletter card
- 16-playground-ide-explorer.pdf: Solana Playground IDE, Explorer panel, lib.rs in the editor
- 17-playground-build-deploy.pdf: Playground Build and Deploy panel, cyan pill button
- 18-playground-settings.pdf: Playground Settings panel (Block Explorer, Build, Connection, Editor)
- 19-playground-tutorials.pdf: Playground Tutorials and Learn page, level badges, card grid
- 20-solana-com-homepage.pdf: solana.com homepage, full page from hero to footer
- 21-solana-com-developers-hero.pdf: solana.com/developers hero, prompt box, tutorial cards
- 22-solana-com-developers-calculator.pdf: solana.com/developers Why Solana cards and fee calculator
- 23-solana-com-ecosystem-hero.pdf: solana.com/ecosystem hero, violet glow, bubble spheres

## Caveats (read before coding)

- Hex codes marked with ~ are visual approximations from the research, not values extracted from stylesheets. The browser research could not inspect stylesheets, so confirm exact hexes in a browser inspector before final polish. The confirmed brand hexes are #9945FF and #14F195 (Solana brand, seen on solana.com) and the SolVox brand gradient #9945FF to #00D1FF to #14F195 (from the SolVox brand kit).
- Font names are visual matches (Inter, geometric grotesque, JetBrains Mono) except JetBrains Mono size 14, which Playground's Settings panel states directly. Confirm the exact font on solana.com in an inspector if it matters.
- Responsive behaviour was not directly tested on any site (the research browsers had no viewport-resize control). The responsive notes in Prompt 7 are inferred from the desktop layouts. Test on a real phone before the demo.
- Playground is desktop-only by construction. Do not copy its fixed pixel grid into the SolVox app.
- Prices, TPS figures, and counts quoted in the site notes are snapshots from 27 Nov 2026 and will have changed. Never hardcode them as SolVox data.
