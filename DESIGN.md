---
name: BELIVIN MEDIA
description: "Kundenweg: cool paper, deep brand navy and one mint signal; drawn lanes carry the visitor from four channels to the booking button."
colors:
  ink: "#14173d"
  ink-lift: "#262a5e"
  mint: "#5ce1c6"
  mint-deep: "#0f9f84"
  mint-light: "#8deedb"
  paper: "#f4f5f8"
  ink-soft: "#444869"
  line: "#d6d9e6"
  night-text: "#c9cce6"
  night-line: "#2c3163"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(42px, 7.2vw, 96px)"
    fontWeight: 760
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(34px, 4.8vw, 64px)"
    fontWeight: 740
    lineHeight: 1.02
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(27px, 3vw, 42px)"
    fontWeight: 700
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  subtitle:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.4vw, 34px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(23px, 2.5vw, 34px)"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.015em"
  step-title:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(22px, 2.4vw, 32px)"
    fontWeight: 640
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  question:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "clamp(20px, 2vw, 27px)"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body-large:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(18px, 1.4vw, 21px)"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(17px, 1.2vw, 19px)"
    fontWeight: 400
    lineHeight: 1.55
  note:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.45
  small:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
  label:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 600
    lineHeight: 1.7
    letterSpacing: "0.05em"
  channel:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "clamp(10.5px, 0.95vw, 13px)"
    fontWeight: 650
    lineHeight: 1.25
    letterSpacing: "0.06em"
  button:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 650
  button-phone:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 650
  nav:
    fontFamily: "Funnel Sans, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  wordmark:
    fontFamily: "Funnel Display, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 760
    letterSpacing: "0.07em"
rounded:
  focus: "4px"
  compact: "8px"
  control: "10px"
  node: "50%"
spacing:
  gutter: "clamp(20px, 4vw, 56px)"
  measure: "1320px"
  spine-col: "72px"
  bar: "72px"
  bar-phone: "58px"
  section: "clamp(72px, 6.9vw, 128px)"
  section-close: "clamp(96px, 9.4vw, 168px)"
  stack: "clamp(44px, 3.75vw, 64px)"
  row: "clamp(28px, 2.5vw, 44px)"
  row-tight: "clamp(22px, 1.9vw, 32px)"
  column: "64px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "16px 28px"
    height: "60px"
  button-primary-hover:
    backgroundColor: "{colors.ink-lift}"
  button-compact:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.compact}"
    padding: "11px 16px"
  button-compact-hover:
    backgroundColor: "{colors.ink-lift}"
  button-signal:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.control}"
    padding: "16px 28px"
    height: "60px"
  button-signal-hover:
    backgroundColor: "{colors.mint-light}"
  bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    height: "{spacing.bar}"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
  tags:
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
  lane-node:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.node}"
    size: "9px"
  spine-node-lit:
    backgroundColor: "{colors.mint-deep}"
    rounded: "{rounded.node}"
    size: "12px"
  step-node:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.node}"
    size: "44px"
  step-node-lit:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.ink}"
  night-block:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    padding: "clamp(96px, 9.4vw, 168px) clamp(20px, 4vw, 56px)"
  footer:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.night-text}"
---

# Design System: BELIVIN MEDIA

## Overview

**Creative North Star: "Kundenweg"**

Kundenweg draws the customer's path as a literal line. The page shows the mechanism instead of claiming it: four channel lanes converge into the booking button, one lane threads four statements like a circuit trace into the verdict, the closing lane ends in the last button, and on desktop a spine fills down the page while the visitor scrolls. Mint pulses travel the lanes; everything else holds still on cool paper in deep brand navy.

Density is calm and editorial. Large, heavy Funnel Display headings sit over generous width-based spacing and are separated by 1px rules, never by containers. Two columns appear only where a heading sits beside its own content; phones get their own single-column composition with full-width buttons and a progress line under the bar in place of the spine.

The direction explicitly rejects agency bento grids, logo marquees, gradient glow and neon on black; the world itself has no cards and no shadows.

