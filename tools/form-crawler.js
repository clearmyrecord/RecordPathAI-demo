import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');

const CATALOG_PATH = path.join(repoRoot, 'data', 'court-catalog.json');
const REVIEW_QUEUE_PATH = path.join(repoRoot, 'admin', 'review-queue.json');
const FORM_KEYWORDS = [
  'record sealing',
  'expungement',
  'application to seal',
  '2953.32',
  '2953.33',
  'dismissal',
  'non-conviction',
  'no bill'
];
const ALLOWED_SOURCE_TOKENS = ['.gov', '.us', 'clerk', 'court', 'municipal', 'commonpleas', 'county'];
const DRY_RUN = !process.argv.includes('--apply');

async function readJson(filePath, fallback) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return fallback;
  }
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function officialSource(url) {
  try {
    const lower = new URL(url).hostname.toLowerCase();
    return ALLOWED_SOURCE_TOKENS.some((token) => lower.includes(token));
  } catch {
    return false;
  }
}

function keywordMatch(text) {
  const normalized = text.toLowerCase();
  return FORM_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

async function fetchHtml(url) {
  const response = await fetch(url, { headers: { 'user-agent': 'RecordPathAI Form Crawler/1.0' } });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  return response.text();
}

function discoverPdfLinks(html, baseUrl) {
  const links = [];
  const anchorPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  let match;
  while ((match = anchorPattern.exec(html)) !== null) {
    const href = (match[1] || '').trim();
    const text = (match[2] || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!href) continue;

    let url;
    try {
      url = new URL(href, baseUrl).toString();
    } catch {
      continue;
    }

    const looksLikePdf = url.toLowerCase().includes('.pdf');
    const relevant = keywordMatch(`${text} ${url}`);

    if (looksLikePdf && relevant && officialSource(url)) {
      links.push({
        sourceUrl: url,
        formTitle: text || path.basename(new URL(url).pathname)
      });
    }
  }

  return links;
}

async function saveFile(url, outPath) {
  const response = await fetch(url, { headers: { 'user-agent': 'RecordPathAI Form Crawler/1.0' } });
  if (!response.ok) throw new Error(`Download failed ${url}: ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(outPath, bytes);
}

async function main() {
  const courts = await readJson(CATALOG_PATH, []);
  const existingQueue = await readJson(REVIEW_QUEUE_PATH, []);
  const queue = [...existingQueue];

  console.log(`Form crawler running in ${DRY_RUN ? 'dry-run' : 'apply'} mode.`);

  for (const court of courts) {
    if (court.status !== 'active') continue;

    console.log(`Scanning ${court.courtName}...`);

    try {
      const html = await fetchHtml(court.formsPage);
      const found = discoverPdfLinks(html, court.formsPage);

      for (const item of found) {
        const stateSlug = slugify(court.state);
        const countySlug = slugify(court.county);
        const courtTypeSlug = slugify(court.courtType);
        const formsDir = path.join(repoRoot, 'assets', 'forms', stateSlug, countySlug, courtTypeSlug);
        const fileName = slugify(item.formTitle) || path.basename(new URL(item.sourceUrl).pathname);
        const pdfPath = path.join(formsDir, `${fileName}.pdf`);
        const metadataPath = path.join(formsDir, `${fileName}.metadata.json`);

        const queueItem = {
          court: court.courtName,
          county: court.county,
          state: court.state,
          courtType: court.courtType,
          formTitle: item.formTitle,
          sourceUrl: item.sourceUrl,
          localPath: path.relative(repoRoot, pdfPath),
          status: 'pending_review',
          discoveredAt: new Date().toISOString(),
          requiresMapping: true
        };

        const duplicate = queue.some((existing) => existing.sourceUrl === queueItem.sourceUrl && existing.court === queueItem.court);
        if (duplicate) continue;

        queue.push(queueItem);

        if (DRY_RUN) {
          console.log(`[DRY RUN] Queued ${item.formTitle} (${item.sourceUrl})`);
          continue;
        }

        await fs.mkdir(formsDir, { recursive: true });

        const alreadyExists = await fs.access(pdfPath).then(() => true).catch(() => false);
        if (alreadyExists) {
          console.log(`Skipping existing file ${pdfPath}`);
          continue;
        }

        await saveFile(item.sourceUrl, pdfPath);

        const metadata = {
          ...queueItem,
          downloadedAt: new Date().toISOString(),
          crawlerVersion: '1.0.0'
        };
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
        console.log(`Downloaded ${pdfPath}`);
      }
    } catch (error) {
      console.warn(`Unable to scan ${court.courtName}: ${error.message}`);
    }
  }

  await fs.writeFile(REVIEW_QUEUE_PATH, JSON.stringify(queue, null, 2));
  console.log(`Review queue updated: ${REVIEW_QUEUE_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
