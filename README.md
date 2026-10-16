# Deyaho Phone Calls MCP

Remote MCP server that lets any AI (Claude, ChatGPT, Cursor...) **place real phone calls** with an AI voice agent and get the **summary, collected data and transcript** back.

- Endpoint: `https://mcp.deyaho.com/mcp` (Streamable HTTP)
- Destinations: Spain (+34) and Mexico (+52), Monday to Friday 09:00-21:00 local time
- Voice and telephony run on Deyaho's servers in the EU. This repository only contains the MCP layer.

[Español más abajo](#español)

## Tools

| Tool | What it does |
|---|---|
| `make_call` | Calls `to` (E.164) on behalf of `business_name`, pursues `goal`, collects `collect` fields. Returns `call_id`. Requires `consent_confirmed: true` and a `consent_statement`. |
| `get_call` | Status, duration, summary, collected data and transcript. |
| `list_calls` | Your latest calls. |
| `get_pricing` | Free. Price, limits, hours and your balance. |

The agent always opens by saying it is an AI assistant (EU AI Act, art. 50) and only names the business you give it.

## Connect

**Claude Desktop / Claude.ai / Cursor** - add a remote MCP server:

```json
{
  "mcpServers": {
    "deyaho-calls": {
      "url": "https://mcp.deyaho.com/mcp",
      "headers": { "Authorization": "Bearer dy_mcp_YOUR_KEY" }
    }
  }
}
```

Get your key and prepaid minutes at https://app.deyaho.com/dashboard/mcp. Pricing: https://deyaho.com/en/mcp

## Limits

- Max 4 minutes per call, 10 calls per day per key, one call at a time.
- Blocked: emergency, premium-rate, toll-free and any country other than ES/MX.
- You must only call people who requested or agreed to be contacted (Spain: prior consent for commercial calls; Mexico: REPEP).

## Self-hosting this layer

```bash
npm ci && npm run build
DEYAHO_API_BASE=https://mcp.deyaho.com PORT=8080 npm start
```

---

## Español

Servidor MCP remoto para que cualquier IA (Claude, ChatGPT, Cursor...) **haga llamadas telefónicas reales** con un agente de voz con IA y reciba el **resumen, los datos recogidos y la transcripción**.

- Endpoint: `https://mcp.deyaho.com/mcp` (Streamable HTTP)
- Destinos: España (+34) y México (+52), de lunes a viernes de 09:00 a 21:00 hora local
- La voz y la telefonía corren en servidores de Deyaho en la UE. Este repositorio solo contiene la capa MCP.

Herramientas: `make_call` (devuelve `call_id`; exige `consent_confirmed: true` y `consent_statement`), `get_call`, `list_calls` y `get_pricing` (gratis).

El agente siempre empieza diciendo que es un asistente con inteligencia artificial (AI Act, art. 50) y solo nombra al negocio que le indiques.

Conexión: añade `https://mcp.deyaho.com/mcp` como servidor MCP remoto con la cabecera `Authorization: Bearer dy_mcp_TU_CLAVE` (clave y minutos en https://app.deyaho.com/dashboard/mcp). Precios: https://deyaho.com/mcp

Límites: 4 minutos por llamada, 10 llamadas al día por clave, una llamada a la vez. Bloqueados emergencias, tarificación especial, gratuitos y cualquier país que no sea ES o MX. Llama solo a quien haya pedido o aceptado ser contactado.

## License

MIT
