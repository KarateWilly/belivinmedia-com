# BELIVIN Hauptseite — Surface Brief

MODE: Persuade
STATUS: APPROVED_COMP_BOUND
SEED: 6d6ca027
APPROVED_COMP: .impeccable/mocks/belivin-main-site/comp-b4-auftragslauf-final.png
APPROVED_COMP_SHA256: bf165deeaa2f8460484e447c4e4f040004a37155964cd14e07e25fd82e95b2e7
COPY: .impeccable/copy/belivin-main-site-approved.md
COPY_SHA256: 6e1ccd3867c69129dde449826b7dd5a0d17e62e901346675ce6e3eed241f680c
NATIVE_VIEWPORT: 1672×941

## THESIS

BELIVIN macht aus einer Website eine sichtbare Auftragszentrale: Die richtigen Menschen finden den Betrieb, verstehen sein Angebot und fragen direkt an.

## OWN-WORLD

Keine generische Agenturseite. Eine glaubhafte, hochwertige Auftragszentrale aus der Arbeitswelt deutscher Handwerksbetriebe: Graphit-Emaille, warmes Arbeitspapier, gebürstetes Aluminium, dunkelgrüne Statusschilder und genau ein Sicherheitsorange für den primären Auftrag. Physische Materialien werden nicht in CSS nachgezeichnet.

## STORY

Der erste Blick startet links mit dem Ergebnis: klare Anfragen. Die mittlere Statusroute erklärt GESEHEN → VERSTANDEN → ANGEFRAGT. Der große Website-Check-Ticketträger macht die nächste Handlung unübersehbar. Rechts beweist ein echtes SHK-Branchenbeispiel die sichtbare Website-Qualität. Der anschließende Streifen verdichtet das Angebot auf WEBSITE BAUEN, LOKAL SICHTBAR WERDEN und MEHR UMSATZ.

## FIRST VIEWPORT

Bindende Geometrie bei 1672×941:

- Header-Rail: x 0–1672, y 0–103.
- Headline/Support: x 52–449, y 169–449.
- Statusroute: x 478–993, y 164–589; drei gleich große Hängescheine.
- CTA-Ticket: x 80–714, y 576–742; überlappt die horizontale Aluminiumrail.
- Proof-Rahmen: x 1012–1651, y 120–728; transparente Innenöffnung x 1036–1630, y 177–679; große, gleichwertige zweite Fokalfläche.
- Second Fold: y 760–941; drei gleichgewichtete Produktfelder, gleiche interne Geometrie.

Die linke Headline und der rechte Proof besitzen zusammen die größte visuelle Masse. CTA und Statusroute verbinden beide horizontal. Keine Region darf zur Standard-Card werden.

## FORM

- Dunkle, durchgehende Auftragszentrale statt Containerlandschaft.
- Aluminiumrails führen horizontal durch Hero und Fold.
- Papier hängt realistisch an Metallclips; Kanten, Schatten, Abrieb und Faser sind bildnativ.
- Das orange Ticket bleibt breit, flach und physisch eingespannt. Es wird nie zum abgerundeten Webbutton.
- Der Proof sitzt in einem tiefen Metallrahmen mit einem echten Chromium-Screenshot der bestehenden SHK-Website bei 1280×720; Navigation, Headline, CTA und Foto bleiben vollständig sichtbar.
- Dunkelgrüne Statusschilder tragen komprimierte Versalien.
- Icons sind monochrome, geometrisch saubere SVGs; keine Emoji- oder Unicode-Symbole.

## READING ORDER

1. Aus Website-Besuchern werden klare Anfragen.
2. Websites fürs Handwerk.
3. GESEHEN → VERSTANDEN → ANGEFRAGT.
4. 15 Min. Website-Check — kostenlos und unverbindlich.
5. Branchenbeispiel SHK.
6. Website bauen · lokal sichtbar werden · mehr Umsatz.

## TYPE SYSTEM

