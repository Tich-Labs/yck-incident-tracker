# YCK Incident Tracker

A trauma-informed, offline-capable Progressive Web App for Youth Changers Kenya (YCK) to securely log, manage, and refer Sexual and Gender-Based Violence (SGBV) incidents across Kakamega and Vihiga counties.

[![Deploy to GitHub Pages](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml)

**Live app**: https://tich-labs.github.io/yck-incident-tracker/\
**Interactive guide**: https://tich-labs.github.io/yck-incident-tracker/docs/\
**Agent card (A2A)**: https://tich-labs.github.io/yck-incident-tracker/docs/agent-card.json\
**MCP server**: https://yck-incident-tracker-production.up.railway.app/

## Features

- **Offline-first PWA** — works without internet; queues submissions for sync
- **SGBV Incident Logging** — structured, trauma-informed intake forms
- **AI Referral Matching** — matches incidents to verified local services (health, police, shelter, psychosocial, legal)
- **Risk Assessment** — automated severity scoring with human oversight
- **FHIR R4 Export** — generates interoperable health bundles (Observation, Patient, Consent, ServiceRequest)
- **MCP Server** — exposes tools for AI clients (Prompt Opinion, Claude Desktop, MCP Inspector)
- **A2A Agent Card** — published for multi-agent orchestration on Prompt Opinion platform
- **Multilingual** — English and Swahili
- **Audit Log** — full action history for accountability
- **Anonymous Reporting** — reference code system, no PII collected

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
├── supabase/          # Database schema and seed data (Kakamega & Vihiga)
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

The MCP server is deployed separately on Railway at https://yck-incident-tracker-production.up.railway.app/.

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

See the full walkthrough with screenshots at:\
https://tich-labs.github.io/yck-incident-tracker/docs/

Covers both the **Survivor Journey** (safety gate → incident form → success page) and the **Admin Journey** (dashboard → incidents → reports → user management → services → manual).

## License

MIT — see [LICENSE](LICENSE)

## Security

This application handles sensitive survivor data. Please review our [security policy](SECURITY.md) before contributing or deploying.
