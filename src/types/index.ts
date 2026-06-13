/**
 * @file index.ts
 * @description Shared TypeScript types and interfaces for the SIGNAL application.
 * This is safe to import in both client-side and server-side contexts.
 */

/**
 * The student's self-reported mood state.
 * Consumed in the log panel and Gemini analysis prompts.
 */
export type MoodState = "crushed" | "drained" | "okay" | "focused" | "clear";

/**
 * The competitive examinations a student could be preparing for.
 * Infuses Gemini analysis with context on distress severity and target dynamics.
 */
export type ExamType = "NEET" | "JEE" | "CUET" | "CAT" | "GATE" | "UPSC";

/**
 * The risk flag evaluated by Gemini for safety screening.
 * "crisis" triggers the emergency safety floor, suppressing standard dashboard plans.
 */
export type RiskFlag = "none" | "low" | "moderate" | "high" | "crisis";

/**
 * One of six specific trigger domains typical of stressed Indian competitive exam students.
 */
export type TriggerDomain =
  | "pre_test_dread"
  | "sleep_disruption"
  | "social_pressure"
  | "academic_shame"
  | "avoidance"
  | "existential_dread";

/**
 * Recognizable clinical cognitive distortion patterns detected in student writing.
 */
export type CognitiveDistortionType =
  | "catastrophizing"
  | "all_or_nothing"
  | "fortune_telling"
  | "personalization"
  | "overgeneralization"
  | "mind_reading"
  | "emotional_reasoning"
  | "should_statements";

/**
 * Resolved geocoding details from Open-Meteo for the user's focus city.
 */
export interface LocationResult {
  /** Resolved city name */
  name: string;
  /** Country code */
  country: string;
  /** Primary administrative division, e.g., state or province */
  admin1?: string;
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
  /** Resolved IANA timezone */
  timezone?: string;
}

/**
 * Live meteorology observations from Open-Meteo as context anchors.
 */
export interface WeatherContext {
  /** Temperature recorded in Celsius */
  temperatureCelsius: number;
  /** Apparent 'feels like' temperature in Celsius */
  apparentTemperatureCelsius: number;
  /** Humidity ratio (0-100) */
  humidity: number;
  /** Precipitation volume in millimeters */
  precipitation: number;
  /** Wind speed in km/h */
  windSpeed: number;
  /** World Meteorological Organization weather code */
  weatherCode: number;
  /** Human-readable categorization of weather conditions */
  weatherDescription: string;
  /** Representational emoji */
  weatherEmoji: string;
  /** True if conditions limit the user to inside environments */
  isIndoorWeather: boolean;
  /** Fetch time ISO string */
  fetchedAt: string;
}

/**
 * Geographic points of interest pulled directly from Wikipedia GeoSearch.
 */
export interface PlaceResult {
  /** Landmark title */
  title: string;
  /** Encapsulated summary or description */
  description: string;
  /** Latitude in decimal degrees */
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
  /** Direct informational resource link */
  url: string;
  /** Database provenance */
  source: "wikipedia" | "google_places";
}

/**
 * Severity scores mapped across the six trigger domains (range 0-10).
 */
export interface TriggerDomains {
  pre_test_dread: number;
  sleep_disruption: number;
  social_pressure: number;
  academic_shame: number;
  avoidance: number;
  existential_dread: number;
}

/**
 * Structured diagnostic intelligence output from Google Gemini.
 */
export interface EntryAnalysis {
  /** Emotional signals extracted */
  emotions: string[];
  /** Found root distress driver */
  primaryStressor: string;
  /** Current mental stamina rating (1-5 scale) */
  energy: number;
  /** List of detected cognitive pattern errors */
  cognitiveDistortions: CognitiveDistortionType[];
  /** Specific text mappings from cognitive distortion categories to local student dynamics */
  distortionExplanations: Record<string, string>;
  /** Core trigger domain intensity table */
  triggerDomains: TriggerDomains;
  /** Overall computed safety screening level */
  riskFlag: RiskFlag;
  /** Factual trigger description justifying assessed risk flag */
  riskRationale: string;
  /** High-impact insight text delivered straight to the student */
  primaryInsight: string;
}

/**
 * A sequenced step in the personalized study break reset itinerary.
 */
export interface ItineraryStep {
  /** Small step descriptive label */
  label: string;
  /** Break period allocation in minutes */
  durationMinutes: number;
  /** Executable sequence task details */
  action: string;
  /** Psychological break grounding purpose relative to student stressors */
  reason: string;
  /** True if step structure updates based on ambient weather */
  usesWeather: boolean;
  /** Bound local landmark from user vicinity inputs if applicable */
  placeTitle?: string;
}

/**
 * Custom tailored restorative break itinerary modeled for local context.
 */
export interface ResetItinerary {
  /** General sequence theme title */
  title: string;
  /** Executive micro break plan summary sentence */
  summary: string;
  /** Sequential executable break steps (3-5 steps only) */
  steps: ItineraryStep[];
  /** Weather integration contextual summary notes */
  weatherAwareNote: string | null;
  /** Suggestion from the nearby geography if weather permits, or null */
  placeSuggestion: PlaceResult | null;
  /** Parting student motivational text */
  encouragement: string;
}

/**
 * Actionable behavioral adjustments recommended for stress recovery.
 */
export interface Recommendation {
  /** Goal title */
  title: string;
  /** Trigger justification reason */
  why: string;
  /** Pragmatic daily action */
  action: string;
  /** Estimated cognitive/physical friction associated with start */
  effortLevel: "low" | "medium" | "high";
}

/**
 * Safety contact information for urgent distress situations.
 */
export interface Helpline {
  name: string;
  number: string;
  available: string;
}

/**
 * App operational state tracing step-by-step decoding.
 */
export type AppRunState =
  | "idle"
  | "loading_geocode"
  | "loading_weather"
  | "loading_places"
  | "loading_analysis"
  | "loading_itinerary"
  | "loading_recommendations"
  | "complete"
  | "error"
  | "setup_required";

/**
 * Complete result details produced by a single decoded run.
 */
export interface SignalRunResult {
  location: LocationResult;
  weather: WeatherContext | null;
  places: PlaceResult[];
  analysis: EntryAnalysis;
  itinerary: ResetItinerary | null;
  recommendations: Recommendation[];
  isCrisis: boolean;
}
