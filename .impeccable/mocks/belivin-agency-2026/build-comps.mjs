#!/usr/bin/env node

// Generates the three browser-native comps from the locked copy strings.
// Each comp is one responsive source; only the first-screen composition differs.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const booking = 'https://calendly.com/mario-belivinmedia/kostenfreier-15-minuten-website-check';

export const copy = {
  title: 'BELIVIN MEDIA · Marketingagentur für mehr Kunden',
  description: 'Websites, Performance-Ads, Social Media und SEO & KI-Sichtbarkeit aus einer Hand. Kostenloser 15-Minuten-Marketing-Check.',
  brand: 'BELIVIN MEDIA',
  nav: ['Leistungen', 'Ablauf', 'Fragen'],
  barAction: 'Marketing-Check buchen',
  lead: 'Ihr Marketing kostet Geld. Bringt es auch Kunden?',
  h1: ['MEHR KUNDEN.', 'AUS JEDEM KANAL.'],
  billing: ['WEBSITES', 'PERFORMANCE-ADS', 'SOCIAL MEDIA', 'SEO & KI'],
  support: 'Eine Agentur für alles, was Ihnen online Kunden bringt. Alle Kanäle greifen ineinander, und Sie sehen, was wirkt.',
  action: 'Kostenlosen Marketing-Check buchen',
  actionNote: '15 Minuten. Kostenlos. Danach wissen Sie, welcher Kanal Ihnen die nächsten Kunden bringt.',
  smallPrint: 'Konzept · Text · Design · Entwicklung · Landingpages · Meta Ads · Google Ads · Tracking · Strategie · Video · Foto · Kanalbetreuung · Google · Google Maps · ChatGPT & Co.',
  lineupLabel: 'DAS LINE-UP',
  lineupHeading: 'Vier Kanäle. Ein Ziel: Ihre nächsten Kunden.',
  acts: [
    {
      name: 'WEBSITES & LANDINGPAGES',
      problem: '„Die Website sieht okay aus. Aber kaum jemand fragt an.“',
      solution: 'Wir bauen Seiten, die in Sekunden erklären, was Sie anbieten, und Besucher zur Anfrage führen.',
      fine: 'Konzept · Text · Design · Entwicklung · Landingpages für Kampagnen',
    },
    {
      name: 'PERFORMANCE-ADS',
      problem: '„Wir schalten Werbung. Was sie bringt, weiß keiner.“',
      solution: 'Kampagnen bei Meta und Google mit sauberem Tracking. Sie sehen, welche Anzeige Anfragen bringt, und das Budget fließt dorthin.',
      fine: 'Meta Ads · Google Ads · Zielgruppen · Anzeigenmotive · Conversion-Tracking',
    },
    {
      name: 'SOCIAL MEDIA & CONTENT',
      problem: '„Social Media machen wir nebenbei. Also selten.“',
      solution: 'Wir planen, produzieren und posten. Regelmäßig und passend zu Ihrer Marke. Sie geben frei, wir machen den Rest.',
      fine: 'Strategie · Redaktionsplan · Video · Foto · Kanalbetreuung',
    },
    {
      name: 'SEO & KI-SICHTBARKEIT',
      problem: '„Wer nach uns sucht, findet die Konkurrenz.“',
      solution: 'Wir machen Sie dort sichtbar, wo Ihre Kunden suchen: bei Google, in Google Maps und in den Antworten von ChatGPT & Co.',
      fine: 'Google · Google Maps · Unternehmensprofil · Inhalte · KI-Suche',
    },
  ],
  mechanismLabel: 'DER MECHANISMUS',
  chain: [
    'Die Anzeige bringt den Klick.',
    'Die Website macht daraus eine Anfrage.',
    'Content baut Vertrauen auf.',
    'Google und KI bringen Kunden, die schon suchen.',
  ],
  verdict: 'Fehlt ein Teil, verpufft der Rest.',
  mechanismText: 'Deshalb planen wir alle Kanäle zusammen. Ein Team, ein Plan, ein Ansprechpartner.',
  stepsLabel: 'SO LÄUFT ES',
  stepsHeading: 'In vier Schritten zu mehr Kunden.',
  steps: [
    ['CHECK', '15 Minuten, kostenlos. Wir sehen uns an, wo Sie stehen und wo Ihnen Kunden verloren gehen.'],
    ['PLAN', 'Sie bekommen eine klare Empfehlung: welche Kanäle, in welcher Reihenfolge, mit welchem Budget.'],
    ['START', 'Wir bauen, schreiben, produzieren und schalten. Sie geben frei.'],
    ['WACHSTUM', 'Wir messen jeden Monat, was wirkt, und bauen es aus.'],
  ],
  faqLabel: 'FRAGEN',
  faq: [
    ['Was kostet das?', 'Das hängt davon ab, welche Kanäle Sie brauchen und wie viel Budget in Werbung fließt. Im Check bekommen Sie eine klare Empfehlung, bevor Sie irgendetwas entscheiden.'],
    ['Muss ich alle vier Kanäle buchen?', 'Nein. Wir starten mit dem Kanal, der bei Ihnen am schnellsten wirkt, und bauen von dort aus.'],
    ['Für welche Branchen arbeiten Sie?', 'Für Unternehmen jeder Branche, die online Kunden gewinnen wollen.'],
    ['Wie viel Arbeit habe ich damit?', 'Wenig. Wir übernehmen Text, Design, Technik, Kampagnen und Content. Sie geben frei.'],
  ],
  closeHeading: 'Ihre nächsten Kunden suchen schon.',
  closeText: 'Die Frage ist, ob sie Sie finden oder die Konkurrenz. In 15 Minuten wissen Sie, wo Sie stehen.',
  footerLine: 'BELIVIN MEDIA · Marketingagentur · Geisenheim · Rheingau · Rhein-Main',
  legal: [['Impressum', '/impressum.html'], ['Datenschutz', '/datenschutz.html']],
};

