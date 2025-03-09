import { createEnv } from "@t3-oss/env-core";

export const env = createEnv({
  server: {},
  runtimeEnv: {},
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
