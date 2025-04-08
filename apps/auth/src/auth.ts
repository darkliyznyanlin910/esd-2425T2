import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, openAPI } from "better-auth/plugins";
import { createMiddleware } from "hono/factory";

import { db } from "@repo/db-auth";
import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import type { HonoExtension } from "./type";
import { env } from "./env";

export const auth: any = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: getServiceBaseUrl("auth"),
  basePath: "/auth",
  user: {
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        required: false,
        return: false,
        fieldName: "stripeCustomerId",
      },
    },
  },
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  plugins: [
    openAPI({
      path: "/docs",
    }),
    admin({
      adminRole: ["admin"],
      defaultRole: "client",
      schema: {
        user: {
          fields: {
            banned: "disabled",
          },
        },
      },
    }),
  ],
  trustedOrigins: SERVICES.map((service) => getServiceBaseUrl(service)),
});

export const ROLES = ["client", "driver", "admin"] as const;

export type Role = (typeof ROLES)[number];

export const authMiddleware = ({
  authBased,
  bearer,
}:
  | {
      authBased: {
        allowedRoles: Role[];
      };
      bearer?: {
        tokens: string[];
      };
    }
  | {
      authBased?: {
        allowedRoles: Role[];
      };
      bearer: {
        tokens: string[];
      };
    }) =>
  createMiddleware<HonoExtension>(async (c, next) => {
    let isAuthenticated = false;

    if (bearer) {
      const authHeader = c.req.raw.headers.get("Authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.split(" ")[1];
        if (token && bearer.tokens.includes(token)) {
          isAuthenticated = true;
          return next();
        }
      }
    }

    if (!isAuthenticated && authBased) {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (!session) {
        c.set("user", null);
        c.set("session", null);
        return c.json({ error: "Unauthorized - No session" }, 401);
      }

      if (
        authBased.allowedRoles.length > 0 &&
        !authBased.allowedRoles.includes(session.user.role as Role)
      ) {
        return c.json({ error: "Unauthorized - Invalid role" }, 401);
      } else {
        c.set("user", session.user);
        c.set("session", session.session);
        return next();
      }
    }
    return c.json({ error: "Unauthorized - Authentication required" }, 401);
  });