const escape = value => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

const action = (className = 'cta') =>
  `<a class="${className}" href="${booking}" target="_blank" rel="noopener">${escape(copy.action)}</a>`;

const heroes = {
  a: {
    name: 'Plakat mit Seitenleiste',
    firstViewport: 'Links eine Leiste mit der Frage oben und dem Check-Button unten; rechts MEHR KUNDEN. und AUS JEDEM KANAL. auf volle Breite gesetzt, darunter die vier Kanäle als eine bündige Zeile, Unterzeile und Kleingedrucktes. Mobil: alles untereinander, Button im ersten Screen.',
    html: () => `
    <section class="hero" aria-labelledby="hero-title">
      <p class="lead hero-lead">${escape(copy.lead)}</p>
      <h1 class="hero-title headliner" id="hero-title">
        <span data-fit="size" data-fit-max="260">${escape(copy.h1[0])}</span>
        <span data-fit="size" data-fit-max="200">${escape(copy.h1[1])}</span>
      </h1>
      <ul class="hero-billing" data-fit="stretch" data-fit-above="900">
        ${copy.billing.map(item => `<li>${escape(item)}</li>`).join('\n        ')}
      </ul>
      <p class="support hero-support">${escape(copy.support)}</p>
      <div class="hero-action">
        ${action()}
        <p class="note">${escape(copy.actionNote)}</p>
      </div>
      <p class="fine hero-fine">${escape(copy.smallPrint)}</p>
    </section>`,
  },
  b: {
    name: 'Line-up-Wand',
    firstViewport: 'Oben die Frage und MEHR KUNDEN. AUS JEDEM KANAL. als Ansage-Zeile; darunter die vier Kanäle in gleicher Schriftgröße als bündige Wand, jede Zeile über die Breitenachse exakt auf Spaltenbreite gezogen; rechts Unterzeile und Check-Button. Mobil: dieselbe Wand auf Handybreite.',
    html: () => `
    <section class="hero" aria-labelledby="hero-title">
      <div class="hero-head">
        <p class="lead hero-lead">${escape(copy.lead)}</p>
        <h1 class="hero-title" id="hero-title">${escape(copy.h1.join(' '))}</h1>
      </div>
      <ul class="hero-wall">
        ${copy.billing.map(item => `<li class="headliner" data-fit="stretch">${escape(item)}</li>`).join('\n        ')}
      </ul>
      <div class="hero-side">
        <p class="support">${escape(copy.support)}</p>
        <div class="hero-action">
          ${action()}
          <p class="note">${escape(copy.actionNote)}</p>
        </div>
      </div>
      <p class="fine hero-fine">${escape(copy.smallPrint)}</p>
    </section>`,
  },
  c: {
    name: 'Monument auf Limette',
    firstViewport: 'Der ganze erste Screen in Limette mit ultramarinblauer Schrift: MEHR KUNDEN. als monumentale Zeile über die volle Breite, AUS JEDEM KANAL. darunter; am Fuß eine Leiste mit den vier Kanälen, der Unterzeile und dem blauen Check-Button. Mobil: Monument auf Handybreite, Kanäle untereinander.',
    html: () => `
    <section class="hero on-lime" aria-labelledby="hero-title">
      <p class="lead hero-lead">${escape(copy.lead)}</p>
      <h1 class="hero-title headliner" id="hero-title">
        <span data-fit="size" data-fit-max="300">${escape(copy.h1[0])}</span>
        <span data-fit="size" data-fit-max="240">${escape(copy.h1[1])}</span>
      </h1>
      <div class="hero-foot">
        <ul class="hero-billing" data-fit="stretch" data-fit-above="900">
          ${copy.billing.map(item => `<li data-fit="stretch" data-fit-below="900">${escape(item)}</li>`).join('\n          ')}
        </ul>
        <p class="support">${escape(copy.support)}</p>
        <div class="hero-action">
          ${action()}
          <p class="note">${escape(copy.actionNote)}</p>
        </div>
      </div>
      <p class="fine hero-fine">${escape(copy.smallPrint)}</p>
    </section>`,
  },
};

