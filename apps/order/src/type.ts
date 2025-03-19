import type { routes } from "./app";

export type AppType = typeof routes;

export interface GeocodingResponse {
  lat: number;
  lng: number;
  error?: string;
}
