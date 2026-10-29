#!/usr/bin/env node

import { access, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const manifestPath = resolve(root, '.impeccable/main-site-build-gate.json');
const mainTargets = ['index.html', 'styles.css'];
const legalTargets = ['impressum.html', 'datenschutz.html', 'legal.css'];
const releaseTargets = [...mainTargets, ...legalTargets];
const heroTargets = ['.impeccable/hero-build/index.html', '.impeccable/hero-build/styles.css'];
const defaultDetector = resolve(process.env.HOME ?? '', '.claude/skills/impeccable/scripts/detect.mjs');
const testDetectorOverride = process.env.NODE_ENV === 'test'
  && root.startsWith(`${resolve(tmpdir())}/belivin-main-site-gate-`)
  ? process.env.IMPECCABLE_DETECT_SCRIPT
  : null;
const detectorScript = testDetectorOverride || defaultDetector;

function fail(message) {
  process.stderr.write(`GATE CLOSED: ${message}\n`);
  process.exitCode = 1;
}

function pass(message) {
  process.stdout.write(`PASS: ${message}\n`);
}

async function readJson(absolutePath, label) {
  let text;
  try {
    text = await readFile(absolutePath, 'utf8');
  } catch {
    throw new Error(`${label} fehlt: ${absolutePath.replace(`${root}/`, '')}`);
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} ist kein gültiges JSON: ${error.message}`);
  }
}

function repositoryPath(relativePath, label) {
  if (!relativePath || typeof relativePath !== 'string') throw new Error(`${label}: Pfad fehlt`);
  const absolute = resolve(root, relativePath);
  if (!absolute.startsWith(`${root}/`)) throw new Error(`${label}: Pfad liegt außerhalb des Repository`);
  return absolute;
}

async function requireFile(relativePath, label, extensions = null) {
  const absolute = repositoryPath(relativePath, label);
  let info;
  try {
    info = await stat(absolute);
  } catch {
    throw new Error(`${label} fehlt: ${relativePath}`);
  }
  if (!info.isFile() || info.size === 0) throw new Error(`${label} ist leer oder keine Datei: ${relativePath}`);
  if (extensions && !extensions.includes(extname(relativePath).toLowerCase())) {
    throw new Error(`${label} hat falsches Format: ${relativePath}`);
  }
  return absolute;
}

function imageDimensions(absolutePath, label) {
  let width;
  let height;
  if (process.platform === 'darwin') {
    const result = spawnSync('sips', ['-g', 'pixelWidth', '-g', 'pixelHeight', absolutePath], { encoding: 'utf8' });
    if (result.status !== 0) throw new Error(`${label}: Bildabmessungen nicht lesbar`);
    width = Number(result.stdout.match(/pixelWidth:\s*(\d+)/)?.[1]);
    height = Number(result.stdout.match(/pixelHeight:\s*(\d+)/)?.[1]);
  } else {
    const bytes = readFileSync(absolutePath);
    const isPng = bytes.length >= 24
      && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (!isPng) throw new Error(`${label}: plattformübergreifend werden derzeit PNG-Abmessungen unterstützt`);
    width = bytes.readUInt32BE(16);
    height = bytes.readUInt32BE(20);
  }
  if (!width || !height) throw new Error(`${label}: ungültige Bildabmessungen`);
  return { width, height };
}

async function sha256(absolutePath) {
  return createHash('sha256').update(await readFile(absolutePath)).digest('hex');
}

async function requireApproval(record, label, selectedPath) {
  if (!record || record.status !== 'approved') throw new Error(`${label}: status muss approved sein`);
  if (record.approvedBy !== 'Mario') throw new Error(`${label}: approvedBy muss Mario sein`);
  if (!record.approvedAt || !record.approvalRecord) throw new Error(`${label}: approvedAt/approvalRecord fehlen`);
  const evidencePath = await requireFile(record.approvalRecord, `${label}-Freigabenachweis`, ['.json']);
  const evidence = await readJson(evidencePath, `${label}-Freigabenachweis`);
  if (evidence.approvedBy !== 'Mario' || !['structured-question', 'impeccable-decision-server', 'chat-explicit'].includes(evidence.source)) {
    throw new Error(`${label}: Freigabenachweis muss aus strukturiertem Tool, Impeccable-Decision-Server oder explizitem Chat stammen`);
  }
  if (evidence.source === 'chat-explicit' && !evidence.evidence) throw new Error(`${label}: expliziter Chat-Nachweis braucht evidence`);
  if (evidence.selectedPath !== selectedPath) throw new Error(`${label}: Freigabenachweis nennt nicht den ausgewählten Pfad`);
}

async function loadGate() {
  const gate = await readJson(manifestPath, 'Build-Gate-Manifest');
  if (gate.schemaVersion !== 2) throw new Error('schemaVersion muss 2 sein');
  if (gate.workflow !== 'impeccable-new-work') throw new Error('workflow muss impeccable-new-work sein');
  if (gate.designAuthority !== 'impeccable-only') throw new Error('designAuthority muss impeccable-only sein');
  return gate;
}

async function validateDirection(gate) {
  const direction = gate.direction ?? {};
  if (!['grounded', 'catalog'].includes(direction.origin)) throw new Error('Designwelt: origin muss grounded oder catalog sein');
  await requireApproval(direction, 'Designwelt', direction.decisionSketch);
  if (!/^[a-f0-9]{8}$/i.test(direction.seedKey ?? '')) throw new Error('Designwelt: gültiger achtstelliger Seed-Key fehlt');
  await requireFile(direction.decisionSketch, 'Decision-Sketch', ['.png', '.webp', '.jpg', '.jpeg']);
  await requireFile(direction.contractSource, 'Direction-Quelle', ['.md', '.json']);
  const cardPath = await requireFile(direction.decisionCard, 'Direction-Card', ['.json']);
  const card = await readJson(cardPath, 'Direction-Card');
  const options = Array.isArray(card.options) ? card.options : [];
  if (!options.some(option => option.sketch === direction.decisionSketch)) {
    throw new Error('Direction-Card enthält den freigegebenen Decision-Sketch nicht');
  }
  if (!Array.isArray(direction.directionReferences) || direction.directionReferences.length < 2) {
    throw new Error('Direction-Card und Decision-Sketch müssen als Direction-Referenzen dokumentiert sein');
  }
  const directionTypes = new Set();
  for (const [index, reference] of direction.directionReferences.entries()) {
    await requireFile(reference.path, `Direction-Referenz ${index + 1}`, ['.json', '.png', '.webp', '.jpg', '.jpeg']);
    if (!['grounded-direction-card', 'direction-sketch'].includes(reference.type)) {
      throw new Error(`Direction-Referenz ${index + 1}: unbekannter Typ ${reference.type}`);
    }
    directionTypes.add(reference.type);
  }
  for (const required of ['grounded-direction-card', 'direction-sketch']) {
    if (!directionTypes.has(required)) throw new Error(`Direction-Referenz fehlt: ${required}`);
  }
  const qualityBars = Array.isArray(direction.qualityBarReferences) ? direction.qualityBarReferences : [];
  if (direction.origin === 'catalog') {
    const qualityTypes = new Set();
    for (const [index, reference] of qualityBars.entries()) {
      await requireFile(reference.path, `Catalog-Quality-Bar ${index + 1}`, ['.png', '.webp', '.jpg', '.jpeg']);
      if (!['catalog-board', 'catalog-hero'].includes(reference.type)) {
        throw new Error(`Catalog-Quality-Bar ${index + 1}: unbekannter Typ ${reference.type}`);
      }
      qualityTypes.add(reference.type);
    }
    for (const required of ['catalog-board', 'catalog-hero']) {
      if (!qualityTypes.has(required)) throw new Error(`Catalog-Welt braucht QUALITY BAR ${required}`);
    }
  } else if (qualityBars.length > 0) {
    throw new Error('Grounded Direction darf keine erfundenen Catalog-QUALITY-BAR-Dateien deklarieren');
  }
  pass('Direction, Seed, Card und Sketch vorhanden; Catalog Quality Bar wird nur bei Catalog-Welten erzwungen');
  return direction;
}

async function validateCopy(gate) {
  const copy = gate.copy ?? {};
  if (copy.status !== 'locked' || copy.lockedBy !== 'Jarvis' || !copy.lockedAt) {
    throw new Error('reale Copy muss vor den drei Comps durch Jarvis gesperrt sein');
  }
  const copyPath = await requireFile(copy.path, 'gesperrte reale Copy', ['.md', '.json']);
  const copyText = await readFile(copyPath, 'utf8');
  for (const marker of ['HEADLINE', 'SUPPORT', 'PRIMARY_CTA', 'PROOF', 'MECHANISM', 'READING_ORDER']) {
    if (!copyText.includes(marker)) throw new Error(`Copy enthält ${marker} nicht`);
  }
  pass('reale Copy und Hierarchie vor den Comps gesperrt');
  return { record: copy, absolutePath: copyPath, hash: await sha256(copyPath) };
}

async function validateVisualization(gate, copy) {
  const visualization = gate.visualization ?? {};
  if (!Array.isArray(visualization.comps) || visualization.comps.length !== 3) {
    throw new Error('Impeccable verlangt genau drei High-Fidelity-Comps');
  }
  const paths = new Set();
  let approvedPath = null;
  let approvedAbsolute = null;
  let approvedDimensions = null;
  let approvedSidecar = null;
  let originalCopyPath = null;
  let originalCopyHash = null;
  let approvals = 0;
  for (const [index, comp] of visualization.comps.entries()) {
    const label = `Hi-Fi-Comp ${index + 1}`;
    const imagePath = await requireFile(comp.path, label, ['.png', '.webp', '.jpg', '.jpeg']);
    if (!comp.path.startsWith('.impeccable/mocks/belivin-main-site/')) {
      throw new Error(`${label} liegt nicht unter .impeccable/mocks/belivin-main-site/`);
    }
    if (paths.has(imagePath)) throw new Error('Die drei Hi-Fi-Comps müssen unterschiedliche Dateien sein');
    paths.add(imagePath);
    const sidecarPath = await requireFile(comp.sidecar, `${label}-Sidecar`, ['.json']);
    const sidecar = await readJson(sidecarPath, `${label}-Sidecar`);
    if (!sidecar.prompt || !sidecar.viewport?.width || !sidecar.viewport?.height) {
      throw new Error(`${label}-Sidecar braucht Prompt und Viewport`);
    }
    if (!sidecar.copyPath || !sidecar.copySha256) throw new Error(`${label} bindet keine Copy`);
    originalCopyPath ??= sidecar.copyPath;
    originalCopyHash ??= sidecar.copySha256;
    if (sidecar.copyPath !== originalCopyPath || sidecar.copySha256 !== originalCopyHash) {
      throw new Error('Die drei ursprünglichen Hi-Fi-Comps müssen dieselben Copy-Bytes binden');
    }
    const dimensions = imageDimensions(imagePath, label);
    if (dimensions.width < 1440 || dimensions.height < 900 || dimensions.width <= dimensions.height) {
      throw new Error(`${label} braucht eine echte Desktop-Landschaft von mindestens 1440×900`);
    }
    if (dimensions.width !== sidecar.viewport.width || dimensions.height !== sidecar.viewport.height) {
      throw new Error(`${label}: Sidecar-Viewport stimmt nicht mit dem Bild überein`);
    }
    if (sidecar.approved === true) {
      approvals += 1;
      approvedPath = comp.path;
      approvedAbsolute = imagePath;
      approvedDimensions = dimensions;
      approvedSidecar = sidecar;
    }
  }
  if (approvals !== 1) throw new Error('Genau ein Comp-Sidecar muss approved: true tragen');
  await requireApproval(visualization.selection, 'Hi-Fi-Comp', approvedPath);
  if (visualization.selection.path !== approvedPath) throw new Error('Comp-Auswahl und approved Sidecar widersprechen sich');

  const revision = visualization.selectedCompRevision;
  if (revision) {
    const revisionPath = await requireFile(revision.path, 'freigegebene Comp-Revision', ['.png', '.webp', '.jpg', '.jpeg']);
    const revisionSidecarPath = await requireFile(revision.sidecar, 'Comp-Revision-Sidecar', ['.json']);
    const revisionSidecar = await readJson(revisionSidecarPath, 'Comp-Revision-Sidecar');
    if (revisionSidecar.approved !== true) throw new Error('Comp-Revision muss approved: true tragen');
    if (revisionSidecar.revisionOf !== approvedPath) throw new Error('Comp-Revision stammt nicht vom ausgewählten ursprünglichen Comp ab');
    if (revisionSidecar.copyPath !== copy.record.path || revisionSidecar.copySha256 !== copy.hash) {
      throw new Error('Comp-Revision bindet nicht exakt die aktuelle gesperrte Copy');
    }
    if (revisionSidecar.review?.topologyPreserved !== true || revisionSidecar.review?.materialWorldPreserved !== true) {
      throw new Error('Comp-Revision hat Topologie oder Materialwelt nicht nachweislich bewahrt');
    }
    const revisionDimensions = imageDimensions(revisionPath, 'freigegebene Comp-Revision');
    if (revisionDimensions.width !== approvedDimensions.width || revisionDimensions.height !== approvedDimensions.height) {
      throw new Error('Comp-Revision verändert die freigegebenen Abmessungen');
    }
    await requireApproval(revision, 'Hi-Fi-Comp-Revision', revision.path);
    const revisionEvidence = await readJson(
      await requireFile(revision.approvalRecord, 'Comp-Revision-Freigabenachweis', ['.json']),
      'Comp-Revision-Freigabenachweis',
    );
    if (revisionEvidence.parentSelectedPath !== approvedPath) {
      throw new Error('Comp-Revision-Freigabe nennt nicht den ausgewählten ursprünglichen Comp');
    }
    approvedPath = revision.path;
    approvedAbsolute = revisionPath;
    approvedDimensions = revisionDimensions;
    approvedSidecar = revisionSidecar;
    pass('drei ursprüngliche Hi-Fi-Comps, Mario-Auswahl und freigegebene Copy-Revision vorhanden');
  } else {
    if (originalCopyPath !== copy.record.path || originalCopyHash !== copy.hash) {
      throw new Error('Ausgewählter Comp bindet nicht die aktuelle Copy und es fehlt eine freigegebene Comp-Revision');
    }
    pass('genau drei Hi-Fi-Comps und genau eine Mario-Auswahl vorhanden');
  }
  return {
    path: approvedPath,
    absolutePath: approvedAbsolute,
    hash: await sha256(approvedAbsolute),
    dimensions: approvedDimensions,
    sidecar: approvedSidecar,
  };
}

async function validateProductionSource(approvedComp, copy) {
  const binding = approvedComp.sidecar?.productionSource;
  if (binding?.status !== 'bound' || binding.type !== 'browser-native-production-comp') {
    throw new Error('freigegebener Comp braucht vor dem Hero eine gebundene browser-native Produktionsquelle');
  }
  if (binding.copyMutationContract !== 'semantic-strings-only') {
    throw new Error('Produktionsquelle erlaubt mehr als den Austausch semantischer Strings');
  }
  const manifestPath = await requireFile(binding.manifest, 'Browser-native Source-Manifest', ['.json']);
  const manifest = await readJson(manifestPath, 'Browser-native Source-Manifest');
  if (manifest.schemaVersion !== 1 || manifest.sourceType !== 'browser-native-production-comp' || manifest.status !== 'bound') {
    throw new Error('Browser-native Source-Manifest hat falsches Schema, Typ oder Status');
  }
  if (manifest.approvedComp?.path !== approvedComp.path || manifest.approvedComp?.sha256 !== approvedComp.hash) {
    throw new Error('Browser-native Source-Manifest gehört nicht zum freigegebenen Comp');
  }
  if (manifest.copy?.path !== copy.record.path || manifest.copy?.sha256 !== copy.hash || manifest.copy?.mutationContract !== 'semantic-strings-only') {
    throw new Error('Browser-native Source-Manifest bindet nicht exakt Copy und String-only-Vertrag');
  }
  if (manifest.viewport?.width !== approvedComp.dimensions.width || manifest.viewport?.height !== approvedComp.dimensions.height) {
    throw new Error('Browser-native Source-Manifest verändert den freigegebenen Viewport');
  }

  const source = manifest.source ?? {};
  if (!source.html?.startsWith('.impeccable/comp-builds/') || !source.css?.startsWith('.impeccable/comp-builds/')) {
    throw new Error('Browser-native HTML/CSS-Quelle muss unter .impeccable/comp-builds/ liegen');
  }
  const sourceFiles = [
    ['html', 'htmlSha256', 'Browser-native Comp-HTML', ['.html']],
    ['css', 'cssSha256', 'Browser-native Comp-CSS', ['.css']],
    ['preview', 'previewSha256', 'Browser-native Comp-Preview', ['.png', '.webp', '.jpg', '.jpeg']],
  ];
  for (const [pathKey, hashKey, label, extensions] of sourceFiles) {
    const absolute = await requireFile(source[pathKey], label, extensions);
    if (source[hashKey] !== await sha256(absolute)) throw new Error(`${label} stimmt nicht mit seinem gebundenen Hash überein`);
  }
  const previewDimensions = imageDimensions(repositoryPath(source.preview, 'Browser-native Comp-Preview'), 'Browser-native Comp-Preview');
  if (previewDimensions.width !== manifest.viewport.width || previewDimensions.height !== manifest.viewport.height) {
    throw new Error('Browser-native Comp-Preview stimmt nicht mit dem gebundenen Viewport überein');
  }
  const sourceCss = await readFile(repositoryPath(source.css, 'Browser-native Comp-CSS'), 'utf8');
  if (/scaleX\s*\(/i.test(sourceCss)) throw new Error('Browser-native Comp-CSS darf Typografie nicht mit scaleX fälschen');

  if (!Array.isArray(manifest.assets)) throw new Error('Browser-native Source-Manifest enthält keine Assets');
  const requiredRoles = new Set([
    'display-font', 'display-font-license', 'body-font-regular', 'body-font-license',
    'material-raster', 'exact-icon-sprite', 'exact-route-svg', 'vector-trace-provenance', 'real-browser-proof',
  ]);
  const assetRoles = new Set();
  for (const asset of manifest.assets) {
    if (!asset?.role || assetRoles.has(asset.role)) throw new Error(`Browser-native Assetrolle fehlt oder ist doppelt: ${asset?.role ?? 'unbekannt'}`);
    assetRoles.add(asset.role);
    const absolute = await requireFile(asset.path, `Browser-native Asset ${asset.role}`);
    if (asset.sha256 !== await sha256(absolute)) throw new Error(`Browser-native Asset ${asset.role} stimmt nicht mit seinem Hash überein`);
  }
  for (const role of requiredRoles) if (!assetRoles.has(role)) throw new Error(`Browser-native Assetrolle fehlt: ${role}`);

  const fidelity = manifest.fidelity ?? {};
  const headlineMinimum = Number(fidelity.thresholds?.headlineMaskIouMin);
  const contourMinimum = Number(fidelity.thresholds?.contourIouMin);
  if (!Number.isFinite(headlineMinimum) || headlineMinimum < 0.45 || Number(fidelity.headline?.maskIou) < headlineMinimum) {
    throw new Error('Browser-native Headline erreicht den bindenden Masken-IoU-Schwellenwert nicht');
  }
  const requiredContours = new Set([
    'seen', 'understood', 'requested', 'build', 'local', 'revenue',
    'header-pin', 'top-arrow-1', 'top-arrow-2', 'lower-route',
  ]);
  if (!Number.isFinite(contourMinimum) || contourMinimum < 0.7 || !Array.isArray(fidelity.contours)) {
    throw new Error('Browser-native Kontur-Schwellenwert oder Konturmatrix fehlt');
  }
  for (const row of fidelity.contours) {
    if (!row?.id || Number(row.iou) < contourMinimum) throw new Error(`Browser-native Kontur versagt: ${row?.id ?? 'unbekannt'}`);
    requiredContours.delete(row.id);
  }
  if (requiredContours.size > 0) throw new Error(`Browser-native Konturen fehlen: ${[...requiredContours].join(', ')}`);
  if (!fidelity.realProofException) throw new Error('Echter Browserproof und seine begrenzte B4-Ausnahme sind nicht dokumentiert');

  runDetector([source.html, source.css], 'Browser-native Comp-Quelle');
  pass('browser-native Produktionsquelle, reale Fonts/Lizenzen, exakte SVGs, Hashes und visuelle Schwellenwerte gebunden');
  return { manifest, absolutePath: manifestPath, hash: await sha256(manifestPath) };
}

async function validateSurfaceBrief(gate, direction, approvedComp) {
  const briefPath = await requireFile(gate.surfaceBrief?.path, 'Surface Brief', ['.md']);
  const text = await readFile(briefPath, 'utf8');
  for (const marker of ['THESIS', 'OWN-WORLD', 'STORY', 'FIRST VIEWPORT', 'FORM', direction.seedKey, approvedComp.path]) {
    if (!text.includes(marker)) throw new Error(`Surface Brief enthält ${marker} nicht`);
  }
  pass('Surface Brief bindet Direction Contract, Seed und freigegebenen Comp');
}

async function validateHeroContent(gate, copy) {
  const record = gate.heroContent ?? {};
  const contentPath = await requireFile(record.path, 'Hero-Content-Vertrag', ['.json']);
  const content = await readJson(contentPath, 'Hero-Content-Vertrag');
  if (content.copySha256 !== copy.hash) throw new Error('Hero-Content-Vertrag gehört nicht zur gesperrten Copy');
  const required = [content.headline, content.support, content.primaryCta?.label, content.primaryCta?.support];
  if (required.some(value => !value || typeof value !== 'string')) throw new Error('Hero-Content-Vertrag enthält nicht alle Kerntexte');
  if (!Array.isArray(content.forbiddenVisiblePhrases)) throw new Error('Hero-Content-Vertrag braucht forbiddenVisiblePhrases');
  pass('Hero-Content-Vertrag bindet Pflichttexte und verbotene Altformulierungen');
  return { data: content, absolutePath: contentPath, hash: await sha256(contentPath) };
}

async function validateInventory(gate, approvedComp) {
  const inventoryRecord = gate.inventory ?? {};
  if (inventoryRecord.status !== 'complete' || !inventoryRecord.completedAt) {
    throw new Error('Fidelity-/Medieninventar ist nicht vollständig');
  }
  const inventoryPath = await requireFile(inventoryRecord.path, 'Fidelity-/Medieninventar', ['.json']);
  const inventory = await readJson(inventoryPath, 'Fidelity-/Medieninventar');
  if (inventory.approvedCompSha256 !== approvedComp.hash) throw new Error('Inventar gehört nicht zum freigegebenen Comp');
  if (!Array.isArray(inventory.items)) throw new Error('Inventar enthält keine items');
  const requiredRoles = new Set([
    'topology', 'reading-order', 'focal-scale', 'typography', 'material',
    'proof', 'navigation', 'primary-cta', 'second-fold',
  ]);
  const validMedia = new Set([
    'semantic-html-css-svg', 'existing-project-asset', 'generated-raster',
    'sourced-raster', 'icon-library', 'canvas-webgl', 'accepted-omission',
  ]);
  const ids = new Set();
  const roles = new Set();
  for (const item of inventory.items) {
    if (!item.id || !item.role || !item.medium || !item.commitment) {
      throw new Error('Inventarzeile ohne id, role, medium oder commitment');
    }
    if (ids.has(item.id)) throw new Error(`Inventar-ID doppelt: ${item.id}`);
    ids.add(item.id);
    roles.add(item.role);
    if (!validMedia.has(item.medium)) throw new Error(`Inventar ${item.id}: nicht-offizielles Medium ${item.medium}`);
    if (item.medium === 'accepted-omission' && !item.userApprovedOmission) {
      throw new Error(`Inventar ${item.id}: Auslassung ist keine stillschweigende Implementierungsentscheidung`);
    }
  }
  for (const role of requiredRoles) if (!roles.has(role)) throw new Error(`Inventarrolle fehlt: ${role}`);
  const cta = inventory.items.find(item => item.role === 'primary-cta');
  if (!cta?.semanticControl || cta.medium === 'accepted-omission') {
    throw new Error('Primary CTA braucht eine eigene Inventarzeile und ein semantisches Control');
  }
  const type = inventory.items.find(item => item.role === 'typography');
  if (!type?.compressionClass || !type?.headlineSampleComparison) {
    throw new Error('Typography-Inventar braucht compressionClass und headlineSampleComparison');
  }
  pass('offizielles Fidelity-/Medieninventar vollständig; CTA und Typografie separat gebunden');
  return { data: inventory, absolutePath: inventoryPath, hash: await sha256(inventoryPath) };
}

async function validateAssetProducer(gate, approvedComp, inventory) {
  const producer = gate.assetProducer ?? {};
  if (producer.status !== 'complete' || producer.producer !== 'impeccable-asset-producer' || !producer.completedAt) {
    throw new Error('der offizielle Impeccable Asset Producer wurde noch nicht vollständig ausgeführt');
  }
  const manifestPath = await requireFile(producer.manifest, 'Asset-Producer-Manifest', ['.json']);
  const manifest = await readJson(manifestPath, 'Asset-Producer-Manifest');
  if (manifest.approvedCompSha256 !== approvedComp.hash || manifest.inventorySha256 !== inventory.hash) {
    throw new Error('Asset-Producer-Manifest gehört nicht zu Comp und Inventar');
  }
  if (!Array.isArray(manifest.assets) || !Array.isArray(manifest.reviewedInventoryIds)) {
    throw new Error('Asset-Producer-Manifest braucht assets und reviewedInventoryIds');
  }
  for (const item of inventory.data.items) {
    if (!manifest.reviewedInventoryIds.includes(item.id)) throw new Error(`Asset Producer hat ${item.id} nicht geprüft`);
    if (['generated-raster', 'sourced-raster'].includes(item.medium)) {
      const asset = manifest.assets.find(candidate => candidate.inventoryId === item.id);
      if (!asset) throw new Error(`Bildnative Inventarzeile ${item.id} hat kein Asset`);
      if (asset.status !== 'accepted' || !asset.promptEmbedded || !asset.provenance) {
        throw new Error(`Asset ${asset.id ?? item.id}: nicht akzeptiert oder Prompt/Provenance fehlen`);
      }
      await requireFile(asset.path, `Asset ${asset.id ?? item.id}`, ['.png', '.webp', '.jpg', '.jpeg']);
    }
  }
  pass('Asset Producer hat jede Inventarzeile geprüft und alle bildnativen Assets geliefert');
}

async function validateUpstream() {
  const gate = await loadGate();
  const direction = await validateDirection(gate);
  const copy = await validateCopy(gate);
  const approvedComp = await validateVisualization(gate, copy);
  const productionSource = await validateProductionSource(approvedComp, copy);
  await validateSurfaceBrief(gate, direction, approvedComp);
  const heroContent = await validateHeroContent(gate, copy);
  const inventory = await validateInventory(gate, approvedComp);
  await validateAssetProducer(gate, approvedComp, inventory);
  return { gate, direction, copy, approvedComp, productionSource, heroContent, inventory };
}

function runDetector(relativeTargets, label) {
  const detectorCheck = spawnSync(process.execPath, [detectorScript, '--json', ...relativeTargets], {
    cwd: root,
    encoding: 'utf8',
  });
  if (detectorCheck.status !== 0) {
    const detail = (detectorCheck.stdout || detectorCheck.stderr || '').trim();
    throw new Error(`${label}: Impeccable Detector meldet Fehler${detail ? `: ${detail}` : ''}`);
  }
  pass(`${label}: offizieller Impeccable Detector ist grün`);
}

async function validateHeroProof(upstream) {
  const proof = upstream.gate.heroProof ?? {};
  if (proof.status !== 'pass' || !proof.completedAt) throw new Error('First-Viewport-Proof fehlt oder ist nicht pass');
  const heroHtmlPath = await requireFile(proof.heroHtml, 'Hero-Build HTML', ['.html']);
  const heroCssPath = await requireFile(proof.heroCss, 'Hero-Build CSS', ['.css']);
  if (await sha256(heroHtmlPath) !== upstream.productionSource.manifest.source.htmlSha256) {
    throw new Error('Hero-HTML ist keine bytegleiche Übernahme der browser-nativen Comp-Quelle');
  }
  if (await sha256(heroCssPath) !== upstream.productionSource.manifest.source.cssSha256) {
    throw new Error('Hero-CSS ist keine bytegleiche Übernahme der browser-nativen Comp-Quelle');
  }
  const heroHtml = await readFile(heroHtmlPath, 'utf8');
  for (const marker of ['THESIS', 'OWN-WORLD', 'STORY', 'FIRST VIEWPORT', 'FORM', upstream.direction.seedKey]) {
    if (!heroHtml.includes(marker)) throw new Error(`Hero-Build enthält ${marker} nicht`);
  }
  const content = upstream.heroContent.data;
  const requiredVisibleCopy = [
    content.headline, content.support, content.primaryCta.label, content.primaryCta.support,
    ...content.mechanism.flatMap(item => [item.state, item.body]),
    content.proof.label, content.proof.title, content.proof.linkLabel,
    ...content.products.flatMap(item => [item.title, item.body]),
  ];
  for (const value of requiredVisibleCopy) {
    if (!heroHtml.includes(value)) throw new Error(`Hero-Build enthält gesperrten Text nicht: ${value}`);
  }
  const normalizedHeroHtml = heroHtml.toLocaleLowerCase('de-DE');
  for (const phrase of content.forbiddenVisiblePhrases) {
    if (normalizedHeroHtml.includes(phrase.toLocaleLowerCase('de-DE'))) {
      throw new Error(`Hero-Build enthält verworfene Altformulierung: ${phrase}`);
    }
  }
  const screenshotPath = await requireFile(proof.screenshot, 'Hero-Screenshot', ['.png', '.webp', '.jpg', '.jpeg']);
  const overlayPath = await requireFile(proof.overlay, 'Comp/Bild-Overlay', ['.png', '.webp', '.jpg', '.jpeg']);
  const screenshotDimensions = imageDimensions(screenshotPath, 'Hero-Screenshot');
  const overlayDimensions = imageDimensions(overlayPath, 'Comp/Bild-Overlay');
  const expected = upstream.approvedComp.dimensions;
  for (const [label, dimensions] of [['Hero-Screenshot', screenshotDimensions], ['Overlay', overlayDimensions]]) {
    if (dimensions.width !== expected.width || dimensions.height !== expected.height) {
      throw new Error(`${label} stimmt nicht mit dem Comp-Viewport ${expected.width}×${expected.height} überein`);
    }
  }
  const reportPath = await requireFile(proof.comparisonReport, 'Hero-Fidelity-Matrix', ['.json']);
  const report = await readJson(reportPath, 'Hero-Fidelity-Matrix');
  if (report.disposition !== 'pass' || report.firstViewportOnly !== true) throw new Error('Hero-Fidelity-Matrix ist nicht pass/firstViewportOnly');
  if (report.approvedCompSha256 !== upstream.approvedComp.hash) throw new Error('Hero-Fidelity-Matrix gehört nicht zum freigegebenen Comp');
  if (report.heroHtmlSha256 !== await sha256(heroHtmlPath)) throw new Error('Hero-Fidelity-Matrix gehört nicht zum aktuellen Hero-HTML');
  if (report.heroCssSha256 !== await sha256(heroCssPath)) throw new Error('Hero-Fidelity-Matrix gehört nicht zum aktuellen Hero-CSS');
  if (report.screenshotSha256 !== await sha256(screenshotPath)) throw new Error('Hero-Fidelity-Matrix gehört nicht zum Screenshot');
  if (report.overlaySha256 !== await sha256(overlayPath)) throw new Error('Hero-Fidelity-Matrix gehört nicht zum Overlay');
  if (report.inventorySha256 !== upstream.inventory.hash) throw new Error('Hero-Fidelity-Matrix gehört nicht zum Inventar');
  if (report.heroContentSha256 !== upstream.heroContent.hash) throw new Error('Hero-Fidelity-Matrix gehört nicht zum Hero-Content-Vertrag');
  if (!Array.isArray(report.matrix)) throw new Error('Hero-Fidelity-Matrix enthält keine matrix');
  const matrix = new Map(report.matrix.map(row => [row.inventoryId, row]));
  for (const item of upstream.inventory.data.items) {
    const row = matrix.get(item.id);
    if (!row || !['match', 'acceptable-adaptation'].includes(row.verdict)) {
      throw new Error(`Hero-Fidelity fehlt/versagt für ${item.id}`);
    }
    if (row.verdict === 'acceptable-adaptation' && !row.evidence) {
      throw new Error(`Hero-Anpassung ${item.id} braucht konkrete Evidenz`);
    }
  }
  if (Array.isArray(report.addedWithoutApproval) && report.addedWithoutApproval.length > 0) {
    throw new Error('Hero enthält ohne Comp-Freigabe hinzugefügte Elemente');
  }
  runDetector([proof.heroHtml, proof.heroCss], 'Hero-Proof');
  pass('First Viewport bei identischen Abmessungen mit Overlay und vollständiger Fidelity-Matrix bewiesen');
  return { screenshotPath, report };
}

function changeFlags(enabled, relativeTargets) {
  const existing = relativeTargets.filter(path => spawnSync('test', ['-e', path], { cwd: root }).status === 0);
  if (existing.length === 0) return;
  if (process.platform === 'darwin') {
    const flag = enabled ? 'uchg' : 'nouchg';
    const result = spawnSync('chflags', [flag, ...existing], { cwd: root, encoding: 'utf8' });
    if (result.status !== 0) throw new Error(result.stderr.trim() || `chflags ${flag} fehlgeschlagen`);
    return;
  }
  const mode = enabled ? 'a-w' : 'u+w';
  const result = spawnSync('chmod', [mode, ...existing], { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr.trim() || `chmod ${mode} fehlgeschlagen`);
}

async function prepareHeroFiles() {
  for (const relativePath of heroTargets) {
    const absolute = repositoryPath(relativePath, 'Hero-Zieldatei');
    await mkdir(dirname(absolute), { recursive: true });
    try {
      await access(absolute);
    } catch {
      await writeFile(absolute, '');
    }
  }
}

function lockStatus(relativeTargets) {
  const existing = relativeTargets.filter(path => spawnSync('test', ['-e', path], { cwd: root }).status === 0);
  if (existing.length === 0) return;
  const options = process.platform === 'darwin' ? ['-lO', ...existing] : ['-l', ...existing];
  const result = spawnSync('ls', options, { cwd: root, encoding: 'utf8' });
  process.stdout.write(result.stdout);
  if (result.status !== 0) throw new Error(result.stderr.trim() || 'Lock-Status nicht lesbar');
}

function isImmutable(relativePath) {
  if (process.platform === 'darwin') {
    const result = spawnSync('ls', ['-lO', relativePath], { cwd: root, encoding: 'utf8' });
    return result.status === 0 && /\buchg\b/.test(result.stdout);
  }
  const result = spawnSync('test', ['-w', relativePath], { cwd: root });
  return result.status !== 0;
}

async function validateCommit() {
  const upstream = await validateUpstream();
  const heroProof = await validateHeroProof(upstream);
  const implementation = upstream.gate.implementation ?? {};
  if (implementation.status !== 'visually-approved') throw new Error('Desktop-Erstbuild ist noch nicht von Mario visuell freigegeben');
  const readiness = implementation.releaseReadiness ?? {};
  if (readiness.responsive?.status !== 'pass') throw new Error('Responsive-Release-Gate ist nicht bestanden');
  if (readiness.legal?.status !== 'pass') throw new Error('Legal-Release-Gate ist nicht bestanden');
  if (readiness.legal?.licensingAuthorityVerified !== true) {
    throw new Error('Impressum: ausstellende Lizenz-/Registerbehörde ist nicht gegen die aktuelle Trade License verifiziert');
  }
  if (readiness.industryRegistry?.status !== 'pass') throw new Error('Branchen-Registry ist nicht verifiziert');

  const bindings = implementation.releaseBindings ?? {};
  for (const relativePath of releaseTargets) {
    const expected = bindings[relativePath];
    if (!/^[a-f0-9]{64}$/.test(expected ?? '')) throw new Error(`Release-Hash fehlt: ${relativePath}`);
    const absolute = await requireFile(relativePath, `Releasequelle ${relativePath}`);
    if (await sha256(absolute) !== expected) throw new Error(`Releasequelle nach QA verändert: ${relativePath}`);
  }
  const responsiveQa = await requireFile(readiness.responsive.qaScript, 'Responsive-QA-Script', ['.mjs']);
  if (await sha256(responsiveQa) !== readiness.responsive.qaScriptSha256) {
    throw new Error('Responsive-QA-Script nach bestandenem Gate verändert');
  }
  const registryPath = await requireFile(readiness.industryRegistry.path, 'Branchen-Registry', ['.json']);
  if (await sha256(registryPath) !== readiness.industryRegistry.sha256) throw new Error('Branchen-Registry nach QA verändert');
  const registry = await readJson(registryPath, 'Branchen-Registry');
  const shk = registry.industries?.shk;
  if (registry.globalIndustryHub?.status !== 'blocked' || shk?.requiredTemplateCount !== 3 || shk?.currentTemplateCount !== 2) {
    throw new Error('Branchen-Registry bildet den aktuellen SHK-Stand 2/3 nicht fail-closed ab');
  }
  if (shk.currentTemplateCount !== shk.templates?.length || shk.publicHubEligible !== false || shk.outreachEligible !== false) {
    throw new Error('SHK-Hub oder Outreach ist vor 3/3 Templates unzulässig geöffnet');
  }

  const screenshot = await requireFile(implementation.desktopScreenshot, 'Desktop-Build-Screenshot', ['.png', '.webp', '.jpg', '.jpeg']);
  if (await sha256(screenshot) !== implementation.desktopScreenshotSha256) throw new Error('Desktop-Build-Screenshot-Hash stimmt nicht');
  const firstViewport = await requireFile(implementation.firstViewportScreenshot, 'First-Viewport-Screenshot', ['.png', '.webp', '.jpg', '.jpeg']);
  const firstViewportHash = await sha256(firstViewport);
  if (firstViewportHash !== implementation.firstViewportSha256) throw new Error('First-Viewport-Screenshot-Hash stimmt nicht');
  if (firstViewportHash !== await sha256(heroProof.screenshotPath)) throw new Error('Finaler First Viewport ist nicht pixelidentisch zum bewiesenen Hero');
  await requireApproval(implementation.visualApproval, 'Desktop-Erstbuild', implementation.desktopScreenshot);
  const dimensions = imageDimensions(screenshot, 'Desktop-Build-Screenshot');
  if (dimensions.width !== upstream.approvedComp.dimensions.width) {
    throw new Error('Desktop-Build-Screenshot wurde nicht in der freigegebenen Comp-Breite aufgenommen');
  }
  const html = await readFile(repositoryPath('index.html', 'index.html'), 'utf8');
  for (const marker of ['THESIS', 'OWN-WORLD', 'STORY', 'FIRST VIEWPORT', 'FORM', upstream.direction.seedKey]) {
    if (!html.includes(marker)) throw new Error(`emittiertes index.html enthält ${marker} nicht`);
  }
  runDetector(releaseTargets, 'Release-Build');
  if (!releaseTargets.every(isImmutable)) throw new Error('Haupt- und Rechtseiten-Dateien müssen vor Commit wieder uchg-gesperrt sein');
  pass('Mario-Freigabe, Responsive-/Legal-Gates, Branchenstatus, Hashbindungen, Detector und Relock für Commit vorhanden');
}

const action = process.argv[2] ?? 'check-upstream';
try {
  if (action === 'check-upstream') {
    await validateUpstream();
    process.stdout.write('UPSTREAM GATE OPEN: Hero-Reproduktion darf beginnen.\n');
  } else if (action === 'open-hero') {
    await validateUpstream();
    await prepareHeroFiles();
    changeFlags(false, heroTargets);
    process.stdout.write('HERO GATE OPEN: nur .impeccable/hero-build darf jetzt den freigegebenen First Viewport reproduzieren.\n');
    lockStatus([...heroTargets, ...mainTargets]);
  } else if (action === 'unlock-page') {
    const upstream = await validateUpstream();
    await validateHeroProof(upstream);
    changeFlags(true, heroTargets);
    changeFlags(false, mainTargets);
    process.stdout.write('PAGE GATE OPEN: bewiesener Hero darf jetzt in die vollständige Desktop-Seite übernommen werden.\n');
    lockStatus([...heroTargets, ...mainTargets]);
  } else if (action === 'unlock-release') {
    const upstream = await validateUpstream();
    await validateHeroProof(upstream);
    changeFlags(true, heroTargets);
    changeFlags(false, releaseTargets);
    process.stdout.write('RELEASE GATE OPEN: Haupt- und Legal-Releasequellen dürfen für Responsive/Legal-QA bearbeitet werden; Hero bleibt gesperrt.\n');
    lockStatus([...heroTargets, ...releaseTargets]);
  } else if (action === 'commit') {
    await validateCommit();
    process.stdout.write('COMMIT GATE OPEN: visuell freigegebener, erneut gesperrter Desktop-Build.\n');
  } else if (action === 'lock') {
    changeFlags(true, [...heroTargets, ...releaseTargets]);
    process.stdout.write('LOCKED: Hero-, Hauptseiten- und Legal-Dateien sind user-immutable.\n');
    lockStatus([...heroTargets, ...releaseTargets]);
  } else if (action === 'status') {
    lockStatus([...heroTargets, ...releaseTargets]);
  } else {
    fail('Usage: node .impeccable/main-site-production-gate.mjs <check-upstream|open-hero|unlock-page|unlock-release|commit|lock|status>');
  }
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}
