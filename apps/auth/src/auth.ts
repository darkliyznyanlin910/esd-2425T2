import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { openAPI } from "better-auth/plugins";

import { db } from "@repo/db-user";
import { getServiceBaseUrl, SERVICES } from "@repo/service-discovery";

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
  plugins: [openAPI()],
  trustedOrigins: SERVICES.map((service) => getServiceBaseUrl(service)),
});
