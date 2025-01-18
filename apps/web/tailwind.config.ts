import type { Config } from "tailwindcss";

import baseConfig from "@repo/ui/tailwind/web";

export default {
  // We need to append the path to the UI package to the content array so that
  // those classes are included correctly.
  content: [
    ...baseConfig.content,
    "../../packages/ui/src/**/*.{ts,tsx}",
    "src/**/*.{ts,tsx}",
  ],
  presets: [baseConfig],
  theme: {},
} satisfies Config;
