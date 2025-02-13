import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as authEnv } from "@repo/auth/env";

export const env = createEnv({
  extends: [authEnv],
  server: {
    OPENAI_API_KEY: z.string(),
  },
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
