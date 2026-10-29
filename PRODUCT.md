# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML, CSS and self-hosted JavaScript in this repository, deployed through the existing `belivinmedia.com` Vercel project behind Cloudflare. Motion libraries, fonts and media are self-hosted; the release QA forbids third-party runtime requests.

## Users

Decision-makers of businesses that want more customers through digital marketing: owners, managing directors and marketing leads. The audience is deliberately broad and industry-open (decision 2026-10-29); no single industry or company size leads the surface. Visitors arrive cold, on phone or desktop, and judge within seconds whether BELIVIN looks capable enough to trust with their marketing.

## Product Purpose

BELIVIN MEDIA's public website presents BELIVIN as a full-service marketing agency and turns qualified visitors into booked first conversations. Success means a first-time visitor understands what BELIVIN does, finds the work credible and contemporary on both desktop and mobile, and books a call.

## Positioning

BELIVIN MEDIA is a classic marketing agency with a slightly technical edge: strategy, creative and technology delivered by one team. The four service pillars (confirmed 2026-10-29):

1. Websites & Landingpages: design, development and conversion pages.
2. Performance-Ads: Meta and Google campaigns with tracking.
3. Social Media & Content: strategy, video/photo production, channel management.
4. SEO & KI-Sichtbarkeit: Google, Maps, and presence in AI answers such as ChatGPT.

The previous positioning (websites for German trades, SHK industry showrooms, Handwerk outreach) is retired. Services lead the surface, not a target industry.

## Operating Context

- `belivinmedia.com` on the existing Vercel project remains the only public deployment target.
- Traffic sources for the new positioning are not yet defined; the surface must work for cold visitors without prior context.
- The SHK showroom (`/beispiele/shk/`), `beispiele/industry-registry.json` and the Handwerk outreach program are discontinued (decision 2026-10-29). Their files stay in the repository untouched until the release gate removes them from deployment; they are not proof, navigation or visual authority for the new site.
- The private `belivin-waas` project and lead pipeline are not part of this surface.

## Capabilities and Constraints

- The repository's fail-closed main-site gate (`AGENTS.md`, `.impeccable/main-site-production-gate.mjs`) governs direction, copy, comps, assets, build and release.
- Desktop and mobile are separately authored compositions from one semantic DOM. Mobile is never a crop, shrink or rearrangement of the desktop page.
- Motion and scroll choreography are welcome where they demonstrate capability, but every motion has a reduced-motion state and content is never hidden behind animation timing.
- Generated video or imagery is used only with a commercial-use licence. The current Higgsfield account is on the free plan (no commercial use); any paid generation plan or provider spend needs Mario's explicit approval first.
- Packages and prices stay off the public site until visitors can buy or book them directly.
- Open decision: the primary booking target. The existing Calendly event is `https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check`; a general first-conversation event may replace it during the copy gate.

## Brand Commitments

- Name: BELIVIN MEDIA.
- Public voice: direct, commercially clear, outcome-led German. No buzzword stacks, hedging, framework talk or internal production notes on the public surface.
- BELIVIN may truthfully present itself as based in Geisenheim / Rheingau / Rhein-Main while contracts, invoices and payments run through BELIVIN MEDIA FZCO in Dubai as disclosed in the imprint. Dubai/FZCO appears only where legally required.
- Existing identity assets: a framed monogram logo with wordmark (`public/assets/logo/Logo_text.png`, `Logo_clean.png`; raster, navy-to-light-blue gradient) and a favicon (`favicon.svg`, navy `#212162` / mint `#5CE1C6`). Whether these stay binding for the new site is an open decision for Mario.
- No prior main-site direction, composition, palette or material world is visual authority for the new site.

## Evidence on Hand

- No approved customer projects, case studies, testimonials, results, ratings, awards, partner badges or client logos are on hand. None may be invented.
- Proof regions may show BELIVIN's own demonstrable craft (the site itself, clearly labelled own demos) or ship as clearly marked placeholders on Mario's replacement list until real, approved proof exists.
- Legal pages (`impressum.html`, `datenschutz.html`, `legal.css`) exist and must match the emitted site's actual entity and data flows at release.

## Product Principles

1. The site is the first proof: its own craft, speed and motion must demonstrate what BELIVIN delivers.
2. Services lead; industries do not.
3. Truth over theatre: no invented customers, numbers or claims.
4. Mobile is an authored sales surface, not desktop damage control.
5. Visual quality is a human-reviewed release requirement; technical compliance is only the floor.

## Accessibility & Inclusion

The public surface targets WCAG 2.2 AA: semantic structure, keyboard operation, visible unobscured focus, sufficient contrast, reduced-motion support, 200% text zoom/reflow, comfortable mobile touch targets, and no horizontal scrolling at 320px.
