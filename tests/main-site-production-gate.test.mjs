import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { chmodSync, cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const gateSource = join(projectRoot, '.impeccable/main-site-production-gate.mjs');
const sourceImage = join(projectRoot, '.impeccable/sketches/belivin-main-site-handwerk/auftragszentrale.png');

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
}

function writeJson(path, value) {
  writeText(path, `${JSON.stringify(value, null, 2)}\n`);
}

function hashFile(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function run(root, action) {
  return spawnSync(process.execPath, ['.impeccable/main-site-production-gate.mjs', action], {
    cwd: root,
    encoding: 'utf8',
    env: {
      ...process.env,
      NODE_ENV: 'test',
      IMPECCABLE_DETECT_SCRIPT: join(root, '.impeccable/detector-stub.mjs'),
    },
  });
}

function lockState(root, path) {
  return execFileSync('ls', ['-lO', path], { cwd: root, encoding: 'utf8' });
}

function createFixture({ upstream = false, selectedRevision = false, heroProof = false, visualApproval = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'belivin-main-site-gate-'));
  mkdirSync(join(root, '.impeccable'), { recursive: true });
  cpSync(gateSource, join(root, '.impeccable/main-site-production-gate.mjs'));
  writeText(join(root, '.impeccable/detector-stub.mjs'), '#!/usr/bin/env node\nprocess.stdout.write("{}\\n");\n');
  chmodSync(join(root, '.impeccable/detector-stub.mjs'), 0o755);
  writeText(join(root, 'index.html'), '<body></body>\n');
  writeText(join(root, 'styles.css'), 'body {}\n');
  writeText(join(root, 'impressum.html'), '<body><main>Impressum</main></body>\n');
  writeText(join(root, 'datenschutz.html'), '<body><main>Datenschutz</main></body>\n');
  writeText(join(root, 'legal.css'), 'body {}\n');

  const paths = {
    sketch: '.impeccable/sketches/direction.png',
    directionCard: '.impeccable/questions/direction.json',
    contractSource: '.impeccable/directions/contract.md',
    directionApproval: '.impeccable/approvals/direction.json',
    compApproval: '.impeccable/approvals/comp.json',
    compRevisionApproval: '.impeccable/approvals/comp-revision.json',
    buildApproval: '.impeccable/approvals/build.json',
    copy: '.impeccable/copy/approved.md',
    heroContent: '.impeccable/hero-content.json',
    brief: '.impeccable/surfaces/index.md',
    inventory: '.impeccable/mocks/belivin-main-site/fidelity-inventory.json',
    producer: '.impeccable/assets/belivin-main-site/producer-manifest.json',
    material: '.impeccable/assets/belivin-main-site/material.png',
    heroHtml: '.impeccable/hero-build/index.html',
    heroCss: '.impeccable/hero-build/styles.css',
    screenshot: '.impeccable/hero-proof/screenshot.png',
    overlay: '.impeccable/hero-proof/overlay.png',
    report: '.impeccable/hero-proof/fidelity-matrix.json',
    desktopScreenshot: '.impeccable/main-site-desktop-build.png',
    firstViewportScreenshot: '.impeccable/main-site-first-viewport.png',
    responsiveQa: '.impeccable/responsive-qa.mjs',
    industryRegistry: 'beispiele/industry-registry.json',
  };

  for (const relative of [paths.sketch, paths.material]) {
    mkdirSync(dirname(join(root, relative)), { recursive: true });
    cpSync(sourceImage, join(root, relative));
  }
  writeText(join(root, paths.contractSource), 'grounded direction source\n');
  writeJson(join(root, paths.directionCard), {
    options: [{ label: 'Auftragszentrale', sketch: paths.sketch }],
  });
  writeJson(join(root, paths.directionApproval), {
    source: 'structured-question', approvedBy: 'Mario', selectedPath: paths.sketch,
  });

  const gate = {
    schemaVersion: 2,
    workflow: 'impeccable-new-work',
    designAuthority: 'impeccable-only',
    direction: {
      origin: 'grounded',
      status: 'approved', approvedBy: 'Mario', approvedAt: 'fixture',
      approvalRecord: paths.directionApproval, seedKey: 'abc12345',
      decisionSketch: paths.sketch, decisionCard: paths.directionCard,
      contractSource: paths.contractSource,
      directionReferences: [
        { type: 'grounded-direction-card', path: paths.directionCard },
        { type: 'direction-sketch', path: paths.sketch },
      ],
      qualityBarReferences: [],
    },
    copy: { status: 'missing', path: paths.copy },
    visualization: { comps: [], selection: { status: 'missing', approvalRecord: paths.compApproval } },
    surfaceBrief: { path: paths.brief },
    heroContent: { path: paths.heroContent },
    inventory: { status: 'missing', path: paths.inventory },
    assetProducer: { status: 'missing', producer: 'impeccable-asset-producer', manifest: paths.producer },
    heroProof: {
      status: 'missing', heroHtml: paths.heroHtml, heroCss: paths.heroCss,
      screenshot: paths.screenshot, overlay: paths.overlay, comparisonReport: paths.report,
    },
    implementation: {
      status: 'blocked', desktopScreenshot: paths.desktopScreenshot,
      visualApproval: { status: 'missing', approvalRecord: paths.buildApproval },
    },
  };

  if (upstream) {
    writeText(join(root, paths.copy), 'HEADLINE\nSUPPORT\nPRIMARY_CTA\nPROOF\nMECHANISM\nREADING_ORDER\n');
    const copyHash = hashFile(join(root, paths.copy));
    const heroContent = {
      copySha256: copyHash,
      headline: 'Clear requests.',
      support: 'Websites for trades.',
      primaryCta: { label: 'Website check', support: 'Free and easy' },
      mechanism: [
        { state: 'SEEN', body: 'Customers find you.' },
        { state: 'UNDERSTOOD', body: 'Your offer is clear.' },
        { state: 'REQUESTED', body: 'Customers ask directly.' },
      ],
      proof: { label: 'TRADE EXAMPLE', title: 'A real website.', linkLabel: 'View example' },
      products: [
        { title: 'BUILD WEBSITE', body: 'Make the offer clear.' },
        { title: 'GET FOUND', body: 'Show up locally.' },
        { title: 'MORE REVENUE', body: 'Requests become revenue.' },
      ],
      forbiddenVisiblePhrases: ['old agency phrase'],
    };
    writeJson(join(root, paths.heroContent), heroContent);
    const requiredCopy = [
      heroContent.headline, heroContent.support, heroContent.primaryCta.label, heroContent.primaryCta.support,
      ...heroContent.mechanism.flatMap(item => [item.state, item.body]),
      heroContent.proof.label, heroContent.proof.title, heroContent.proof.linkLabel,
      ...heroContent.products.flatMap(item => [item.title, item.body]),
    ].join('\n');
    writeJson(join(root, paths.compApproval), {
      source: 'structured-question', approvedBy: 'Mario',
      selectedPath: '.impeccable/mocks/belivin-main-site/comp-b.png',
    });
    const comps = ['a', 'b', 'c'].map(name => {
      const path = `.impeccable/mocks/belivin-main-site/comp-${name}.png`;
      const sidecar = `.impeccable/mocks/belivin-main-site/comp-${name}.json`;
      mkdirSync(dirname(join(root, path)), { recursive: true });
      cpSync(sourceImage, join(root, path));
      writeJson(join(root, sidecar), {
        prompt: `designed web surface ${name}`,
        viewport: { width: 1536, height: 1024 },
        copyPath: paths.copy,
        copySha256: copyHash,
        approved: name === 'b',
      });
      return { path, sidecar };
    });
    const approvedComp = '.impeccable/mocks/belivin-main-site/comp-b.png';
    let buildComp = approvedComp;
    if (selectedRevision) {
      const originalCopy = '.impeccable/copy/original.md';
      writeText(join(root, originalCopy), 'HEADLINE\nSUPPORT\nPRIMARY_CTA\nPROOF\nMECHANISM\nREADING_ORDER\nOLD COPY\n');
      const originalCopyHash = hashFile(join(root, originalCopy));
      for (const comp of comps) {
        const sidecar = JSON.parse(readFileSync(join(root, comp.sidecar), 'utf8'));
        sidecar.copyPath = originalCopy;
        sidecar.copySha256 = originalCopyHash;
        writeJson(join(root, comp.sidecar), sidecar);
      }
      buildComp = '.impeccable/mocks/belivin-main-site/comp-b-revision.png';
      cpSync(sourceImage, join(root, buildComp));
      writeJson(join(root, '.impeccable/mocks/belivin-main-site/comp-b-revision.json'), {
        prompt: 'approved content-only revision',
        viewport: { width: 1536, height: 1024 },
        copyPath: paths.copy,
        copySha256: copyHash,
        revisionOf: approvedComp,
        review: { topologyPreserved: true, materialWorldPreserved: true },
        approved: true,
      });
      writeJson(join(root, paths.compRevisionApproval), {
        source: 'chat-explicit', approvedBy: 'Mario', evidence: 'approved with copy changes',
        selectedPath: buildComp, parentSelectedPath: approvedComp,
      });
    }
    const approvedCompHash = hashFile(join(root, buildComp));

    const productionDir = '.impeccable/comp-builds/selected-production-comp';
    const productionManifest = `${productionDir}/source-manifest.json`;
    const productionHtml = `${productionDir}/index.html`;
    const productionCss = `${productionDir}/styles.css`;
    const productionPreview = `${productionDir}/preview.png`;
    const productionFont = `${productionDir}/display-font.ttf`;
    const productionLicense = `${productionDir}/OFL.txt`;
    const productionIcons = `${productionDir}/icons.svg`;
    const productionRoute = `${productionDir}/route.svg`;
    const productionTrace = `${productionDir}/trace.json`;
    writeText(join(root, productionHtml), `<body><!-- THESIS OWN-WORLD STORY FIRST VIEWPORT FORM abc12345 -->${requiredCopy}</body>\n`);
    writeText(join(root, productionCss), 'body {}\n');
    cpSync(sourceImage, join(root, productionPreview));
    writeText(join(root, productionFont), 'licensed fixture font\n');
    writeText(join(root, productionLicense), 'fixture OFL license\n');
    writeText(join(root, productionIcons), '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n');
    writeText(join(root, productionRoute), '<svg xmlns="http://www.w3.org/2000/svg"></svg>\n');
    writeJson(join(root, productionTrace), { source: buildComp, method: 'fixture exact trace' });
    const productionAssets = [
      ['display-font', productionFont],
      ['display-font-license', productionLicense],
      ['body-font-regular', productionFont],
      ['body-font-license', productionLicense],
      ['material-raster', paths.material],
      ['exact-icon-sprite', productionIcons],
      ['exact-route-svg', productionRoute],
      ['vector-trace-provenance', productionTrace],
      ['real-browser-proof', paths.material],
    ].map(([role, path]) => ({ role, path, sha256: hashFile(join(root, path)) }));
    const contourIds = [
      'seen', 'understood', 'requested', 'build', 'local', 'revenue',
      'header-pin', 'top-arrow-1', 'top-arrow-2', 'lower-route',
    ];
    writeJson(join(root, productionManifest), {
      schemaVersion: 1,
      sourceType: 'browser-native-production-comp',
      status: 'bound',
      approvedComp: { path: buildComp, sha256: approvedCompHash },
      viewport: { width: 1536, height: 1024 },
      copy: { path: paths.copy, sha256: copyHash, mutationContract: 'semantic-strings-only' },
      source: {
        html: productionHtml, htmlSha256: hashFile(join(root, productionHtml)),
        css: productionCss, cssSha256: hashFile(join(root, productionCss)),
        preview: productionPreview, previewSha256: hashFile(join(root, productionPreview)),
      },
      assets: productionAssets,
      fidelity: {
        thresholds: { headlineMaskIouMin: 0.45, contourIouMin: 0.7 },
        headline: { maskIou: 0.9 },
        contours: contourIds.map(id => ({ id, iou: 0.9 })),
        realProofException: 'fixture uses a real browser proof',
      },
    });
    const selectedSidecarPath = selectedRevision
      ? '.impeccable/mocks/belivin-main-site/comp-b-revision.json'
      : '.impeccable/mocks/belivin-main-site/comp-b.json';
    const selectedSidecar = JSON.parse(readFileSync(join(root, selectedSidecarPath), 'utf8'));
    selectedSidecar.productionSource = {
      status: 'bound', type: 'browser-native-production-comp', manifest: productionManifest,
      preview: productionPreview, copyMutationContract: 'semantic-strings-only',
    };
    writeJson(join(root, selectedSidecarPath), selectedSidecar);

    writeText(join(root, paths.brief), `THESIS\nOWN-WORLD\nSTORY\nFIRST VIEWPORT\nFORM\nabc12345\n${buildComp}\n`);
    const inventory = {
      approvedCompSha256: approvedCompHash,
      items: [
        { id: 'topology', role: 'topology', medium: 'semantic-html-css-svg', commitment: 'same arrangement' },
        { id: 'reading', role: 'reading-order', medium: 'semantic-html-css-svg', commitment: 'same order' },
        { id: 'scale', role: 'focal-scale', medium: 'semantic-html-css-svg', commitment: 'same coverage' },
        { id: 'type', role: 'typography', medium: 'semantic-html-css-svg', commitment: 'same silhouette', compressionClass: 'condensed industrial', headlineSampleComparison: 'approved' },
        { id: 'material', role: 'material', medium: 'generated-raster', commitment: 'physical material' },
        { id: 'proof', role: 'proof', medium: 'generated-raster', commitment: 'truthful example' },
        { id: 'nav', role: 'navigation', medium: 'semantic-html-css-svg', commitment: 'same items' },
        { id: 'cta', role: 'primary-cta', medium: 'semantic-html-css-svg', commitment: 'approved treatment', semanticControl: true },
        { id: 'second-fold', role: 'second-fold', medium: 'semantic-html-css-svg', commitment: 'same grammar' },
      ],
    };
    writeJson(join(root, paths.inventory), inventory);
    const inventoryHash = hashFile(join(root, paths.inventory));
    writeJson(join(root, paths.producer), {
      approvedCompSha256: approvedCompHash,
      inventorySha256: inventoryHash,
      reviewedInventoryIds: inventory.items.map(item => item.id),
      assets: [
        { id: 'material', inventoryId: 'material', path: paths.material, status: 'accepted', promptEmbedded: true, provenance: 'fixture' },
        { id: 'proof', inventoryId: 'proof', path: paths.material, status: 'accepted', promptEmbedded: true, provenance: 'fixture' },
      ],
    });
    Object.assign(gate, {
      copy: { status: 'locked', lockedBy: 'Jarvis', lockedAt: 'fixture', path: paths.copy },
      visualization: {
        comps,
        selection: {
          status: 'approved', approvedBy: 'Mario', approvedAt: 'fixture',
          approvalRecord: paths.compApproval, path: approvedComp,
        },
        ...(selectedRevision ? {
          selectedCompRevision: {
            status: 'approved', approvedBy: 'Mario', approvedAt: 'fixture',
            approvalRecord: paths.compRevisionApproval, path: buildComp,
            sidecar: '.impeccable/mocks/belivin-main-site/comp-b-revision.json',
          },
        } : {}),
      },
      surfaceBrief: { path: paths.brief },
      inventory: { status: 'complete', completedAt: 'fixture', path: paths.inventory },
      assetProducer: {
        status: 'complete', completedAt: 'fixture', producer: 'impeccable-asset-producer', manifest: paths.producer,
      },
    });

    if (heroProof) {
      writeText(join(root, paths.heroHtml), readFileSync(join(root, productionHtml), 'utf8'));
      writeText(join(root, paths.heroCss), readFileSync(join(root, productionCss), 'utf8'));
      mkdirSync(dirname(join(root, paths.screenshot)), { recursive: true });
      cpSync(sourceImage, join(root, paths.screenshot));
      cpSync(sourceImage, join(root, paths.overlay));
      writeJson(join(root, paths.report), {
        disposition: 'pass', firstViewportOnly: true,
        approvedCompSha256: approvedCompHash,
        heroHtmlSha256: hashFile(join(root, paths.heroHtml)),
        heroCssSha256: hashFile(join(root, paths.heroCss)),
        screenshotSha256: hashFile(join(root, paths.screenshot)),
        overlaySha256: hashFile(join(root, paths.overlay)),
        inventorySha256: inventoryHash,
        heroContentSha256: hashFile(join(root, paths.heroContent)),
        matrix: inventory.items.map(item => ({ inventoryId: item.id, verdict: 'match' })),
        addedWithoutApproval: [],
      });
      gate.heroProof = {
        status: 'pass', completedAt: 'fixture', heroHtml: paths.heroHtml, heroCss: paths.heroCss,
        screenshot: paths.screenshot, overlay: paths.overlay, comparisonReport: paths.report,
      };
    }

    if (visualApproval) {
      writeText(join(root, 'index.html'), '<body><!-- THESIS OWN-WORLD STORY FIRST VIEWPORT FORM abc12345 --></body>\n');
      cpSync(sourceImage, join(root, paths.desktopScreenshot));
      cpSync(sourceImage, join(root, paths.firstViewportScreenshot));
      writeText(join(root, paths.responsiveQa), 'process.stdout.write("pass\\n");\n');
      writeJson(join(root, paths.industryRegistry), {
        globalIndustryHub: { status: 'blocked' },
        industries: {
          shk: {
            requiredTemplateCount: 3,
            currentTemplateCount: 2,
            publicHubEligible: false,
            outreachEligible: false,
            templates: [{ id: 'design-1' }, { id: 'design-2' }],
          },
        },
      });
      writeJson(join(root, paths.buildApproval), {
        source: 'structured-question', approvedBy: 'Mario', selectedPath: paths.desktopScreenshot,
      });
      gate.implementation = {
        status: 'visually-approved',
        desktopScreenshot: paths.desktopScreenshot,
        desktopScreenshotSha256: hashFile(join(root, paths.desktopScreenshot)),
        firstViewportScreenshot: paths.firstViewportScreenshot,
        firstViewportSha256: hashFile(join(root, paths.firstViewportScreenshot)),
        releaseBindings: Object.fromEntries([
          'index.html', 'styles.css', 'impressum.html', 'datenschutz.html', 'legal.css',
        ].map(relativePath => [relativePath, hashFile(join(root, relativePath))])),
        releaseReadiness: {
          responsive: {
            status: 'pass',
            qaScript: paths.responsiveQa,
            qaScriptSha256: hashFile(join(root, paths.responsiveQa)),
          },
          legal: { status: 'pass', licensingAuthorityVerified: true },
          industryRegistry: {
            status: 'pass',
            path: paths.industryRegistry,
            sha256: hashFile(join(root, paths.industryRegistry)),
          },
        },
        visualApproval: {
          status: 'approved', approvedBy: 'Mario', approvedAt: 'fixture',
          approvalRecord: paths.buildApproval,
        },
      };
    }
  }

  writeJson(join(root, '.impeccable/main-site-build-gate.json'), gate);
  run(root, 'lock');
  return root;
}

