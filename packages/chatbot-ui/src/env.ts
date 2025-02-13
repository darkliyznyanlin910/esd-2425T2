import { createEnv } from "@t3-oss/env-core";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  server: {},
  runtimeEnv: {},
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
