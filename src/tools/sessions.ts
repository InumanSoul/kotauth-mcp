import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError, type ApiResponse } from "../api/client.js";
import { ListSessionsSchema, RevokeSessionSchema } from "../schemas/index.js";

interface SessionDto {
  id: number;
  userId: number;
  clientId: number;
  scopes: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

export function registerSessionTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_sessions",
    "List all active user sessions in the workspace, including IP address and expiry time.",
    ListSessionsSchema.shape,
    async () => {
      try {
        const res = await client.get<ApiResponse<SessionDto>>("/sessions");
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "revoke_session",
    "Immediately revoke an active session, forcing the user to re-authenticate.",
    RevokeSessionSchema.shape,
    async ({ sessionId }) => {
      try {
        await client.del(`/sessions/${sessionId}`);
        return { content: [{ type: "text", text: `Session ${sessionId} revoked.` }] };
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
