# BELIVIN MEDIA Deploy-Checkliste

## Vor einem Go-Live

- [ ] Foto, Namensnennung und Referenztext von Cristina Hubrath schriftlich freigeben.
- [ ] Unternehmensangaben, Registrierungsnummer und Kontaktadresse prüfen.
- [ ] Datenschutzhinweise gegen die tatsächlich aktiven Vercel- und Cloudflare-Einstellungen prüfen.
- [ ] UAE-Struktur, möglichen EU-Vertreter und zuständige Datenschutzaufsicht juristisch prüfen lassen.
- [ ] Calendly-Ziel und externe Links erneut aufrufen.
- [ ] `npm ci` und anschließend `npm run qa` vollständig grün ausführen.
- [ ] Desktop, Mobile, Tastaturbedienung, reduzierte Bewegung, `robots.txt` und `sitemap.xml` prüfen.
- [ ] Den Hero zusätzlich auf einem echten iPhone und Android-Gerät in Hoch- und Querformat prüfen.

## Lokale Vorschau

```bash
python3 -m http.server 4318 --bind 127.0.0.1
```

Danach `http://127.0.0.1:4318/` öffnen.

## Verbindliches Responsive-Gate

```bash
npm ci
npm run qa
```

Das Gate prüft Startseite, Impressum und Datenschutz in Chromium und WebKit auf sieben Größen von 320 px bis 1920 px, inklusive Handy-Querformat. Es kontrolliert horizontalen Überlauf, geladene Schriften, Konsolen- und Seitenfehler, Anfragen an Drittanbieter, lokale Links und Sprungmarken, Trefferflächen ab 24 px, sichtbaren Tastaturfokus, Layout-Shift, die gezeichneten Kundenweg-Linien und den Check-Button im ersten Screen. Fehler-Screenshots landen ausschließlich unter `output/responsive-qa/` und werden nicht veröffentlicht. Lokal kann `QA_ENGINES=chromium` den Lauf eingrenzen; für den Release laufen immer beide Engines.

Design- und Ablaufregeln stehen in `AGENTS.md`, das Designsystem in `DESIGN.md`, der aktuelle Stand in `.impeccable/site-gate.json` (`npm run handoff:check`).

## Veröffentlichung

Die Domain läuft derzeit über Cloudflare vor Vercel. `main` löst den Produktions-Deploy automatisch aus; deshalb muss das lokale Responsive-Gate **vor** dem Push grün sein. Der GitHub-Workflow wiederholt dieselben Prüfungen, ersetzt bei einer direkten `main`-Veröffentlichung aber keine vorgeschaltete lokale Freigabe. `.vercelignore` hält Design-, Test- und QA-Artefakte aus dem Deployment.

## Markenfarben

- Navy: `#212162`
- Mint: `#5CE1C6`
- Steel: `#A7BBCA`
