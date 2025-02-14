import { createEnv } from "@t3-oss/env-core";

import { env as authEnv } from "@repo/auth/env";

export const env = createEnv({
  extends: [authEnv],
  server: {},
  runtimeEnv: {},
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