test('incomplete upstream package blocks hero and keeps main immutable', () => {
  const root = createFixture();
  const check = run(root, 'check-upstream');
  const openHero = run(root, 'open-hero');
  assert.equal(check.status, 1);
  assert.match(check.stderr, /reale Copy muss vor den drei Comps/);
  assert.equal(openHero.status, 1);
  assert.match(lockState(root, 'index.html'), /uchg/);
  assert.match(lockState(root, 'styles.css'), /uchg/);
});

test('complete upstream package opens only hero while main remains immutable', () => {
  const root = createFixture({ upstream: true });
  assert.equal(run(root, 'check-upstream').status, 0);
  const openHero = run(root, 'open-hero');
  assert.equal(openHero.status, 0, openHero.stderr);
  assert.doesNotMatch(lockState(root, '.impeccable/hero-build/index.html'), /uchg/);
  assert.doesNotMatch(lockState(root, '.impeccable/hero-build/styles.css'), /uchg/);
  assert.match(lockState(root, 'index.html'), /uchg/);
  assert.match(lockState(root, 'styles.css'), /uchg/);
});

test('selected comp without browser-native production source fails closed', () => {
  const root = createFixture({ upstream: true });
  const sidecarPath = join(root, '.impeccable/mocks/belivin-main-site/comp-b.json');
  const sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'));
  delete sidecar.productionSource;
  writeJson(sidecarPath, sidecar);
  const check = run(root, 'check-upstream');
  assert.equal(check.status, 1);
  assert.match(check.stderr, /browser-native Produktionsquelle/);
  assert.match(lockState(root, 'index.html'), /uchg/);
});

