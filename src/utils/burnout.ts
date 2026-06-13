import { RiskFlag } from "../types";

/**
 * Calculates a dynamic, formula-driven burnout index (0-100)
 * based on energy levels (1-5, where 1 is drained) and assessed risk flags.
 */
export function calculateBurnoutScore(energy: number, riskFlag: RiskFlag): number {
  if (riskFlag === "crisis") {
    return 100;
  }

  // Base score from risk flag
  let riskBase = 0;
  switch (riskFlag) {
    case "none":
      riskBase = 10;
      break;
    case "low":
      riskBase = 30;
      break;
    case "moderate":
      riskBase = 55;
      break;
    case "high":
      riskBase = 85;
      break;
  }

  // Energy is 1-5, invert it so 1 (drained) adds the maximum burnout impact
  // 5 (highest energy) -> 0% impact, 1 (depleted) -> 100% impact
  const energyFactor = (5 - Math.min(5, Math.max(1, energy))) / 4; // 0 to 1
  const energyImpact = energyFactor * 100;

  // Weight them: 60% risk profile assessment, 40% immediate mental stamina (energy)
  const calculated = Math.round(riskBase * 0.6 + energyImpact * 0.4);

  return Math.min(100, Math.max(0, calculated));
}

/**
 * Returns color codes and labels suited for the Burnout index.
 */
export function getBurnoutMetadata(score: number): {
  label: string;
  colorClass: string;
  description: string;
} {
  if (score >= 85) {
    return {
      label: "Critical Burnout",
      colorClass: "text-signal-red",
      description: "Severe cognitive fatigue. Immediate disengagement recommended.",
    };
  } else if (score >= 60) {
    return {
      label: "High Stress",
      colorClass: "text-signal-amber",
      description: "Significant depletion. Avoidance loops and stress spirals active.",
    };
  } else if (score >= 35) {
    return {
      label: "Moderate Tension",
      colorClass: "text-signal-blue",
      description: "Accumulating study pressure. Preventative mental reset required.",
    };
  } else {
    return {
      label: "Regulated State",
      colorClass: "text-signal-green",
      description: "Cognitive resources intact. Ready for focused learning.",
    };
  }
}
