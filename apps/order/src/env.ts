import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as authEnv } from "@repo/auth/env";

export const env = createEnv({
  extends: [authEnv],
  server: {
    INTERNAL_COMMUNICATION_SECRET: z.string(),
    GOOGLE_MAP_API_KEY: z.string(),
  },
  runtimeEnv: {
    INTERNAL_COMMUNICATION_SECRET: process.env.INTERNAL_COMMUNICATION_SECRET,
    GOOGLE_MAP_API_KEY: process.env.GOOGLE_MAP_API_KEY,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
