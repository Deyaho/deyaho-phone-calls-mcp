# Deyaho Phone Calls MCP

[![Deyaho/deyaho-phone-calls-mcp MCP server](https://glama.ai/mcp/servers/Deyaho/deyaho-phone-calls-mcp/badges/score.svg)](https://glama.ai/mcp/servers/Deyaho/deyaho-phone-calls-mcp)

**Let Claude, ChatGPT, Cursor or any AI agent make real phone calls to Mexico, Spain, the United States, Canada, Colombia, Peru and the United Kingdom.** A remote MCP server: your agent calls a tool with a phone number and a goal, a Deyaho AI voice agent places the call, and you get back the summary, the collected data and the full transcript.

- **Endpoint:** `https://mcp.deyaho.com/mcp` (Streamable HTTP, OAuth or API key)
- **Price:** 0.25 USD per connected minute, telephony included, no monthly fee. Unanswered, busy and voicemail calls are free.
- **Destinations:** Mexico (+52), Spain (+34), United States and Canada (+1), Colombia (+57), Peru (+51) and United Kingdom (+44), each called from the line closest to it. With a prepaid key, at their own price per minute: Argentina, Belize, Bolivia, Brazil, Chile, Costa Rica, Dominican Republic, Ecuador, El Salvador, Guatemala, Honduras, Nicaragua, Panama, Paraguay, Puerto Rico, Uruguay, Austria, Belgium, France, Germany, Ireland, Italy, Netherlands and Portugal
- **Hours:** service calls Monday to Saturday 09:00-21:00; commercial calls Monday to Friday (commercial calls to Spain go out from a 400 number). Colombia, Peru and United Kingdom: service calls only. United States and Canada: informational calls only, every day 08:00-21:00 local time of the recipient, with `prior_express_consent=true` and `call_type`
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
- "Use list_voices for Mexico, play me the samples and call +52 55 1234 5678 with the voice I pick."
- "Use get_pricing and tell me my balance."

## Tools

| Tool | What it does |
|---|---|
| `make_call` | Calls `to` (E.164) on behalf of `business_name`, pursues `goal`, collects the `collect` fields, in `language` (optional: by default the language of the destination country, e.g. Brazil +55 in Brazilian Portuguese; set it only to speak another language). `call_purpose` is `service` (appointments, reminders, surveys of your own customers, calls the person asked for) or `commercial` (selling or offering something to someone who did not ask for it). Requires `consent_confirmed: true` and a `consent_statement`. Optional `website_url` (the agent reads the business website before the call), `business_info` and `voice` (an id or name from `list_voices`, in the language of the call) to change the voice for that call only; by default the agent uses the voice the account chose with `set_voice` or in its dashboard, or the voice of the destination country (Mexico: Emiliano). Returns `call_id`. |
| `get_call` | Status, duration, billed minutes, summary, collected data and full transcript. |
| `list_calls` | Your latest calls, newest first. |
| `list_voices` | Free. Voices by `language` and `country`, with name, gender and a link to a ~10 s audio sample. Every destination country has Fish voices and a default voice with its sample (Belgium: French and Dutch; Canada: English and French; Brazil: Brazilian Portuguese, and calls to +55 with `language: pt` are in Brazilian Portuguese). Signed in, it also shows `your_voices`. |
| `set_voice` | Free. Saves the voice of your account for one destination `country` (`voice`: id or name from `list_voices`, or `default`). Every later call to that country uses it. Same setting as the voice picker in app.deyaho.com/dashboard/mcp. |
| `get_pricing` | Free. Price, your balance, limits, countries and calling hours. |

## Pricing

0.25 USD per connected minute, rounded up to the minute. Prepaid packs: 40 min = 10 USD, 100 min = 25 USD, 200 min = 50 USD (also in EUR and MXN). No monthly fee, no number to buy. A 3-minute call costs 0.57 USD. Every new account has 1 free minute to try a call to its own phone.

## Limits and compliance

- Max 4 minutes per call, 10 calls per day per key, one call at a time.
- Calling hours depend on `call_purpose`, local time of the destination: service calls Monday to Saturday 09:00-21:00; commercial calls Monday to Friday, Spain 09:00-21:00 and Mexico 09:00-19:00. No calls on Sundays or national holidays.
- Since 17 October 2026, commercial calls to Spain must come from a 400 number. Until Deyaho has one, calls to Spain are service calls; `make_call` returns `commercial calls to Spain require a 400 number` otherwise.
- Only the destinations above; emergency, premium-rate and toll-free numbers are blocked.
- At the start the agent says it is an AI (EU AI Act art. 50) and that the call is recorded, and only names the business you give it.
- Only call people who requested or agreed to be contacted (Spain: prior consent for commercial calls; Mexico: REPEP; United States and Canada: prior express consent). Never cold calls to purchased lists.
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
- **Precio:** 0,25 USD por minuto conectado, telefonía incluida, sin cuota mensual. No contestadas, comunicando y buzón de voz no se cobran.
- **Destinos:** México (+52), España (+34), Estados Unidos y Canadá (+1), Colombia (+57), Perú (+51) y Reino Unido (+44). Con clave prepago, a su propio precio por minuto: Argentina, Belice, Bolivia, Brasil, Chile, Costa Rica, Rep. Dominicana, Ecuador, El Salvador, Guatemala, Honduras, Nicaragua, Panamá, Paraguay, Puerto Rico, Uruguay, Austria, Bélgica, Francia, Alemania, Irlanda, Italia, Países Bajos y Portugal
- **Guía, precios y preguntas frecuentes:** https://deyaho.com/mcp

**Instalación:** cuenta gratis y recarga en https://app.deyaho.com/dashboard/mcp. En Claude y Claude Desktop: Ajustes > Conectores > Añadir conector personalizado con `https://mcp.deyaho.com/mcp` e inicio de sesión. En Claude Code: `claude mcp add --transport http deyaho-llamadas https://mcp.deyaho.com/mcp --header "Authorization: Bearer dy_mcp_TU_CLAVE"`. En Cursor: el `mcp.json` de arriba. En ChatGPT: modo desarrollador y conector con la URL y OAuth.

**Ejemplo:** "Llama al +34 600 000 000 de parte de Clínica Sol y confirma la cita de mañana a las 10:00; si no le viene bien, pide otra hora. Me dio su consentimiento en el formulario de reserva. Después dame el resumen y la transcripción."

**Herramientas:** `make_call` (devuelve `call_id`; exige `call_purpose` (`service` o `commercial`), `consent_confirmed: true` y `consent_statement`), `get_call`, `list_calls`, `list_voices` (gratis: voces por idioma y país con muestra de audio de unos 10 s), `set_voice` (gratis: fija la voz de tu cuenta para un país de destino, la misma que eliges en tu panel) y `get_pricing` (gratis). En `make_call`, `voice` (opcional) cambia la voz solo en esa llamada.

**Precio:** 0,25 USD por minuto conectado. Packs: 40 min = 10 USD, 100 min = 25 USD, 200 min = 50 USD. Cada cuenta nueva tiene 1 minuto gratis para probar llamando a su propio teléfono.

**Límites:** 4 minutos por llamada, 10 llamadas al día por clave, una llamada a la vez. Las llamadas de servicio funcionan de lunes a sábado de 09:00 a 21:00; las comerciales, de lunes a viernes, y en España salen por número 400. Domingos y festivos nacionales, sin llamadas. El agente avisa al empezar de que es una IA y de que la llamada se graba. Llama solo a quien haya pedido o aceptado ser contactado. Grabación borrada a los 15 días; transcripción, resumen y datos a los 90.

## License

MIT
