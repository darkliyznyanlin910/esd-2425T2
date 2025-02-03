import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    NEXT_PUBLIC_DEPLOYMENT_ENVIRONMENT: z
      .enum(["local", "docker", "aws-prod", "aws-dev"])
      .default("local"),
  },
  clientPrefix: "NEXT_PUBLIC_",
  runtimeEnv: {
    DEPLOYMENT_ENVIRONMENT: process.env.DEPLOYMENT_ENVIRONMENT,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
