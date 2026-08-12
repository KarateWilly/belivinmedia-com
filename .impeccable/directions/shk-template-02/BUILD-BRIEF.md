# SHK Template 02 — Versorgung in Schichten

Status: selected direction; implementation has not started.
Route target: `/beispiele/shk/design-2/`
Direction ID: `challenger-multiplane`

## Binding product context

- This is Template 2 of the initial SHK industry showroom. Outreach starts only when Templates 1–3 are all distinct, production-ready and live.
- Every qualified SHK lead receives the same `/beispiele/shk/` showroom. There is no per-template A/B/C split and no lead-specific demo, logo, company name, phone number or renderer.
- The showroom promise is `So könnte auch Ihre Website aussehen.` Customer-specific work starts only after genuine interest or collaboration.
- Template 1 `Inbetriebnahme-Pass` is locked. Template 2 must be recognizably more experimental and may not reuse Template 1's composition, typographic hierarchy, pass/protocol language or section system with different copy.
- Public code belongs in this repository and deploys only through the existing `belivinmedia` Vercel project. The route remains link-only, outside navigation and sitemap, with `noindex, nofollow, noarchive, nosnippet`.

## Selected visual direction

### Lineage

`Multiplane cel animation × hidden residential supply system`

### Thesis

House, warmth, water and building technology exist as spatial layers. Scrolling makes the relationship between comfortable living and the normally hidden supply system understandable.

### First-view narrative

Several authored house and technology layers move from a regional morning atmosphere through a warm residential zone to the technical supply layer. The visible benefit is the comfortable home; the hidden proof is the professionally ordered system beneath it.

### Palette

- deep forest: `#10241C`
- muted structural green: `#536454`
- cool mist grey: `#9BA9A4`
- warm window/utility amber: `#D69A42`

These are direction colors, not permission for low-contrast text.

### Materials and image language

- gouache-like authored planes;
- mist wash and subdued regional dawn;
- warm window and interior light;
- architectural section/cutaway logic;
- visible pipe and supply paths as part of the spatial system;
- dark hand-drawn architectural/technical notation as texture, never fake factual proof.

### Reference sketch

`.impeccable/sketches/shk-template-01/versorgung-in-schichten.webp`

The sketch is a direction reference, not a final asset and not implementation-ready artwork. Its visible DNA is:

- landscape and house silhouette form the atmospheric rear plane;
- living room and bathroom form the warm, human upper layer;
- plant room, pipe network and working technician form the darker functional lower layer;
- a horizontal cut through the house explains that comfort above depends on the ordered technology below;
- editorial identity copy occupies a dark quiet field rather than a conventional split-hero card;
- serif display typography and spaced uppercase utility text create a crafted architectural/editorial register;
- the composition reads as one connected world, not a grid of service cards.

## Required commercial story

The page is for private homeowners and residential decision-makers, not plant engineers. It must make the visitor understand:

1. The desired outcome is a warm, comfortable and reliably supplied home.
2. The difficult part is normally hidden: heating, water, installation, coordination and service must work together.
3. A capable SHK business makes these layers understandable, plans them coherently and leaves a traceable result.
4. The practical payoff is less uncertainty, clearer decisions, fewer later corrections, dependable comfort and one accountable partner.
5. The final action is the approved free Website-Check for the real recipient business, reached directly through the approved Calendly URL.

PAS may name uncertainty, coordination friction, avoidable changes and expensive later corrections, but must remain calm, premium and truthful. No alarmism, invented damage claims or guaranteed outcomes.

## Image-production contract

- Final imagery must be generated at the highest available quality, normally with a high-resolution/upscaled pass suitable for 2K–4K source production.
- Desktop landscape and mobile portrait are separate authored compositions. Mobile is not a crop, shrink or automatic rearrangement of desktop.
- The layer logic must remain readable on both: visible residential comfort and hidden technical supply cannot collapse into a generic house photo.
- Generated text, logos, gauges, pipe connections, tools, hands, anatomy and equipment layouts are not trusted. Final candidates require human visual review and technical-plausibility review before integration.
- Technical QA, file resolution and detector scores are floors, not approval. Do not hide weak imagery behind CSS overlays, darkness, blur, gradients or text fields.
- Synthetic images demonstrate the category and craft context only; never present them as real BELIVIN or SHK customer projects.

