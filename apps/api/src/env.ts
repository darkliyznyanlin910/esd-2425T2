import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string(),
  },
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