- Display und Utility: Archivo Variable, native Width-Achse `62%`, Gewicht 700; selbst gehostet; im echten Browser bei 1:1-Geometrie gegen B4 geprüft.
- Body: IBM Plex Sans Condensed 400, selbst gehostet.
- Keine Systemfont als Display-Ersatz.
- Headline: große komprimierte Masse, eng geführt, exakt zwei Zeilen bei nativer Breite.
- Navigation/Schilder: Versalien, moderates Tracking, hohe Lesbarkeit.

## MATERIAL SYSTEM

- Graphit: #171a18 bis #242825, matte ungleichmäßige Emaille.
- Arbeitspapier: #e8ddc8 bis #f2eadb, sichtbare Faser und leichte Gebrauchsspuren.
- Aluminium: #9b9a91 bis #d0cec4 mit gebürsteter Richtungsstruktur und realer Beleuchtung.
- Statusgrün: #193d2c bis #2b5640, Emaille mit Metallkante.
- Auftragsorange: #e95611 bis #f36a16, nur CTA, aktive Links und kleine Navigationspunkte.
- Rastermaterial wird als Asset produziert; keine CSS-Verläufe oder Schattenstapel als Materialersatz.

## INTERACTION

- Gesamtes orange Ticket ist ein semantischer Calendly-Link.
- SHK-Proof-Titel und sichtbarer Link führen zu `/beispiele/shk/design-1/`.
- Navigation scrollt/führt zu realen Seitensektionen.
- Materialstage und Dekoration haben `pointer-events: none`; Interaktionen liegen semantisch darüber.

## SECOND FOLD SYSTEM

Drei gleich breite Felder mit gleicher Geometrie: Iconplatte links, Headline und ein kurzer WIIFM-Satz rechts. Keine vierte Karte, keine unterschiedliche Textrolle, keine variierenden Baselines.

## REMAINING DESKTOP PAGE

Nach dem Produktstreifen folgen nur drei kurze Arbeitsflächen:

1. **SO ARBEITEN WIR** — eine durchgehende horizontale Auftragsroute mit vier verbundenen Stationen: PRÜFEN, SORTIEREN, BAUEN, VERBESSERN. Keine vier Einzelkarten. Die verbindende Rail wächst visuell in Leserichtung und zeigt, dass jeder Schritt zum nächsten führt.
2. **RHEINGAU · RHEIN-MAIN** — ein großes Einsatzgebiet-Schild auf Graphit mit einem authored Standort-SVG und der kurzen Copy `Aus Geisenheim. Für Betriebe im Rheingau und Rhein-Main.` Keine Kartenansicht, keine erfundenen Standortmarker.
3. **SCHLUSSAUFTRAG** — ein breiter physischer orangefarbener Auftragsträger mit `Holt Ihre Website genug Anfragen?`, `Finden wir es in 15 Minuten heraus.` und dem semantischen Link `Website prüfen lassen` direkt zu Calendly.

Die Seite bleibt kurz. Es gibt keine zusätzliche Über-uns-Erzählung, keine Framework-Erklärung, keine erfundenen Zahlen, keinen Preisblock und keinen zweiten Proof-Katalog. Nach Proof, Angebot, Ablauf, Region und CTA ist die Verkaufsaufgabe erledigt.

## MUST NOT LITERALIZE

- Generierte Kleinsttexte im Proof werden nicht übernommen; der echte Browser-Screenshot `.impeccable/mocks/belivin-main-site/shk-design-1-live-1280x720.png` ist die Quelle.
- Das Comp-PNG wird nicht als tote Vollseiten-Hintergrundgrafik verwendet.
- Core Copy wird nicht gerastert.
- Metall, Papier, Clips, Abrieb und Ticketmaterial werden nicht mit improvisierten CSS-Gradienten nachgezeichnet.
- Keine erfundenen Funktionen, Auftragsdaten oder Statuswerte.
