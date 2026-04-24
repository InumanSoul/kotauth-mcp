import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError } from "../api/client.js";
import {
  ListClaimMappersSchema,
  SetClaimMapperSchema,
  DeleteClaimMapperSchema,
} from "../schemas/index.js";

interface ClaimMapperDto {
  attributeKey: string;
  claimName: string;
  includeInAccess: boolean;
  includeInId: boolean;
}

interface ClaimMappersDto {
  mappers: ClaimMapperDto[];
}

export function registerClaimMapperTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_claim_mappers",
    "List all claim mappers for the workspace. Claim mappers project user attributes into JWT access and/or ID tokens. Max 20 mappers per tenant.",
    ListClaimMappersSchema.shape,
    async () => {
      try {
        const res = await client.get<ClaimMappersDto>("/claim-mappers");
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "set_claim_mapper",
    "Create or update a claim mapper. Maps a user attribute key to a JWT claim name. Reserved OIDC claim names (sub, iss, aud, email, etc.) are blocked. Attribute values flow unencrypted into JWTs — avoid mapping PII.",
    SetClaimMapperSchema.shape,
    async ({ attributeKey, claimName, includeInAccess, includeInId }) => {
      try {
        await client.put(`/claim-mappers/${encodeURIComponent(attributeKey)}`, {
          claimName,
          includeInAccess,
          includeInId,
        });
        return {
          content: [
            {
              type: "text",
              text: `Claim mapper set: attribute "${attributeKey}" → claim "${claimName}" (access: ${includeInAccess}, id: ${includeInId}).`,
            },
          ],
        };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "delete_claim_mapper",
    "Remove a claim mapper. The mapped claim will no longer appear in newly issued tokens. Existing tokens are unaffected until they expire.",
    DeleteClaimMapperSchema.shape,
    async ({ attributeKey }) => {
      try {
        await client.del(`/claim-mappers/${encodeURIComponent(attributeKey)}`);
        return {
          content: [{ type: "text", text: `Claim mapper for "${attributeKey}" deleted.` }],
        };
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
