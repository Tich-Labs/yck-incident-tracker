#!/usr/bin/env node

import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

import { MatchServicesInput, matchServicesSmart } from "./tools/match-services.js";
import { GenerateFHIRBundleInput, generateFHIRBundle } from "./tools/generate-fhir.js";
import { AssessRiskInput, assessRiskSmart } from "./tools/assess-risk.js";

/** Create and configure a fresh Server instance. Called once for stdio, once per HTTP request. */
function createMCPServer(): Server {
  const srv = new Server(
    { name: "yck-incident-tracker", version: "1.0.0" },
    {
      capabilities: {
        tools: {},
        extensions: {
          "ai.promptopinion/fhir-context": {
            scopes: [
              { name: "patient/Observation.rs" },
              { name: "patient/Observation.write" },
              { name: "patient/Patient.rs" },
              { name: "patient/ServiceRequest.rs" },
              { name: "patient/ServiceRequest.write" },
              { name: "patient/Consent.write" },
              { name: "patient/Location.rs" },
            ],
          },
        },
      },
    }
  );

  srv.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "match_services",
        description: "Match an SGBV incident to appropriate referral services based on incident type, location, and context. Uses AI when available, falls back to keyword matching. Returns scored service recommendations with reasoning.",
        inputSchema: zodToJsonSchema(MatchServicesInput),
      },
      {
        name: "generate_fhir_bundle",
        description: "Generate a FHIR R4 transaction Bundle from an SGBV incident. Creates Observation (incident details), Patient (anonymized survivor), Consent (privacy consent), Location (service providers), and ServiceRequest (referrals) resources. Optionally accepts fhirServerUrl and fhirToken (from SHARP context) to submit directly to a FHIR-compliant EHR.",
        inputSchema: zodToJsonSchema(GenerateFHIRBundleInput),
      },
      {
        name: "assess_risk",
        description: "Assess risk and severity of an SGBV incident. Returns a risk score (0-100), severity level, urgency, contributing factors, and recommended actions. Uses AI when available.",
        inputSchema: zodToJsonSchema(AssessRiskInput),
      },
    ],
  }));

  srv.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "match_services": {
        const input = MatchServicesInput.parse(args);
        const matches = await matchServicesSmart(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  count: matches.length,
                  matches,
                  incidentType: input.incidentType,
                  location: input.location,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "generate_fhir_bundle": {
        const input = GenerateFHIRBundleInput.parse(args);
        const result = await generateFHIRBundle(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  summary: result.summary,
                  bundle: result.bundle,
                  submissionResult: result.submissionResult,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case "assess_risk": {
        const input = AssessRiskInput.parse(args);
        const assessment = await assessRiskSmart(input);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(assessment, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [{ type: "text", text: `Invalid input: ${error.message}` }],
        isError: true,
      };
    }
    throw error;
  }
  });

  return srv;
}

async function main() {
  const mode = process.env.MCP_TRANSPORT ?? "stdio";

  if (mode === "http") {
    // HTTP mode — for Prompt Opinion and other cloud A2A clients
    const port = parseInt(process.env.PORT ?? "3001", 10);
    const apiKey = process.env.MCP_API_KEY;

    const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      // CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-API-Key");

      if (req.method === "OPTIONS") {
        res.writeHead(204);
        res.end();
        return;
      }

      // Health check
      if (req.url === "/health") {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: "ok", server: "yck-mcp-server" }));
        return;
      }

      // Debug — always shows key info without auth
      if (req.url === "/debug") {
        const { getActiveServices } = await import("./lib/supabase.js");
        const services = await getActiveServices();
        const maskedKey = process.env.VITE_SUPABASE_ANON_KEY
          ? process.env.VITE_SUPABASE_ANON_KEY.slice(0, 12) + "..."
          : process.env.SUPABASE_ANON_KEY
          ? process.env.SUPABASE_ANON_KEY.slice(0, 12) + "..."
          : "NOT SET";
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          supabaseUrl: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || "NOT SET",
          supabaseAnonKey: maskedKey,
          nodeEnv: process.env.NODE_ENV || "not set",
          servicesCount: services.length,
          serviceNames: services.map((s) => s.name),
          envKeys: Object.keys(process.env).filter(k => k.includes("SUPABASE") || k.includes("VITE_") || k.includes("API_KEY") || k.includes("OPENAI") || k.includes("MCP_")),
        }, null, 2));
        return;
      }

      // API key validation
      if (apiKey) {
        const incoming = req.headers["x-api-key"];
        if (incoming !== apiKey) {
          res.writeHead(401, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Unauthorized" }));
          return;
        }
      }

      if (req.url === "/mcp" || req.url === "/") {
        // MCP Streamable HTTP requires Accept to include both json and event-stream
        const accept = req.headers.accept || "";
        if (!accept.includes("text/event-stream") || !accept.includes("application/json")) {
          req.headers.accept = "application/json, text/event-stream";
        }

        const mcpServer = createMCPServer();
        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined,
        });
        await mcpServer.connect(transport);
        await transport.handleRequest(req, res);
        return;
      }

      res.writeHead(404);
      res.end();
    });

    httpServer.listen(port, () => {
      console.error(`YCK MCP Server (HTTP) listening on port ${port}`);
    });
  } else {
    // Stdio mode — for Claude Desktop and local MCP clients
    const transport = new StdioServerTransport();
    await createMCPServer().connect(transport);
    console.error("YCK MCP Server running on stdio");
  }
}

main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
