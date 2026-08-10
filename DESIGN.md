---
name: "BELIVIN MEDIA — Signal Cut"
description: "A sharp, conversion-led agency system built from asymmetric planes, cut-paper depth, and one mint signal."
colors:
  navy: "#212162"
  navy-deep: "#11113e"
  navy-mid: "#2a2a72"
  ink: "#0d1024"
  paper: "#f4f6f5"
  paper-muted: "#dce5e6"
  steel: "#a7bbca"
  mint: "#5ce1c6"
  mint-active: "#70ead1"
  line: "rgba(244, 246, 245, 0.2)"
  line-strong: "rgba(244, 246, 245, 0.42)"
typography:
  display-hero:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(3.2rem, 4.8vw, 5.6rem)"
    fontWeight: 760
    lineHeight: 0.92
    letterSpacing: "-0.026em"
    fontVariation: "\"wdth\" 66, \"wght\" 760"
  display-section:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(3.25rem, 5.4vw, 5.95rem)"
    fontWeight: 760
    lineHeight: 0.92
    letterSpacing: "-0.026em"
    fontVariation: "\"wdth\" 66, \"wght\" 760"
  display-title:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "clamp(2rem, 3vw, 3.35rem)"
    fontWeight: 760
    lineHeight: 0.98
    letterSpacing: "-0.026em"
    fontVariation: "\"wdth\" 66, \"wght\" 760"
  body:
    fontFamily: "Manrope, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  navigation:
    fontFamily: "Manrope, sans-serif"
    fontSize: "0.87rem"
    fontWeight: 680
    lineHeight: 1
    letterSpacing: "normal"
  action:
    fontFamily: "Manrope, sans-serif"
    fontSize: "1rem"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "normal"
  brand:
    fontFamily: "Archivo, Arial Narrow, sans-serif"
    fontSize: "1.22rem"
    fontWeight: 760
    lineHeight: 1
    letterSpacing: "0.11em"
    fontVariation: "\"wdth\" 68, \"wght\" 760"
rounded:
  square: "0px"
spacing:
  mobile-gutter: "16px"
  tablet-gutter: "24px"
  desktop-gutter: "32px"
  section-block: "clamp(72px, 6.5vw, 96px)"
  hero-block: "clamp(38px, 6vh, 68px)"
components:
  primary-action:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "15px 22px"
    height: "54px"
  primary-action-hover:
    backgroundColor: "{colors.mint-active}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
  primary-action-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "15px 22px"
    height: "54px"
  navigation-action:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.action}"
    rounded: "{rounded.square}"
    padding: "11px 15px"
    height: "42px"
  menu-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.paper}"
    typography: "{typography.navigation}"
    rounded: "{rounded.square}"
    padding: "0 12px"
    height: "44px"
    width: "72px"
  decision-result:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.display-title}"
    rounded: "{rounded.square}"
    padding: "16px 26px"
  offer-main:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "clamp(42px, 5vw, 74px)"
  process-strip:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.square}"
    padding: "clamp(34px, 3.8vw, 50px)"
---

# Design System: BELIVIN MEDIA — Signal Cut

## Overview

**Creative North Star: "The Signal Cut"**

Signal Cut is a self-confident persuasion system for a website-led agency: deep navy establishes authority, hard off-white planes create forward movement, and a single mint signal marks the path to action. Its visual language is attention-grabbing because the hierarchy is decisive, not because the surface is busy.

The system translates the commercial story into six compact beats: outcome, lost opportunity, solution, working relationship, real proof, and final Website-Check action. Large asymmetric planes, condensed headlines, one real testimonial portrait, and authored cut-paper imagery make a few moments dominant while the Manrope body copy stays plain and credible.

The approved world refuses generic light agency card grids, SaaS gradients, glass, rounded controls, decorative metrics, and continuous motion. All content remains visible without animation, and real proof is visually distinct from atmospheric imagery.

**Key Characteristics:**

- Deep BELIVIN navy is the continuous ground; off-white and mint appear as decisive cuts rather than decorative layers.
- Archivo is narrow, heavy, and tightly led for display; Manrope carries all explanatory and action text.
- Composition uses large asymmetric planes, diagonal masks, structural rules, and full-width consequence lines.
- The primary Website-Check action is always a direct Calendly link and the only repeated high-salience control.
- The abstract open doorway and mint path are atmospheric metaphors for new business entering; Cristina Hubrath's named portrait and quote are the sole customer proof.
- Motion is limited to one brief hero-copy reveal and short control responses, with a complete reduced-motion fallback.

## Colors

