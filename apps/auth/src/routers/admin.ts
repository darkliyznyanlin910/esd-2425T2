import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { db } from "@repo/db-auth";

import { authMiddleware } from "../auth";
import { env } from "../env";

const adminRouter = new OpenAPIHono().openapi(
  createRoute({
    method: "get",
    path: "/getAdminEmails",
    middleware: [
      authMiddleware({
        bearer: {
          tokens: [env.INTERNAL_COMMUNICATION_SECRET],
        },
      }),
    ],
    responses: {
      200: {
        content: {
          "application/json": {
            schema: z.array(z.string()),
          },
        },
        description: "Admin emails",
      },
    },
  }),
  async (c) => {
    const admins = await db.user.findMany({
      where: {
        role: "admin",
      },
      select: {
        email: true,
      },
    });
    return c.json(admins.map((admin) => admin.email));
  },
);

export { adminRouter };
