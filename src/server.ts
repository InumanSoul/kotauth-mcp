import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KotauthClient } from "./api/client.js";
import { registerUserTools } from "./tools/users.js";
import { registerRoleTools } from "./tools/roles.js";
import { registerGroupTools } from "./tools/groups.js";
import { registerApplicationTools } from "./tools/applications.js";
import { registerSessionTools } from "./tools/sessions.js";
import { registerAuditTools } from "./tools/audit.js";
import { registerUserAttributeTools } from "./tools/user-attributes.js";
import { registerClaimMapperTools } from "./tools/claim-mappers.js";

export function createServer(client: KotauthClient): McpServer {
  const server = new McpServer({
    name: "kotauth",
    version: "0.2.0",
  });

  registerUserTools(server, client);
  registerRoleTools(server, client);
  registerGroupTools(server, client);
  registerApplicationTools(server, client);
  registerSessionTools(server, client);
  registerAuditTools(server, client);
  registerUserAttributeTools(server, client);
  registerClaimMapperTools(server, client);

  return server;
}
