import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { authMiddleware } from "@repo/auth/auth";
import { db } from "@repo/db-auth";
import { UserSchema } from "@repo/db-auth/zod";

import { env } from "./env";

const userRouter = new OpenAPIHono().openapi(
  createRoute({
    method: "get",
    path: "/:id",
    request: {
      params: z.object({
        id: z.string(),
      }),
    },
    middleware: [
      authMiddleware({
        authBased: {
          allowedRoles: ["admin"],
        },
        bearer: {
          tokens: [env.INTERNAL_COMMUNICATION_SECRET],
        },
      }),
    ],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: UserSchema,
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
    const id = c.req.valid("param").id;
    const user = await db.user.findUnique({
      where: {
        id,
      },
    });
    return c.json(user);
  },
);

export { userRouter };
