import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    INVOICE_POSTGRES_URL: z.string(),
    INVOICE_POSTGRES_READ_REPLICA_URLS: z
      .string()
      .transform((val) => val.split(","))
      .default(""),
    NODE_ENV: z
      .enum(["development", "production", "staging"])
      .default("development"),
  },
  runtimeEnv: {
    INVOICE_POSTGRES_URL: process.env.INVOICE_POSTGRES_URL,
    INVOICE_POSTGRES_READ_REPLICA_URLS:
      process.env.INVOICE_POSTGRES_READ_REPLICA_URLS,
    NODE_ENV: process.env.NODE_ENV,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
