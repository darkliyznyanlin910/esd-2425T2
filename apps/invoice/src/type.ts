import { hc } from "hono/client";

import { getServiceBaseUrl } from "@repo/service-discovery";

import type { routes } from "./app";

export type AppType = typeof routes;

export const HonoClient = hc<typeof routes>(getServiceBaseUrl("invoice"));
