import { Client, TravelMode, UnitSystem } from "@googlemaps/google-maps-services-js";

const gmaps = new Client({});
const API_KEY = process.env.GOOGLE_MAPS_API_KEY_SERVER;

// ─── Haversine fallback when API key is absent (dev mode) ────────────────────
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Rough road-distance multiplier (straight-line underestimates road distance)
const ROAD_FACTOR = 1.35;
// City speed assumption for fallback ETA (km/h)
const AVG_SPEED_KMH = 25;

/**
 * Returns route data between origin and destination (with optional waypoints).
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @param {Array<{ lat: number, lng: number }>} waypoints
 * @returns {{ distanceMeters: number, durationSeconds: number, polyline: string|null }}
 */
export const getDirections = async (origin, destination, waypoints = []) => {
  if (!API_KEY) {
    let totalKm = 0;
    const points = [origin, ...waypoints, destination];
    for (let i = 0; i < points.length - 1; i++) {
      totalKm += haversineKm(
        points[i].lat, points[i].lng,
        points[i + 1].lat, points[i + 1].lng
      ) * ROAD_FACTOR;
    }
    return {
      distanceMeters: Math.round(totalKm * 1000),
      durationSeconds: Math.round((totalKm / AVG_SPEED_KMH) * 3600),
      polyline: null,
    };
  }

  const response = await gmaps.directions({
    params: {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      waypoints: waypoints.map((w) => `${w.lat},${w.lng}`),
      mode: TravelMode.driving,
      units: UnitSystem.metric,
      key: API_KEY,
    },
  });

  const leg = response.data.routes[0]?.legs;
  if (!leg) throw new Error("DIRECTIONS_NO_RESULT");

  const distanceMeters = leg.reduce((s, l) => s + l.distance.value, 0);
  const durationSeconds = leg.reduce((s, l) => s + l.duration.value, 0);
  const polyline = response.data.routes[0].overview_polyline.points;

  return { distanceMeters, durationSeconds, polyline };
};

/**
 * Returns straight-line driving ETA from one point to another.
 * Used for driver-to-pickup distance in matching.
 * @param {{ lat: number, lng: number }} origin
 * @param {{ lat: number, lng: number }} destination
 * @returns {{ distanceMeters: number, durationSeconds: number }}
 */
export const getDistanceMatrix = async (origin, destination) => {
  if (!API_KEY) {
    const km = haversineKm(origin.lat, origin.lng, destination.lat, destination.lng) * ROAD_FACTOR;
    return {
      distanceMeters: Math.round(km * 1000),
      durationSeconds: Math.round((km / AVG_SPEED_KMH) * 3600),
    };
  }

  const response = await gmaps.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: [`${destination.lat},${destination.lng}`],
      mode: TravelMode.driving,
      units: UnitSystem.metric,
      key: API_KEY,
    },
  });

  const element = response.data.rows[0]?.elements[0];
  if (!element || element.status !== "OK") throw new Error("DISTANCE_MATRIX_FAILED");

  return {
    distanceMeters: element.distance.value,
    durationSeconds: element.duration.value,
  };
};

/**
 * Batch Distance Matrix — one origin, many destinations.
 * Used to get real road ETAs from a driver's location to multiple pickup points in one API call.
 * @param {{ lat: number, lng: number }} origin
 * @param {Array<{ lat: number, lng: number }>} destinations  (max 25)
 * @returns {Array<{ distanceMeters: number, durationSeconds: number }>}
 */
export const getBatchDistanceMatrix = async (origin, destinations) => {
  if (!API_KEY || destinations.length === 0) {
    return destinations.map((dest) => {
      const km = haversineKm(origin.lat, origin.lng, dest.lat, dest.lng) * ROAD_FACTOR;
      return {
        distanceMeters: Math.round(km * 1000),
        durationSeconds: Math.round((km / AVG_SPEED_KMH) * 3600),
      };
    });
  }

  const response = await gmaps.distancematrix({
    params: {
      origins: [`${origin.lat},${origin.lng}`],
      destinations: destinations.map((d) => `${d.lat},${d.lng}`),
      mode: TravelMode.driving,
      units: UnitSystem.metric,
      key: API_KEY,
    },
  });

  return response.data.rows[0].elements.map((el) => {
    if (el.status !== "OK") return { distanceMeters: 0, durationSeconds: 0 };
    return { distanceMeters: el.distance.value, durationSeconds: el.duration.value };
  });
};

/**
 * Converts a text address to lat/lng.
 */
export const geocodeAddress = async (address) => {
  if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY_SERVER not set");

  const response = await gmaps.geocode({
    params: { address, region: "np", key: API_KEY },
  });

  const result = response.data.results[0];
  if (!result) throw new Error("GEOCODE_NO_RESULT");

  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
  };
};

/**
 * Converts lat/lng to a human-readable address.
 */
export const reverseGeocode = async (lat, lng) => {
  if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY_SERVER not set");

  const response = await gmaps.reverseGeocode({
    params: { latlng: `${lat},${lng}`, key: API_KEY },
  });

  const result = response.data.results[0];
  if (!result) throw new Error("REVERSE_GEOCODE_NO_RESULT");

  return { formattedAddress: result.formatted_address };
};

/**
 * Places autocomplete — proxied through backend to hide client key.
 */
export const getPlaceAutocomplete = async (query, lat, lng) => {
  if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY_SERVER not set");

  const response = await gmaps.placeAutocomplete({
    params: {
      input: query,
      location: `${lat},${lng}`,
      radius: 50000,
      components: "country:np",
      key: API_KEY,
    },
  });

  return response.data.predictions.map((p) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text,
  }));
};

/**
 * Place details — returns lat/lng + formatted address for a place_id.
 */
export const getPlaceDetails = async (placeId) => {
  if (!API_KEY) throw new Error("GOOGLE_MAPS_API_KEY_SERVER not set");

  const response = await gmaps.placeDetails({
    params: {
      place_id: placeId,
      fields: ["geometry", "formatted_address", "name"],
      key: API_KEY,
    },
  });

  const result = response.data.result;
  return {
    lat: result.geometry.location.lat,
    lng: result.geometry.location.lng,
    formattedAddress: result.formatted_address,
    name: result.name,
  };
};
