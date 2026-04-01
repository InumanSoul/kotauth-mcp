import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError, type ApiResponse } from "../api/client.js";
import { ListRolesSchema, CreateRoleSchema, DeleteRoleSchema } from "../schemas/index.js";

interface RoleDto {
  id: number;
  name: string;
  description: string | null;
  scope: string;
  tenantId: number;
}

export function registerRoleTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_roles",
    "List all roles in the workspace, including their scope (tenant or client) and descriptions.",
    ListRolesSchema.shape,
    async () => {
      try {
        const res = await client.get<ApiResponse<RoleDto>>("/roles");
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "create_role",
    "Create a new role in the workspace. Roles can be tenant-scoped (global) or client-scoped (per-application).",
    CreateRoleSchema.shape,
    async (args) => {
      try {
        const res = await client.post<RoleDto>("/roles", args);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "delete_role",
    "Permanently delete a role. Users and groups assigned this role will lose it immediately.",
    DeleteRoleSchema.shape,
    async ({ roleId }) => {
      try {
        await client.del(`/roles/${roleId}`);
        return { content: [{ type: "text", text: `Role ${roleId} deleted.` }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );
}

function formatError(e: unknown) {
  if (e instanceof KotauthApiError) {
    return {
      content: [{ type: "text" as const, text: `Error ${e.status}: ${e.message}` }],
      isError: true,
    };
  }
  const msg = e instanceof Error ? e.message : String(e);
  return { content: [{ type: "text" as const, text: `Error: ${msg}` }], isError: true };
}
