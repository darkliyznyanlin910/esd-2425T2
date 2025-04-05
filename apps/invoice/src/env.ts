import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    INTERNAL_COMMUNICATION_SECRET: z.string(),
    AWS_REGION: z.string(),
    AWS_ACCESS_KEY_ID: z.string(),
    AWS_SECRET_ACCESS_KEY: z.string(),
    S3_ENDPOINT: z.string(),
    S3_BUCKET: z.string(),
  },
  runtimeEnv: {
    INTERNAL_COMMUNICATION_SECRET: process.env.INTERNAL_COMMUNICATION_SECRET,
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_BUCKET: process.env.S3_BUCKET,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
