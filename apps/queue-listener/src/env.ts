import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  server: {
    RABBITMQ_URL: z.string().optional(),
    RABBITMQ_QUEUE: z.string().optional(),
    RABBITMQ_USERNAME: z.string().optional(),
    RABBITMQ_PASSWORD: z.string().optional(),
    SQS_QUEUE_URL: z.string().optional(),
  },
  runtimeEnv: {
    RABBITMQ_URL: process.env.RABBITMQ_URL,
    RABBITMQ_QUEUE: process.env.RABBITMQ_QUEUE,
    RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME,
    RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
    SQS_QUEUE_URL: process.env.SQS_QUEUE_URL,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
