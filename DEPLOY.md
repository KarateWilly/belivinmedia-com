# BELIVIN MEDIA Deploy-Checkliste

## Vor einem Go-Live

- [ ] Foto, Namensnennung und Referenztext von Cristina Hubrath schriftlich freigeben.
- [ ] Unternehmensangaben, Registrierungsnummer und Kontaktadresse prüfen.
- [ ] Datenschutzhinweise gegen die tatsächlich aktiven Vercel- und Cloudflare-Einstellungen prüfen.
- [ ] UAE-Struktur, möglichen EU-Vertreter und zuständige Datenschutzaufsicht juristisch prüfen lassen.
- [ ] Calendly-Ziel und externe Links erneut aufrufen.
- [ ] Desktop, Mobile, Tastaturbedienung, reduzierte Bewegung, `robots.txt` und `sitemap.xml` prüfen.

## Lokale Vorschau

```bash
python3 -m http.server 4318 --bind 127.0.0.1
```

Danach `http://127.0.0.1:4318/` öffnen.

## Veröffentlichung

Die Domain läuft derzeit über Cloudflare vor Vercel. Vor einer Veröffentlichung zuerst einen Vercel-Preview-Deploy erzeugen, die Preview prüfen und erst dann gezielt in das bestehende Produktionsprojekt übernehmen. `.vercelignore` hält Design- und QA-Artefakte aus dem Deployment.

## Markenfarben

- Navy: `#212162`
- Mint: `#5CE1C6`
- Steel: `#A7BBCA`
