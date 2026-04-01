import { z } from "zod";

// --- Users ---

export const ListUsersSchema = z.object({
  search: z.string().optional().describe("Filter by username, email, or name prefix"),
});

export const GetUserSchema = z.object({
  userId: z.number().int().positive().describe("User ID"),
});

export const CreateUserSchema = z.object({
  username: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, "Alphanumeric, dots, underscores, hyphens only")
    .describe("Unique username"),
  email: z.string().email().describe("User email address"),
  fullName: z.string().optional().describe("Display name"),
  password: z.string().min(4).describe("Initial password (min 4 chars)"),
});

export const UpdateUserSchema = z.object({
  userId: z.number().int().positive().describe("User ID"),
  email: z.string().email().optional().describe("New email address"),
  fullName: z.string().optional().describe("New display name"),
});

export const DisableUserSchema = z.object({
  userId: z.number().int().positive().describe("User ID to disable"),
});

export const AssignUserRoleSchema = z.object({
  userId: z.number().int().positive().describe("User ID"),
  roleId: z.number().int().positive().describe("Role ID to assign"),
});

export const RemoveUserRoleSchema = z.object({
  userId: z.number().int().positive().describe("User ID"),
  roleId: z.number().int().positive().describe("Role ID to remove"),
});

// --- Roles ---

export const ListRolesSchema = z.object({});

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .regex(/^[a-zA-Z0-9._-]+$/, "Alphanumeric, dots, underscores, hyphens only")
    .describe("Role name"),
  description: z.string().optional().describe("Role description"),
  scope: z.enum(["tenant", "client"]).default("tenant").describe("Role scope"),
});

export const DeleteRoleSchema = z.object({
  roleId: z.number().int().positive().describe("Role ID to delete"),
});

// --- Groups ---

export const ListGroupsSchema = z.object({});

export const CreateGroupSchema = z.object({
  name: z.string().min(1).describe("Group name"),
  description: z.string().optional().describe("Group description"),
  parentGroupId: z.number().int().positive().optional().describe("Parent group ID for nesting"),
});

export const DeleteGroupSchema = z.object({
  groupId: z.number().int().positive().describe("Group ID to delete"),
});

export const ManageGroupMemberSchema = z.object({
  groupId: z.number().int().positive().describe("Group ID"),
  userId: z.number().int().positive().describe("User ID"),
  action: z.enum(["add", "remove"]).describe("Whether to add or remove the user"),
});

// --- Applications ---

export const ListApplicationsSchema = z.object({});

export const UpdateApplicationSchema = z.object({
  applicationId: z.number().int().positive().describe("Application ID"),
  name: z.string().optional().describe("New application name"),
  description: z.string().optional().describe("New description"),
  accessType: z.enum(["public", "confidential"]).optional().describe("OAuth client type"),
  redirectUris: z.array(z.string().url()).optional().describe("Allowed redirect URIs"),
});

// --- Sessions ---

export const ListSessionsSchema = z.object({});

export const RevokeSessionSchema = z.object({
  sessionId: z.number().int().positive().describe("Session ID to revoke"),
});

// --- Audit Logs ---

export const QueryAuditLogsSchema = z.object({
  eventType: z.string().optional().describe("Filter by event type (e.g. LOGIN_SUCCESS, ADMIN_USER_CREATED)"),
  userId: z.number().int().positive().optional().describe("Filter by user ID"),
  limit: z.number().int().min(1).max(200).default(50).describe("Number of events to return (max 200)"),
  offset: z.number().int().min(0).default(0).describe("Pagination offset"),
});
