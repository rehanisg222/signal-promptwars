// lib/server/wikipedia.ts
// SERVER-SIDE ONLY. Query Wikipedia GeoSearch and summaries of proximity coordinates.

import { PlaceResult } from "../../src/types";

/**
 * Fetches nearby places of interest from Wikipedia using coordinate queries.
 * Queries en.wikipedia.org within a 10km radius for up to 10 results.
 */
export async function fetchNearbyPlaces(lat: number, lon: number): Promise<PlaceResult[]> {
  // Configured to fetch coordinates and clean extracts in a single generator query.
  const radiusMeters = 10000;
  const limit = 10;
  const url = `https://en.wikipedia.org/w/api.php?action=query&generator=geosearch&ggscoord=${lat}|${lon}&ggsradius=${radiusMeters}&ggslimit=${limit}&prop=coordinates|extracts&exintro=1&explaintext=1&exchars=200&format=json&origin=*`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Wikipedia service returned status: ${response.status}`);
    }

    const data = await response.json();

    // If no pages are found in the query area
    if (!data.query || !data.query.pages) {
      return [];
    }

    const pages = data.query.pages;
    const results: PlaceResult[] = [];

    for (const pageId of Object.keys(pages)) {
      const page = pages[pageId];
      if (!page) continue;

      const pageLat = page.coordinates?.[0]?.lat ?? page.lat ?? lat;
      const pageLon = page.coordinates?.[0]?.lon ?? page.lon ?? lon;
      const title = page.title || "Unknown Place";
      const description = page.extract ? page.extract.trim() : `Historical point of interest in ${page.title || "the area"}.`;
      const url = `https://en.wikipedia.org/?curid=${page.pageid}`;

      results.push({
        title,
        description,
        latitude: pageLat,
        longitude: pageLon,
        url,
        source: "wikipedia"
      });
    }

    return results;
  } catch (error: any) {
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      const err = new Error("PLACES_TIMEOUT");
      (err as any).statusCode = 504;
      throw err;
    }
    // Return empty results on API failure or log/throw standard error
    throw new Error(error.message || "Failed to fetch nearby sites from Wikipedia");
  }
}