**Key Characteristics:**
- Paper, navy and one mint signal; mint only moves, arrives or closes.
- Lanes are the signature: thin navy lines that always end in an action or a verdict.
- Flat: 1px rules, rounded corners on buttons only, circles only as nodes; no cards, no elevation.
- Heavy Funnel Display headings with tight negative tracking over Funnel Sans reading text.
- Width-based spacing only; lanes are computed from rendered boxes and never drift.
- Motion carries information, and reduced motion keeps every lane.

## Colors

Cool, nearly achromatic paper and one deep navy carry everything; a single mint hue, in three strengths, marks movement and arrival.

### Primary
- **Ink Navy** (#14173d): every heading and body line on paper, the primary and compact buttons, lane strokes (at 28% opacity), node outlines, the focus outline on paper, and the background of the night close and footer. 15.8:1 on paper.
- **Ink Lift** (#262a5e): the hover state of every navy button, nothing else.

### Secondary
The one signal. These are three strengths of the same mint, never a second accent.
- **Signal Mint** (#5ce1c6): the closing CTA on the night block (ink label, 10.7:1), the arrival dot and ring on top of every large CTA, the end point of the mechanism lane, pulses on the night block, lit step numerals (ink numeral on a mint fill), text selection, and the focus outline on navy.
- **Deep Mint** (#0f9f84): the on-paper form of the signal for marks that must read on their own (3.05:1 on paper): pulses on the hero and mechanism lanes, the desktop spine fill, the phone progress line, lit spine nodes.
- **Pale Mint** (#8deedb): the hover state of the closing mint CTA only.

### Neutral
- **Cool Paper** (#f4f5f8): page ground, bar background, browser theme color, and the fill of every node, so lanes appear to pass beneath them.
- **Muted Ink** (#444869): secondary reading text on paper: supports, quoted customer problems, notes, tags, fine print, FAQ answers. 8.1:1 on paper.
- **Hairline** (#d6d9e6): every 1px rule on paper (bar bottom, section tops, row tops, FAQ, fine-print band) and the empty spine track.
- **Night Text** (#c9cce6): reading text on the night block and footer (10.9:1 on navy) and the closing lane at 40% opacity.
- **Night Rule** (#2c3163): the single rule between the night close and the footer.
- **White** (#ffffff): button labels on navy and the closing heading on the night block.

### Named Rules
**The One Signal Rule.** Mint exists only where something moves, arrives or closes: pulses, the spine and progress fill, lit nodes, lane ends, the arrival dot, the closing CTA. It is never decoration, never a background area, never a second accent beside navy.

**The Mint Is Never Text Rule.** Bright mint on paper measures 1.48:1, so mint never carries text. On paper, bright mint appears only as an arrival accent attached to a navy lane or button, or as a fill under ink; any signal mark that must read on its own uses Deep Mint.

**The Navy-on-Paper Rule.** On paper the primary CTA is Ink Navy with a white label. The mint CTA appears once, on the night close, where the last lane ends.

## Typography

**Display Font:** Funnel Display (with system-ui, sans-serif)
**Body Font:** Funnel Sans (with system-ui, sans-serif)

Both are self-hosted variable woff2 files (weights 300 to 800, SIL OFL), preloaded and loaded with `font-display: swap`.

**Character:** One family split in two. Display is drawn heavy with tight negative tracking for everything that speaks (headings, statements, questions, numerals); Sans carries everything that is read or pressed. Hierarchy comes from size and weight, never from a second voice.

### Hierarchy
- **Display** (760, clamp(42px, 7.2vw, 96px), 0.98): the hero H1 and the closing heading. Set as two deliberate lines that never wrap on desktop; the closing heading runs at 780 with a 21ch measure.
- **Headline** (740, clamp(34px, 4.8vw, 64px), 1.02): section headings, 18ch measure. The mechanism verdict runs at 780 and up to clamp(34px, 4.2vw, 64px), each of its two lines held unbroken.
- **Title** (700, clamp(27px, 3vw, 42px), 1.06): service names.
- **Subtitle** (600, clamp(22px, 2.4vw, 34px), 1.15): the hero question lead (in Ink Navy, from 23px), the four chain statements (560), and step titles (640, up to 32px, 1.1).
- **Question** (600, clamp(20px, 2vw, 27px), 1.25): FAQ summaries.
- **Body large** (400, clamp(18px, 1.4vw, 21px), 1.5): supports beside or under headings, 46ch (44ch on the night block). Quoted customer problems use the same size at 500 and 1.4, 30ch.
- **Body** (400, clamp(17px, 1.2vw, 19px), 1.55): reading text; 48ch in service answers, 52ch in steps, 60ch in FAQ answers.
- **Note** (400, 15px, 1.45): the line under the hero CTA, 40ch.
- **Small** (600, 14px): the compact bar button, the footer and the field labels on the legal pages. Legal page titles use **Headline**, legal section headings use **Question**.
- **Label** (600, 12.5px, 0.05em, uppercase): tags under services and the hero's fine-print band. The channel names where the hero lanes begin share the uppercase label voice at 650 and 0.06em, scaling with width up to 13px.
- **Button** (650, 17px): large CTAs; the compact bar button runs 600 at 14px.
- **Nav** (500, 15px): bar links. **Wordmark** (Display 760, 17px, 0.07em): the brand name in the bar.

### Named Rules
**The No-Eyebrow Rule.** Headings stand alone. No small uppercase label, category word, number or kicker sits above an H1 or H2. Uppercase small print exists only after content (tags, the fine-print band) or as the channel names where lanes begin.

**The Bound Separator Rule.** In tags and fine print, items are joined by a middle dot bound to the preceding item with a non-breaking space ("Konzept&nbsp;· Text"), so a wrapped line can end with a separator but never start with one.

**The Deliberate Line Rule.** Every heading uses balanced wrapping, and display and verdict headings are pre-broken into their intended lines rather than left to the browser.

## Layout

One centered measure (1320px) plus a fluid gutter on each side, under a sticky bar. Sections are stacked in a single flow, each opened by a 1px Hairline rule and padded by the `section` step; the gap from a heading to its content is the `stack` step; list rows carry their own 1px rule and the `row` or `row-tight` padding. On desktop (900px and up) the page body reserves a 72px spine column at the left, with the 2px spine track 7px inside the gutter.

Two columns exist only on desktop and only where a heading sits beside its content:
- **Hero copy:** 1fr and minmax(280px, 0.55fr) with a 64px gap; the question spans both, the H1 sits left, the support aligns to its baseline on the right.
- **Service rows:** two equal columns; name and quoted problem left, answer and tags right.
- **Mechanism:** chain statements left, verdict right, two equal columns with a clamp(64px, 8vw, 128px) gap.
- **Steps and FAQ:** heading column 0.8fr, content 1.2fr, clamp(48px, 6vw, 96px) gap; the heading sticks 40px below the bar, and the first row drops its rule and top padding to align with it.

The hero ends in the convergence band: channel names in four equal columns over a 1px rule, a 9px node under each, and the CTA a clamp(110px, 9.4vw, 140px) drop below so the lanes have room to converge. The note follows under the button and a centered fine-print band on its own rule closes the hero.

Breakpoints: phones up to 719px, tablet 720 to 899px (single column, full bar, no spine), desktop from 900px. On phones the bar becomes two rows (wordmark and compact CTA, then the nav on its own rule), a 2px progress line under the bar replaces the spine, the hero question breaks into two lines, channel columns tighten to a 4px gap, and both large CTAs go full width with a 16px label.

### Named Rules
**The Width-Only Rule.** Layout spacing is width-based: px and vw clamps only, never vh, svh or dvh. The viewport height can change at any moment (mobile address bars, full-page captures) and must never move a lane, node or button. The only height-relative value is the scroll line at 55% of the viewport that decides when nodes light.

**The Heading-Beside Rule.** Desktop uses two columns only where a heading or the chain sits beside its own content. Everything else is one column; nothing is gridded into tiles.

**The Authored Phone Rule.** Phones are a composition, not a shrink: one column from the same DOM and copy, full-width CTAs, the progress line in place of the spine.

## Elevation & Depth

The system is flat. There are no elevation shadows, no cards, no gradients and no blur. Depth is only stacking order: labels, nodes and buttons sit above the lane layer, paper-filled nodes mask the lanes passing beneath them, and the navy night block is the single tonal shift on the page.

### Shadow Vocabulary
- **Arrival ring** (`box-shadow: 0 0 0 0 rgb(92 225 198 / 0.55)` expanding to `0 0 0 14px rgb(92 225 198 / 0)`): a zero-blur spread animated around the arrival dot on every large CTA, 1.8s, repeating. It is motion, not elevation, and it stops under reduced motion.

### Named Rules
**The Flat Paper Rule.** Surfaces never lift. Separation is a 1px rule; emphasis is size, weight or the night block. A box-shadow appears only as the arrival ring: zero blur, expanding spread, fading to transparent.

## Shapes

Three forms make up the whole page: straight 1px rules that run the full measure with square ends; gently rounded rectangles for buttons (10px, 8px on the compact bar button); and circles for every node. The lanes are the only curves: cubic Béziers in the hero and the close, and in the mechanism straight runs joined by 24px quarter-turns, like a trace on a circuit board. Strokes are 1.25px for lanes, 1.5px for node outlines, 2px for the spine, progress line and focus outline (offset 3px, 4px corners).

Node sizes: 9px at the channel origins and on the chain, 12px for section headings on the spine, 8px for service rows on the spine, 44px for step numerals, 10px for the arrival dot; pulses are 4.5px radius and the lane end 5px.

### Named Rules
**The Node Rule.** A circle always means a point on the path. Every node is a paper-filled circle with a 1.5px ink outline; lit, it fills with the signal. Circles are never decoration, avatars or icon frames.

**The Button-Only Radius Rule.** Only buttons round their corners. Sections, rows, lists and the night block are square-edged; containers are rules, not boxes.

## Components

### Buttons
Calm, solid and unmistakable: one weight of label, one shape, no chrome.
- **Shape:** gently rounded (10px).
- **Primary (lane-end CTA):** Ink Navy with a white 17px label at 650, 60px minimum height, 16px 28px padding, centered text. Every large CTA sits at the end of a lane and carries the arrival dot: a 10px Signal Mint circle centered on its top edge with the arrival ring.
- **Hover / Active / Focus:** hover shifts to Ink Lift over 200ms on `cubic-bezier(0.16, 1, 0.3, 1)`; active presses down 1px; focus shows a 2px outline offset 3px (Ink Navy on paper, Signal Mint on navy).
- **Compact (bar):** Ink Navy, white 14px label at 600, 11px 16px padding, 8px corners, no arrival dot; on phones 13px with 9px 12px padding.
- **Signal (closing):** Signal Mint with an Ink Navy label, Pale Mint on hover; it exists only on the night block. On phones both large CTAs run full width.

### Tags and Fine Print
- **Style:** Label role in Muted Ink, uppercase, with no background, border or chip shape. Items are joined with bound middle dots.
- **Placement:** tags follow a service answer; the fine-print band closes the hero, centered, on its own 1px rule.

### Rows (in place of cards)
- **Corner Style:** square.
- **Background:** none; rows sit directly on paper.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** a 1px Hairline top rule per row; the FAQ list also closes with a bottom rule.
- **Internal Padding:** `row` for services, `row-tight` for steps, 24px for FAQ summaries.

### Step Rows
- A 44px numeral node (Funnel Display 19px at 650) spans the title and text rows; title in the subtitle role, text at 52ch.
- **Lit:** once the row passes the scroll line, outline and fill turn Signal Mint under an ink numeral, over 400ms.

### Disclosure (FAQ)
- Native details and summary with the marker removed, in the question role, with 56px of right padding for the toggle.
- The toggle is a plus built from two 18 by 2px bars in the current text color; opening rotates the vertical bar flat into a minus over 260ms. The first question is open by default; answers run in Muted Ink at 60ch.

### Navigation
- **Bar:** sticky, Cool Paper with a 1px Hairline bottom rule, 72px tall; wordmark left, nav links centered (underline on hover only), compact CTA right.
- **Phones:** 58px bar in two rows; the nav moves under its own rule, left-aligned with 22px gaps at 14px; a 2px Deep Mint progress line along the bar's bottom edge scales with page scroll.
- **Footer:** Ink Navy with Night Text at 14px under a single Night Rule; locality line left, legal links right.

### Lanes (signature)
Lanes are SVG paths computed from the rendered boxes of their start and end elements. Each section's lanes redraw only when that section resizes, so nothing drifts behind its nodes. Strokes are 1.25px Ink Navy at 28% opacity on paper and Night Text at 40% on navy, with no fill.
- **Convergence (hero):** four cubic lanes from the node under each channel name to the top center of the booking button, control points at 58% of the drop. A 4.5px Deep Mint pulse travels each lane in 3.6s, staggered 0.9s per lane, eased `0.45 0 0.25 1`, fading in over the first 10% and out over the last 12%.
- **Trace (mechanism):** one lane through the four chain nodes. Side by side, it leaves the last node downward, runs 22px under its line, turns on 24px quarter-radii and rises between the columns into the verdict's first line, 24px left of the heading. Stacked, it drops straight to 16px above the verdict. It ends in a 5px Signal Mint dot; its pulse runs 5.2s.
- **Finale (close):** from the spine's position straight down the night block, curving in its last 40px into the top center of the mint CTA, with a Signal Mint pulse every 4.4s.
- **Spine (desktop):** a 2px Hairline track that fills with Deep Mint down to the scroll line. Section headings carry 12px nodes and service rows 8px nodes on it; nodes above the line fill Deep Mint over 400ms. Step rows light their own numerals instead of a spine node.
- **Reduced motion:** pulses are neither drawn nor shown, arrival rings stop, transitions collapse to near zero and smooth scrolling is off. Every lane, node and the scroll-linked spine fill remain.

**The Lane Rule.** Every lane begins at something BELIVIN does and ends in an action or a verdict. A lane that ends nowhere is decoration and does not ship.

**The Lanes Stay Rule.** Reduced motion removes travel (pulses, arrival rings, transitions), never the path, and content never waits on animation timing.

## Do's and Don'ts

### Do:
- **Do** end every lane in an action or a verdict, and give every large CTA a lane ends in the Signal Mint arrival dot.
- **Do** compute lanes from rendered element boxes and redraw a section's lanes only when that section resizes.
- **Do** use Ink Navy for the primary CTA on paper (60px minimum height, 10px corners, white 17px label).
- **Do** use Deep Mint for any signal mark on paper; keep bright Signal Mint for fills under ink, arrival accents and the night block.
- **Do** separate everything with 1px rules: Hairline on paper, Night Rule on navy.
- **Do** keep spacing in px and vw clamps, reusing the `section`, `stack`, `row` and `row-tight` steps.
- **Do** go two columns only where a heading sits beside its content, and author phones as one column with full-width CTAs.
- **Do** bind every separator in tags and fine print to the preceding item with a non-breaking space.
- **Do** set headings in Funnel Display at 700 to 780 with negative tracking and balanced, deliberate line breaks; set reading text and controls in Funnel Sans.

### Don't:
- **Don't** set text in mint anywhere; bright mint on paper measures 1.48:1.
- **Don't** add a second accent hue or use mint as decoration, highlight or background area.
- **Don't** put a mint button on paper; the mint CTA belongs only to the night close.
- **Don't** use cards, boxed containers, drop shadows, gradients or glow.
- **Don't** put eyebrows, kickers or category labels above headings.
- **Don't** use vh, svh or dvh for layout spacing.
- **Don't** build agency bento grids, logo marquees or neon on black.
- **Don't** hide lanes or content under reduced motion; remove only the travel.