test('browser-native source fails closed below objective headline fidelity threshold', () => {
  const root = createFixture({ upstream: true });
  const manifestPath = join(root, '.impeccable/comp-builds/selected-production-comp/source-manifest.json');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  manifest.fidelity.headline.maskIou = 0.44;
  writeJson(manifestPath, manifest);
  const check = run(root, 'check-upstream');
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Headline.*Masken-IoU/);
});

test('selected comp may carry an explicitly approved copy-only revision without rerendering rejected comps', () => {
  const root = createFixture({ upstream: true, selectedRevision: true });
  const check = run(root, 'check-upstream');
  assert.equal(check.status, 0, check.stderr);
  assert.match(check.stdout, /freigegebene Copy-Revision/);
});

test('selected comp revision fails closed when topology preservation is not proven', () => {
  const root = createFixture({ upstream: true, selectedRevision: true });
  const sidecarPath = join(root, '.impeccable/mocks/belivin-main-site/comp-b-revision.json');
  const sidecar = JSON.parse(readFileSync(sidecarPath, 'utf8'));
  sidecar.review.topologyPreserved = false;
  writeJson(sidecarPath, sidecar);
  const check = run(root, 'check-upstream');
  assert.equal(check.status, 1);
  assert.match(check.stderr, /Topologie oder Materialwelt/);
});

