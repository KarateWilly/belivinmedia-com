# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are owners and decision-makers of local German trades businesses. They usually arrive from a cold but individually relevant outreach email, often open the link on a phone, and need to judge BELIVIN's quality within seconds.

BELIVIN itself uses the showroom to validate one trade and one finished design at a time before investing in additional template worlds or industries.

## Product Purpose

BELIVIN MEDIA's public website explains and sells its website service. Its industry showrooms demonstrate what a finished website for a specific trade could look like without pretending that a cold lead has already received a personalized build.

The current objective is one production-ready SHK example. As soon as it is approved, it can be sent to one suppression-checked third of the qualified SHK lead population. A second and third fixed design may be added later for the remaining thirds.

Success means that a recipient immediately recognizes the SHK context, trusts the visible craft level on both desktop and mobile, understands that this is an example direction, and requests the same quality for their own business.

## Positioning

The showroom is a truthful pre-sale demonstration, not a lead-specific demo generator and not a generic theme catalogue. Each industry receives a small number of authored, fixed example websites. Company-specific identity, copy, proof and implementation begin only after genuine interest or collaboration.

## Operating Context

- Initial SHK entry point: `/beispiele/shk/`.
- First example: `/beispiele/shk/design-1/`.
- The route is initially link-only, `noindex`, omitted from navigation and sitemap, but remains a real production-quality public page.
- Later publication requires only an explicit navigation/indexing decision, not a new renderer or hosting project.
- The existing `belivinmedia.com` Vercel project and domain remain the only public deployment target.
- The private `belivin-waas` project remains responsible for lead research, revalidation, suppression and campaign staging; it does not render public examples.

## Capabilities and Constraints

- Static HTML and isolated template-local CSS in the existing BELIVIN repository.
- No lead JSON, private manifests, runtime logo swaps, per-lead routes or personalization code.
- The showroom shell may be shared; composition, typography, imagery, interaction, mobile translation and visual system are authored independently for every template world.
- The first template must be completed as one vertical slice before a second template or industry begins.
- Desktop and mobile first viewports are separate approved compositions. Mobile is never an automatic crop, shrink or rearrangement of the desktop page.
- Final hero and key section imagery must use the highest available generation quality, normally a high-resolution/upscaled pass suitable for 2K–4K source production. Desktop landscape and mobile portrait assets are generated separately for their approved compositions.
- Image acceptance requires visual review for realism, technical SHK plausibility, sharpness, anatomy, tools, equipment placement, lighting, perspective, text/logo artifacts, quiet HTML overlay regions and crop resilience. Resolution and file validity alone never approve an image.
- Final delivery encodes responsive AVIF/WebP variants from approved source assets without using CSS or HTML to conceal weak generation quality.
- The example uses a designed generic identity such as `IHR SHK-BETRIEB`, `SANITÄR · HEIZUNG · KLIMA`, `IHRE REGION` and `IHRE TELEFONNUMMER`; these surfaces must look intentional rather than like unfinished wireframes.
- No invented ratings, review counts, founding years, certifications, guarantees, project totals, response times, emergency availability, partnerships, customer names or potentially real contact details.
- Any workwear mark is a fixed, controlled part of an approved source image, never a runtime overlay. Generated text is not trusted for final typography.
- BELIVIN interest actions lead directly to the approved Calendly website-check route; no redundant intermediate CTA.
- No public deployment, outreach release or provider spend occurs without the relevant explicit approval.

## Brand Commitments

- Parent brand: BELIVIN MEDIA.
- Public voice is direct, commercially clear and customer-outcome-led; internal frameworks and production notes never appear on the public surface.
- The existing BELIVIN main-site visual system remains intact. SHK example pages may establish independent trade-specific visual worlds inside a restrained BELIVIN showroom frame.
- BELIVIN may truthfully position itself as a local Rheingau/Rhein-Main web agency while contracts, invoices and payments run through BELIVIN MEDIA FZCO in Dubai as disclosed in the imprint.

## Evidence on Hand

- Existing BELIVIN website, legal pages, analytics and responsive QA harness in this repository.
- Existing direct Calendly event: `https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check`.
- No approved SHK customer case study, project gallery, ratings, awards or performance outcomes are available for the example and none may be fabricated.
- Synthetic SHK photography may demonstrate category and craft context but must never be represented as a real customer project.

## Product Principles

1. Money-in before inventory: ship and test one complete template before building more.
2. Show finished quality, not personalization theatre.
3. One branch earns expansion before another branch begins.
4. Mobile is an authored sales surface, not desktop damage control.
5. Visual quality is a human-reviewed release requirement; technical compliance is only the floor.

## Accessibility & Inclusion

The public surface targets WCAG 2.2 AA: semantic structure, keyboard operation, visible unobscured focus, sufficient contrast, reduced-motion support, 200% text zoom/reflow, comfortable mobile touch targets, and no horizontal scrolling at 320px.
