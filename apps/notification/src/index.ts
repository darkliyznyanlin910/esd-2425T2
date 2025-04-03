import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";

import { app } from "./app";

const port = 3004;
console.log(`Server is running on http://localhost:${port}`);

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});

injectWebSocket(server);

export { upgradeWebSocket };
