import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin, openAPI } from "better-auth/plugins";
import { createMiddleware } from "hono/factory";

import { db } from "@repo/db-auth";
import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

import type { HonoExtension } from "./type";
import { env } from "./env";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: getServiceBaseUrl("auth"),
  basePath: "/auth",
  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
  },
  plugins: [
    openAPI({
      path: "/docs",
    }),
    admin(),
  ],
  trustedOrigins: SERVICES.map((service) => getServiceBaseUrl(service)),
});

export const authMiddleware = (allowedRoles: string[] = []) =>
  createMiddleware<HonoExtension>(async (c, next) => {
    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });

    if (!session) {
      c.set("user", null);
      c.set("session", null);
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (
      allowedRoles.length > 0 &&
      !allowedRoles.includes(session.user.role ?? "")
    ) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);
    return next();
  });
