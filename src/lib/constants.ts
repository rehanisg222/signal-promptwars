import {
  MoodState,
  ExamType,
  TriggerDomain,
  CognitiveDistortionType,
} from "../types";

export interface MoodStateConfig {
  value: MoodState;
  label: string;
  emoji: string;
  description: string;
}

export interface ExamTypeConfig {
  value: ExamType;
  label: string;
  fullName: string;
  description: string;
}

/**
 * Mood selector options representing students' stress states.
 */
export const MOOD_STATES: MoodStateConfig[] = [
  {
    value: "crushed",
    label: "Crushed",
    emoji: "😔",
    description: "Completely overwhelmed, can't think straight",
  },
  {
    value: "drained",
    label: "Drained",
    emoji: "😞",
    description: "Exhausted and low on energy",
  },
  {
    value: "okay",
    label: "Okay",
    emoji: "😐",
    description: "Neutral, getting by",
  },
  {
    value: "focused",
    label: "Focused",
    emoji: "🎯",
    description: "In the zone, study-ready",
  },
  {
    value: "clear",
    label: "Clear",
    emoji: "✨",
    description: "Sharp, calm, and composed",
  },
];

/**
 * Competitive exam profiles with target contextual structures.
 */
export const EXAM_TYPES: ExamTypeConfig[] = [
  {
    value: "NEET",
    label: "NEET",
    fullName: "National Eligibility cum Entrance Test",
    description: "High-competition Indian medical entrance examination",
  },
  {
    value: "JEE",
    label: "JEE",
    fullName: "Joint Entrance Examination",
    description: "High-stakes Indian engineering entrance examination",
  },
  {
    value: "CUET",
    label: "CUET",
    fullName: "Common University Entrance Test",
    description: "Central Indian universities admission test",
  },
  {
    value: "CAT",
    label: "CAT",
    fullName: "Common Admission Test",
    description: "Premier Indian postgraduate business administration admissions",
  },
  {
    value: "GATE",
    label: "GATE",
    fullName: "Graduate Aptitude Test in Engineering",
    description: "Technical postgraduate programs and public sector entrance",
  },
  {
    value: "UPSC",
    label: "UPSC",
    fullName: "Union Public Service Commission",
    description: "Indian civil services executive selection examination",
  },
];

/**
 * Human-friendly mapping for specialized diagnostic trigger domains.
 */
export const TRIGGER_DOMAIN_LABELS: Record<TriggerDomain, string> = {
  pre_test_dread: "Pre-Test Dread",
  sleep_disruption: "Sleep Disruption",
  social_pressure: "Social Pressure",
  academic_shame: "Academic Shame",
  avoidance: "Avoidance",
  existential_dread: "Existential Dread",
};

/**
 * Diagnostic mapping for primary cognitive distortions.
 */
export const DISTORTION_LABELS: Record<CognitiveDistortionType, string> = {
  catastrophizing: "Catastrophizing",
  all_or_nothing: "All-or-Nothing",
  fortune_telling: "Fortune Telling",
  personalization: "Personalization",
  overgeneralization: "Overgeneralization",
  mind_reading: "Mind Reading",
  emotional_reasoning: "Emotional Reasoning",
  should_statements: "Should Statements",
};

export const APP_VERSION = "1.0.0";

export const DEFAULT_CITY = "Kota";

export const WIKIPEDIA_SEARCH_RADIUS_METERS = 5000;

export const WIKIPEDIA_RESULT_LIMIT = 8;

export const GEMINI_TIMEOUT_MS = 15000;
