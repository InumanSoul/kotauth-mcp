import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient, KotauthApiError, type ApiResponse } from "../api/client.js";
import {
  ListGroupsSchema,
  CreateGroupSchema,
  DeleteGroupSchema,
  ManageGroupMemberSchema,
} from "../schemas/index.js";

interface GroupDto {
  id: number;
  name: string;
  description: string | null;
  parentGroupId: number | null;
  tenantId: number;
}

export function registerGroupTools(server: McpServer, client: KotauthClient) {
  server.tool(
    "list_groups",
    "List all groups in the workspace, including their hierarchy (parent group relationships).",
    ListGroupsSchema.shape,
    async () => {
      try {
        const res = await client.get<ApiResponse<GroupDto>>("/groups");
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "create_group",
    "Create a new group. Groups can be nested under a parent group for hierarchical access control.",
    CreateGroupSchema.shape,
    async (args) => {
      try {
        const res = await client.post<GroupDto>("/groups", args);
        return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "delete_group",
    "Delete a group. Members will lose any roles inherited through this group.",
    DeleteGroupSchema.shape,
    async ({ groupId }) => {
      try {
        await client.del(`/groups/${groupId}`);
        return { content: [{ type: "text", text: `Group ${groupId} deleted.` }] };
      } catch (e) {
        return formatError(e);
      }
    },
  );

  server.tool(
    "manage_group_member",
    "Add or remove a user from a group. Users inherit all roles assigned to the group.",
    ManageGroupMemberSchema.shape,
    async ({ groupId, userId, action }) => {
      try {
        if (action === "add") {
          await client.post(`/groups/${groupId}/members/${userId}`);
          return { content: [{ type: "text", text: `User ${userId} added to group ${groupId}.` }] };
        } else {
          await client.del(`/groups/${groupId}/members/${userId}`);
          return { content: [{ type: "text", text: `User ${userId} removed from group ${groupId}.` }] };
        }
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
