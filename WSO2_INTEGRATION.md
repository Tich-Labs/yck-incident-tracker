# WSO2 FHIR MCP Server Integration

## How We Integrated WSO2's FHIR MCP Server

Our YCK Incident Tracker uses **WSO2's FHIR MCP Server** as the FHIR persistence layer — it's the bridge between our SGBV incident data and any FHIR R4-compliant healthcare system.

## Architecture

```
YCK PWA → YCK MCP Server (generate_fhir_bundle) → WSO2 FHIR MCP Server → HAPI FHIR / Kenya MoH HIE
                ↕
    Claude Desktop / VS Code / MCP Clients
```

## Two-Layer MCP Architecture

| Layer | Server | Purpose |
|-------|--------|---------|
| **Domain** | `YCK MCP Server` (ours) | SGBV-specific tools: `match_services`, `generate_fhir_bundle`, `assess_risk` |
| **Infrastructure** | `WSO2 FHIR MCP Server` | Generic FHIR CRUD: `search`, `read`, `create`, `update`, `delete` on any FHIR server |

## Integration Flow

1. **Incident is logged** in YCK PWA (anonymous SGBV report)
2. **YCK MCP Server → `match_services`** → AI recommends appropriate health/police/shelter/legal services
3. **YCK MCP Server → `generate_fhir_bundle`** → Produces FHIR R4 bundle:
   - `Observation` (incident type, SNOMED CT coded)
   - `Patient` (anonymized survivor, age group → birth date)
   - `Consent` (privacy consent, anonymous policy)
   - `Location` (recommended service providers)
   - `ServiceRequest` (AI-recommended referrals)
4. **WSO2 FHIR MCP Server → `create`** → Submutes each resource to a FHIR-compliant EHR (HAPI FHIR / EPIC / Kenya MoH HIE)
5. **MCP Client** (Claude Desktop / VS Code) orchestrates both servers:
   - "Find incidents matching domestic violence in Kakamega" → YCK MCP
   - "Create these FHIR resources in the Kenya HIE" → WSO2 MCP

## Configuration for Dual MCP

### Claude Desktop Config

```json
{
  "mcpServers": {
    "yck-sgbv": {
      "command": "npx",
      "args": ["tsx", "/path/to/mcp-server/src/index.ts"],
      "env": {
        "VITE_SUPABASE_URL": "https://fytspbolszccphbdmyzi.supabase.co",
        "VITE_SUPABASE_ANON_KEY": "eyJ...",
        "OPENAI_API_KEY": "sk-..."
      }
    },
    "wso2-fhir": {
      "command": "uv",
      "args": [
        "--directory", "/path/to/fhir-mcp-server",
        "run", "fhir-mcp-server",
        "--transport", "stdio"
      ],
      "env": {
        "FHIR_SERVER_BASE_URL": "https://hapi.fhir.org/baseR4",
        "FHIR_SERVER_DISABLE_AUTHORIZATION": "True"
      }
    }
  }
}
```

## Why This Matters for Hackathon

| Requirement | How We Meet It |
|-------------|---------------|
| **FHIR Compliance** | Resources conform to Kenya MoH SGBV FHIR profiles |
| **Interoperability** | WSO2 MCP pushes our bundles to any FHIR server |
| **Standards-Based** | Uses MCP + FHIR R4 + SMART-on-FHIR (open standards) |
| **AI Integration** | YCK MCP generates AI-powered recommendations, WSO2 MCP persists them |
| **Human Oversight** | AI recommendations require staff approval before FHIR submission |

## Demo Narrative

> "When a counselor approves an AI recommendation, our YCK MCP server generates a FHIR R4 transaction bundle. We then use WSO2's FHIR MCP Server to push that bundle directly into the Kenya Ministry of Health's Health Information Exchange — no custom integration code needed. The counselor sees 'Recommendation Approved, Synced to National HIE'."

## FHIR Resource Mapping (Our Extension of WSO2)

While WSO2 FHIR MCP provides generic CRUD, we mapped our SGBV domain to FHIR R4:

| YCK Model | FHIR Resource | Key Fields |
|-----------|--------------|------------|
| Incident | `Observation` | code (SNOMED SGBV), category (social-history), component (age, gender) |
| Survivor | `Patient` | identifier (anonymized ref), approximate birthDate, gender |
| Referral Service | `Location` | name, address, telecom, managingOrganization |
| AI Referral | `ServiceRequest` | status (draft), intent (proposal), performer, reasonCode |
| Consent | `Consent` | scope (patient-privacy), policyRule (ANONY - anonymous) |

## Full Demo Flow

1. **Submit incident** via offline PWA → Supabase
2. **Counselor opens case** → sees AI recommendations (match_services)
3. **Counselor approves** → YCK MCP generates FHIR bundle (generate_fhir_bundle)
4. **WSO2 FHIR MCP** pushes to HAPI FHIR (create resources)
5. **Audit trail** records: "FHIR bundle submitted to Kenya HIE"
6. **Query**: "Show me all SGBV observations from Kakamega this month" → WSO2 FHIR MCP search