test('main page cannot unlock before screenshot overlay and fidelity proof', () => {
  const root = createFixture({ upstream: true });
  assert.equal(run(root, 'open-hero').status, 0);
  const unlock = run(root, 'unlock-page');
  assert.equal(unlock.status, 1);
  assert.match(unlock.stderr, /First-Viewport-Proof fehlt/);
  assert.match(lockState(root, 'index.html'), /uchg/);
});

test('valid first-viewport proof locks hero and unlocks main page', () => {
  const root = createFixture({ upstream: true, heroProof: true });
  assert.equal(run(root, 'open-hero').status, 0);
  const unlock = run(root, 'unlock-page');
  assert.equal(unlock.status, 0, unlock.stderr);
  assert.match(lockState(root, '.impeccable/hero-build/index.html'), /uchg/);
  assert.match(lockState(root, '.impeccable/hero-build/styles.css'), /uchg/);
  assert.doesNotMatch(lockState(root, 'index.html'), /uchg/);
  assert.doesNotMatch(lockState(root, 'styles.css'), /uchg/);
});

test('valid hero proof unlocks main and legal release sources while hero stays locked', () => {
  const root = createFixture({ upstream: true, heroProof: true });
  const unlock = run(root, 'unlock-release');
  assert.equal(unlock.status, 0, unlock.stderr);
  assert.match(lockState(root, '.impeccable/hero-build/index.html'), /uchg/);
  for (const target of ['index.html', 'styles.css', 'impressum.html', 'datenschutz.html', 'legal.css']) {
    assert.doesNotMatch(lockState(root, target), /uchg/);
  }
});

