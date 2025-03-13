import type { routes } from "./app";

export type AppType = typeof routes;

export type GeocodingResponse = {
  lat: number;
  lng: number;
  error?: string;
};
