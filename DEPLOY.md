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

Das Gate prüft Chromium und WebKit in Hochformat, kurzem Querformat, Tablet, Desktop, Tall Desktop, Wide Desktop sowie direkt vor und nach jedem Layout-Wechsel und dem Seitenverhältnis `4/3`. Es kontrolliert nicht nur den Dokument-Scroll, sondern auch abgeschnittenen Text, lokale Clipping-Flächen, den vollständigen Hero, den CTA im ersten Viewport, die Pfeilspitze, Touch-Ziele, Menübedienung, reduzierte Bewegung und Textvergrößerung. Für den Hero erzwingt es zusätzlich ausschließlich freigegebene responsive Encodings des einen kanonischen Motivs, vollständige Bild- und Kontrastabdeckung, Copy-Bild-Überlappung und den sichtbaren Tür-Fokalpunkt. Fehler-Screenshots landen ausschließlich unter `output/responsive-qa/` und werden nicht veröffentlicht.

Für neue Hero- oder Template-Richtungen werden vor der Umsetzung zwei verbindliche First-Viewport-Comps freigegeben: Desktop und Telefon-Hochformat. Signal Cut verwendet auf allen Größen dasselbe Motiv und steuert ausschließlich Fokalpunkt, Kontrast und Typografie per CSS. Das `<picture>` liefert nur AVIF-/WebP-Größenvarianten dieses einen freigegebenen Artworks; ein separates Portrait-Motiv setzt weiterhin eine spätere freigegebene Art Direction voraus. Copy und Bild dürfen nie wieder in getrennte Hero-Blöcke zerfallen.

## Veröffentlichung

Die Domain läuft derzeit über Cloudflare vor Vercel. `main` löst den Produktions-Deploy automatisch aus; deshalb muss das lokale Responsive-Gate **vor** dem Push grün sein. Der GitHub-Workflow wiederholt dieselben Prüfungen, ersetzt bei einer direkten `main`-Veröffentlichung aber keine vorgeschaltete lokale Freigabe. `.vercelignore` hält Design-, Test- und QA-Artefakte aus dem Deployment.

## Markenfarben

- Navy: `#212162`
- Mint: `#5CE1C6`
- Steel: `#A7BBCA`
