# YCK Incident Tracker

A trauma-informed, offline-capable Progressive Web App for Youth Changers Kenya (YCK) to securely log, manage, and refer Sexual and Gender-Based Violence (SGBV) incidents across Kakamega and Vihiga counties.

[![Deploy to GitHub Pages](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml)

**Live app**: https://tich-labs.github.io/yck-incident-tracker/
**Interactive guide**: https://tich-labs.github.io/yck-incident-tracker/docs/
**Agent card (A2A)**: https://tich-labs.github.io/yck-incident-tracker/docs/agent-card.json
**MCP server**: not currently reachable. The Railway deployment (`yck-incident-tracker-production.up.railway.app`) returns "Application not found" and needs redeploying. See [ISSUES.md](ISSUES.md).

## Features

- **Offline-first PWA** — works without internet; queues submissions locally and auto-syncs when back online. Install prompt surfaces on survivor-facing routes (not admin)
- **SGBV Incident Logging** — structured, trauma-informed 5-step intake form with three reporter types (self, on behalf, volunteer with unique Volunteer ID)
- **Anonymous Reporting** — the incident record stores age group and gender, not a survivor name. A reference code built from initials and birth month/year is shown once to the reporter but is not stored. An optional contact can be added for follow-up
- **AI Referral Matching** — matches incidents to verified local services (health, police, shelter, psychosocial, legal)
- **Risk Assessment** — rule-based severity scoring (0–100) with human oversight; an optional AI path uses the MCP server
- **Referral Directory** — searchable directory of verified service providers across Kakamega & Vihiga
- **Role-Based Access Control** — five roles (volunteer, counselor, program lead, executive director, pending) enforced via Supabase Row Level Security
- **Reports & Analytics** — charts by incident type, status, age group, gender, and month with anonymized CSV export
- **FHIR R4 Export** — interoperable health bundles (Observation, Patient, Consent, Location, ServiceRequest)
- **MCP Server** — exposes tools for AI clients (Prompt Opinion, Claude Desktop, MCP Inspector)
- **A2A Agent Card** — published for multi-agent orchestration on Prompt Opinion platform
- **Quick Exit** — one-tap safety button that clears session storage and redirects to a neutral site
- **Multilingual** — English and Swahili
- **Audit Log** — full action history for accountability

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
| URL | `https://yck-incident-tracker-production.up.railway.app/` (currently unreachable, see note above) |
| Transport | Streamable HTTP |
| Auth | API Key |
| Header | `X-API-Key` |
| Value | your MCP API key (stored as `VITE_MCP_API_KEY` / the server env var, never committed) |

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
├── supabase/          # Database schema and seed data (Kakamega & Vihiga)
├── docs/              # A2A agent card, system prompt, screenshots, journey guide
├── guide/             # Standalone interactive user-journey guide
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
```

Database is scoped to **Kakamega and Vihiga counties** only. To add more counties, remove the CHECK constraint in `schema.sql`, add seed data, and re-run.

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

The app deploys automatically to GitHub Pages on push to `main`.

**Required GitHub secrets:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_MCP_SERVER_URL` — `https://yck-incident-tracker-production.up.railway.app/`
- `VITE_MCP_API_KEY` — your MCP API key

Set these in **Settings → Secrets and variables → Actions**, then enable GitHub Pages under **Settings → Pages → Source: GitHub Actions**.

The MCP server was deployed on Railway at `yck-incident-tracker-production.up.railway.app`. That deployment is currently not reachable (returns "Application not found"), so the AI features and the in-app AI Assistant will not work until it is redeployed. Update the URL here once the new deployment is live.

## MCP Tools

| Tool | Description |
|------|-------------|
| `match_services` | Match incidents to verified referral services (AI + keyword) |
| `generate_fhir_bundle` | Generate FHIR R4 transaction bundles (Observation, Patient, Consent, Location, ServiceRequest) |
| `assess_risk` | Risk/severity scoring for incidents (0-100, severity, urgency, factors, actions) |

## LLM Provider Configuration

The MCP server supports any OpenAI-compatible LLM provider. Set one of these env vars:

| Provider | Env Var | Value |
|----------|---------|-------|
| Groq (free) | `GROQ_API_KEY` | `gsk_your_key` |
| Ollama | `OLLAMA_BASE_URL` | `http://localhost:11434` |
| OpenAI | `OPENAI_API_KEY` | `sk_your_key` |

Optional: `GROQ_MODEL`, `OLLAMA_MODEL`, `OPENAI_MODEL` to override defaults. Falls back to keyword matching if no LLM is configured.

## Interactive User Journey

See the full walkthrough with screenshots at:
https://tich-labs.github.io/yck-incident-tracker/docs/

Covers both the **Survivor Journey** (safety gate → reporter type → 5-step incident form → success page) and the **Admin Journey** (dashboard → incidents → reports → user management → services → manual).

## License

MIT — see [LICENSE](LICENSE)

## Security

This application handles sensitive survivor data. Please review our [security policy](SECURITY.md) before contributing or deploying.
