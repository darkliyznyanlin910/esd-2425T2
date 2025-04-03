import { serve } from "@hono/node-server";

import { app, injectWebSocket } from "./ws";

const port = 3004;
console.log(`Server is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});

injectWebSocket(server);
