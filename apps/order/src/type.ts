import { hc } from "hono/client";

import { getServiceBaseUrl } from "@repo/service-discovery";

import type { routes } from "./app";

export type AppType = typeof routes;

export interface GeocodingResponse {
  lat: number;
  lng: number;
  error?: string;
}

export const HonoClient = hc<typeof routes>(getServiceBaseUrl("order"));
