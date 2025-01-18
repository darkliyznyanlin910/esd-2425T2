import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DB_HOST: z.string(),
  },
  runtimeEnv: {
    DB_HOST: process.env.DB_HOST,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
