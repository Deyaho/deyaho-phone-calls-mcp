// Deyaho Phone Calls MCP server (Streamable HTTP, stateless).
// Thin layer: every tool forwards to the Deyaho Calls REST API. Voice and telephony run on
// Deyaho's servers in the EU; this code never touches audio.
import express, { type Request, type Response } from "express";
import { McpServer, createMcpHandler } from "@modelcontextprotocol/server";
import { toNodeHandler } from "@modelcontextprotocol/node";
import * as z from "zod/v4";

export type Config = {
  apiBase: string;              // e.g. https://mcp.deyaho.com
  gatewaySecret?: string;       // set only when hosted behind a marketplace gateway
  subscriberHeader?: string;    // header where the gateway puts the subscriber id
};

type Caller = { authorization?: string; subscriber?: string };

// Gateway headers that may carry the subscriber id (first one present wins).
const SUBSCRIBER_HEADERS = ["x-mcpize-user-id", "x-mcpize-subscriber-id", "x-mcpize-user", "x-user-id"];
let loggedHeaders = false;

function callerFrom(req: { headers: Record<string, string | string[] | undefined> }, cfg: Config): Caller {
  if (cfg.gatewaySecret && !loggedHeaders) { loggedHeaders = true; console.log("request header names:", Object.keys(req.headers).join(",")); }
  const names = cfg.subscriberHeader ? [cfg.subscriberHeader.toLowerCase()] : SUBSCRIBER_HEADERS;
  const sub = names.map((h) => String(req.headers[h] || "")).find(Boolean) || (cfg.gatewaySecret ? "anonymous" : "");
  // Deyaho API key: Authorization: Bearer <key> or x-deyaho-api-key.
  const key = String(req.headers["x-deyaho-api-key"] || "");
  const authorization = String(req.headers.authorization || "") || (key ? `Bearer ${key}` : "");
  return { authorization: authorization || undefined, subscriber: sub || undefined };
}

async function api(cfg: Config, caller: Caller, method: string, path: string, body?: unknown) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  // Only Deyaho keys are forwarded (never a gateway's own token).
  if (/dy_(live|mcp|oat)_/.test(caller.authorization || "")) headers.authorization = caller.authorization!;
  if (cfg.gatewaySecret && caller.subscriber) {
    headers["x-gateway-secret"] = cfg.gatewaySecret;
    headers["x-subscriber-id"] = caller.subscriber;
  }
  const r = await fetch(cfg.apiBase.replace(/\/$/, "") + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  return { ok: r.ok, data };
}

function out(res: { ok: boolean; data: unknown }) {
  return { content: [{ type: "text" as const, text: JSON.stringify(res.data, null, 2) }], isError: !res.ok };
}

export function buildServer(cfg: Config, caller: Caller): McpServer {
  const server = new McpServer({ name: "deyaho-phone-calls", title: "Deyaho Phone Calls MCP", version: "0.1.5" });

  server.registerTool("make_call", {
    title: "Make a phone call",
    annotations: { title: "Make a phone call", readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: true },
    description:
      "Place a real outbound phone call with an AI voice agent and get a call_id. The agent introduces itself as an AI " +
      "assistant of the business you name, pursues the goal you describe, collects the requested data and hangs up. " +
      "Destinations: Spain (+34) and Mexico (+52) only. Calls are short (max 4 minutes). " +
      "Set call_purpose: service calls (appointments, reminders, surveys of your own customers, calls the person asked for) run Monday to Saturday 09:00-21:00 local time; " +
      "commercial calls run Monday to Friday (Spain 09:00-21:00 and only from a 400 number; Mexico 09:00-19:00). No calls on Sundays or national holidays. " +
      "You must confirm the recipient asked for or agreed to be contacted. The result is returned by get_call using the call_id. " +
      "Pass website_url (the business website) and/or business_info so the agent can answer questions about prices, hours or services during the call.",
    inputSchema: z.object({
      to: z.string().describe("Destination phone number in E.164 format, e.g. +34600111222 or +525512345678"),
      goal: z.string().min(10).max(1500).describe("What the call must achieve, in plain language"),
      language: z.enum(["es", "en"]).describe("Language the agent speaks"),
      business_name: z.string().min(2).max(80).describe("Name of the business on whose behalf the agent calls"),
      call_purpose: z.enum(["service", "commercial"]).describe("service: appointments, reminders, surveys of your own customers, or a call the person asked for. commercial: selling or offering something to someone who did not ask for it. It sets the allowed calling hours; commercial calls to Spain require a 400 number"),
      collect: z.array(z.string().max(80)).max(10).optional().describe("Data points to collect, e.g. ['preferred date', 'email']"),
      consent_confirmed: z.literal(true).describe("Must be true: the recipient requested or agreed to be contacted"),
      consent_statement: z.string().min(15).max(500).describe("How and when the recipient requested or agreed to be contacted"),
      website_url: z.string().url().max(300).optional().describe("Website of the business you call for. It is read before the call (up to 10 pages) so the agent can answer questions about prices, hours, services or address"),
      business_info: z.string().max(4000).optional().describe("Extra facts about the business the agent may need (prices, hours, services, policies). The agent answers only with this and the website, never invents"),
    }),
  }, async (args) => out(await api(cfg, caller, "POST", "/v1/calls", args)));

  server.registerTool("get_call", {
    title: "Get call result",
    annotations: { title: "Get call result", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    description: "Get the status, duration, summary, collected data and transcript of a call placed with make_call.",
    inputSchema: z.object({ call_id: z.string().describe("The call_id returned by make_call") }),
  }, async ({ call_id }) => out(await api(cfg, caller, "GET", `/v1/calls/${encodeURIComponent(call_id)}`)));

  server.registerTool("list_calls", {
    title: "List recent calls",
    annotations: { title: "List recent calls", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    description: "List the most recent calls placed with your key (newest first).",
    inputSchema: z.object({ limit: z.number().int().min(1).max(50).optional().describe("How many calls, default 10") }),
  }, async ({ limit }) => out(await api(cfg, caller, "GET", `/v1/calls?limit=${limit ?? 10}`)));

  server.registerTool("get_pricing", {
    title: "Get pricing and balance",
    annotations: { title: "Get pricing and balance", readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    description: "Free. Show the price per call/minute, limits, allowed countries and calling hours, and your remaining balance.",
    inputSchema: z.object({}),
  }, async () => out(await api(cfg, caller, "GET", "/v1/pricing")));

  return server;
}

export function mcpRouter(cfg: Config) {
  const router = express.Router();
  // Serves the 2026-07-28 protocol (server/discover probes) and falls back to stateless 2025-era serving.
  const handler = createMcpHandler((ctx) =>
    buildServer(cfg, callerFrom({ headers: Object.fromEntries(ctx.requestInfo?.headers ?? []) }, cfg)));
  const node = toNodeHandler(handler);
  router.post("/mcp", express.json({ limit: "64kb" }), (req: Request, res: Response) => node(req, res, req.body));
  // Stateless server: no SSE stream, no sessions.
  router.all("/mcp", (_req, res) => { res.status(405).json({ error: "Method not allowed" }); });
  return router;
}
