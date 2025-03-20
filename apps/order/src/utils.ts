import type { Order } from "@repo/db-order/zod";
import { db } from "@repo/db-order";

import type { GeocodingResponse } from "./type";
import { env } from "./env";

export const generateDisplayId = (num: number): string => {
  return `#${num.toString().padStart(4, "0")}`;
};

export const getAddress = (order: Order, type: "from" | "to") => {
  if (type === "from") {
    return `${order.fromAddressLine1} ${order.fromAddressLine2 ?? ""} ${order.fromZipCode}`;
  }

  return `${order.toAddressLine1} ${order.toAddressLine2 ?? ""} ${order.toZipCode}`;
};

export async function googleGeocode(
  address: string,
): Promise<GeocodingResponse> {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${env.GOOGLE_MAP_API_KEY}`;
    console.log(url);
    const response = await fetch(url);

    const data = (await response.json()) as any;

    if (data.status === "OK" && data.results?.[0]?.geometry?.location) {
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    }

    return {
      lat: 0,
      lng: 0,
      error: `Geocoding failed: ${data.status}`,
    };
  } catch (error) {
    console.error(error);
    return {
      lat: 0,
      lng: 0,
      error: "Failed to geocode address",
    };
  }
}

export async function getGeocoding(
  address: string,
): Promise<GeocodingResponse> {
  const cacheKey = address;
  const getLatLon = await db.geocodingCache.findUnique({
    where: {
      address: cacheKey,
    },
  });

  if (getLatLon) {
    return {
      lat: getLatLon.lat,
      lng: getLatLon.lng,
    };
  }

  const { lat, lng, error } = await googleGeocode(address);

  if (error) {
    return {
      lat: 0,
      lng: 0,
      error,
    };
  }

  await db.geocodingCache.create({
    data: {
      address: cacheKey,
      lat,
      lng,
    },
  });

  return {
    lat,
    lng,
  };
}

export async function getOptimalRoute(
  origin: { lat: number; lng: number },
  destinations: { lat: number; lng: number }[],
): Promise<number[]> {
  // Return early if no destinations
  if (!destinations.length) return [];

  // Haversine formula to calculate distance between two points
  function haversineDistance(
    p1: { lat: number; lng: number },
    p2: { lat: number; lng: number },
  ): number {
    const toRad = (value: number) => (value * Math.PI) / 180;

    const R = 6371; // Earth radius in km
    const dLat = toRad(p2.lat - p1.lat);
    const dLng = toRad(p2.lng - p1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(p1.lat)) *
        Math.cos(toRad(p2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
  }

  const remainingIndices = destinations.map((_, index) => index);
  const routeOrder: number[] = [];

  let currentPosition = origin;

  // Find nearest destination until all are visited
  while (remainingIndices.length > 0) {
    let nearestIndex = -1;
    let shortestDistance = Number.POSITIVE_INFINITY;

    // Find closest unvisited destination
    remainingIndices.forEach((destinationIndex, arrayIndex) => {
      const dest = destinations[destinationIndex]!;
      const distance = haversineDistance(currentPosition, dest);

      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestIndex = arrayIndex;
      }
    });

    // If we found a valid next destination
    if (nearestIndex !== -1) {
      const nextDestinationIndex = remainingIndices[nearestIndex]!;

      // Add to route
      routeOrder.push(nextDestinationIndex);

      // Move to next position
      currentPosition = destinations[nextDestinationIndex]!;

      // Remove from remaining indices
      remainingIndices.splice(nearestIndex, 1);
    } else {
      // Shouldn't reach here unless there's a problem
      break;
    }
  }

  return routeOrder;
}