The palette is intentionally narrow: three navy depths, ink, two paper tones, one steel neutral, and one mint signal with its active state.

### Primary

- **BELIVIN Navy** (`navy`): the main field for the hero, services, proof, and core section planes.
- **Deep Authority Navy** (`navy-deep`): the page ground, sticky header, footer, problem field, and darkest support planes.
- **Signal Mint** (`mint`): the CTA, selected word, result arrow, process strip, portrait underlay, and final conversion field.

### Secondary

- **Mid Signal Navy** (`navy-mid`): consequence bands and supporting service planes that need separation without leaving the brand field.
- **Active Mint** (`mint-active`): hover-only reinforcement for mint actions and proof links.

### Neutral

- **Dark Ink** (`ink`): text and dark actions on mint or paper surfaces.
- **Cut Paper** (`paper`): bright text on navy and the main off-white service plane.
- **Muted Paper** (`paper-muted`): body copy on dark fields.
- **Steel Blue** (`steel`): secondary brand lettering and footer metadata.
- **Fine Rule / Strong Rule** (`line`, `line-strong`): low-contrast and emphasized structural joints on dark fields.

**The One Signal Rule.** Mint marks action, consequence, or the successful path; it never becomes a general decorative fill across several competing elements.

**The Navy Field Rule.** The page remains visibly navy-led even where paper or mint planes take over a section.

## Typography

**Display Font:** Archivo (with Arial Narrow and sans-serif fallbacks)

**Body Font:** Manrope (with sans-serif fallback)

**Character:** Archivo is used as a condensed, high-pressure display face through its width and weight axes; Manrope supplies calm, familiar readability. The contrast lets the page sound forceful in headlines without making service explanations theatrical.

### Hierarchy

- **Hero Display** (`display-hero`): the first-viewport promise and its opposing second line; it is the conversion thesis, not a decorative title.
- **Section Display** (`display-section`): major problem, solution, collaboration, proof, and closing statements, usually held to a short character measure.
- **Display Title** (`display-title`): service, reason, process, and testimonial subheads.
- **Body** (`body`): plain German explanation with a maximum observed measure of approximately `70ch`; hero and key service copy use narrower measures.
- **Navigation** (`navigation`): compact header and mobile-menu labels.
- **Action** (`action`): Website-Check controls, always heavy enough to read as the next step.
- **Brand** (`brand`): the compact tracked BELIVIN MEDIA wordmark, with MEDIA stepping down to the steel neutral.

**The Condensed Consequence Rule.** Use the narrow display axis for outcomes and consequences; never use it for long paragraphs.

**The Two-Voice Rule.** Archivo carries identity and hierarchy; Manrope carries explanation and action. Do not introduce a third typographic voice.

## Layout

The desktop shell is capped at `1420px` with a `32px` outer gutter. The sticky header uses a `70px` height; sections use the shared vertical rhythm in `section-block`. On wide landscape viewports (`min-width: 1100px` and `min-aspect-ratio: 4/3`), the hero fills the remaining viewport and places a contained copy block over the left of the cut-paper artwork. A directional navy-to-transparent shade preserves contrast through the complete text-safe zone.

The six-section story alternates deliberately: an asymmetric problem grid and mint consequence arrow; a large paper service plane paired with two navy supports; an offset twelve-column relationship grid; a real portrait beside the testimonial; and a full-width mint closing plane. Horizontal rules and clipped polygons establish joins instead of card spacing or floating containers.

The base layout is the `320px` mobile composition: copy and CTA stay in normal flow, followed by the complete intrinsic hero artwork with no opportunistic crop. Short landscape viewports between `480px` and `1099px` use a compact `62/38` copy-and-art split so the CTA remains in the first viewport. Wide landscape overlay mode begins only when both the width and aspect-ratio contract are satisfied. Navigation uses its keyboard-safe menu below `1440px`; major content grids stack below `901px`; at `520px`, offer points and process steps become single columns; and at `360px`, compact type adjustments apply. There is no hard minimum document width and no root overflow masking.

Every responsive release is checked at portrait, short landscape, tablet, desktop, large desktop, and breakpoint-flank sizes. Meaningful text and controls must remain inside the viewport and every clipping ancestor. Only explicitly decorative pseudo-elements may exceed a component plane. A desktop comp never authorizes the mobile treatment by itself: every future first viewport needs a binding phone composition and image/crop contract before implementation.

**The Few Dominant Moments Rule.** Each section gets one commanding plane or statement; do not subdivide the story into equal card tiles.

**The Mobile Recomposition Rule.** Mobile changes order, image height, and grid density; it is not a proportionally scaled desktop canvas.

## Elevation & Depth

