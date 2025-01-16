import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    
  },
  runtimeEnv: {
    
  },
  skipValidation: process.env.npm_lifecycle_event === "lint",
});
