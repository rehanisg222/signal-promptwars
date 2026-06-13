// lib/server/openMeteo.ts
// SERVER-SIDE ONLY. Handles querying free search and weather coordinates from Open-Meteo.

import { LocationResult, WeatherContext } from "../../src/types";
import {
  getWeatherDescription,
  getWeatherEmoji,
  isRainyCode,
  isThunderstormCode,
  isFogCode
} from "../../src/utils/weatherCodes";

/**
 * Geocodes a user-input city query using the Open-Meteo Geocoding API.
 */
export async function geocodeCity(city: string): Promise<LocationResult> {
  const trimmed = city.trim();
  if (!trimmed) {
    throw new Error("City name cannot be empty");
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Geocoding service returned status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.results || data.results.length === 0) {
      const err = new Error("LOCATION_NOT_FOUND");
      (err as any).statusCode = 404;
      throw err;
    }

    const result = data.results[0];
    return {
      name: result.name,
      country: result.country_code || result.country || "",
      admin1: result.admin1,
      latitude: result.latitude,
      longitude: result.longitude,
      timezone: result.timezone
    };
  } catch (error: any) {
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      const err = new Error("GEOCODE_TIMEOUT");
      (err as any).statusCode = 504;
      throw err;
    }
    if (error.message === "LOCATION_NOT_FOUND") {
      throw error;
    }
    const err = new Error(error.message || "Geocoding request failed");
    (err as any).statusCode = error.statusCode || 500;
    throw err;
  }
}

/**
 * Fetches current weather for a latitude/longitude using the Open-Meteo Weather Forecast API.
 */
export async function fetchWeather(lat: number, lon: number): Promise<WeatherContext> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Weather service returned status: ${response.status}`);
    }

    const data = await response.json();
    if (!data.current) {
      throw new Error("Invalid weather data response structure");
    }

    const current = data.current;
    const tempCelsius = current.temperature_2m;
    const apparentTempCelsius = current.apparent_temperature;
    const humidity = current.relative_humidity_2m;
    const precipitation = current.precipitation;
    const windSpeed = current.wind_speed_10m;
    const weatherCode = current.weather_code;

    const weatherDescription = getWeatherDescription(weatherCode);
    const weatherEmoji = getWeatherEmoji(weatherCode);

    // isIndoorWeather determines whether the user should be restricted to inside environments
    // based on: (1) rainy weather codes, (2) thunderstorm conditions, (3) fog conditions,
    // or (4) extreme temperature thresholds (below 12°C or above 38°C)
    const isIndoorWeather =
      isRainyCode(weatherCode) ||
      isThunderstormCode(weatherCode) ||
      isFogCode(weatherCode) ||
      tempCelsius < 12 ||
      tempCelsius > 38;

    return {
      temperatureCelsius: tempCelsius,
      apparentTemperatureCelsius: apparentTempCelsius,
      humidity,
      precipitation,
      windSpeed,
      weatherCode,
      weatherDescription,
      weatherEmoji,
      isIndoorWeather,
      fetchedAt: new Date().toISOString()
    };
  } catch (error: any) {
    if (error.name === "AbortError" || error.message?.includes("timeout")) {
      const err = new Error("WEATHER_TIMEOUT");
      (err as any).statusCode = 504;
      throw err;
    }
    const err = new Error(error.message || "Weather request failed");
    (err as any).statusCode = error.statusCode || 500;
    throw err;
  }
}
