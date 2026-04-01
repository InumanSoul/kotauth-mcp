import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createClientFromEnv } from "./api/client.js";
import { createServer } from "./server.js";

async function main() {
  const client = createClientFromEnv();
  const server = createServer(client);
  const transport = new StdioServerTransport();

  await server.connect(transport);
  console.error("[kotauth-mcp] Server started on stdio");
}

main().catch((err) => {
  console.error("[kotauth-mcp] Fatal:", err);
  process.exit(1);
});
