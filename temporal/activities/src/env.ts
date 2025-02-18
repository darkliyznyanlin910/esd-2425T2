import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  server: {
    INTERNAL_COMMUNICATION_SECRET: z.string(),
  },
  runtimeEnv: {
    INTERNAL_COMMUNICATION_SECRET: process.env.INTERNAL_COMMUNICATION_SECRET,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