const contract = (id, hero) => `<!--
  THESIS: Leistungen werden gebucht wie Headliner. Das Ergebnis „Mehr Kunden“ führt, die vier Kanäle sind das Line-up. Verweigert Agentur-Bento, Logo-Laufband und Verlaufslicht.
  OWN-WORLD: Ultramarin-Fläche, eine Limetten-Tinte, Anybody als einzige Schrift in vielen Größen und Breiten, 2px-Linien, invertierte Blöcke für aktive Elemente.
  STORY: Besucher erkennt sein Problem, versteht vier Kanäle als ein System und bucht den kostenlosen 15-Minuten-Check.
  FIRST VIEWPORT: Comp ${id.toUpperCase()} · ${hero.name}. ${hero.firstViewport}
  FORM: Festival-Line-up (Challenger, competitive), seed 67b063e5.
  FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
-->`;

const page = (id, hero) => `<!doctype html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escape(copy.description)}">
  <meta name="theme-color" content="#1f2bff">
  <link rel="icon" href="data:,">
  <title>${escape(copy.title)}</title>
  <link rel="preload" href="../fonts/anybody-latin-standard-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="../shared/base.css">
  <link rel="stylesheet" href="comp.css">
  <script src="../shared/fit.js" defer></script>
</head>
<body class="comp-${id}">
  ${contract(id, hero)}
  <header class="bar">
    <a class="brand" href="#top">${escape(copy.brand)}</a>
    <nav class="nav" aria-label="Hauptnavigation">
      <a href="#leistungen">${copy.nav[0]}</a>
      <a href="#ablauf">${copy.nav[1]}</a>
      <a href="#fragen">${copy.nav[2]}</a>
    </nav>
    <a class="bar-cta" href="${booking}" target="_blank" rel="noopener">${escape(copy.barAction)}</a>
  </header>

  <main id="top">${hero.html()}

    <section class="section lineup" id="leistungen" aria-labelledby="lineup-title">
      <p class="band">${escape(copy.lineupLabel)}</p>
      <h2 class="section-heading" id="lineup-title">${escape(copy.lineupHeading)}</h2>
      <ol class="acts">
        ${copy.acts.map(act => `<li class="act">
          <h3 class="act-name" data-fit="stretch">${escape(act.name)}</h3>
          <p class="problem">${escape(act.problem)}</p>
          <p class="solution">${escape(act.solution)}</p>
          <p class="fine">${escape(act.fine)}</p>
        </li>`).join('\n        ')}
      </ol>
    </section>

    <section class="section mechanism" aria-labelledby="mechanism-title">
      <p class="band" id="mechanism-title">${escape(copy.mechanismLabel)}</p>
      <ol class="chain">
        ${copy.chain.map(line => `<li>${escape(line)}</li>`).join('\n        ')}
      </ol>
      <p class="verdict headliner" data-fit="size" data-fit-max="200" data-fit-above="720">${escape(copy.verdict)}</p>
      <p class="support">${escape(copy.mechanismText)}</p>
    </section>

    <section class="section steps" id="ablauf" aria-labelledby="steps-title">
      <p class="band">${escape(copy.stepsLabel)}</p>
      <h2 class="section-heading" id="steps-title">${escape(copy.stepsHeading)}</h2>
      <ol>
        ${copy.steps.map(([name, text], index) => `<li>
          <span class="step-number">${index + 1}</span>
          <h3 class="step-name">${escape(name)}</h3>
          <p class="step-text">${escape(text)}</p>
        </li>`).join('\n        ')}
      </ol>
    </section>

    <section class="section faq" id="fragen" aria-labelledby="faq-title">
      <p class="band" id="faq-title">${escape(copy.faqLabel)}</p>
      ${copy.faq.map(([question, answer], index) => `<details${index === 0 ? ' open' : ''}>
        <summary>${escape(question)}</summary>
        <p>${escape(answer)}</p>
      </details>`).join('\n      ')}
    </section>

    <section class="close on-lime" aria-labelledby="close-title">
      <h2 class="close-heading headliner" id="close-title" data-fit="size" data-fit-max="220" data-fit-above="720">${escape(copy.closeHeading)}</h2>
      <p class="support">${escape(copy.closeText)}</p>
      ${action()}
    </section>
  </main>

  <footer class="footer">
    <p>${escape(copy.footerLine)}</p>
    <nav aria-label="Rechtliches">
      ${copy.legal.map(([label, href]) => `<a href="${href}">${label}</a>`).join('\n      ')}
    </nav>
  </footer>
</body>
</html>
`;

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const [id, hero] of Object.entries(heroes)) {
    const target = join(here, `comp-${id}`, 'index.html');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, page(id, hero));
    process.stdout.write(`wrote ${target}\n`);
  }
}
