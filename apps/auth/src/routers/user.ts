import { createRoute, OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";

import { db } from "@repo/db-auth";
import { UserSchema } from "@repo/db-auth/zod";
import { getServiceBaseUrl } from "@repo/service-discovery";

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
      const url = c.req.header("Origin");
      console.log(url);
      if (!url) {
        return c.json({ message: "Invalid origin" }, 400);
      }
      const role = getServiceBaseUrl("customer-frontend").includes(url)
        ? "client"
        : getServiceBaseUrl("driver-frontend").includes(url)
          ? "driver"
          : null;
      if (!role) {
        return c.json({ message: "Invalid origin" }, 400);
      }
      const body = await c.req.json();
      try {
        const res = await auth.api.signUpEmail({
          body: {
            password: body.password,
            email: body.email,
            name: body.name,
          },
        });
        await db.user.update({
          where: {
            id: res.user.id,
          },
          data: {
            role,
          },
        });
        console.log(res.user);
        return c.json(res.user);
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
      // middleware: [
      //   authMiddleware({
      //     authBased: {
      //       allowedRoles: ["admin"],
      //     },
      //     bearer: {
      //       tokens: [env.INTERNAL_COMMUNICATION_SECRET],
      //     },
      //   }),
      // ],
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
  )

  .openapi(
    createRoute({
      method: "put",
      path: "/:id/stripeCustomerId",
      description: "Update Stripe Customer ID for a user",
      request: {
        params: z.object({
          id: z.string(),
        }),
        body: {
          content: {
            "application/json": {
              schema: z.object({
                stripeCustomerId: z.string(),
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
          description: "Stripe Customer ID updated",
        },
        400: {
          description: "Bad request",
        },
        404: {
          description: "User not found",
        },
      },
    }),
    async (c) => {
      const id = c.req.valid("param").id;
      const { stripeCustomerId } = await c.req.json();

      try {
        const user = await db.user.update({
          where: { id },
          data: { stripeCustomerId },
        });

        if (!user) {
          return c.json({ message: "User not found" }, 404);
        }

        return c.json({ message: "Stripe Customer ID updated successfully" });
      } catch (error) {
        console.log(error);
        return c.json({ message: "Failed to update Stripe Customer ID" }, 400);
      }
    },
  )
  .openapi(
    createRoute({
      method: "get",
      path: "/getAdminEmails",
      middleware: [
        authMiddleware({
          bearer: {
            tokens: [env.INTERNAL_COMMUNICATION_SECRET],
          },
        }),
      ] as const,
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

export { userRouter };
