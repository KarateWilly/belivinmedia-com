# Kundenweg — Medium Inventory (approved comp → production)

Approved comp: `comp-kundenweg/` (Mario, 2026-10-29). Production transfers the comp source; no element is re-imagined.

| Ingredient | Medium | Production source |
|---|---|---|
| Bar: wordmark, nav, small booking button | Semantic HTML + CSS | `index.html`, `styles.css` |
| Scroll progress under the bar (phones) | CSS + JS transform | `site.js` |
| Lead question, H1 (2 lines desktop), support | Semantic HTML, Funnel Display / Funnel Sans | `index.html` |
| Four channel labels with source nodes | Semantic list + CSS pseudo-element nodes | `index.html`, `styles.css` |
| Converging lanes | Inline SVG paths computed from live label/button positions | `site.js` |
| Pulses along the lanes | SVG circles with SMIL `animateMotion`; hidden under reduced motion | `site.js`, `styles.css` |
| **Primary CTA** (hero) | Semantic link, navy fill, 10px radius; mint arrival dot with ring pulse (CSS keyframes) | `index.html`, `styles.css` |
| Primary CTA (close) | Semantic link, mint fill on navy | `index.html`, `styles.css` |
| Small print | Semantic paragraph, uppercase tracking | `index.html` |
| Customer-path spine with nodes (desktop) | CSS line + JS-driven fill and lit nodes | `styles.css`, `site.js` |
| Service rows, mechanism chain, steps, questions | Semantic lists, `details/summary`; drawn plus/minus | `index.html`, `styles.css` |
| Closing field + footer | Navy field, CSS | `styles.css` |
| Fonts | Self-hosted WOFF2 (SIL OFL 1.1): Funnel Display, Funnel Sans 5.2.8 | `public/site/fonts/` |
| Raster images | None. The world has no photographic or painted material. | — |

Produce bucket: empty (no raster, no generated media, no paid provider).
