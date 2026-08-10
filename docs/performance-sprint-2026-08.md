# BELIVIN MEDIA Performance- und Analytics-Sprint

Stand: 10. August 2026
Quellbaseline: `f8a53ec634c212463fa37d3b4959067bd7701d20`
Integrationsbasis nach Live-Recheck: `976d66f5d3220f90efb8a65aaab77d4a64679fe8`

Dieser Bericht enthält keine Tokens, Team-IDs, Deployment-IDs, IP-Adressen oder personenbezogenen Analysedaten.

## Produktionsbaseline

| Messpunkt | Vor dem Sprint | Nach dem Release |
| --- | ---: | ---: |
| Vercel-Requests, 30 Tage | ca. 12.834 | ausstehend |
| Web Analytics | deaktiviert, keine Events | ausstehend |
| Speed Insights | deaktiviert | bleibt deaktiviert |
| RUM LCP / CLS / INP | keine belastbare BELIVIN-Stichprobe | ausstehend |

Die Nachher-Spalte wird erst nach einem produktiven Git-basierten Deployment, aktivierten Web Analytics und einer ausreichenden Stichprobe ergänzt. Kleine Samples werden ausdrücklich als niedrig-konfident gekennzeichnet.

## Reproduzierbare Labormessung

Lighthouse 13.0.1 mit Chrome for Testing, identische lokale Server- und Cache-Header, jeweils kalter Browserkontext. Mobile verwendet das Lighthouse-Standardprofil; Desktop das Desktop-Preset. Der lokale Analytics-Endpunkt wurde wie im Browser-Gate mit einem leeren 200-Skript ersetzt, weil `/_vercel/insights/script.js` erst auf Vercel bereitsteht.

| Kennzahl | Mobile vorher | Mobile nachher | Desktop vorher | Desktop nachher |
| --- | ---: | ---: | ---: | ---: |
| Performance | 97 | **99** | 100 | **100** |
| Accessibility | 100 | **100** | 100 | **100** |
| Best Practices | 100 | **100** | 100 | **100** |
| SEO | 100 | **100** | 100 | **100** |
| FCP | 906 ms | 1.060 ms | 245 ms | 294 ms |
| LCP | 2.556 ms | **2.110 ms** | 525 ms | **488 ms** |
| CLS | 0 | **0** | 0 | **0** |
| TBT | 0 ms | **0 ms** | 0 ms | **0 ms** |
| Initiale Übertragung | 288.515 B | **174.270 B** | 288.515 B | **175.302 B** |
| Render-blocking-Einsparpotenzial | 303 ms | **0 ms** | nicht relevant | **0 ms** |

Mobile LCP sank um rund 446 ms beziehungsweise 17 %. Die initiale Übertragung sank um rund 114 KB beziehungsweise 40 %. Der etwas spätere FCP ist im kontrollierten Einzelrun sichtbar und wird nicht verschwiegen; für die Nutzerwahrnehmung und das Sprintziel überwiegt der deutlich frühere vollständige Hero als LCP. Produktions-RUM entscheidet über die dauerhafte Bewertung.

## Technische Änderungen

- Responsive 480/768/1200-Encodings des einen kanonischen Hero-Artworks in AVIF und WebP, mit passendem `srcset`, `sizes`, intrinsischen Dimensionen und AVIF-Preload. Motiv, absolute Cover-Komposition und CSS-Fokalpunkte sind auf allen Viewports identisch zur neueren Integrationsbasis geblieben. Im mobilen Lab sank der Hero-Transfer von 22.546 B auf rund 2,4 KB.
- Kritische Header-/Hero-CSS sind inline; die vollständigen Below-fold-Styles laden nicht render-blockierend. Die Kundenfotografie lädt erst in Viewportnähe.
- Der Hero ist beim ersten Paint vollständig sichtbar. Nur Below-fold-Inhalte erhalten einen kurzen, nicht blockierenden Reveal; Reduced Motion bleibt statisch.
- Vercel Web Analytics wird auf Startseite, Impressum und Datenschutz geladen. Kein Speed-Insights-Skript wurde ergänzt.
- Custom Events verwenden eine TypeScript-geprüfte und zur Laufzeit validierte Allowlist. Unbekannte Namen, Werte und Eigenschaften werden verworfen.

Während der Umsetzung rückte `main` von der Quellbaseline auf `976d66f` vor. Der Branch wurde darauf rebasiert. Der einzige Inhaltskonflikt in `styles.css` wurde zugunsten der neueren einheitlichen Cover-Komposition gelöst; DESIGN-, Deployment- und Responsive-QA-Vertrag erlauben nun ausschließlich Größen-/Formatderivate desselben Motivs, keine Art Direction und keinen Motivwechsel.

| Event | Erlaubte Eigenschaften |
| --- | --- |
| `calendly_click` | `placement: nav | hero | closing` |
| `case_study_click` | `project: bestlife`, `placement: customer_proof` |
| `email_click` | `placement: footer` |

Namen, E-Mail-Adressen, Telefonnummern, Linktexte, Freitexte, Tokens und vollständige Ziel-URLs können über diese Schnittstelle nicht gesendet werden.

## Verifikation

- HTML-, CSS- und JavaScript-Syntax, TypeScript-Check und fünf Analytics-Unit-/Browser-Tests.
- Responsive QA in Chromium und WebKit über 49 Viewports, beide Motion-Modi, 150 % und 200 % Textskalierung sowie Keyboard-Menüführung. Browserphasen laufen isoliert, damit ein Engine-Prozess auch unter paralleler Host-Last vollständig freigegeben wird.
- Die sechs Hero-Derivate wurden gegen das kanonische Artwork skaliert verglichen (SSIM 0,992 bis 0,995); das Responsive-Gate akzeptiert nur die sechs freigegebenen Quellen und prüft den dimensionsnormalisierten Tür-Fokalpunkt.
- Visuelle Browserprüfung bei 320×568, 390×844, 768×1024 und 1440×900.
- Keine horizontale Überläufe, keine abgeschnittenen semantischen Inhalte, sichtbare Fokuszustände und 44-Pixel-Mindestziele.
- Der Browsertest bestätigt fünf repräsentative Conversion-Aktionen einschließlich aller drei Calendly-Platzierungen und prüft den serialisierten Queue-Inhalt auf PII und Ziel-URLs.

## Nach dem Deployment

1. Web Analytics im Vercel-Projekt aktivieren und das Git-basierte Deployment ausrollen.
2. Über `belivinmedia.com` und die vorgeschaltete Cloudflare-Schicht `/_vercel/insights/script.js`, Pageviews und alle drei Eventtypen prüfen.
3. Nach 7 und 14 Tagen Pageviews, Eventzahlen, mobile Stichprobengröße und verfügbare Feldmetriken ergänzen.
4. Akzeptanz: keine PII in Events, mobile p75 LCP unter 2,5 s und CLS unter 0,05 bei ausreichender Stichprobe.
