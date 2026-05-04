# RecordPathAI Form Ingestion Workflow

This document defines the first ingestion flow for official court sealing/expungement forms.

## Pipeline

1. **Find**
   - `tools/form-crawler.js` reads `data/court-catalog.json`.
   - For each active court, it scans court forms pages for relevant PDF links tied to sealing/expungement keywords.
2. **Download**
   - In `--apply` mode only, it downloads matching PDFs to `assets/forms/{state}/{county}/{courtType}/`.
   - Dry-run mode is the default to avoid silent ingestion.
3. **Metadata**
   - Each downloaded form gets a sidecar metadata file (`*.metadata.json`) with source URL, discovered time, and review fields.
4. **Review**
   - Every discovered form is appended to `admin/review-queue.json` with `status: pending_review`.
   - `admin/asset-manager.html` provides a simple review UI for triage.
5. **Map**
   - Reviewed forms marked as valid should be mapped in the PDF mapper workflow (`pdf-mapper-v5.html` and related mapping configs).
6. **Activate**
   - Activation must be explicit after review + mapping validation. No auto-activation is allowed.

## Why forms must not activate automatically

Court forms change without notice. Automatic activation can cause users to submit outdated or invalid packets, creating legal risk, user harm, and support burden. A review gate ensures:

- human verification of source authenticity,
- mapping quality checks before production usage,
- auditability for compliance and rollback.

## How this connects to packet generation

- `packet.html` and the packet engine rely on stable, correctly mapped templates.
- This ingestion system feeds candidate PDFs into the review queue first.
- Once a form is approved and mapped, it can be registered as a template used by the packet and PDF fill flows.
