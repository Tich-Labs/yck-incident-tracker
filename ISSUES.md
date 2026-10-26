# Issues

Claims, documentation, data and housekeeping problems in the YCK Incident Tracker. Runtime bugs are in [BUGS.md](BUGS.md).

The core problem: several public-facing surfaces (landing page, README, Devpost, admin manual, work page) describe features that are not built. Each entry below says what the code actually does.

Status key: **Open**, **In progress**, **Done**.

## What is built (verified in code)

- Anonymous 5-step intake, three reporter types, reference code
- Offline queue and installable PWA
- Dashboard, incident list, status, assignment, escalation
- Referral matching against seeded services
- Rule-based risk scoring (0–100); optional AI path via the MCP server
- Staff approval of referral suggestions
- Five roles enforced by Row Level Security
- Audit log
- Reports with charts and anonymized CSV export
- FHIR R4 bundle generation
- English and Swahili, Quick Exit
- MCP server with three tools

## Not built (claimed somewhere)

- PDF report export
- Email or in-app notifications, including "notifies senior staff"
- "Community Mobilizer" role (no such role in the database)
- Weekly, monthly and annual summaries
- AI-assisted risk scoring as the default (the default path is rule-based)
- WSO2 / national health system integration
- SMS reporting (proposed under Kesi Yangu, not built)

## Claims to correct

| ID | Where | Claim | What the code shows | Status |
|----|-------|-------|---------------------|--------|
| I-01 | Landing page (`frontend/src/locales/en/landing.json`, `Index.tsx`) | "PDF Export", "Automated Workflow Notifications", "Email alerts trigger at every stage", "Community Mobilizer" step, "Weekly, monthly, and annual summaries" | None of these are built | Done. Replaced with Audit Trail and Anonymized CSV Export; Community Mobilizer step removed; reporting copy now describes charts + CSV. English and Swahili |
| I-02 | Landing page hero | "automate response workflows" | Not built | Done. Now says "coordinate referrals" |
| I-03 | Admin manual, Email Notifications section (`SectionEmails`) | Emails sent for new incident, assignment, escalation and confirmation; sender "the Hercules platform" | No email sending code exists. Hercules is the older build | Done. Section rewritten as "Notifications" and states plainly that no email/SMS/push is sent; assignment and escalation copy corrected |
| I-04 | Admin manual, Roadmap | "Human oversight approval UI" listed as planned | Approve/reject UI exists in `ai-recommendations.tsx`, but choices are client-side only | Done. Row now reads "Persist staff approval of AI suggestions" |
| I-05 | Admin manual, AI Assistant section | Describes the assistant | Added 26 Oct. MCP server is currently unreachable | Done locally. Note that the assistant needs a running MCP server |
| I-06 | Incident detail page | "Mark as urgent — notifies senior staff" | No notification is sent | Done. Now reads "Flags the case for senior review" |
| I-07 | README | "collects no PII (age group and gender only)" | Reference code uses initials, birth month and birth year; those are not stored, but an optional contact can be | Done. README states exactly what is stored, what is shown once, and what is optional |
| I-08 | README | "Risk Assessment — automated severity scoring" | Rule-based. AI path is optional | Done. README now says rule-based by default, AI optional |
| I-09 | README | "Quick Exit … clears session data" | It clears `sessionStorage` only, not `localStorage` or the offline queue | Done. README and manual say "clears session storage" |
| I-10 | Devpost page | "Zero PII collected … from their initials and birth date" | Birth month and year are collected to build the code | Open |
| I-11 | Devpost page | "AI referral matching … runs entirely client-side, no API calls" | AI Assistant calls the MCP server. Only the incident suggestions panel is client-side | Open |
| I-12 | Devpost page | "integrated with OpenAI" | MCP server supports Groq, Ollama and OpenAI | Open |
| I-13 | Devpost page | "44+ verified referral services" and "30+" | `supabase/seed.sql` has 35 service rows. "30+" is true; "44+" is not | Done in-repo (`docs/index.html`, `guide/index.html` now say 35). External Devpost copy still needs the same edit |
| I-14 | Devpost page | Audit log "immutable" | RLS is enabled, but no immutability policy found | Open. In-repo manual no longer says "immutable" |
| I-15 | Devpost page | Links to `WSO2_INTEGRATION.md` | File does not exist in the repo | Open |
| I-16 | Work page (naijeriatoweett.com/work, external) | "Anonymized PDF reporting", "AI-powered risk assessment", "Automated workflow notifications" | CSV export only; rule-based scoring; no notifications | Open (site edit, outside this repo) |
| I-17 | Work page, Incident Tracker link | `tich-labs.github.io/yck-incident-tracker/en` | Returns 404 directly. Use the root URL | Open (site edit, outside this repo) |