test('hero proof becomes stale after hero bytes change', () => {
  const root = createFixture({ upstream: true, heroProof: true });
  assert.equal(run(root, 'open-hero').status, 0);
  writeText(join(root, '.impeccable/hero-build/styles.css'), 'body { color: red; }\n');
  const unlock = run(root, 'unlock-page');
  assert.equal(unlock.status, 1);
  assert.match(unlock.stderr, /keine bytegleiche Übernahme/);
  assert.match(lockState(root, 'index.html'), /uchg/);
});

test('hero proof blocks rejected old copy even when visual artifacts otherwise exist', () => {
  const root = createFixture({ upstream: true, heroProof: true });
  assert.equal(run(root, 'open-hero').status, 0);
  const heroPath = join(root, '.impeccable/hero-build/index.html');
  const sourcePath = join(root, '.impeccable/comp-builds/selected-production-comp/index.html');
  const changedHtml = `${readFileSync(sourcePath, 'utf8')}<p>old agency phrase</p>\n`;
  writeText(sourcePath, changedHtml);
  writeText(heroPath, changedHtml);
  const sourceManifestPath = join(root, '.impeccable/comp-builds/selected-production-comp/source-manifest.json');
  const sourceManifest = JSON.parse(readFileSync(sourceManifestPath, 'utf8'));
  sourceManifest.source.htmlSha256 = hashFile(sourcePath);
  writeJson(sourceManifestPath, sourceManifest);
  const reportPath = join(root, '.impeccable/hero-proof/fidelity-matrix.json');
  const report = JSON.parse(readFileSync(reportPath, 'utf8'));
  report.heroHtmlSha256 = hashFile(heroPath);
  writeJson(reportPath, report);
  const unlock = run(root, 'unlock-page');
  assert.equal(unlock.status, 1);
  assert.match(unlock.stderr, /verworfene Altformulierung/);
  assert.match(lockState(root, 'index.html'), /uchg/);
});

