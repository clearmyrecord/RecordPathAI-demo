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
const SERPAPI_KEY = process.env.SERPAPI_KEY;

const SAFE_SEED_DISCOVERIES = {
  'Wood County Court of Common Pleas': [
    {
      sourceUrl: 'https://clerkofcourt.co.wood.oh.us/wp-content/uploads/2024/02/Application-for-Sealing-2953.32.pdf',
      formTitle: 'Application for Sealing 2953.32 (Conviction)',
      discoveryMethod: 'safeSeed'
    }
  ],
  'Franklin County Court of Common Pleas': [
    {
      sourceUrl: 'https://clerk.franklincountyohio.gov/CLCT-website/media/docs/general/Application-to-Seal-Record-of-Conviction-2953-32-B1a.pdf',
      formTitle: 'Application to Seal Record of Conviction (R.C. 2953.32)',
      discoveryMethod: 'safeSeed'
    }
  ]
};

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
        formTitle: text || path.basename(new URL(url).pathname),
        discoveryMethod: 'formsPage'
      });
    }
  }

  return links;
}


function buildSerpQueries(court) {
  return [
    `${court.courtName} record sealing application PDF`,
    `${court.courtName} expungement application PDF`,
    `${court.courtName} application to seal record 2953.32 PDF`,
    `${court.county} County Ohio clerk sealing records PDF`
  ];
}

function normalizeDiscovery(item, fallbackTitle = '') {
  const title = (item.title || fallbackTitle || '').trim();
  const sourceUrl = (item.link || item.sourceUrl || '').trim();
  if (!sourceUrl) return null;
  const relevant = keywordMatch(`${title} ${sourceUrl}`);
  const looksLikePdf = sourceUrl.toLowerCase().includes('.pdf');
  if (!relevant || !looksLikePdf || !officialSource(sourceUrl)) return null;
  return {
    sourceUrl,
    formTitle: title || path.basename(new URL(sourceUrl).pathname)
  };
}

async function searchSerpApi(query) {
  if (!SERPAPI_KEY) {
    return [];
  }

  const searchUrl = new URL('https://serpapi.com/search.json');
  searchUrl.searchParams.set('engine', 'google');
  searchUrl.searchParams.set('q', query);
  searchUrl.searchParams.set('api_key', SERPAPI_KEY);

  const response = await fetch(searchUrl, { headers: { 'user-agent': 'RecordPathAI Form Crawler/1.0' } });
  if (!response.ok) {
    throw new Error(`SerpAPI request failed for "${query}": ${response.status}`);
  }

  const payload = await response.json();
  const candidates = [
    ...(payload.organic_results || []),
    ...(payload.inline_videos || []),
    ...(payload.related_results || [])
  ];

  return candidates
    .map((candidate) => normalizeDiscovery(candidate, query))
    .filter(Boolean);
}

async function discoverWithSerpApi(court) {
  const queries = buildSerpQueries(court);
  const discovered = [];

  for (const query of queries) {
    try {
      const results = await searchSerpApi(query);
      for (const result of results) {
        discovered.push({ ...result, discoveryMethod: 'serpapi', searchQuery: query });
      }
    } catch (error) {
      console.warn(`SerpAPI search failed for ${court.courtName} query "${query}": ${error.message}`);
    }
  }

  return discovered;
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
  if (!SERPAPI_KEY) {
    console.log('SERPAPI_KEY not set; SerpAPI fallback is disabled.');
  }

  for (const court of courts) {
    if (court.status !== 'active') continue;

    console.log(`Scanning ${court.courtName}...`);

    try {
      let found = [];
      try {
        const html = await fetchHtml(court.formsPage);
        found = discoverPdfLinks(html, court.formsPage);
      } catch (error) {
        console.warn(`Unable to fetch forms page for ${court.courtName}: ${error.message}`);
      }

      if (!found.length) {
        const seeded = SAFE_SEED_DISCOVERIES[court.courtName] || [];
        if (seeded.length) {
          console.log(`Using safe seed discovery for ${court.courtName}.`);
          found = seeded;
        }
      }

      if (!found.length) {
        console.log(`No form PDFs found on forms page for ${court.courtName}; trying SerpAPI fallback.`);
        found = await discoverWithSerpApi(court);
      }

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
          requiresMapping: true,
          discoveryMethod: item.discoveryMethod || 'formsPage',
          searchQuery: item.searchQuery || null
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
