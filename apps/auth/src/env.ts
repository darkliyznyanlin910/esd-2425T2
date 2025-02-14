import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as dbEnv } from "@repo/db-auth/env";
import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv, dbEnv],
  server: {},
  shared: {
    BETTER_AUTH_SECRET: z.string(),
  },
  runtimeEnv: {
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
