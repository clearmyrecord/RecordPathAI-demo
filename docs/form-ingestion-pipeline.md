# RecordPathAI Form Ingestion Pipeline

## Pipeline Overview
Court Catalog → Search/Crawl → Official Source Scoring → PDF Detection → Download Local Copy → Metadata → Review Queue → Mapper Queue → Template Activation.

## Discovery
- `data/ohio-counties.json` defines Ohio county tiers and discovery status.
- `data/court-catalog.json` is generated from counties and contains court targets.
- `tools/form-crawler.js` reads the catalog, applies `--state`, `--county`, and `--tier` filters, then issues multiple search queries per court.
- Dry-run mode is default; `--apply` enables local downloads and metadata file writes.

## Official-Source Scoring
- `tools/form-source-scorer.js` scores results using court/clerk/official domain indicators and legal-form keywords.
- Signals such as `.gov`, `.us`, `clerk`, `court`, `commonpleas`, `municipal`, and `county` increase score.
- Marketing/directory/legal-advertising domains are penalized.
- Form classification output: `sealing-conviction`, `sealing-dismissal`, `sealing-nonconviction`, `expungement`, or `unknown`.

## Review Queue
- Discovered entries are appended to `admin/review-queue.json`.
- Entries are deduplicated by `sourceUrl` + `localPath`.
- All new items remain safe by default:
  - `status: pending_review`
  - `requiresMapping: true`
  - `mapped: false`
  - `active: false`

## Approval Workflow
1. Open `admin/asset-manager.html`.
2. Filter by state/county/court/form/status.
3. Validate source page and PDF.
4. Mark item as Approved / Rejected / Needs Mapping.
5. Copy metadata for mapper tasks.

## Mapping Workflow
1. Use approved metadata to build mapper config for the selected form.
2. Validate field mapping against local PDF copy.
3. Mark `mapped: true` in system workflows once mapper is verified.

## Activation Workflow
- Activation is intentionally separate and manual.
- Only mapped, approved templates belong in `templates/index.json`.
- The crawler and review UI do **not** auto-activate templates.

## Why Court PDF Hotlinks Are Unreliable
- Courts regularly move files, alter URLs, or gate assets behind sessions/CDN rules.
- Some servers block bots or reject direct binary requests.
- A valid source page may exist while direct PDF access fails.

## Why RecordPathAI Stores Reviewed Local Copies
- Stable local assets prevent breakage from upstream URL churn.
- Reviewed copies improve reproducibility of mapping and packet assembly.
- Local provenance metadata supports auditability and safer template lifecycle management.
