import { describe, it, expect } from "vitest";
import { 
  getWeatherDescription, 
  getWeatherEmoji, 
  isRainyCode, 
  isThunderstormCode, 
  isFogCode 
} from "../weatherCodes";

describe("Weather Code Mapping Utilities", () => {
  it("should output correct weather descriptions", () => {
    expect(getWeatherDescription(0)).toBe("Clear sky");
    expect(getWeatherDescription(3)).toBe("Overcast");
    expect(getWeatherDescription(45)).toBe("Foggy");
    expect(getWeatherDescription(99)).toBe("Severe thunderstorm");
    expect(getWeatherDescription(-1)).toBe("Unknown conditions");
  });

  it("should output correct weather emojis", () => {
    expect(getWeatherEmoji(0)).toBe("☀️");
    expect(getWeatherEmoji(3)).toBe("☁️");
    expect(getWeatherEmoji(45)).toBe("🌫️");
    expect(getWeatherEmoji(95)).toBe("⛈️");
    expect(getWeatherEmoji(-1)).toBe("🌡️");
  });

  it("should detect rainy codes correctly", () => {
    expect(isRainyCode(61)).toBe(true);
    expect(isRainyCode(80)).toBe(true);
    expect(isRainyCode(0)).toBe(false);
  });

  it("should detect thunderstorm codes correctly", () => {
    expect(isThunderstormCode(95)).toBe(true);
    expect(isThunderstormCode(99)).toBe(true);
    expect(isThunderstormCode(45)).toBe(false);
  });

  it("should detect fog codes correctly", () => {
    expect(isFogCode(45)).toBe(true);
    expect(isFogCode(48)).toBe(true);
    expect(isFogCode(0)).toBe(false);
  });
});
