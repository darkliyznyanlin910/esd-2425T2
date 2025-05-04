import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    INTERNAL_COMMUNICATION_SECRET: z.string(),
    RESEND_API_KEY: z.string(),
    EMAIL_FROM: z.string(),
  },
  runtimeEnv: {
    INTERNAL_COMMUNICATION_SECRET: process.env.INTERNAL_COMMUNICATION_SECRET,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
