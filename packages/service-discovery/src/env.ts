import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {},
  shared: {
    DEPLOYMENT_ENVIRONMENT: z.enum(["local", "docker", "aws-prod", "aws-dev"]),
  },
  runtimeEnv: {
    DEPLOYMENT_ENVIRONMENT: process.env.DEPLOYMENT_ENVIRONMENT,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
