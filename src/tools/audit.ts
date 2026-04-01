import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError, type ApiResponse } from "../api/client.js";
import { QueryAuditLogsSchema } from "../schemas/index.js";

interface AuditEventDto {
  eventType: string;
  userId: number | null;
  clientId: number | null;
  ipAddress: string | null;
  createdAt: string;
  details: Record<string, string>;
}

export function registerAuditTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "query_audit_logs",
    "Query the immutable audit log. Filter by event type (e.g. LOGIN_SUCCESS, LOGIN_FAILED, ADMIN_USER_CREATED, MFA_ENROLLMENT_STARTED) and/or user ID. Supports pagination.",
    QueryAuditLogsSchema.shape,
    async ({ eventType, userId, limit, offset }) => {
      try {
        const params: Record<string, string> = {};
        if (eventType) params.eventType = eventType;
        if (userId !== undefined) params.userId = String(userId);
        if (limit !== undefined) params.limit = String(limit);
        if (offset !== undefined) params.offset = String(offset);
        const res = await client.get<ApiResponse<AuditEventDto>>("/audit-logs", params);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
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
