import { createEnv } from "@t3-oss/env-core";

import { env as dbEnv } from "@repo/db/env";
import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv, dbEnv],
  server: {},
  runtimeEnv: {},
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
