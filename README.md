# Deyaho Phone Calls MCP

**Let Claude, ChatGPT, Cursor or any AI agent make real phone calls to Mexico and Spain.** A remote MCP server: your agent calls a tool with a phone number and a goal, a Deyaho AI voice agent places the call, and you get back the summary, the collected data and the full transcript.

- **Endpoint:** `https://mcp.deyaho.com/mcp` (Streamable HTTP, OAuth or API key)
- **Price:** 0.19 USD per connected minute, telephony included, no monthly fee. Unanswered, busy and voicemail calls are free.
- **Destinations:** Mexico (+52) and Spain (+34), called from local numbers (Mexico City and Madrid)
- **Hours:** service calls Monday to Saturday 09:00-21:00; commercial calls Monday to Friday (commercial calls to Spain go out from a 400 number)
- **Languages:** Spanish or English
- **Website, guide and FAQ:** https://deyaho.com/en/mcp (Spanish: https://deyaho.com/mcp)

[Español más abajo](#mcp-de-llamadas-de-deyaho)

## Install

Get a free Deyaho account and top up minutes at https://app.deyaho.com/dashboard/mcp. That page also creates API keys (`dy_mcp_...`) for clients that use one.

**Claude (claude.ai and Claude Desktop):** Settings > Connectors > Add custom connector, paste `https://mcp.deyaho.com/mcp`, click Connect and sign in with your Deyaho account (OAuth, no key needed).

**Claude Code:**

```bash
claude mcp add --transport http deyaho-calls https://mcp.deyaho.com/mcp --header "Authorization: Bearer dy_mcp_YOUR_KEY"
```

Without the header, sign in from `/mcp` inside Claude Code.

**Cursor** (`~/.cursor/mcp.json` or `.cursor/mcp.json`):

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

**ChatGPT:** Settings > Apps & Connectors > Advanced settings, turn on developer mode, create a connector with `https://mcp.deyaho.com/mcp` and OAuth authentication.

**Any other MCP client:** the same URL over Streamable HTTP, with OAuth or the `Authorization: Bearer` header.

## Example prompts

- "Call +34 600 000 000 on behalf of Sun Clinic and confirm tomorrow's 10:00 appointment; if it does not suit them, ask for another time. They gave consent in the booking form. Then give me the summary and the transcript."
- "Call +52 55 1234 5678 for Casa Azul Restaurant and remind them of their reservation for 4 people tonight at 21:00. They booked on our website and accepted reminder calls."
- "Call the lead who just filled in our form (+34 611 222 333, consent in the form) on behalf of Nova Dental, ask what treatment they want and when they can come, and return the answers as data."
- "Run a 3-question satisfaction survey with +52 33 9876 5432 for TallerMax (they agreed when they picked up their car) and give me each answer."
- "Use get_pricing and tell me my balance."

## Tools

| Tool | What it does |
|---|---|
| `make_call` | Calls `to` (E.164) on behalf of `business_name`, pursues `goal`, collects the `collect` fields, in `language` (es/en). `call_purpose` is `service` (appointments, reminders, surveys of your own customers, calls the person asked for) or `commercial` (selling or offering something to someone who did not ask for it). Requires `consent_confirmed: true` and a `consent_statement`. Optional `website_url` (the agent reads the business website before the call) and `business_info`. Returns `call_id`. |
| `get_call` | Status, duration, billed minutes, summary, collected data and full transcript. |
| `list_calls` | Your latest calls, newest first. |
| `get_pricing` | Free. Price, your balance, limits, countries and calling hours. |

## Pricing

0.19 USD per connected minute, rounded up to the minute. Prepaid packs: 52 min = 10 USD, 131 min = 25 USD, 263 min = 50 USD (also in EUR and MXN). No monthly fee, no number to buy. A 3-minute call costs 0.57 USD.

## Limits and compliance

- Max 4 minutes per call, 10 calls per day per key, one call at a time.
- Calling hours depend on `call_purpose`, local time of the destination: service calls Monday to Saturday 09:00-21:00; commercial calls Monday to Friday, Spain 09:00-21:00 and Mexico 09:00-19:00. No calls on Sundays or national holidays.
- Since 17 October 2026, commercial calls to Spain must come from a 400 number. Until Deyaho has one, calls to Spain are service calls; `make_call` returns `commercial calls to Spain require a 400 number` otherwise.
- Spain and Mexico only; emergency, premium-rate and toll-free numbers are blocked.
- At the start the agent says it is an AI (EU AI Act art. 50) and that the call is recorded, and only names the business you give it.
- Only call people who requested or agreed to be contacted (Spain: prior consent for commercial calls; Mexico: REPEP).
- Voice and data are processed in the EU. Recordings are deleted after 15 days; transcript, summary and collected data after 90 days.

## Self-hosting this layer

This repository contains only the MCP layer (MIT). Voice and telephony run on Deyaho's servers.

```bash
npm ci && npm run build
DEYAHO_API_BASE=https://mcp.deyaho.com PORT=8080 npm start
```

---

## MCP de llamadas de Deyaho

**Tu agente de IA (Claude, ChatGPT, Cursor) hace llamadas telefónicas reales en español a México y España.** Servidor MCP remoto: tu agente llama a una herramienta con un teléfono y un objetivo, un agente de voz con IA de Deyaho hace la llamada y recibes el resumen, los datos recogidos y la transcripción.

- **Endpoint:** `https://mcp.deyaho.com/mcp` (Streamable HTTP, OAuth o API key)
- **Precio:** 0,19 USD por minuto conectado, telefonía incluida, sin cuota mensual. No contestadas, comunicando y buzón de voz no se cobran.
- **Destinos:** México (+52) y España (+34), desde números locales (Ciudad de México y Madrid)
- **Guía, precios y preguntas frecuentes:** https://deyaho.com/mcp

**Instalación:** cuenta gratis y recarga en https://app.deyaho.com/dashboard/mcp. En Claude y Claude Desktop: Ajustes > Conectores > Añadir conector personalizado con `https://mcp.deyaho.com/mcp` e inicio de sesión. En Claude Code: `claude mcp add --transport http deyaho-llamadas https://mcp.deyaho.com/mcp --header "Authorization: Bearer dy_mcp_TU_CLAVE"`. En Cursor: el `mcp.json` de arriba. En ChatGPT: modo desarrollador y conector con la URL y OAuth.

**Ejemplo:** "Llama al +34 600 000 000 de parte de Clínica Sol y confirma la cita de mañana a las 10:00; si no le viene bien, pide otra hora. Me dio su consentimiento en el formulario de reserva. Después dame el resumen y la transcripción."

**Herramientas:** `make_call` (devuelve `call_id`; exige `call_purpose` (`service` o `commercial`), `consent_confirmed: true` y `consent_statement`), `get_call`, `list_calls` y `get_pricing` (gratis).

**Precio:** 0,19 USD por minuto conectado. Packs: 52 min = 10 USD, 131 min = 25 USD, 263 min = 50 USD.

**Límites:** 4 minutos por llamada, 10 llamadas al día por clave, una llamada a la vez. Las llamadas de servicio funcionan de lunes a sábado de 09:00 a 21:00; las comerciales, de lunes a viernes, y en España salen por número 400. Domingos y festivos nacionales, sin llamadas. El agente avisa al empezar de que es una IA y de que la llamada se graba. Llama solo a quien haya pedido o aceptado ser contactado. Grabación borrada a los 15 días; transcripción, resumen y datos a los 90.

## License

MIT
