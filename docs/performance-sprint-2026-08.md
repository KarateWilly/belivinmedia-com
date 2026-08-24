# BELIVIN MEDIA Performance- und Analytics-Sprint

Stand: 10. August 2026
Quellbaseline: `f8a53ec634c212463fa37d3b4959067bd7701d20`
Integrationsbasis nach Live-Recheck: `976d66f5d3220f90efb8a65aaab77d4a64679fe8`

Dieser Bericht enthält keine Tokens, Team-IDs, Deployment-IDs, IP-Adressen oder personenbezogenen Analysedaten.

## Produktionsbaseline

| Messpunkt | Vor dem Sprint | Nach dem Release |
| --- | ---: | ---: |
| Vercel-Requests, 30 Tage | ca. 12.834 | neue 7-/14-Tage-Stichprobe ausstehend |
| Web Analytics | deaktiviert, keine Events | **aktiv; Intake und Aggregation verifiziert** |
| Speed Insights | deaktiviert | bleibt deaktiviert |
| RUM LCP / CLS / INP | keine belastbare BELIVIN-Stichprobe | ausstehend |

Der Git-basierte Produktionsrelease ist erfolgt. Die Feldwerte und das neue 30-Tage-Volumen werden erst bei ausreichender Stichprobe ergänzt; kleine Samples werden ausdrücklich als niedrig-konfident gekennzeichnet.

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

## Produktionsmessung über Cloudflare

Nach dem Git-basierten Release wurde Lighthouse 13.0.1 direkt gegen `https://belivinmedia.com/` ausgeführt. Diese Einzelruns sind ein zusätzlicher Labornachweis über die reale CDN-Kette und kein Ersatz für die spätere RUM-Stichprobe.

| Kennzahl | Mobile Produktion | Desktop Produktion |
| --- | ---: | ---: |
| Performance | **98** | **100** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| FCP | 836 ms | 333 ms |
| LCP | **2.384 ms** | **493 ms** |
| CLS | **0** | **0** |
| TBT | **0 ms** | **0 ms** |
| Initiale Übertragung | 248.689 B | 142.789 B |

Der mobile Produktionsrun erfüllt Performance-, LCP- und CLS-Ziel. Lighthouse bewertet SEO mit 92 statt 100, ausschließlich weil die von Cloudflare verwaltete `Content-Signal`-Erweiterung in `robots.txt` als unbekannte Direktive gilt. Suchmaschinenzugriff, `Allow: /` und Sitemap bleiben vorhanden; die Meldung ist kein blockierter Indexzugriff.

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

- HTML-, CSS- und JavaScript-Syntax, TypeScript-Check, fünf Analytics-Unit-/Browser-Tests und ein Critical-CSS-Paritätstest.
- Responsive QA in Chromium und WebKit über 49 Viewports, beide Motion-Modi, 150 % und 200 % Textskalierung sowie Keyboard-Menüführung. Browserphasen laufen isoliert, damit ein Engine-Prozess auch unter paralleler Host-Last vollständig freigegeben wird.
- Die sechs Hero-Derivate wurden gegen das kanonische Artwork skaliert verglichen (SSIM 0,992 bis 0,995); das Responsive-Gate akzeptiert nur die sechs freigegebenen Quellen und prüft den dimensionsnormalisierten Tür-Fokalpunkt.
- Visuelle Browserprüfung bei 320×568, 390×844, 768×1024 und 1440×900.
- Keine horizontale Überläufe, keine abgeschnittenen semantischen Inhalte, sichtbare Fokuszustände und 44-Pixel-Mindestziele.
- Der Browsertest bestätigt fünf repräsentative Conversion-Aktionen einschließlich aller drei Calendly-Platzierungen und prüft den serialisierten Queue-Inhalt auf PII und Ziel-URLs.

## Nach dem Deployment

Produktionscommit `d82e7690e9744574cc5f910fa2db899126302504` wurde am 10. August 2026 nach grünen GitHub- und Vercel-Gates aus `main` ausgerollt.

- Web Analytics Basic ist im exakten BELIVIN-Projekt aktiv; Speed Insights bleibt aus.
- Über `belivinmedia.com` und die vorgeschaltete Cloudflare-Schicht lieferten Startseite, Analytics-Skript, Stylesheet, Hero-Asset und Datenschutzseite jeweils HTTP 200.
- Ein Pageview sowie alle fünf erlaubten Eventvarianten wurden ohne PII über die Produktionsdomain mit HTTP 200 angenommen. Die Vercel-Metrik bestätigte anschließend einen Pageview, drei `calendly_click`, einen `case_study_click` und einen `email_click`. Diese fünf bekannten synthetischen Events gehören zum Release-Nachweis und werden bei der ersten Geschäftsauswertung separat ausgewiesen.
- Das produktive HTML enthält den Analytics-Loader, die eng begrenzte Eventlogik und den Critical-CSS-Paritätsfix.

