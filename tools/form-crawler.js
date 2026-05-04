import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectFormType, scoreFormCandidate } from './form-source-scorer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CATALOG_PATH = path.join(repoRoot, 'data', 'court-catalog.json');
const COUNTIES_PATH = path.join(repoRoot, 'data', 'ohio-counties.json');
const REVIEW_QUEUE_PATH = path.join(repoRoot, 'admin', 'review-queue.json');

const args = process.argv.slice(2);
const getArg = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const DRY_RUN = !args.includes('--apply');
const filters = { state: getArg('state'), county: getArg('county'), tier: getArg('tier') };

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const SEARCH_QUERIES = (court) => [
  `${court.courtName} record sealing application PDF`,
  `${court.courtName} expungement application PDF`,
  `${court.county} County Ohio application for sealing 2953.32 PDF`,
  `${court.county} County Clerk of Courts sealing records forms PDF`,
  `${court.courtName} dismissal not guilty no bill sealing PDF`
];

async function readJson(filePath, fallback) { try { return JSON.parse(await fs.readFile(filePath, 'utf8')); } catch { return fallback; } }
const nowIso = () => new Date().toISOString();

async function searchSerp(query) {
  if (!SERPAPI_KEY) return [];
  const u = new URL('https://serpapi.com/search.json');
  u.searchParams.set('engine', 'google'); u.searchParams.set('q', query); u.searchParams.set('api_key', SERPAPI_KEY);
  const r = await fetch(u); if (!r.ok) return [];
  const p = await r.json();
  return (p.organic_results || []).map((x) => ({ title: x.title, link: x.link, snippet: x.snippet || '' }));
}

async function tryDownloadPdf(url, localPath) {
  const r = await fetch(url, { headers: { 'user-agent': 'RecordPathAI Form Crawler/2.0' } });
  if (!r.ok) throw new Error(`Download failed: ${r.status}`);
  const type = (r.headers.get('content-type') || '').toLowerCase();
  if (!url.toLowerCase().includes('.pdf') && !type.includes('pdf')) throw new Error('Not a PDF content-type');
  const bytes = Buffer.from(await r.arrayBuffer());
  await fs.mkdir(path.dirname(localPath), { recursive: true });
  await fs.writeFile(localPath, bytes);
}

function buildMetadata(court, candidate, scored, pdfAccess, localPath = '') {
  return {
    state: court.state,
    county: court.county,
    countySlug: court.countySlug,
    courtName: court.courtName,
    courtType: court.courtType,
    formType: scored.formType || detectFormType(candidate.title, candidate.link, candidate.snippet),
    sourceUrl: candidate.link || '',
    sourcePageUrl: candidate.sourcePageUrl || candidate.link || '',
    localPath,
    pdfAccess,
    status: 'pending_review',
    requiresMapping: true,
    mapped: false,
    active: false,
    discoveredAt: nowIso(),
    lastVerified: nowIso(),
    score: scored.score,
    signals: scored.signals
  };
}

(async function main() {
  const [catalog, counties, existingQueue] = await Promise.all([
    readJson(CATALOG_PATH, []), readJson(COUNTIES_PATH, []), readJson(REVIEW_QUEUE_PATH, [])
  ]);

  const countyBySlug = new Map(counties.map((c) => [c.slug, c]));
  const courts = catalog.filter((court) => {
    if (filters.state && court.state !== filters.state) return false;
    if (filters.county && court.countySlug !== filters.county.toLowerCase()) return false;
    if (filters.tier) return countyBySlug.get(court.countySlug)?.tier === filters.tier;
    return true;
  });

  const dedupe = new Set(existingQueue.map((q) => `${q.sourceUrl}|${q.localPath}`));
  const queue = [...existingQueue];

  for (const court of courts) {
    console.log(`Scanning: ${court.courtName}`);
    let best = null;
    for (const query of SEARCH_QUERIES(court)) {
      try {
        const results = await searchSerp(query);
        for (const candidate of results) {
          const scored = scoreFormCandidate(candidate, court);
          if (scored.score < 10) continue;
          if (!best || scored.score > best.scored.score) best = { candidate: { ...candidate, searchQuery: query }, scored };
        }
      } catch (e) {
        console.warn(`Query failed (${query}): ${e.message}`);
      }
    }

    if (!best) { console.warn(`No viable candidates for ${court.courtName}`); continue; }

    const formType = best.scored.formType || 'unknown';
    const localPathRel = `assets/forms/ohio/${court.countySlug}/${court.courtType}/${formType}.pdf`;
    const localPathAbs = path.join(repoRoot, localPathRel);
    let pdfAccess = 'unknown';
    let localPath = '';

    if ((best.candidate.link || '').toLowerCase().includes('.pdf')) {
      if (!DRY_RUN) {
        try {
          await tryDownloadPdf(best.candidate.link, localPathAbs);
          pdfAccess = 'downloaded';
          localPath = localPathRel;
        } catch {
          pdfAccess = 'manual_download_required';
        }
      } else {
        pdfAccess = 'unknown';
      }
    } else {
      pdfAccess = 'manual_download_required';
    }

    const metadata = buildMetadata(court, best.candidate, best.scored, pdfAccess, localPath);
    const key = `${metadata.sourceUrl}|${metadata.localPath}`;
    if (!dedupe.has(key)) {
      queue.push(metadata);
      dedupe.add(key);
    }

    if (!DRY_RUN && pdfAccess === 'downloaded') {
      const metaPath = path.join(repoRoot, `assets/forms/ohio/${court.countySlug}/${court.courtType}/metadata.json`);
      await fs.mkdir(path.dirname(metaPath), { recursive: true });
      await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
    }

    console.log(`Candidate: ${metadata.sourceUrl} [score=${metadata.score}] [access=${metadata.pdfAccess}]`);
  }

  await fs.writeFile(REVIEW_QUEUE_PATH, JSON.stringify(queue, null, 2) + '\n');
  console.log(`Done (${DRY_RUN ? 'dry-run' : 'apply'}). Updated admin/review-queue.json`);
})();
