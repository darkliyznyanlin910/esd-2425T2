import { Server as HttpServer } from "http";
import { serve } from "@hono/node-server";
import { Server } from "socket.io";

import { app } from "./app";
import {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./type";

const port = 3004;
console.log(`Server is running on http://localhost:${port}`);

const server = serve({
  fetch: app.fetch,
  port: Number(port),
});

const ioServer = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server as HttpServer, {
  // path: "/ws",
  serveClient: false,
});

const clients: { userId: string; clientId: string }[] = [];

ioServer.on("connection", (socket) => {
  console.log("connection", socket.id);
  const clientInfo = {
    userId: socket.data.userId,
    clientId: socket.id,
  };
  clients.push(clientInfo);
});

ioServer.sockets.on("connection", function (socket) {
  socket.on("disconnect", () => {
    for (let i = 0, len = clients.length; i < len; ++i) {
      const c = clients[i];

      if (!!c && c.clientId == socket.id) {
        clients.splice(i, 1);
        break;
      }
    }
  });
});

export { ioServer };