## Interaction and motion contract

- The spatial layers may become understandable through scroll-linked progression, but meaning must exist without animation and with reduced motion.
- Motion must reproduce causality: the connecting supply structure grows or reveals with the living/technical states, never before them and never in a direction that contradicts the story.
- Do not use continuous decorative parallax, scroll hijacking, sticky traps or motion that delays reading or contact.
- Header navigation must use the deterministic one-click fragment pattern established by Template 1: CSS settles before interaction; every click lands once and remains stable even when the same hash already exists.
- Hero images must not outrank render-blocking CSS. Template 1's real-device defect came from image priority competing with stylesheet application and moving header hitboxes after `DOMContentLoaded`.

## Responsive contract

- Mobile first viewport must be designed independently and contain a clear primary action without horizontal scrolling.
- Minimum manual/automated targets include `320 × 720`, `390 × 844`, intermediate breakpoint flanks, `1440 × 900`, `1920px` desktop and `3840 × 2160`.
- Support portrait, short landscape, tablet, desktop, large/tall desktop, both sides of major breakpoints, 150% and 200% text scaling, keyboard navigation and reduced motion.
- No text bleed, column collisions, clipped focus, hover-dependent information or controls below 44px touch size.
- 4K is a real release case. Large display typography needs explicit optical spacing and collision checks, including umlauts and accents.

## Truth and identity constraints

Use the controlled demonstration identity:

- `IHR SHK-BETRIEB`
- `SANITÄR · HEIZUNG · KLIMA`
- `IHRE REGION`
- `IHRE TELEFONNUMMER`

Do not invent ratings, review counts, founding years, certifications, response times, emergency availability, guarantees, partnerships, project totals, customer names or potentially real contact details.

All high-salience conversion actions lead directly to:

`https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check`

No decorative CTA arrows and no hover translations that can resemble page movement.

## Distinction from Template 1

Template 1 proves order through a documentary commissioning/pass system. Template 2 must prove connection through spatially layered home/supply causality.

Do not copy from Template 1:

- its industrial pass/protocol framing;
- its type pairing or headline composition;
- its service-band architecture;
- its rectangular documentary hero treatment;
- its paper/metal commissioning material language;
- its section sequence with only renamed copy.

Reuse only repository-level infrastructure and verified safety/accessibility patterns, not the visual world.

## Primary known risk

The direction can become picturesque, fairy-tale-like or resemble a nature hotel. That failure occurs when forest, mist and painted atmosphere dominate the SHK system. The build must preserve immediate trade recognition through an unmistakable residential cutaway, plausible technical layers, a working technician and explicit benefit-led copy.

Secondary risks:

- architectural section becomes an engineering diagram that private homeowners cannot parse;
- dark green/amber palette loses accessibility or feels vintage;
- too much parallax creates scroll instability and poor mobile performance;
- visual layer tricks overpower the commercial message and CTA;
- technical connections generated in imagery become implausible.

## Build sequence for the next session

1. Re-read `PRODUCT.md`, this brief and the reference sketch.
2. Inspect Template 1 only for shared safety/QA infrastructure and explicit lessons; do not derive Template 2's composition from it.
3. Convert the selected thesis into separate desktop and mobile composition specs before generating final imagery.
4. Generate and visually review high-quality image candidates before writing the page around them.
5. Implement `/beispiele/shk/design-2/` as a self-contained visual system with static/no-motion meaning first, then add restrained causal motion.
6. Add the real Design 02 entry to `/beispiele/shk/` only when the route is production-ready. Do not publish placeholders or claim three live designs early.
7. Run local content, truth, image, accessibility, responsive, 4K, reduced-motion, repeated-anchor, CTA and performance QA.
8. Request release approval before production deployment. Outreach remains blocked until Template 3 is also live and verified.

## Still open — do not guess silently

The selected direction does not yet lock:

- final public headline and section copy;
- final typography;
- exact number and identity of visual layers;
- whether the final art is painterly, semi-photoreal or a controlled hybrid;
- exact scroll choreography;
- final mobile layer arrangement;
- Template 3 direction.

Resolve these through the normal design/composition selection and visual review workflow rather than treating the sketch as pixel-level approval.
