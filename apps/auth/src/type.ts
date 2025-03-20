import { hc } from "hono/client";

import { getServiceBaseUrl } from "@repo/service-discovery";

import type { routes } from "./app";
import type { auth } from "./auth";

export interface HonoExtension {
  Variables: {
    user: typeof auth.$Infer.Session.user | null;
    session: typeof auth.$Infer.Session.session | null;
  };
}

export const HonoClient = hc<typeof routes>(getServiceBaseUrl("auth"));