Offen bleibt ausschließlich die zeitabhängige Feldabnahme: Nach 7 und 14 Tagen werden Pageviews, echte Eventzahlen, mobile Stichprobengröße und verfügbare Feldmetriken ergänzt. Akzeptanz bleiben keine PII in Events, mobile p75 LCP unter 2,5 s und CLS unter 0,05 bei ausreichender Stichprobe.

## 7-Tage-Feldabnahme

Nachgeholt am 18. August 2026 um 17:03 Uhr CEST. Das ausgewertete Produktionsfenster reicht vom Analytics-Release am 10. August 2026 um 17:00 Uhr bis zum Erfassungszeitpunkt. Die Abnahme ist **nicht bestanden**, weil ein späterer Redesign-Release die produktive Telemetrie entfernt hat.

### Stichprobe und Conversion-Events

| Messpunkt | Rohwert | Bereinigung / Bewertung |
| --- | ---: | --- |
| Pageviews | 10 | Darin ist ein bekannter synthetischer Release-Pageview enthalten; damit bleiben höchstens 9 nicht-synthetische Pageviews. |
| Besucher | 8 | Keine belastbare Besucherbereinigung möglich; insgesamt niedrige Konfidenz. |
| Desktop / Mobil | 86 % / 14 % | Entspricht bei nur acht Besuchern ungefähr sieben Desktop- und einem Mobilbesucher; nicht belastbar. |
| `calendly_click` | 3 | Alle drei sind die dokumentierten synthetischen Events: je 1× `nav`, `hero` und `closing`; echte Conversions: **0**. |
| `case_study_click` | 1 | Dokumentiertes synthetisches Event mit `project: bestlife` und `placement: customer_proof`; echte Conversions: **0**. |
| `email_click` | 1 | Dokumentiertes synthetisches Event mit `placement: footer`; echte Conversions: **0**. |

Die fünf Custom Events entsprechen in Typ, Anzahl und erlaubten Eigenschaften vollständig dem Release-Nachweis. Es gibt daher im Messfenster keine belegte echte Conversion. Namen, Kontaktdaten, Freitext oder vollständige Ziel-URLs wurden nicht als Eventeigenschaften erfasst.

Das separate Vercel-Siebentagefenster vom 11. bis 18. August enthält fünf Besucher, sechs Pageviews und keine Custom Events. Das bestätigt, dass alle fünf Events ausschließlich im älteren Release-Verifikationsintervall liegen.

### Produktions- und Telemetriezustand

- Der aktuelle Produktionscommit ist `5cb3acca1dd05155354ec9938621f1c96d40ef0c`; `main` und das READY-Production-Deployment stimmen überein. Dieser Stand wurde am 14. August 2026 um 18:06 Uhr CEST ausgerollt und ist ein Nachfolger des Analytics-Releases `d82e7690e9744574cc5f910fa2db899126302504`.
- Hauptdomain und Datenschutzseite liefern HTTP 200. Das Vercel-Analytics-Skript ist providerseitig erreichbar und Web Analytics ist im Projekt weiterhin aktiviert.
- Das aktuelle Produktions-HTML bindet den Analytics-Loader jedoch nicht mehr ein und enthält auch die drei Eventnamen beziehungsweise die erlaubte Eventlogik nicht. Seit dem aktuellen Production-Deployment wurden deshalb **0 Pageviews und 0 Custom Events** aufgenommen.
- Die aktuelle Datenschutzerklärung beschreibt entsprechend wieder, dass derzeit keine eigenen Analyse-, Marketing- oder Profiling-Dienste eingesetzt werden. Es besteht damit kein Widerspruch zwischen der aktuellen Seite und ihrer aktuellen, faktisch inaktiven Telemetrie; der Sprint-Messvertrag wurde aber zurückgenommen.
- Speed Insights ist weiterhin deaktiviert und kein Speed-Insights-Loader vorhanden. LCP-, CLS- und INP-Samples betragen jeweils 0; mobile und Desktop-p75-Werte sind daher nicht verfügbar.
- Im vollständigen Fenster wurden 348 HTTP-403-Antworten als erwartete WAF-/Bot-Denies, 396 HTTP-404-Antworten als Bot-/Not-found-Kategorien und eine HTTP-405-Antwort erfasst. Es gab **0 HTTP-5xx** und keine Runtime-Error-Cluster. Die Schutzantworten sind kein belegter Anwendungsfehler.

### Abnahmeurteil

Die synthetische Performance-Baseline vom 10. August bleibt als Labornachweis bestehen. Eine belastbare Feldbewertung der dort veröffentlichten Seite ist wegen der sehr kleinen Stichprobe, des späteren Redesigns und des Telemetrieabbruchs nicht möglich. Insbesondere können die Ziele mobile p75 LCP unter 2,5 Sekunden und CLS unter 0,05 nicht anhand von Produktions-RUM bestätigt werden.

Vor einer neuen Feldabnahme müssen Analytics-Loader, eng begrenzte Eventlogik und die faktische Analytics-Offenlegung gemeinsam in den aktuellen Redesign-Stand zurückgeführt und produktiv verifiziert werden. Der Messzeitraum beginnt danach neu; eine Auswertung am 24. August kann ohne vorherige Wiederherstellung nur den weiterhin fehlenden Messzustand bestätigen.

