import { describe, it, expect } from "vitest";
import { calculateBurnoutScore, getBurnoutMetadata } from "../burnout";

describe("Burnout Score Calculations", () => {
  it("should return 100 if the risk flag is crisis", () => {
    expect(calculateBurnoutScore(1, "crisis")).toBe(100);
    expect(calculateBurnoutScore(5, "crisis")).toBe(100);
  });

  it("should calculate burnout correctly with risk flags and energy levels", () => {
    // Risk "none" (10 base 60% = 6) + energy 5 (0% impact 40% = 0) = 6 -> rounded to 6
    expect(calculateBurnoutScore(5, "none")).toBe(6);

    // Risk "low" (30 base 60% = 18) + energy 3 (50% impact 40% = 20) = 38 -> rounded to 38
    expect(calculateBurnoutScore(3, "low")).toBe(38);

    // Risk "high" (85 base 60% = 51) + energy 1 (100% impact 40% = 40) = 91 -> rounded to 91
    expect(calculateBurnoutScore(1, "high")).toBe(91);
  });

  it("should handle out of bounds energy values gracefully", () => {
    expect(calculateBurnoutScore(10, "none")).toBe(6); // energy clamped to 5
    expect(calculateBurnoutScore(-5, "none")).toBe(46); // energy clamped to 1
  });
});

describe("Burnout Metadata Resolver", () => {
  it("should return Critical Burnout for score >= 85", () => {
    const meta = getBurnoutMetadata(85);
    expect(meta.label).toBe("Critical Burnout");
    expect(meta.colorClass).toContain("red");
  });

  it("should return High Stress for scores >= 60 and < 85", () => {
    const meta = getBurnoutMetadata(70);
    expect(meta.label).toBe("High Stress");
    expect(meta.colorClass).toContain("amber");
  });

  it("should return Moderate Tension for scores >= 35 and < 60", () => {
    const meta = getBurnoutMetadata(50);
    expect(meta.label).toBe("Moderate Tension");
    expect(meta.colorClass).toContain("blue");
  });

  it("should return Regulated State for score < 35", () => {
    const meta = getBurnoutMetadata(20);
    expect(meta.label).toBe("Regulated State");
    expect(meta.colorClass).toContain("green");
  });
});
