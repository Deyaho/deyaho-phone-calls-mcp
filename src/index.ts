// Standalone entrypoint (used when the server is hosted on its own, e.g. by a marketplace).
import express from "express";
import { mcpRouter } from "./app.js";

const app = express();
app.get("/health", (_req, res) => { res.json({ ok: true }); });
app.use(mcpRouter({
  apiBase: process.env.DEYAHO_API_BASE || "https://mcp.deyaho.com",
  gatewaySecret: process.env.GATEWAY_SECRET || undefined,
  subscriberHeader: process.env.SUBSCRIBER_HEADER || undefined,
}));

const port = Number(process.env.PORT || 8080);
app.listen(port, () => { console.log(`deyaho-phone-calls MCP listening on :${port}/mcp`); });
