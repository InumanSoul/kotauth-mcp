import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError, type ApiResponse } from "../api/client.js";
import {
  ListUsersSchema,
  GetUserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  DisableUserSchema,
  AssignUserRoleSchema,
  RemoveUserRoleSchema,
} from "../schemas/index.js";

interface UserDto {
  id: number;
  username: string;
  email: string;
  fullName: string | null;
  emailVerified: boolean;
  enabled: boolean;
  mfaEnabled: boolean;
}

export function registerUserTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_users",
    "List users in the workspace. Optionally filter by username, email, or name prefix.",
    ListUsersSchema.shape,
    async ({ search }) => {
      try {
        const params: Record<string, string> = {};
        if (search) params.search = search;
        const res = await client.get<ApiResponse<UserDto>>("/users", params);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "get_user",
    "Get detailed information about a specific user by their ID.",
    GetUserSchema.shape,
    async ({ userId }) => {
      try {
        const res = await client.get<UserDto>(`/users/${userId}`);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "create_user",
    "Create a new user in the workspace with username, email, and password.",
    CreateUserSchema.shape,
    async (args) => {
      try {
        const res = await client.post<UserDto>("/users", args);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "update_user",
    "Update a user's email or display name.",
    UpdateUserSchema.shape,
    async ({ userId, ...body }) => {
      try {
        const res = await client.put<UserDto>(`/users/${userId}`, body);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "disable_user",
    "Disable a user account. The user data is preserved but they can no longer authenticate.",
    DisableUserSchema.shape,
    async ({ userId }) => {
      try {
        await client.del(`/users/${userId}`);
        return { content: [{ type: "text", text: `User ${userId} has been disabled.` }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "assign_user_role",
    "Assign a role to a user. The user will gain the permissions associated with that role.",
    AssignUserRoleSchema.shape,
    async ({ userId, roleId }) => {
      try {
        await client.post(`/users/${userId}/roles/${roleId}`);
        return { content: [{ type: "text", text: `Role ${roleId} assigned to user ${userId}.` }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "remove_user_role",
    "Remove a role from a user.",
    RemoveUserRoleSchema.shape,
    async ({ userId, roleId }) => {
      try {
        await client.del(`/users/${userId}/roles/${roleId}`);
        return { content: [{ type: "text", text: `Role ${roleId} removed from user ${userId}.` }] };
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
