# Agents Assemble Hackathon - YCK Incident Tracker

## What We Built

### 1. MCP Server (Superpower) — `mcp-server/`
An MCP (Model Context Protocol) server that exposes 3 tools:

| Tool | Purpose | AI Fallback |
|------|---------|-------------|
| `match_services` | Match SGBV incidents to verified referral services | Keyword matching (no AI key needed) |
| `generate_fhir_bundle` | Generate FHIR R4 transaction bundles | N/A - deterministic |
| `assess_risk` | Risk/severity scoring for incidents | Keyword-based risk scoring |

**Status**: ✅ Compiles, runs, ready for MCP clients (Claude Desktop, MCP Inspector)

### 2. FHIR R4 Mapping — `frontend/src/lib/fhir.ts` + `fhir-types.ts`
Complete FHIR R4 resource mapping:
- Incident → **Observation** (social-history category, SNOMED CT coded)
- Survivor → **Patient** (anonymized, age group → approximate birth date)
- Referral Service → **Location** (telecom, address)
- Referral → **ServiceRequest** (proposal intent, AI-recommended tag)
- Consent → **Consent** (privacy consent, anonymous policy)

**Status**: ✅ Used by both PWA and MCP server

### 3. AI Recommendations UI — `frontend/src/components/ai-recommendations.tsx`
Integrated into incident detail page. Features:
- Top 5 service matches with relevance scores (0-100%)
- Approve/Skip actions for staff review
- FHIR bundle export (download JSON)
- Human oversight: no recommendation reaches survivor without staff approval

**Status**: ✅ Added to incident detail page

### 4. Supabase Schema — `supabase/schema.sql` + `seed.sql`
- 6 tables: users, incidents, referral_services, audit_log, offline_submissions, ai_recommendations
- 44 seeded referral services (from GBV REFERRAL PATHWAY.docx)
- Row Level Security policies
- Indexes for performance

**Status**: ✅ Ready to run in Supabase SQL Editor

## Demo Flow

```
Offline PWA → Supabase → Incident Detail → AI Recommendations → Approve → FHIR Download
                    ↕
              MCP Server (tools: match_services, generate_fhir_bundle, assess_risk)
                    ↕
              Claude Desktop / Any MCP Client (the "Superpower")
```

## Quick Start

### 1. Set up Supabase tables
```sql
-- Open Supabase SQL Editor and run:
supabase/schema.sql
supabase/seed.sql
```

### 2. Configure environment
```bash
# Already done in frontend/.env.local
VITE_SUPABASE_URL=https://fytspbolszccphbdmyzi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Run the PWA
```bash
cd frontend
npm run dev
```

### 4. (Optional) Run MCP Server with OpenAI
```bash
cd mcp-server
OPENAI_API_KEY=sk-your-key npx tsx src/index.ts
```

### 5. Connect Claude Desktop
Add to `claude_desktop_config.json`:
```json
{
  "mcpServers": {
    "yck-incident-tracker": {
      "command": "npx",
      "args": ["tsx", "/absolute/path/to/mcp-server/src/index.ts"],
      "env": {
        "VITE_SUPABASE_URL": "https://fytspbolszccphbdmyzi.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "eyJ...",
        "OPENAI_API_KEY": "sk-..."
      }
    }
  }
}
```

## Scoring Criteria Coverage

- **Feasibility (25%)** — ✅ Working PWA with real referral data, offline-first
- **Impact (25%)** — ✅ Addresses KES 46B annual SGBV cost in Kenya
- **Implementation (25%)** — ✅ MCP server + FHIR + AI recommendations + human oversight
- **Presentation (25%)** — ✅ Trauma-informed UX, quick exit, safety gate, bilingual

## Key Differentiators

1. **Offline-first PWA** — Real incident reporting without internet
2. **Human oversight** — AI recommendations require staff approval
3. **FHIR R4 compliance** — Interoperable with Kenya MoH systems
4. **Privacy by design** — No PII in exports, anonymized analytics
5. **MCP + A2A ready** — Can be used by any compatible agent
