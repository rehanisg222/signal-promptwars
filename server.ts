// server.ts
// Custom Full-Stack Express Server that integrates Vite middleware
// and hosts secured server-side only API routes.

import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { hasGeminiApiKey, hasGoogleMapsApiKey } from "./lib/server/env";
import { APP_VERSION } from "./src/lib/constants";
import { geocodeCity, fetchWeather } from "./lib/server/openMeteo";
import { fetchNearbyPlaces } from "./lib/server/wikipedia";
import {
  handleAnalyze,
  handleGenerateItinerary,
  handleRecommend,
  handleReplan
} from "./lib/server/geminiHandlers";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Accept JSON bodies
  app.use(express.json());

  // ==========================================================
  // API ROUTES (Always placed FIRST)
  // ==========================================================

  /**
   * GET /api/health
   * Purpose: Confirms API configurations safely without leaking keys
   */
  app.get("/api/health", (req: Request, res: Response) => {
    const geminiConfigured = hasGeminiApiKey();
    const googleMapsConfigured = hasGoogleMapsApiKey();
    
    res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      geminiConfigured,
      googleMapsConfigured,
      version: APP_VERSION,
      message: geminiConfigured
        ? "SIGNAL is configured and ready."
        : "Gemini API key missing. Add GEMINI_API_KEY to your .env file or check Settings > Secrets in AI Studio."
    });
  });

  /**
   * Fallback boilerplate handler for unimplemented endpoints
   */
  const handleNotImplemented = (endpointPath: string) => {
    return (req: Request, res: Response) => {
      res.status(501).json({
        success: false,
        error: "NOT_IMPLEMENTED",
        message: "This endpoint is not yet implemented. See implementation prompts.",
        endpoint: endpointPath
      });
    };
  };

  // geocode endpoint
  app.get("/api/geocode", async (req: Request, res: Response) => {
    const city = req.query.city;
    if (!city || typeof city !== "string") {
      res.status(400).json({
        success: false,
        error: "INVALID_CITY",
        message: "A city name query parameter is required."
      });
      return;
    }

    try {
      const location = await geocodeCity(city);
      res.status(200).json({
        success: true,
        location
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      const errorCode = error.message === "LOCATION_NOT_FOUND" ? "LOCATION_NOT_FOUND" : (error.message === "GEOCODE_TIMEOUT" ? "GEOCODE_TIMEOUT" : "GEOCODE_ERROR");
      const message = error.message === "LOCATION_NOT_FOUND"
        ? `Could not resolve city coordinate specs for "${city}". Check your spelling.`
        : `Geocoding failed: ${error.message}`;

      res.status(statusCode).json({
        success: false,
        error: errorCode,
        message
      });
    }
  });

  // weather endpoint
  app.get("/api/weather", async (req: Request, res: Response) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({
        success: false,
        error: "MISSING_COORDINATES",
        message: "Latitude (lat) and longitude (lon) are required parameters."
      });
      return;
    }

    const latNum = parseFloat(lat as string);
    const lonNum = parseFloat(lon as string);

    if (isNaN(latNum) || isNaN(lonNum)) {
      res.status(400).json({
        success: false,
        error: "INVALID_COORDINATES",
        message: "Latitude and longitude must be valid numbers."
      });
      return;
    }

    try {
      const weather = await fetchWeather(latNum, lonNum);
      res.status(200).json({
        success: true,
        weather
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: "WEATHER_ERROR",
        message: error.message || "Failed to retrieve local weather conditions."
      });
    }
  });

  // places endpoint
  app.get("/api/places", async (req: Request, res: Response) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      res.status(400).json({
        success: false,
        error: "MISSING_COORDINATES",
        message: "Latitude (lat) and longitude (lon) are required parameters."
      });
      return;
    }

    const latNum = parseFloat(lat as string);
    const lonNum = parseFloat(lon as string);

    if (isNaN(latNum) || isNaN(lonNum)) {
      res.status(400).json({
        success: false,
        error: "INVALID_COORDINATES",
        message: "Latitude and longitude must be valid numbers."
      });
      return;
    }

    try {
      const places = await fetchNearbyPlaces(latNum, lonNum);
      res.status(200).json({
        success: true,
        places
      });
    } catch (error: any) {
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: "PLACES_ERROR",
        message: error.message || "Failed to retrieve nearby places of interest."
      });
    }
  });

  // gemini endpoints
  app.post("/api/gemini/analyze", handleAnalyze);
  app.post("/api/gemini/generate-itinerary", handleGenerateItinerary);
  app.post("/api/gemini/recommend", handleRecommend);
  app.post("/api/gemini/replan", handleReplan);

  // ==========================================================
  // VITE OR STATIC STATIC SERVING
  // ==========================================================

  if (process.env.NODE_ENV !== "production") {
    console.log("Starting full-stack server in Development Mode with Vite...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Integrate Vite as middleware
    app.use(vite.middlewares);
  } else {
    console.log("Starting full-stack server in Production Mode...");
    const distPath = path.join(process.cwd(), "dist");
    
    // Serve production static assets
    app.use(express.static(distPath));
    
    // Serve Vite SPA on every unhandled client route
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SIGNAL] Security-hardened command deck running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Critical: Failed to launch FULL-STACK SERVER:", error);
  process.exit(1);
});
