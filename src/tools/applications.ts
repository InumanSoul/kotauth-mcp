import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError, type ApiResponse } from "../api/client.js";
import { ListApplicationsSchema, UpdateApplicationSchema } from "../schemas/index.js";

interface ApplicationDto {
  id: number;
  clientId: string;
  name: string;
  description: string | null;
  accessType: string;
  enabled: boolean;
  redirectUris: string[];
}

export function registerApplicationTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_applications",
    "List all OAuth2/OIDC applications (clients) registered in the workspace.",
    ListApplicationsSchema.shape,
    async () => {
      try {
        const res = await client.get<ApiResponse<ApplicationDto>>("/applications");
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "update_application",
    "Update an OAuth2 application's name, description, access type (public/confidential), or redirect URIs.",
    UpdateApplicationSchema.shape,
    async ({ applicationId, ...body }) => {
      try {
        const res = await client.put<ApplicationDto>(`/applications/${applicationId}`, body);
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
