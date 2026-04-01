# @kotauth/mcp

MCP (Model Context Protocol) server for [KotAuth](https://kotauth.dev) — manage users, roles, groups, sessions, and audit logs from AI assistants like Claude, Cursor, and any MCP-compatible client.

## Quick Start

```bash
npx @kotauth/mcp
```

## Configuration

The server requires three environment variables:

| Variable | Description | Example |
|---|---|---|
| `KOTAUTH_BASE_URL` | Your KotAuth instance URL | `https://auth.example.com` |
| `KOTAUTH_TENANT_SLUG` | Workspace slug to operate on | `my-workspace` |
| `KOTAUTH_API_KEY` | API key with required scopes | `kauth_my-workspace_abc...` |

Create an API key in the KotAuth Admin Console under **Settings → API Keys**. Grant the scopes you need (e.g. `users:read`, `users:write`, `roles:read`).

## Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "kotauth": {
      "command": "npx",
      "args": ["-y", "@kotauth/mcp"],
      "env": {
        "KOTAUTH_BASE_URL": "https://auth.example.com",
        "KOTAUTH_TENANT_SLUG": "my-workspace",
        "KOTAUTH_API_KEY": "kauth_my-workspace_..."
      }
    }
  }
}
```

## Claude Code

```bash
claude mcp add kotauth -- npx -y @kotauth/mcp \
  --env KOTAUTH_BASE_URL=https://auth.example.com \
  --env KOTAUTH_TENANT_SLUG=my-workspace \
  --env KOTAUTH_API_KEY=kauth_my-workspace_...
```

## Available Tools

### Users
- **list_users** — List users, optionally filter by username/email/name
- **get_user** — Get a specific user by ID
- **create_user** — Create a new user with username, email, and password
- **update_user** — Update a user's email or display name
- **disable_user** — Disable a user account (soft delete)
- **assign_user_role** — Assign a role to a user
- **remove_user_role** — Remove a role from a user

### Roles
- **list_roles** — List all roles (tenant and client scoped)
- **create_role** — Create a new role
- **delete_role** — Delete a role

### Groups
- **list_groups** — List all groups with hierarchy
- **create_group** — Create a group (optionally nested under a parent)
- **delete_group** — Delete a group
- **manage_group_member** — Add or remove a user from a group

### Applications
- **list_applications** — List OAuth2/OIDC clients
- **update_application** — Update an application's settings

### Sessions
- **list_sessions** — List active sessions
- **revoke_session** — Force-terminate a session

### Audit
- **query_audit_logs** — Query immutable audit events with filters

## Required API Key Scopes

Each tool requires specific scopes on the API key:

| Tools | Scope |
|---|---|
| list_users, get_user | `users:read` |
| create_user, update_user, disable_user, assign/remove role | `users:write` |
| list_roles | `roles:read` |
| create_role, delete_role | `roles:write` |
| list_groups | `groups:read` |
| create_group, delete_group, manage_group_member | `groups:write` |
| list_applications | `applications:read` |
| update_application | `applications:write` |
| list_sessions | `sessions:read` |
| revoke_session | `sessions:write` |
| query_audit_logs | `audit_logs:read` |

## Development

```bash
git clone https://github.com/kotauth/kotauth-mcp.git
cd kotauth-mcp
npm install
npm run build
```

Test locally with the MCP inspector:

```bash
KOTAUTH_BASE_URL=http://localhost:8080 \
KOTAUTH_TENANT_SLUG=master \
KOTAUTH_API_KEY=kauth_master_... \
npx @modelcontextprotocol/inspector node dist/index.js
```

## License

MIT — see [LICENSE](LICENSE).
