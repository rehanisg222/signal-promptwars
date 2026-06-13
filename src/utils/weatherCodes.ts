/**
 * World Meteorological Organization (WMO) codes to description and emoji mapping
 * used on the Open-Meteo current forecast APIs.
 */

export function getWeatherDescription(code: number): string {
  switch (code) {
    case 0: return "Clear sky";
    case 1: return "Mainly clear";
    case 2: return "Partly cloudy";
    case 3: return "Overcast";
    case 45: return "Foggy";
    case 48: return "Icy fog";
    case 51: return "Light drizzle";
    case 53: return "Moderate drizzle";
    case 55: return "Heavy drizzle";
    case 61: return "Light rain";
    case 63: return "Moderate rain";
    case 65: return "Heavy rain";
    case 71: return "Light snow";
    case 73: return "Moderate snow";
    case 75: return "Heavy snow";
    case 77: return "Snow grains";
    case 80: return "Rain showers";
    case 81: return "Moderate showers";
    case 82: return "Violent showers";
    case 85: return "Snow showers";
    case 86: return "Heavy snow showers";
    case 95: return "Thunderstorm";
    case 96: return "Thunderstorm with hail";
    case 99: return "Severe thunderstorm";
    default: return "Unknown conditions";
  }
}

export function getWeatherEmoji(code: number): string {
  switch (code) {
    case 0: return "☀️";
    case 1: return "🌤️";
    case 2: return "⛅";
    case 3: return "☁️";
    case 45: return "🌫️";
    case 48: return "🌫️";
    case 51: return "🌦️";
    case 53: return "🌦️";
    case 55: return "🌧️";
    case 61: return "🌧️";
    case 63: return "🌧️";
    case 65: return "🌧️";
    case 71: return "❄️";
    case 73: return "❄️";
    case 75: return "🌨️";
    case 77: return "🌨️";
    case 80: return "🌦️";
    case 81: return "🌧️";
    case 82: return "⛈️";
    case 85: return "🌨️";
    case 86: return "🌨️";
    case 95: return "⛈️";
    case 96: return "⛈️";
    case 99: return "⛈️";
    default: return "🌡️";
  }
}

export function isRainyCode(code: number): boolean {
  // Drizzle (51, 53, 55), Rain (61, 63, 65), Snow (71, 73, 75, 77), Rain showers (80, 81, 82), Snow showers (85, 86)
  return [51, 53, 55, 61, 63, 65, 71, 73, 75, 77, 80, 81, 82, 85, 86].includes(code);
}

export function isThunderstormCode(code: number): boolean {
  return [95, 96, 99].includes(code);
}

export function isFogCode(code: number): boolean {
  return [45, 48].includes(code);
}
