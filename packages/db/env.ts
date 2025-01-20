import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    POSTGRES_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "production", "staging"])
      .default("development"),
  },
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
