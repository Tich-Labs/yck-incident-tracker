# Tich Labs SGBV Case Management

A multi-tenant, trauma-informed SaaS platform for logging, managing, and referring Sexual and Gender-Based Violence (SGBV) incidents. Built for the **Google for Startups AI Agents Challenge** — deployable offline-first as a PWA, AI-augmented via MCP, and FHIR R4 interoperable.

[![Deploy to GitHub Pages](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml)

**Live app**: https://tich-labs.github.io/yck-incident-tracker/\
**Interactive guide**: https://tich-labs.github.io/yck-incident-tracker/docs/\
**Agent card (A2A)**: https://tich-labs.github.io/yck-incident-tracker/docs/agent-card.json\
**MCP server**: https://yck-incident-tracker-production.up.railway.app/

---

## Google for Startups AI Agents Challenge

All eligible startups receive **$500 in credits** and a chance to win a share of a **$90,000 prize pool**.

> **The Challenge: From Prototype to Production** — Build an autonomous system that drives real business results, leveraging Gemini, the Agent Development Kit (ADK), and a complete toolchain to rapidly build, optimize, and manage the entire agent lifecycle.

### Our Approach

We're pursuing two tracks in parallel:

### Track 1: Build (Net-New Agents)

Architect a net-new autonomous agent using the Agent Development Kit (ADK) with MCP (Model Context Protocol). Our agent:

- Connects to the MCP server via Streamable HTTP to match SGBV incidents to verified referral services
- Assesses risk severity (0–100) with urgency levels and recommended actions
- Generates FHIR R4 bundles for EHR interoperability (Observation, Patient, Consent, ServiceRequest, Location)
- Uses trauma-informed AI guardrails — never blame the survivor, human-in-the-loop oversight, mandatory reporting for minors
- Published as an A2A agent card for multi-agent orchestration on the Prompt Opinion platform

Currently uses **Groq's free tier** (Llama 3.3 70B) via an OpenAI-compatible LLM abstraction layer. Swappable to Ollama, OpenAI, or any OpenAI-compatible API without code changes.

### Track 2: Optimize (Existing Agents)

We brought our existing production agent (serving YCK in Kakamega & Vihiga counties, Kenya) and are hardening it for multi-tenant SaaS scale:

- Stress-testing multi-step reasoning across 7 workflow stages (new → assigned → pfa_in_progress → under_review → escalated → resolved → closed)
- Adding workflow stage descriptions and inline guidance to reduce reasoning errors
- Programmatically refining system instructions for production-grade reliability
- Generalizing from a single-org deployment to a multi-tenant architecture with org-level data isolation

---

## Multi-Tenant Architecture

The platform uses **org-scoped row-level security (RLS)** — a shared Supabase (PostgreSQL) database with every row tagged by `org_id`:

```
orgs
├── id (UUID, primary key)
├── name
├── slug (unique, used in subdomain)
├── settings (JSONB — feature flags, branding overrides)
└── is_active

users
├── id (UUID, FK → auth.users)
├── org_id (FK → orgs.id)
├── role (org-scoped: volunteer | counselor | program_lead | executive_director)
└── ...

incidents, referral_services, audit_log, ai_recommendations
└── org_id (FK → orgs.id) — all queries filtered by RLS
```

**RLS policies** on every table enforce `org_id = current_setting('app.current_org_id')`, ensuring tenants only see their own data. A single Supabase project serves all orgs with zero data leakage.

---

## What's on This Branch (`google-hackathon-2026`)

These changes are in-progress (uncommitted) and represent the multi-tenancy SaaS migration:

| Change | Description |
|--------|-------------|
| **Rebrand to Tich Labs** | Removed YCK-specific references from UI, i18n, meta tags. New brand colors (magenta #7c003f), logo, and footer.|
| **Platform-agnostic copy** | All labels, descriptions, and CTAs generalized for any organization. |
| **Incident detail redesign** | Two-column desktop layout (data left, workflow right), case summary card, workflow stage descriptions with tooltips. |
| **Responsive grid fixes** | Mobile-first grids on incident type selection, survivor info, review step. |
| **Demo seed data** | `supabase/seed-workflow.sql` — 7 incidents at every workflow stage with full audit trail. |
| **Cloud Run deployment** | `Dockerfile` + `nginx.conf` for frontend, `Dockerfile` for MCP server, `deploy-hackathon.sh` script. |

**Not yet implemented** (next up):
- `orgs` table and RLS policies
- Org-switching UI for admin/superadmin
- Onboarding flow (org creation, invite links)
- Per-org branding overrides (logo, colors, county scope)

---

## Features

- **Multi-tenant SaaS** — org-scoped data isolation via RLS (in progress)
- **Offline-first PWA** — works without internet; queues submissions for sync. Install prompt surfaces only on incident tracker and find help pages (not admin)
- **SGBV Incident Logging** — structured, trauma-informed intake forms with three reporter types (self, on behalf, volunteer)
- **AI Referral Matching** — matches incidents to verified local services (health, police, shelter, psychosocial, legal)
- **Risk Assessment** — automated severity scoring with human oversight
- **FHIR R4 Export** — generates interoperable health bundles (Observation, Patient, Consent, ServiceRequest)
- **MCP Server** — exposes tools for AI clients (Prompt Opinion, Claude Desktop, MCP Inspector)
- **A2A Agent Card** — published for multi-agent orchestration on Prompt Opinion platform
- **7-Stage Workflow** — new → assigned → pfa_in_progress → under_review → escalated → resolved → closed
- **Multilingual** — English and Swahili
- **Audit Log** — full action history for accountability
- **Anonymous Reporting** — reference code system, no PII collected
- **Reporter Types** — three options per submission: Self (survivor), On Behalf of Survivor (relative/friend), Volunteer (unique Volunteer ID for field workers without accounts)

## AI Assistant (In-App)

Every admin page has a floating **AI Assistant** button (bottom-right). Click it to open a slide-out panel with three tools powered by the MCP server:

### Match Services
Describe an incident — the AI finds the best-matched referral services (health, police, shelter, psychosocial, legal) with relevance scores and reasoning.

### Assess Risk
Describe the incident — the AI returns a risk score (0-100), severity level, urgency, risk factors, and recommended actions.

### Generate FHIR Bundle
Generate a FHIR R4 transaction bundle (Observation, Patient, Consent, Location, ServiceRequest) for EHR interoperability.

AI matching uses **Groq's free tier** (Llama 3.3 70B) by default, with fallback to keyword matching. The LLM provider is configurable via env vars — swap to Ollama, OpenAI, or any OpenAI-compatible API without code changes.

## Prompt Opinion Integration

The MCP server connects to the **Prompt Opinion** platform, allowing external AI agents to:

- **Match incidents to referral services** — agents call `match_services` to find nearby health, police, shelter, psychosocial, and legal services based on incident type and location
- **Assess risk severity** — agents call `assess_risk` to score incidents (0-100) with urgency levels and recommended actions
- **Generate FHIR bundles** — agents call `generate_fhir_bundle` to produce FHIR R4 transaction bundles interoperable with EHR systems (Observation, Patient, Consent, Location, ServiceRequest)

When a responder reports an incident in the app, a Prompt Opinion AI agent can analyze the case, recommend matched services, assess risk, and (with FHIR context) submit records to a connected health information exchange.

### Adding the MCP server to Prompt Opinion

| Setting | Value |
|---------|-------|
| URL | `https://yck-incident-tracker-production.up.railway.app/` |
| Transport | Streamable HTTP |
| Auth | API Key |
| Header | `X-API-Key` |
| Value | `yck-dev-key-2026` |

When prompted about the FHIR extension, enable it and grant the scopes (Observation, Patient, ServiceRequest, Consent, Location) — these allow the server's FHIR bundle tool to optionally write records to a connected EHR.

### FHIR Scopes (Prompt Opinion)

| Scope | Purpose |
|-------|---------|
| `patient/Observation.rs` | Read SGBV observations from EHR |
| `patient/Observation.write` | Write SGBV observations to EHR |
| `patient/Patient.rs` | Read patient demographics (anonymized) |
| `patient/ServiceRequest.rs` | Read existing referrals |
| `patient/ServiceRequest.write` | Write referral recommendations |
| `patient/Consent.write` | Write consent records |
| `patient/Location.rs` | Read service provider locations |

## Project Structure

```
├── frontend/          # React + Vite PWA (TypeScript)
├── mcp-server/        # Model Context Protocol server (Railway)
├── supabase/          # Database schema and seed data
├── db_export/         # Exported data snapshots
├── docs/              # A2A agent card, system prompt, screenshots, journey guide
├── scripts/           # One-off utility scripts
└── .github/workflows/ # CI/CD pipelines
```

## Quick Start

### Prerequisites

- Node.js 22+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Set up the database

Run in Supabase SQL Editor:

```sql
-- Run in order:
-- supabase/schema.sql
-- supabase/seed.sql
-- supabase/seed-workflow.sql (optional demo data)
```

By default the schema is scoped to **Kakamega and Vihiga counties** via a CHECK constraint. For multi-tenant use, remove the CHECK constraint and add an `orgs` table with RLS policies (see architecture section above).

### 2. Configure environment

```bash
cp frontend/.env.example frontend/.env.local
# Fill in your Supabase URL and anon key
```

### 3. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

### 4. (Optional) Run the MCP server

```bash
cd mcp-server
cp .env.example .env
# Add your credentials
npm install
npm run dev
```

## Deployment

### Frontend (GitHub Pages)

The app deploys automatically to GitHub Pages on push to `main`.

**Required GitHub secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MCP_SERVER_URL` — `https://yck-incident-tracker-production.up.railway.app/`
- `VITE_MCP_API_KEY` — your MCP API key

Set these in **Settings → Secrets and variables → Actions**, then enable GitHub Pages under **Settings → Pages → Source: GitHub Actions**.

### MCP Server (Railway)

Deployed from `mcp-server/` using `railway.toml`. Node.js 22, nixpacks builder, HTTP transport on port 3001.

### Alternative: Google Cloud Run

```bash
./deploy-hackathon.sh <gcp-project-id>
```

Uses the Dockerfile in `frontend/` and `mcp-server/` for containerized deployment.

 New deployment artifacts included in this branch:
 - `.github/workflows/deploy-cloud-run.yml`
 - `deploy-hackathon.sh`
 - `frontend/Dockerfile`
 - `frontend/cloudbuild.yaml`
 - `frontend/nginx.conf`
 - `mcp-server/Dockerfile`
 
## LLM Provider Configuration

The MCP server supports any OpenAI-compatible LLM provider. Set one of these env vars:

| Provider | Env Var | Value |
|----------|---------|-------|
| Groq (free) | `GROQ_API_KEY` | `gsk_your_key` |
| Ollama | `OLLAMA_BASE_URL` | `http://localhost:11434` |
| OpenAI | `OPENAI_API_KEY` | `sk_your_key` |

Optional: `GROQ_MODEL`, `OLLAMA_MODEL`, `OPENAI_MODEL` to override defaults. Falls back to keyword matching if no LLM is configured.

## Interactive User Journey

See the full walkthrough with screenshots at:\
https://tich-labs.github.io/yck-incident-tracker/docs/

Covers both the **Survivor Journey** (safety gate → reporter type → 5-step incident form → success page) and the **Admin Journey** (dashboard → incidents → reports → user management → services → manual).

## License

MIT — see [LICENSE](LICENSE)

## Security

This application handles sensitive survivor data. Please review our [security policy](SECURITY.md) before contributing or deploying.
