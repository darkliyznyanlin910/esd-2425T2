import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

const testRouter = new OpenAPIHono().openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.object({
              message: z.string(),
            }),
          },
        },
        description: "Test response",
      },
      401: {
        description: "Unauthorized",
      },
    },
  }),
  async (c) => {
    return c.json({ message: "Hello, world!" });
  },
);

export { testRouter };