The system is primarily flat. Depth comes from the raster cut-paper doorway, its mint path, diagonal clipping, tonal navy steps, one-pixel joints, and the testimonial portrait's offset mint polygon. Only primary actions receive a compact dark shadow: the default CTA uses `0 16px 44px rgba(13, 16, 36, 0.28)`, increasing to `0 21px 56px rgba(13, 16, 36, 0.36)` on hover; the dark closing action uses the quieter `0 16px 44px rgba(13, 16, 36, 0.2)`.

**The Structural Depth Rule.** Planes, cuts, and photography create depth; do not add ambient card shadows or glass layers.

## Shapes

Controls and containers are square (`square`). Diagonal polygons are reserved for directional content: the problem sequence field, the mint result arrow, the service-plane corner, the process-strip cap, the testimonial crop, and the closing background cut. Fine straight rules connect information and define component boundaries.

**The Hard Cut Rule.** Keep buttons, menus, offer planes, and process fields rectangular; use diagonals only where they express movement or consequence.

## Components

### Buttons

- **Primary Website-Check Action:** a mint rectangle with dark ink, heavy Manrope, a `54px` target, and compact padding. Hover lifts by `2px`, increases shadow depth, and moves to the active mint; active returns to the plane and scales to `0.985`.
- **Dark Closing Action:** the same dimensions and behavior with ink on paper, used only inside the final mint conversion field.
- **Header Navigation Action:** a compact `44px` mint control. It lifts by `1px` on hover and uses the paper-colored focus outline for separation.
- **Focus:** interactive elements use a visible `3px` mint outline with a `4px` offset; mint controls switch the outline to paper or ink as required for contrast.

### Navigation

- **Desktop:** from `1440px`, compact text links sit in the sticky deep-navy header. A two-pixel mint rule grows from right to left on hover or keyboard focus.
- **Compact navigation:** below `1440px`, the `44px` square-corner menu toggle reveals a bordered deep-navy panel of `48px` navigation rows and a full-width mint action. Escape, outside click, link selection, and the desktop breakpoint all close it.

### Cards / Containers

- **Main Offer Plane:** a large paper field spanning two rows, with an asymmetric mint corner and a ruled two-column deliverable list. It is the dominant solution object, not a reusable marketing card.
- **Supporting Offers:** two stacked navy planes separated by a strong rule. They remain subordinate to the paper website offer.
- **Relationship Reasons:** offset ruled bands on a twelve-column grid; one navy fill and one mint-topped row create hierarchy without individual card shells.

### Signature Components

- **Decision Sequence:** three oversized Archivo statements use contained padding to imply forward movement; the final result becomes a mint arrow whose complete point always remains inside its content plane.
- **Consequence Line:** a full-width mid-navy band carries one oversized unbroken commercial consequence.
- **Process Strip:** a mint structural slab with an angled cap and four ruled steps; it collapses to two columns and then one.
- **Customer Proof:** Cristina Hubrath's real portrait is cut into an irregular polygon over a mint underlay, paired with the approved quote and named source link. Atmospheric art never substitutes for this proof.

**The Direct Action Rule.** Every Website-Check component links straight to the approved Calendly destination; never insert an on-page intermediate step.

## Do's and Don'ts

### Do:

- **Do** keep the six-section outcome → loss → solution → collaboration → proof → action story compact and customer-centered.
- **Do** reserve mint for the next action, the decisive consequence, or the successful path.
- **Do** preserve the abstract open doorway and single mint path as atmospheric art, and the named Cristina portrait and quote as real proof.
- **Do** use large asymmetric planes, clipped diagonals, and structural rules to establish hierarchy.
- **Do** keep all content visible without animation and preserve the reduced-motion and reduced-transparency fallbacks.
- **Do** run the automated responsive matrix across `320px` portrait, short landscape, tablet, `1440px` and wide desktop, including both sides of `360px`, `520px`, `900px`, `1100px`, `1180px`, and `1440px` transitions.

### Don't:

- **Don't** add light agency card grids, gradients, glass, rounded pills, decorative metrics, or interchangeable split heroes.
- **Don't** turn mint into a broad decorative palette or introduce colors outside the documented navy, mint, paper, steel, and ink family.
- **Don't** add continuous motion, smooth scrolling, or scroll-dependent content visibility.
- **Don't** use the unused `hero-focus-desktop.webp` or `hero-focus-mobile.webp` assets as Signal Cut visual authority.
- **Don't** invent customer logos, rankings, reviews, statistics, awards, or outcomes.
- **Don't** publish internal positioning, PAS, WIIFM, or Value Equation labels.
