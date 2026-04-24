import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError } from "../api/client.js";
import {
  ListUserAttributesSchema,
  SetUserAttributeSchema,
  DeleteUserAttributeSchema,
} from "../schemas/index.js";

interface UserAttributesDto {
  attributes: Record<string, string>;
}

export function registerUserAttributeTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_user_attributes",
    "List all custom attributes for a user. Attributes are key-value metadata that can be projected into JWT claims via claim mappers.",
    ListUserAttributesSchema.shape,
    async ({ userId }) => {
      try {
        const res = await client.get<UserAttributesDto>(`/users/${userId}/attributes`);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "set_user_attribute",
    "Set a custom attribute on a user. Creates the attribute if it doesn't exist, updates it if it does. Values are opaque strings (max 1024 chars). If a claim mapper exists for this key, the value will appear in issued JWTs.",
    SetUserAttributeSchema.shape,
    async ({ userId, key, value }) => {
      try {
        await client.put(`/users/${userId}/attributes/${encodeURIComponent(key)}`, { value });
        return { content: [{ type: "text", text: `Attribute "${key}" set on user ${userId}.` }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "delete_user_attribute",
    "Remove a custom attribute from a user. If a claim mapper references this key, the claim will no longer appear in newly issued tokens.",
    DeleteUserAttributeSchema.shape,
    async ({ userId, key }) => {
      try {
        await client.del(`/users/${userId}/attributes/${encodeURIComponent(key)}`);
        return { content: [{ type: "text", text: `Attribute "${key}" deleted from user ${userId}.` }] };
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
