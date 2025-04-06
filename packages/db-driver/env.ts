import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DRIVER_POSTGRES_READ_REPLICA_URLS: z
      .string()
      .transform((val) => val.split(","))
      .default(""),
    DRIVER_POSTGRES_URL: z.string(),
    NODE_ENV: z
      .enum(["development", "production", "staging"])
      .default("development"),
  },
  runtimeEnv: {
    DRIVER_POSTGRES_URL: process.env.DRIVER_POSTGRES_URL,
    DRIVER_POSTGRES_READ_REPLICA_URLS:
      process.env.DRIVER_POSTGRES_READ_REPLICA_URLS,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