## Admin manual platform cleanup

The manual also described the old Hercules/Convex platform (Hercules Backend, Database, Auth, Email, Cloud, App Builder). That has been corrected to Supabase, GitHub Pages and `is_active`. Remaining manual content has not been re-reviewed line by line; treat it as fixed for platform and notifications, unverified elsewhere.

## PII wording (single source of truth needed)

The reference code is built from initials and birth month and year. The app does not store those as fields, but they are collected and used to build the code. Every public statement must say this, or the code must change. Affected: README, landing page, Devpost, EOI (already corrected), admin manual privacy section.

- Decide: keep the birth-month/year reference code, or change it.
- Then align all of I-07, I-10, and the landing page "PII anonymized by default" claim.

## Data

| ID | Issue | Status |
|----|-------|--------|
| D-01 | Seed data: 35 referral services. Devpost and marketing claim 30+ and 44+ | Open |
| D-02 | Seed data covers Kakamega and Vihiga only. Busia/Teso data is part of the Kesi Yangu proposal, not built | Open (proposal scope) |
| D-03 | Demo data used age groups outside the app's enum (`18-24`, `15-17`, `25-34`, `0-9`) and dated every incident today, so charts showed raw keys and date filters did nothing | Fixed (normalized to app enums; dates derived from `createdAt`) |

## Deployment

| ID | Issue | Status |
|----|-------|--------|
| X-01 | Railway MCP server `https://yck-incident-tracker-production.up.railway.app/` returns HTTP 404 "Application not found". README listed it as live. Service is deleted, suspended, or its domain was removed. The AI Assistant, risk scoring via MCP, and referral matching via MCP depend on it | Closed by decision: Railway is not used. README now states the MCP server is self-hosted only. The AI Assistant button is hidden unless `VITE_MCP_SERVER_URL` and `VITE_MCP_API_KEY` are set. Remove the dead URL from the GitHub Actions secrets |
| X-02 | README documents a plaintext MCP API key (`yck-dev-key-2026`) under "Adding the MCP server to Prompt Opinion" | Open. Rotate the key on any deployment and remove it from the README |

## Housekeeping

| ID | Issue | Status |
|----|-------|--------|
| H-01 | EOI materials (`eoi/`, `EOI-SHOWCASE.md`, `eoi-site/`) are still in this repo. The public copy of `eoi-site/index.html` remains in git history with the older budget | Open. Backup is in `../eoi-materials/`. Removing from history needs a force push and is a separate decision |
| H-02 | Uncommitted changes on `main`: `README.md`, `BUGS.md`, `ISSUES.md`, `frontend/public/sw.js`, `frontend/src/hooks/use-supabase-query.ts`, `frontend/src/lib/demo-data.ts`, `frontend/src/pages/{users,referral,reports,audit}/page.tsx`, `frontend/src/pages/admin/{manual,services}/page.tsx`, `frontend/src/pages/incidents/{page,detail/page}.tsx`, `frontend/src/pages/app/_components/AppLayout.tsx`, plus deleted `pages/admin/services/AdminServicesInner.tsx` and the EOI files | Open (commit and push after review) |
| H-03 | Two open PRs from May 2026 ("Document branch changes…" on `google-hackathon-2026`, and a Railway deploy fix) | Needs triage. The Railway PR can be closed now that Railway is not used |
| H-04 | Repo description is empty | Open |
| H-05 | Dependencies not installed; build/lint not run after the local fixes | Done: `npm install`, `tsc --noEmit` clean, lint 0 errors, build passes |

## Technical debt (caused the bug cluster)

| ID | Issue | Status |
|----|-------|--------|
| T-01 | `useSupabaseQuery()` accepts no `queryFn` and silently returns a permanently-disabled query. Five pages were written against that stubbed signature and never load. Make `queryFn` required, or throw in development | Open |
| T-02 | `useSupabaseQueryCamel` builds its cache key from `queryFn.toString()`, so two different closures with identical source can share a cache entry. Pass an explicit key or accept one as an argument | Open |
| T-03 | `jspdf` and `jspdf-autotable` are installed but unused (PDF export is not built; the admin roadmap lists it as planned) | Open (remove or implement) |
| T-04 | The app reads `VITE_SUPABASE_URL` at import time. With no env set, `createClient` throws and nothing renders. A local `.env.local` with dummy values was used to verify demo mode | Open (document in README) |
