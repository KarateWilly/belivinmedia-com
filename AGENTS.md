# BELIVIN Repository Instructions

## Start of every session

Run `npm run handoff:check`. It prints the current stage, the next action and any blocker. Follow it; do not reconstruct intent from screenshots or chat history.

## Authority order

1. Mario's current instruction.
2. This file.
3. The live installed Impeccable skill: `SKILL.md` and the references it routes to (`reference/new-work.md`, `reference/visualize.md`, `reference/adapt.md`, and `reference/craft-floor.md` right before UI authoring).
4. `PRODUCT.md`, the surface brief `.impeccable/surfaces/index-html.md`, and approved artifacts in `.impeccable/`.
5. The global `belivin-media` skill for business facts only. Its main-site and showroom workflow references (browser-native delivery standard, main-site production gate) describe the retired Handwerk process; where they conflict with this file, this file wins.

Deleted builds (Handwerk "Auftragszentrale", SHK showroom, Festival-Line-up comps) are anti-reference only, never visual authority; see Removed.

## Current state

- Positioning: full-service marketing agency, services lead, audience industry-open (`PRODUCT.md`, 2026-10-29).
- Direction: Kundenweg, chosen after Mario rejected Festival-Line-up (`.impeccable/directions/belivin-agency-2026/selection.md`). Approved comp and live master: `.impeccable/mocks/belivin-agency-2026/comp-kundenweg/`; design system: `DESIGN.md`.
- Machine-readable stage: `.impeccable/site-gate.json`.

## Main-site workflow

Scope: `index.html`, `styles.css`, `site.js`, `public/site/`, and new `.impeccable` artifacts for this surface. Impeccable is the only design authority; do not blend `frontend-design`, generic landing-page systems or a second visual system.

1. **Direction:** done.
2. **Copy lock:** Mario approves `.impeccable/copy/belivin-agency-2026-draft.md`. Freeze it as `belivin-agency-2026-locked.md` and record path and SHA-256 in `site-gate.json`. Code never adds or expands copy; a new copy need reopens this gate.
3. **Three comps, mobile and desktop together:** in `.impeccable/mocks/belivin-agency-2026/`, each comp is one responsive HTML/CSS source with the locked copy, self-hosted licensed fonts and real SVGs. Capture every comp at 390×844 and 1440×900, first viewport and full page. Mario compares the three as mobile+desktop pairs. The chosen comp's `comp-*.json` gets `"approved": true` with Mario's words, and `site-gate.json` records it.
4. **Inventory and assets:** list every visible ingredient with its medium (semantic HTML, SVG, canvas/WebGL, raster); the primary CTA gets its own row. Produce every raster before building. Paid generation (Higgsfield, image APIs) only after Mario's explicit approval.
5. **Build:** run `npm run gate:unlock`, then build from the approved comp source. Reproduce the first screen at both 390 and 1440 before building further sections.
6. **Review:** compare build and comp side by side at 390 and 1440 (`.impeccable/review/mobile.png`, `desktop.png`, `hero-repro.png`), run the Impeccable detector and finish review, fix in at most two rounds. Then stop for Mario: he reviews mobile and desktop together and records approval in `site-gate.json`.
7. **Release:** `npm run qa` green, legal pages true, `npm run gate:lock`, Mario's explicit release approval recorded, then commit, push and deploy.

## Responsive rules

The last build failed on mobile because it was a fixed 1672×941 canvas reproduced pixel-for-pixel, with mobile retrofitted afterwards. Never again:

- No fixed canvas. Never position content with absolute coordinates against a comp size. Layout is fluid flow (grid/flex), type scales with `clamp()`, and breakpoints come from content.
- Mobile is designed in the comp round, not after the desktop build. Every comp source already works from 320 to 1920 px.
- One semantic DOM and one copy for all widths. Composition may change per breakpoint; content may not.
- Verify 320, 390, 768, 1024, 1440 and 1920 px, portrait and short landscape, with no horizontal scroll and no clipped text.
- Fidelity means matching the comp at 390 and 1440 in topology, scale, density, type and color. It does not mean pixel equality at one canvas size.
- Motion has a reduced-motion state, content is visible without JavaScript, and native scrolling is never hijacked (no scroll-jacking, smooth-scroll libraries off on touch).
- Fonts, libraries and media are self-hosted; no third-party runtime requests.

## Truth rules

- No invented customers, logos, testimonials, numbers, rankings, awards or guarantees. No guaranteed Google or AI positions.
- Proof sections stay off the page until real, consented proof exists.
- Prices stay off the page until visitors can book or buy directly.

## Legal

`impressum.html`, `datenschutz.html` and `legal.css` are release sources. Their statements must match the emitted site's actual entity and data flows. A missing current legal-entity field, especially the FZCO licensing/register authority, blocks commit and deployment. Only Mario can waive this, in his own words, recorded as `release.legal.waiver` in `site-gate.json`; a waiver is temporary and the imprint is re-verified once the current licence is available.

## Locks and commits

- `index.html`, `styles.css`, `site.js` and the legal sources are macOS `uchg`-locked while `site-gate.json` says the build is closed. Open and close them only with `npm run gate:unlock` and `npm run gate:lock`. Never bypass with direct `chflags`, `chmod`, rename-overwrite, delete/recreate, `git checkout`/`reset` or another writer.
- The pre-commit hook runs `node .impeccable/site-gate.mjs commit`. Commits touching main or legal sources need a green `npm run qa`, re-locked sources, a verified licensing authority and Mario's recorded release approval.
- No commit, push or deployment without Mario's explicit approval.

## Removed

The Handwerk site, its fixed-canvas production gate, the SHK showroom (`/beispiele/`), the industry registry and the rejected Festival-Line-up comps were deleted on 2026-10-29 (Mario: „Keine Altlasten“). Git history keeps them; nothing in the working tree refers to them. Do not restore them.

## Shared working tree

Preserve unrelated dirty files. No destructive reset, broad cleanup or force operation.