## 14-Tage-Feldabnahme

Durchgeführt am 24. August 2026 um 20:00 Uhr CEST. Das exakte Auswertungsfenster reicht vom Analytics-Release am 10. August 2026 um 17:01 Uhr bis zum Erfassungszeitpunkt. Die Abnahme ist **nicht bestanden**: Der am 18. August dokumentierte Telemetrieabbruch besteht unverändert fort.

### Stichprobe und Conversion-Events

| Messpunkt | Rohwert | Bereinigung / Bewertung |
| --- | ---: | --- |
| Pageviews | 10 | Enthält einen dokumentierten synthetischen Release-Pageview; damit bleiben höchstens 9 nicht-synthetische Pageviews. Seit dem Redesign-Release kamen 0 Pageviews hinzu. |
| Besucher | 8 | Keine belastbare Besucherbereinigung möglich; seit dem Redesign-Release kamen 0 Besucher hinzu. Insgesamt niedrige Konfidenz. |
| Desktop / Mobil | 86 % / 14 % | Entspricht bei nur acht Besuchern ungefähr sieben Desktop- und einem Mobilbesucher; wegen `n < 30` nicht belastbar. |
| `calendly_click` | 3 | Je 1× `nav`, `hero` und `closing`; alle drei sind dokumentierte synthetische Release-Events. Echte Conversions: **0**. |
| `case_study_click` | 1 | Dokumentiertes synthetisches Event mit `project: bestlife` und `placement: customer_proof`. Echte Conversions: **0**. |
| `email_click` | 1 | Dokumentiertes synthetisches Event mit `placement: footer`. Echte Conversions: **0**. |

Typ, Anzahl und Eigenschaften der fünf Custom Events sind identisch zum Release-Nachweis. Es gibt daher auch nach 14 Tagen keine belegte echte Conversion. Namen, Kontaktdaten, Freitext oder vollständige Ziel-URLs wurden nicht als Eventeigenschaften erfasst.

### Produktions-, Performance- und Telemetriezustand

- Der Produktionscommit ist weiterhin `5cb3acca1dd05155354ec9938621f1c96d40ef0c`; `main` und das READY-Production-Deployment stimmen überein. Hauptdomain, Startseite und Datenschutzseite liefern HTTP 200.
- Web Analytics ist im Projekt providerseitig aktiviert und der offizielle Skriptendpunkt ist erreichbar. Das ausgelieferte Produktions-HTML enthält jedoch weder den Analytics-Loader noch die drei erlaubten Eventnamen. Seit dem Redesign-Deployment am 14. August 2026 um 18:06 Uhr CEST wurden deshalb **0 Besucher, 0 Pageviews und 0 Custom Events** erfasst.
- Die Datenschutzerklärung beschreibt faktisch passend zum aktuellen Stand weiterhin, dass derzeit keine eigenen Analyse-, Marketing- oder Profiling-Dienste eingesetzt werden. Der Sprint-Messvertrag selbst bleibt damit jedoch außer Betrieb.
- Speed Insights ist deaktiviert und kein Speed-Insights-Loader vorhanden. Für Mobile und Desktop betragen die Samplegrößen für LCP, CLS und INP jeweils `n = 0`; p75-Werte sind nicht verfügbar.

| Gerät | LCP p75 | CLS p75 | INP p75 | Samplegröße je Metrik |
| --- | ---: | ---: | ---: | ---: |
| Mobil | nicht verfügbar | nicht verfügbar | nicht verfügbar | 0 |
| Desktop | nicht verfügbar | nicht verfügbar | nicht verfügbar | 0 |

Die offizielle Produktionsmetrik enthält im exakten Fenster 5.744 Requests: 3.712× 2xx, 281× 3xx und 1.751× 4xx. Die 4xx verteilen sich auf 1.024 erwartete WAF-Denies, 722× 404 und 5× 405; 721 der 404 sind als `not_found` und eine als extern klassifiziert. Es gab **0 HTTP-5xx** und keine Runtime-Error-Cluster.

### Abnahmeurteil und nächster Messzyklus

Domain- und HTTP-Stabilität sind mit 0 HTTP-5xx grün, und Speed Insights bleibt wie entschieden aus. Das zentrale Analytics-Gate ist rot: Ohne produktiven Loader und erlaubte Eventlogik können weder Traffic noch Conversions oder Feldperformance der aktuellen Seite gemessen werden. Die 14-Tage-Feldabnahme kann deshalb weder das Conversion-Tracking noch die Ziele mobile p75 LCP unter 2,5 Sekunden und CLS unter 0,05 bestätigen.

Für eine belastbare neue Feldabnahme müssen Loader, Event-Allowlist und faktische Datenschutzhinweise gemeinsam in den aktuellen Redesign-Stand integriert, durch Cloudflare bis Vercel verifiziert und anschließend über einen neuen 7-/14-Tage-Zyklus gemessen werden. Die historischen fünf synthetischen Events bleiben dabei dauerhaft von echten Conversions ausgeschlossen.
