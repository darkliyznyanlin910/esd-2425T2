import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { db } from "@repo/db-auth";
import { UserSchema } from "@repo/db-auth/zod";

import { auth, authMiddleware } from "../auth";
import { env } from "../env";

const userRouter = new OpenAPIHono()
  .openapi(
    createRoute({
      method: "post",
      path: "/signup",
      request: {
        body: {
          content: {
            "application/json": {
              schema: z.object({
                password: z.string(),
                email: z.string(),
                name: z.string(),
                role: z.enum(["client", "driver"]),
              }),
            },
          },
        },
      },
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
      const body = await c.req.json();
      try {
        const res = await auth.api.createUser({
          body: {
            password: body.password,
            email: body.email,
            name: body.name,
            role: body.role,
          },
        });
        console.log(res.user);
        return c.json({ message: "User signup successful" });
      } catch (error) {
        console.log(error);
        return c.json({ message: "User signup failed" }, 400);
      }
    },
  )
  .openapi(
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
          description: "User details",
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
