import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

import { env as serviceDiscoveryEnv } from "@repo/service-discovery/env";

export const env = createEnv({
  extends: [serviceDiscoveryEnv],
  server: {
    INTERNAL_COMMUNICATION_SECRET: z.string(),
    STRIPE_SECRET_KEY: z.string(),

    PAYMENT_TIMEOUT: z.string().regex(/^\d+[smhd]$/, {
      message: "Must be a valid Temporal duration (e.g. '5m', '1h')",
    }),
    ACTIVITY_TIMEOUT: z.string().regex(/^\d+[smhd]$/, {
      message: "Must be a valid Temporal duration (e.g. '1m')",
    }),
    ACTIVITY_RETRY_MAX_INTERVAL: z.string().regex(/^\d+[smhd]$/, {
      message: "Must be a valid Temporal duration (e.g. '1m')",
    }),
    PICKUP_TIMEOUT: z.string().regex(/^\d+[smhd]$/, {
      message: "Must be a valid Temporal duration (e.g. '10s')",
    }),
    DELIVERY_TIMEOUT: z.string().regex(/^\d+[smhd]$/, {
      message: "Must be a valid Temporal duration (e.g. '10s')",
    }),
    DRIVER_FOUND_TIMEOUT: z.string().regex(/^\d+[smhd]$/, {
      message: "Must be a valid Temporal duration (e.g. '10s')",
    }),
  },
  runtimeEnv: {
    INTERNAL_COMMUNICATION_SECRET: process.env.INTERNAL_COMMUNICATION_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,

    PAYMENT_TIMEOUT: process.env.PAYMENT_TIMEOUT,
    ACTIVITY_TIMEOUT: process.env.ACTIVITY_TIMEOUT,
    ACTIVITY_RETRY_MAX_INTERVAL: process.env.ACTIVITY_RETRY_MAX_INTERVAL,
    PICKUP_TIMEOUT: process.env.PICKUP_TIMEOUT,
    DELIVERY_TIMEOUT: process.env.DELIVERY_TIMEOUT,
    DRIVER_FOUND_TIMEOUT: process.env.DRIVER_FOUND_TIMEOUT,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
