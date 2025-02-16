import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { streamText } from "ai";
import { stream } from "hono/streaming";
import { z } from "zod";

import type { AiSdkMessages } from "@repo/chatbot-common";
import { backendTools } from "@repo/chatbot-ui/tools";

import { model } from "./ai";

const chatRouter = new OpenAPIHono().openapi(
  createRoute({
    method: "post",
    path: "/",
    request: {
      body: {
        content: {
          "application/json": {
            schema: z.object({
              messages: z.any(),
            }),
          },
        },
      },
    },
    responses: {
      200: {
        content: {
          "text/plain": {
            schema: z.string(),
          },
        },
        description: "Test response",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  (c) => {
    const body = c.req.valid("json");
    console.log(body);
    const messages = JSON.parse(JSON.stringify(body.messages)) as AiSdkMessages;
    const result = streamText({
      model,
      messages,
      tools: backendTools,
    });

    c.header("X-Vercel-AI-Data-Stream", "v1");
    c.header("Content-Type", "text/plain; charset=utf-8");

    return stream(c, (stream) => stream.pipe(result.toDataStream()));
  },
);

export { chatRouter };
