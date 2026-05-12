# YCK Incident Tracker

A trauma-informed, offline-capable Progressive Web App for Youth Changers Kenya (YCK) to securely log, manage, and refer Sexual and Gender-Based Violence (SGBV) incidents across Kakamega and Vihiga counties.

[![Deploy to GitHub Pages](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml/badge.svg)](https://github.com/Tich-Labs/yck-incident-tracker/actions/workflows/deploy.yml)

## Features

- **Offline-first PWA** — works without internet; queues submissions for sync
- **SGBV Incident Logging** — structured, trauma-informed intake forms
- **AI Referral Matching** — matches incidents to verified local services (health, police, shelter, psychosocial, legal)
- **Risk Assessment** — automated severity scoring with human oversight
- **FHIR R4 Export** — generates interoperable health bundles (Observation, Patient, Consent, ServiceRequest)
- **MCP Server** — exposes tools for AI clients (Claude Desktop, MCP Inspector)
- **Multilingual** — English and Swahili
- **Audit Log** — full action history for accountability

## Project Structure

```
├── frontend/          # React + Vite PWA (TypeScript)
├── mcp-server/        # Model Context Protocol server
├── supabase/          # Database schema and seed data
├── db_export/         # Exported data snapshots
├── docs/              # Documentation and agent card
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

Set these in **Settings → Secrets and variables → Actions**, then enable GitHub Pages under **Settings → Pages → Source: GitHub Actions**.

## MCP Tools

| Tool | Description |
|------|-------------|
| `match_services` | Match incidents to verified referral services |
| `generate_fhir_bundle` | Generate FHIR R4 transaction bundles |
| `assess_risk` | Risk/severity scoring for incidents |

## License

MIT — see [LICENSE](LICENSE)

## Security

This application handles sensitive survivor data. Please review our [security policy](SECURITY.md) before contributing or deploying.
