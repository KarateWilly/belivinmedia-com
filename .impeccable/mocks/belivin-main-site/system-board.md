# BELIVIN Auftragszentrale — System Board

APPROVED_COMP: `.impeccable/mocks/belivin-main-site/comp-b4-auftragslauf-final.png`
VIEWPORT: `1672×941`

## Palette

| Rolle | Werte | Einsatz |
|---|---|---|
| Graphit | `#171a18`, `#202421`, `#2a2d29` | durchgehende Arbeitsfläche |
| Papier | `#e8ddc8`, `#f2eadb` | Hängescheine, Proof-Innenfläche |
| Aluminium | `#9b9a91`, `#b8b6ae`, `#d0cec4` | Rails, Clips, Rahmen, Schrauben |
| Statusgrün | `#193d2c`, `#244b37`, `#315e46` | GESEHEN/VERSTANDEN/ANGEFRAGT, Iconplatten |
| Auftragsorange | `#e95611`, `#f36a16` | primärer CTA, Links, Nav-Punkte |
| Tinte hell | `#f2efe7` | Display auf Graphit |
| Tinte dunkel | `#161815` | Text auf Papier/Orange |

## Typografie

- `Archivo Variable`, native `font-stretch: 62%`, Gewicht 700: Headline, Navigation, Schilder, Produktnamen, CTA.
- `IBM Plex Sans Condensed 400`: Support, Mechanismus, Proof und Produkt-WIIFM.
- Display bleibt schmal, hoch und werkstattnah; kein Arial/Impact/Systemfont-Ersatz.
- Browserbeweis: `.impeccable/mocks/belivin-main-site/type-proof-browser.png`; Archivo wurde bei 1:1-Crop akzeptiert, IBM Plex Condensed als Display verworfen.
- Header-Navigation ca. 27 px, Hero-Headline ca. 58–66 px, CTA ca. 54 px, Schilder 29–32 px, Body 20–27 px bei 1672 px.

## Komponenten

1. **Header-Rail** — Logo links, vier Navpunkte mittig, Region rechts; verschraubte Metallkante.
2. **Headline-Feld** — keine Box; Text direkt auf Graphit.
3. **Statusmodul ×3** — grüne Emailleplatte, Metallclip, Papierzettel, SVG-Symbol, kurzer Satz.
4. **Auftragsroute** — handgezeichnet wirkende weiße Linien/Arrows als authored SVG, keine Unicode-Pfeile.
5. **CTA-Ticket** — physischer orangefarbener Träger mit Clip und Rail-Überlagerung; gesamter Bereich klickbar.
6. **Proof-Prüfmonitor** — tiefer Aluminiumrahmen; echte SHK-Weboberfläche im Live-Fenster; semantischer Link.
7. **Produktfeld ×3** — identische Geometrie, grüne SVG-Iconplatte, Headline, ein WIIFM-Satz.

## Materialbindung

- Ein durchgehendes Raster-Materialstage trägt Graphit, Papier, Rails, Clips, Ticket, Proof-Rahmen, Schrauben, Kantenlicht und Gebrauchsspuren.
- Proof-Innenfenster erhält Alpha und zeigt darunter den echten Chromium-Screenshot der bestehenden SHK-Route bei 1280×720 vollständig per `contain`.
- Text, Links und SVG-Symbole liegen oberhalb der Materialstage.
- CTA-Text bleibt semantisch; Tickettext wird aus dem Materialasset entfernt.

## Z-Order

1. Basisgraphit.
2. Live SHK-Proof hinter transparentem Rahmenfenster.
3. Raster-Materialstage mit Rails, Papier, Metall, Ticket und Proof-Rahmen.
4. Route/Symbole als SVG.
5. Semantische Texte und Links.
6. Fokus-/Hover-Zustände.

## Verbotene Ersatzmittel

- keine CSS-Textur aus Gradients;
- keine Standard-Cards;
- kein rounded orange button;
- keine Emoji-/Unicode-Icons;
- kein totes Comp-Bild als komplette Seite;
- keine neue Material-, Radius- oder Schattenfamilie.
