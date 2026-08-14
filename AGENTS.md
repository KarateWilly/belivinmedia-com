# BELIVIN Repository Instructions

## Authority order

For BELIVIN main-site design work, follow in this order:

1. Mario's current instruction.
2. Live installed Impeccable `SKILL.md`, `reference/new-work.md`, `reference/visualize.md`, and `reference/craft-floor.md`.
3. `belivin-media` skill references `references/belivin-browser-native-delivery-standard.md` and `references/belivin-main-site-impeccable-production-gate.md`.
4. `PRODUCT.md` and the approved surface artifacts.
5. Existing implementation only when it is not a rejected build.

## Exclusive design workflow

For `index.html`, `styles.css`, or main-site assets, Impeccable is the only design authority. Do not load or blend `frontend-design`, generic landing-page advice, a second visual system, or previous rejected BELIVIN builds.

A direction-page sketch is never a production comp. After Mario chooses a direction, complete these gates before code:

1. lock the real first-screen copy;
2. produce one system board and exactly three browser-native/layered production hi-fi comps in `.impeccable/mocks/belivin-main-site/`, each with a bound source manifest; PNGs are screenshots only;
3. obtain Mario's explicit comp approval and mark the chosen sidecar `approved: true`;
4. write the fidelity/medium inventory, with the primary CTA as its own row;
5. produce and accept every image-native asset;
6. complete `.impeccable/main-site-build-gate.json`;
7. run `npm run gate:main-site`, then `npm run gate:main-site:open-hero`, and—after the Hero Proof passes—`npm run gate:main-site:unlock-page`.

`index.html` and `styles.css` are macOS user-immutable while the gate is closed. Never bypass the lock with direct `chflags`, `chmod`, rename-overwrite, deletion/recreation, git checkout/reset, or another writer. A failed validator means return to the missing upstream Impeccable step.

## Comp-to-code

The approved hi-fi comp is the production source, not loose inspiration. First insert the five-part direction contract and seed key into emitted HTML. Then reproduce only the first desktop viewport at the comp's exact dimensions. Use side-by-side/overlap comparison until topology, scale, density, material, typography, proof and CTA are near-pixel-perfect. Only then build later desktop sections in that same grammar.

Choose medium from the comp:

- physical texture/material/lighting/illustration → regenerated raster asset;
- precise geometry/state/motion → SVG, canvas or code;
- real copy/navigation/core controls → semantic HTML;
- materially treated CTA → approved raster/SVG carrier plus semantic link overlay, never improvised CSS chrome.

Copy is approved before code and may not be expanded during implementation. If an unapproved copy need appears, stop and reopen the copy gate.

## Production-master revisions

- A first-viewport defect is fixed in the browser-native master first. Update source/vector provenance, hashes and objective metrics; then propagate master → hero → root through the gates and rebuild both proofs. Never patch a hero defect only in root.
- A lower-page correction changes only the approved lower-page scope; afterward prove the first viewport still equals the hero at `0` changed pixels.
- A semantic revision changes only its approved content field. A new topology/direction returns to three production comps.
- Raster-derived vector crops fail when their foreground bbox touches any crop edge. Expand and re-extract before tracing. Bind the complete source mask, bbox, method, hash and IoU. Visible smoothing needs Mario approval and must preserve the source form; use geometric precision and zero-blur shadows where crisp contours are intended.
- Source → approved-comp fidelity and master → hero/page transfer are separate proofs. Never use transfer equality as design fidelity evidence.

After the complete desktop build is opened, stop for Mario. No responsive/mobile, accessibility, performance, generic reviewer, browser matrix, polish, commit, push or deployment before his visual approval. Re-lock with `npm run gate:main-site:lock`.

## Responsive, legal, industry, and release

- After Mario accepts the complete desktop build, use `npm run gate:main-site:unlock-release`. It opens only the main and legal release sources; the proven Hero stays immutable.
- Author compact desktop, tablet, and mobile as deliberate compositions from the same semantic DOM, copy, fonts, SVGs, proof, and material grammar. Never scale, screenshot, or crop the fixed desktop canvas into smaller viewports.
- Resolve perceived blur at the source asset. Bind the accepted source, method, and SHA-256, inspect it in the real page, and prove the desktop first viewport still equals the Hero at `0` changed pixels.
- Treat `impressum.html`, `datenschutz.html`, and `legal.css` as release sources. Match their statements to the emitted site's actual entity and data flows. A missing current legal-entity field—especially the FZCO licensing/register authority—blocks commit and deployment.
- `beispiele/industry-registry.json` is the machine-readable truth. No public central industry hub, placeholder industry, or outreach before an industry has three distinct production-ready templates. The current SHK state is `2/3`; its truthful homepage proof may remain featured while hub and outreach stay blocked.
- `npm run qa` is the release floor: HTML/CSS/JS, Impeccable, unit gates, isolated Chromium/WebKit main/legal matrices, local-link status, hit areas, fonts, horizontal bounds, focus, console/page errors, third-party requests, CLS, and protected SHK QA.
- Bind root, legal, QA-script, registry, and evidence hashes in `.impeccable/main-site-build-gate.json`. Then run `npm run gate:main-site:lock`; Hero, main, and legal sources must all be `uchg`.
- `npm run gate:main-site:commit` must remain fail-closed until the current Trade License verifies the licensing/register authority and Mario explicitly approves the complete desktop/tablet/mobile/legal release candidate.
- Before continuing in a fresh session, run `npm run handoff:check`. Follow the printed state and blocker; do not reconstruct intent from screenshots or chat history.

## Shared working tree

Preserve parallel SHK work and unrelated dirty files. Main-site work owns only explicitly named main-site paths and its new `.impeccable` artifacts. No destructive reset or broad cleanup.
