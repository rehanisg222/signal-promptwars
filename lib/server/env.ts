// lib/server/env.ts
// SERVER-SIDE ONLY. Never import this file in client components, hooks,
// or any file loaded by the browser.
// This file is the single source of truth for env variable access.

import dotenv from "dotenv";

// Load environment variables dynamically in node env
dotenv.config();

/**
 * Returns the Google Gemini API Key.
 * Checks for GOOGLE_GEMINI_API_KEY first, then GEMINI_API_KEY (used by AI Studio).
 * Throws a descriptive Error if neither is configured.
 */
export function getGeminiApiKey(): string {
  const key = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  if (!key || key.trim() === "") {
    throw new Error(
      "GOOGLE_GEMINI_API_KEY is not configured. Add it to your .env file. See .env.example for the required format."
    );
  }
  return key;
}

/**
 * Returns true if the Gemini API Key is configured.
 */
export function hasGeminiApiKey(): boolean {
  const key = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return typeof key === "string" && key.trim() !== "";
}

/**
 * Returns true if the Google Maps API Key is configured.
 */
export function hasGoogleMapsApiKey(): boolean {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  return typeof key === "string" && key.trim() !== "";
}

/**
 * Returns the Google Maps API Key or null if not configured.
 */
export function getGoogleMapsApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key || key.trim() === "") {
    return null;
  }
  return key;
}
