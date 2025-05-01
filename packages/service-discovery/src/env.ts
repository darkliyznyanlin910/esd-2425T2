import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: z
      .enum(["local", "docker", "kubernetes", "kubernetes-internal"])
      .default("local"),
    NEXT_PUBLIC_DOMAIN: z.string().default("esd.local"),
  },
  clientPrefix: "NEXT_PUBLIC_",
  runtimeEnv: {
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT:
      process.env.NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT,
    NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
