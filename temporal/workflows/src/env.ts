import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    ORDER_DEFAULT_UNIT_AMOUNT: z.preprocess((x) => Number(x), z.number()),
    PAYMENT_TIMEOUT: z
      .string()
      .regex(/^\d+[smhd]$/, {
        message: "Must be a valid Temporal duration (e.g. '5m', '1h')",
      })
      .default("5m"),
    ACTIVITY_TIMEOUT: z
      .string()
      .regex(/^\d+[smhd]$/, {
        message: "Must be a valid Temporal duration (e.g. '1m')",
      })
      .default("1m"),
    ACTIVITY_RETRY_MAX_INTERVAL: z
      .string()
      .regex(/^\d+[smhd]$/, {
        message: "Must be a valid Temporal duration (e.g. '1m')",
      })
      .default("1m"),
    PICKUP_TIMEOUT: z
      .string()
      .regex(/^\d+[smhd]$/, {
        message: "Must be a valid Temporal duration (e.g. '10s')",
      })
      .default("5m"),
    DELIVERY_TIMEOUT: z
      .string()
      .regex(/^\d+[smhd]$/, {
        message: "Must be a valid Temporal duration (e.g. '10s')",
      })
      .default("10s"),
    DRIVER_FOUND_TIMEOUT: z
      .string()
      .regex(/^\d+[smhd]$/, {
        message: "Must be a valid Temporal duration (e.g. '10s')",
      })
      .default("10s"),
  },
  runtimeEnv: {
    PAYMENT_TIMEOUT: process.env.PAYMENT_TIMEOUT,
    ACTIVITY_TIMEOUT: process.env.ACTIVITY_TIMEOUT,
    ACTIVITY_RETRY_MAX_INTERVAL: process.env.ACTIVITY_RETRY_MAX_INTERVAL,
    PICKUP_TIMEOUT: process.env.PICKUP_TIMEOUT,
    DELIVERY_TIMEOUT: process.env.DELIVERY_TIMEOUT,
    DRIVER_FOUND_TIMEOUT: process.env.DRIVER_FOUND_TIMEOUT,
    ORDER_DEFAULT_UNIT_AMOUNT: process.env.ORDER_DEFAULT_UNIT_AMOUNT,
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