test('commit remains closed without Mario visual approval', () => {
  const root = createFixture({ upstream: true, heroProof: true });
  assert.equal(run(root, 'lock').status, 0);
  const commit = run(root, 'commit');
  assert.equal(commit.status, 1);
  assert.match(commit.stderr, /noch nicht von Mario visuell freigegeben/);
});

test('commit remains closed when licensing authority is not verified', () => {
  const root = createFixture({ upstream: true, heroProof: true, visualApproval: true });
  const manifestPath = join(root, '.impeccable/main-site-build-gate.json');
  const gate = JSON.parse(readFileSync(manifestPath, 'utf8'));
  gate.implementation.releaseReadiness.legal.licensingAuthorityVerified = false;
  writeJson(manifestPath, gate);
  assert.equal(run(root, 'lock').status, 0);
  const commit = run(root, 'commit');
  assert.equal(commit.status, 1);
  assert.match(commit.stderr, /Lizenz-\/Registerbehörde/);
});

test('commit opens only with Mario approval detector pass contract and relock', () => {
  const root = createFixture({ upstream: true, heroProof: true, visualApproval: true });
  assert.equal(run(root, 'lock').status, 0);
  const commit = run(root, 'commit');
  assert.equal(commit.status, 0, commit.stderr);
  assert.match(commit.stdout, /COMMIT GATE OPEN/);
});
