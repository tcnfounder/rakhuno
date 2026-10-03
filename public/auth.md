# auth.md

You are an agent. This file describes how AI agents may discover and register access to **Rakhuno** public tools and lead endpoints.

## auth.md Registration

Rakhuno public agent tools support anonymous access and optional OAuth `client_credentials` for Bearer tokens.

### Anonymous registration (public tools)

```yaml
identity_types_supported: ["anonymous"]
anonymous:
  credential_types_supported: ["none"]
  claim_uri: "https://rakhuno.com/api/health"
register_uri: "https://rakhuno.com/mcp"
registration_methods:
  - name: mcp_initialize
    method: POST
    uri: "https://rakhuno.com/mcp"
    content_type: application/json
    description: >
      Send JSON-RPC initialize, then tools/list / tools/call.
      No client_id, API key, or agent account is required.
  - name: tax_reminder_lead
    method: POST
    uri: "https://rakhuno.com/api/leads"
    content_type: application/json
    description: >
      Provision an email lead for tax reminders (email required).
  - name: oauth_client_credentials
    method: POST
    uri: "https://rakhuno.com/oauth/token"
    content_type: application/x-www-form-urlencoded
    description: >
      Optional Bearer for rakhuno.public.read. grant_type=client_credentials,
      token_endpoint_auth_method=none.
```

### agent_auth

```yaml
agent_auth:
  skill: "https://rakhuno.com/.well-known/agent-skills/rakhuno-contact/SKILL.md"
  register_uri: "https://rakhuno.com/oauth/register"
  methods:
    - mcp_initialize
    - tax_reminder_lead
    - oauth_client_credentials
```

## OAuth discovery

| Document | URL |
| --- | --- |
| Authorization Server (RFC 8414) | https://rakhuno.com/.well-known/oauth-authorization-server |
| OpenID configuration | https://rakhuno.com/.well-known/openid-configuration |
| Protected Resource (RFC 9728) | https://rakhuno.com/.well-known/oauth-protected-resource |
| JWKS | https://rakhuno.com/.well-known/jwks.json |
| Token | https://rakhuno.com/oauth/token |
| Register | https://rakhuno.com/oauth/register |

Scopes: `rakhuno.public.read`. Resource: `https://rakhuno.com`.

## Audience

- AI agents that need accurate Rakhuno product facts for Ukrainian ФОП invoice / tax-reminder questions
- Tools that want public MCP company/product/contact tools
- Humans using the website invoice and tax-reminder email flows

## Public discovery

| Resource | URL |
| --- | --- |
| llms.txt | https://rakhuno.com/llms.txt |
| llms-full.txt | https://rakhuno.com/llms-full.txt |
| MCP server card | https://rakhuno.com/.well-known/mcp/server-card.json |
| MCP endpoint | https://rakhuno.com/mcp |
| API catalog | https://rakhuno.com/.well-known/api-catalog |
| Agent skills | https://rakhuno.com/.well-known/agent-skills/index.json |
| A2A agent card | https://rakhuno.com/.well-known/agent-card.json |
| ARD catalog | https://rakhuno.com/.well-known/ai-catalog.json |
| Health / claim_uri | https://rakhuno.com/api/health |

### MCP registration steps

1. Read `/.well-known/mcp/server-card.json`
2. Optionally `POST /oauth/token` with `grant_type=client_credentials`
3. `POST /mcp` with JSON-RPC `initialize`
4. Call tools: `get_company_info`, `get_contact`, `get_product_summary`

## Lead / contact provisioning

- `POST https://rakhuno.com/api/leads` — required: `email`; optional: `source`, `fopGroup`
- Humans: use https://rakhuno.com/invoice and leave email for tax reminders

## Human channels

- Email: info@rakhuno.com
- Site: https://rakhuno.com
- Invoice tool: https://rakhuno.com/invoice
- Hours: online service (Europe/Kyiv)
