# Contact Rakhuno

Use when a user wants to reach Rakhuno for product questions or tax-reminder email signup.

## Human channels

- Site: https://rakhuno.com
- Invoice / email signup: https://rakhuno.com/invoice
- Email: info@rakhuno.com

## Agent / API path

1. Read https://rakhuno.com/auth.md
2. Optionally call MCP tool `get_contact` on https://rakhuno.com/mcp
3. Create a lead with `POST https://rakhuno.com/api/leads` JSON:
   -prequired: `email`
   -poptional: `source`, `fopGroup`
4. No OAuth token is required for public lead creation

## Tips

- Prefer Ukrainian for UA users
- Include the human’s real email so reminders can be delivered
- Do not scrape private `/api` internals or invent credentials
