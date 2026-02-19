# Belivin Media Website — Deploy Checklist

## Pflicht vor Go-Live

- [ ] Logos in `public/assets/logo/` legen:
  - `logo-with-text.png`
  - `logo-without-text.png`
- [ ] Calendly-Link ersetzen in `index.html` → suche nach `DEIN-LINK`
- [ ] Formspree-Endpoint einrichten → https://formspree.io/new → ID in `index.html` ersetzen (suche `PLACEHOLDER`)
- [ ] Impressum ausfüllen (Adresse, Geschäftsführer, Steuernummer)
- [ ] Datenschutzerklärung → https://www.datenschutz-generator.de

## Deploy auf Vercel

```bash
cd /Users/nexus/.openclaw/workspace/projects/business/belivin-media/website
npx vercel --prod
# Domain: belivinmedia.com zuweisen
```

## DNS (Cloudflare)
Nach Vercel-Deploy:
- A-Record: `@` → Vercel IP
- CNAME: `www` → `cname.vercel-dns.com`
- Vercel Dashboard → Custom Domain → `belivinmedia.com` hinzufügen

## Farben
- Navy:  #212162
- Teal:  #5ce1c6
- Steel: #a7bbca
