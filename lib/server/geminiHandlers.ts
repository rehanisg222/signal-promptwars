// lib/server/geminiHandlers.ts
// Handles Express routing and validation middleware for the four Gemini-powered API routes.

import { Request, Response } from "express";
import { callGemini, parseGeminiJson, ANALYSIS_MODEL, GENERATION_MODEL } from "./gemini";
import { hasGeminiApiKey } from "./env";
import { CRISIS_HELPLINES } from "../../src/utils/helplines";
import { EntryAnalysis, ResetItinerary, Recommendation } from "../../src/types";

/**
 * Maps standard SDK errors or timeouts to compliant client-side JSON responses.
 */
function handleGeminiError(error: any, res: Response) {
  const statusCode = error.statusCode || 500;
  const message = error.message || "An unexpected error occurred.";
  const errCode = error.code || error.message || "INTERNAL_ERROR";

  if (errCode === "GEMINI_NOT_CONFIGURED") {
    return res.status(503).json({
      success: false,
      error: "GEMINI_NOT_CONFIGURED",
      message: "Add GOOGLE_GEMINI_API_KEY to your .env.local file to use SIGNAL."
    });
  }

  if (errCode === "INVALID_GEMINI_KEY") {
    return res.status(401).json({
      success: false,
      error: "INVALID_GEMINI_KEY",
      message: "Your Gemini API key appears to be invalid. Check it at aistudio.google.com."
    });
  }

  if (errCode === "GEMINI_RATE_LIMITED") {
    return res.status(429).json({
      success: false,
      error: "GEMINI_RATE_LIMITED",
      message: "Gemini is rate limited right now. Wait a moment and try again."
    });
  }

  if (errCode === "GEMINI_TIMEOUT") {
    return res.status(408).json({
      success: false,
      error: "GEMINI_TIMEOUT",
      message: "Gemini took too long to respond. Please try again."
    });
  }

  if (errCode === "INVALID_AI_RESPONSE") {
    return res.status(422).json({
      success: false,
      error: "INVALID_AI_RESPONSE",
      message: "Gemini returned an unexpected format. Please try again."
    });
  }

  // Fallback checks on messages
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes("api_key_invalid") || lowerMsg.includes("invalid api key") || lowerMsg.includes("key is invalid") || statusCode === 401) {
    return res.status(401).json({
      success: false,
      error: "INVALID_GEMINI_KEY",
      message: "Your Gemini API key appears to be invalid. Check it at aistudio.google.com."
    });
  }

  if (lowerMsg.includes("429") || lowerMsg.includes("rate_limited") || lowerMsg.includes("rate limit") || lowerMsg.includes("quota exceeded") || statusCode === 429) {
    return res.status(429).json({
      success: false,
      error: "GEMINI_RATE_LIMITED",
      message: "Gemini is rate limited right now. Wait a moment and try again."
    });
  }

  if (lowerMsg.includes("timeout") || lowerMsg.includes("abort") || statusCode === 408) {
    return res.status(408).json({
      success: false,
      error: "GEMINI_TIMEOUT",
      message: "Gemini took too long to respond. Please try again."
    });
  }

  if (lowerMsg.includes("format") || lowerMsg.includes("parse") || lowerMsg.includes("json") || statusCode === 422) {
    return res.status(422).json({
      success: false,
      error: "INVALID_AI_RESPONSE",
      message: "Gemini returned an unexpected format. Please try again."
    });
  }

  return res.status(statusCode === 200 ? 500 : statusCode).json({
    success: false,
    error: "GEMINI_ERROR",
    message: `Gemini operation failed: ${message}`
  });
}

/**
 * POST /api/gemini/analyze
 * Body: { journalText, mood, examType, daysToExam, city, location, weather, places }
 */
export async function handleAnalyze(req: Request, res: Response): Promise<void> {
  if (!hasGeminiApiKey()) {
    res.status(503).json({
      success: false,
      error: "GEMINI_NOT_CONFIGURED",
      message: "Add GOOGLE_GEMINI_API_KEY to your .env.local file to use SIGNAL."
    });
    return;
  }

  const { journalText, mood, examType, daysToExam, city, weather } = req.body;

  if (journalText === undefined || journalText === null || typeof journalText !== "string" || journalText.trim() === "") {
    res.status(400).json({
      success: false,
      error: "INVALID_INPUT",
      message: "journalText is required and cannot be empty."
    });
    return;
  }

  if (!mood) {
    res.status(400).json({
      success: false,
      error: "INVALID_INPUT",
      message: "mood state is required."
    });
    return;
  }

  try {
    const systemInstruction = `You are a clinical psychology-informed AI assistant specializing in academic stress analysis for Indian competitive exam students. You are NOT a therapist. You do NOT provide clinical diagnoses. You identify cognitive patterns, emotional states, and risk signals in free-text journal entries. You are deeply familiar with the unique pressure of NEET, JEE, CUET, CAT, GATE, and UPSC examinations in India.

You recognize Indian exam-specific vocabulary and pressure contexts:
- Coaching centers, revision cycles, mock tests, previous year papers (PYQs)
- Rank anxiety, cutoff pressure, parental expectations, peer competition
- Kota coaching city culture and its specific psychological pressures
- Isolation, avoidance behaviors, sleep disruption, social comparison`;

    const prompt = `Analyze the following student journal entry and return ONLY a valid JSON object matching the EntryAnalysis schema. No markdown. No explanation text. Pure JSON only.

Student context:
  Exam: ${examType || "competitive exam"}
  Days to exam: ${daysToExam ?? "unknown"}
  City: ${city || "unknown"}
  Current mood (self-reported): ${mood}
  Current weather: ${weather ? weather.weatherDescription : "unknown"}

Journal entry:
"${journalText}"

Identify and return:

1. emotions: array of emotional states present in the entry (e.g., dread, shame, exhaustion, panic)

2. primaryStressor: the single most dominant stressor identified, in 5-10 words

3. energy: an integer from 1 to 5
   1 = completely depleted
   2 = very low energy
   3 = neutral/okay
   4 = moderate energy
   5 = high energy, alert
   Base this on both the mood and the journal content.

4. cognitiveDistortions: array of distortions identified.
   Must only contain valid values from this list:
   catastrophizing, all_or_nothing, fortune_telling, personalization,
   overgeneralization, mind_reading, emotional_reasoning, should_statements
   May be empty array if no significant distortions detected.

5. distortionExplanations: object mapping each identified distortion to a 1-2 sentence
   explanation of exactly how it appears in THIS student's journal entry.
   Quote the relevant words from the entry where possible.

6. triggerDomains: object with exactly these 6 keys, each an integer 0-10:
   pre_test_dread: intensity of fear/dread about the upcoming exam
   sleep_disruption: severity of sleep issues mentioned or implied
   social_pressure: intensity of social/family pressure signals
   academic_shame: degree of shame around academic performance
   avoidance: extent of avoidance behaviors mentioned
   existential_dread: presence of deeper meaninglessness or hopelessness

7. riskFlag: one of: "none", "low", "moderate", "high", "crisis"
   Classification guide:
   none: no concerning signals
   low: mild stress, normal exam pressure
   moderate: elevated stress, avoidance, some cognitive distortions
   high: severe distress, multiple distortions, sleep issues, social isolation
   crisis: explicit or strongly implied suicidal ideation, statements of
           not wanting to be alive, wanting everything to be over in a personal sense,
           not wanting to wake up, or similar signals of acute crisis

   CRITICAL RULE: The phrase "I don't want to wake up" in any exam stress context
   must be classified as riskFlag = "crisis". This overrides all other signals.

8. riskRationale: 1-2 sentence explanation of why you assigned the riskFlag you did.
   Be specific. Quote the journal.

9. primaryInsight: a single, compassionate but clinically grounded insight sentence
   about what the student's entry most reveals about their psychological state.
   Do not use generic wellness platitudes.

COGNITIVE DISTORTION GUIDANCE:
- fortune_telling: predicting a specific bad outcome as certain ("I'm going to fail")
- catastrophizing: treating a bad outcome as globally catastrophic and irreversible
- all_or_nothing: binary thinking ("if I fail this, my life is over")
- personalization: taking excessive personal blame for external events
- overgeneralization: extending one failure to all future events ("I always fail")
- mind_reading: assuming what others think without evidence
- emotional_reasoning: treating feelings as facts ("I feel stupid so I am stupid")
- should_statements: rigid internal rules creating guilt and shame

For "I'm going to fail again":
  strongly prefer fortune_telling and catastrophizing.
  "again" implies overgeneralization.

Return ONLY this JSON structure:
{
  "emotions": [],
  "primaryStressor": "",
  "energy": 0,
  "cognitiveDistortions": [],
  "distortionExplanations": {},
  "triggerDomains": {
    "pre_test_dread": 0,
    "sleep_disruption": 0,
    "social_pressure": 0,
    "academic_shame": 0,
    "avoidance": 0,
    "existential_dread": 0
  },
  "riskFlag": "none",
  "riskRationale": "",
  "primaryInsight": ""
}`;

    const textResponse = await callGemini(`${systemInstruction}\n\n${prompt}`, ANALYSIS_MODEL, 0.2);
    const parsed = parseGeminiJson<EntryAnalysis>(textResponse);

    // Validate structure and values
    const validRiskFlags = ["none", "low", "moderate", "high", "crisis"];
    let riskFlagResponse = parsed.riskFlag;
    if (!validRiskFlags.includes(riskFlagResponse)) {
      riskFlagResponse = "none";
    }

    // Crisis keywords / override
    const lowerJournalText = journalText.toLowerCase();
    if (
      lowerJournalText.includes("i don't want to wake up") ||
      lowerJournalText.includes("i dont want to wake up")
    ) {
      riskFlagResponse = "crisis";
    }

    const triggerDomains = (parsed.triggerDomains || {}) as any;
    const keys = [
      "pre_test_dread",
      "sleep_disruption",
      "social_pressure",
      "academic_shame",
      "avoidance",
      "existential_dread"
    ] as const;

    const finalTriggerDomains: Record<string, number> = {};
    for (const key of keys) {
      let val = Number(triggerDomains[key]);
      if (isNaN(val)) {
        val = 0;
      }
      finalTriggerDomains[key] = Math.max(0, Math.min(10, val));
    }

    parsed.riskFlag = riskFlagResponse as any;
    parsed.triggerDomains = finalTriggerDomains as any;

    let energyNum = Number(parsed.energy);
    if (isNaN(energyNum) || energyNum < 1 || energyNum > 5) {
      energyNum = 3;
    }
    parsed.energy = energyNum;

    parsed.emotions = Array.isArray(parsed.emotions) ? parsed.emotions.map(String) : [];
    parsed.cognitiveDistortions = Array.isArray(parsed.cognitiveDistortions) ? parsed.cognitiveDistortions : [];
    parsed.distortionExplanations = parsed.distortionExplanations && typeof parsed.distortionExplanations === "object" ? parsed.distortionExplanations : {};

    res.status(200).json({
      success: true,
      analysis: parsed
    });
  } catch (error) {
    handleGeminiError(error, res);
  }
}

/**
 * POST /api/gemini/generate-itinerary
 * Body: { analysis, journalText, mood, examType, daysToExam, city, weather, places }
 */
export async function handleGenerateItinerary(req: Request, res: Response): Promise<void> {
  if (!hasGeminiApiKey()) {
    res.status(503).json({
      success: false,
      error: "GEMINI_NOT_CONFIGURED",
      message: "Add GOOGLE_GEMINI_API_KEY to your .env.local file to use SIGNAL."
    });
    return;
  }

  const { analysis, mood, examType, daysToExam, city, weather, places } = req.body;

  if (!analysis) {
    res.status(400).json({
      success: false,
      error: "INVALID_INPUT",
      message: "Entry analysis is required to generate a wellbeing break plan."
    });
    return;
  }

  // FIRST THING: Crisis Guard Check
  if (analysis.riskFlag === "crisis") {
    res.status(200).json({
      success: true,
      isCrisis: true,
      helplines: CRISIS_HELPLINES
    });
    return;
  }

  try {
    const spots = Array.isArray(places) ? places : [];
    const spotsList = spots.map(p => `- ${p.title}: ${p.description}`).join("\n") || "None available";
    const isIndoor = weather ? weather.isIndoorWeather : false;

    const systemInstruction = `You are a wellbeing reset coach for high-pressure Indian exam students. You design short (30 minutes maximum), grounded, non-clinical reset micro-plans for students who need to recover their mental state before returning to study. Your plans are practical, honest, and rooted in the student's specific situation, current local weather, and real nearby places.

You do NOT give clinical therapy advice. You do NOT suggest journaling workshops or therapist sessions. You do NOT use generic wellness clichés.`;

    const prompt = `Based on the following student analysis, please design an ultra-targeted restorative break itinerary (exactly 3 to 5 steps, total durationMinutes across all steps ≤ 30).

PLAN CONTEXT:
Student exam: ${examType || "competitive exam"} — ${daysToExam ?? "unknown"} days remaining
Current mood (self-reported): ${mood}
Energy level detected: ${analysis.energy}/5
Risk level: ${analysis.riskFlag}
Primary stressor: ${analysis.primaryStressor}
City: ${city || "unknown"}
Current weather: ${weather ? `${weather.weatherDescription}, ${weather.temperatureCelsius}°C, ${weather.weatherEmoji}` : "unknown"}
Indoor weather conditions: ${isIndoor ? "YES — recommend indoor activities only" : "NO — outdoor is feasible"}

Available real nearby places (use ONLY these, do NOT invent):
${spotsList}

Weather-aware instruction:
- If isIndoorWeather is true (YES): ALL steps must be indoor activities (e.g. listening to music, box breathing, drinking water inside).
- If isIndoorWeather is false (NO) AND places array is non-empty: you MAY suggest visiting one real place from the list above as a step (Only one place suggestion maximum).
- Do NOT invent place names. Use exactly one of the titles in the available list if recommending.
- Do NOT suggest going outside if isIndoorWeather is true.

Energy instruction:
- energy 1-2: ultra-gentle steps only (lying down, breathing, water, gentle music)
- energy 3: mild movement steps are okay (short walk if outdoor allowed, light stretching)
- energy 4-5: slightly more engaging steps (organize desk, short revision warm-up)

Return ONLY a valid JSON object matching the ResetItinerary schema.
Return ONLY this JSON structure:
{
  "title": "Short Reset Plan Title",
  "summary": "One sentence explaining what this plan does for this student",
  "steps": [
    {
      "label": "step name",
      "durationMinutes": 5,
      "action": "specific, concrete action",
      "reason": "why this helps the student",
      "usesWeather": false,
      "placeTitle": null
    }
  ],
  "weatherAwareNote": "One sentence about how current weather affected this plan, or null",
  "placeSuggestion": null,
  "encouragement": "One final short sentence of genuine encouragement"
}

Rules:
  - Exactly 3 to 5 steps
  - Total durationMinutes across all steps must not exceed 30
  - Each step must have a reason that references this student's specific situation
  - If a step uses a real place from the list, set placeTitle to the exact place title
  - If isIndoorWeather true: usesWeather should reference this (indoor because of heat/rain)
  - placeSuggestion: if you suggested a place in a step, return its full PlaceResult object (matching one from the input places array), otherwise return null.
  - Do not include clinical advice, meditation app suggestions, or therapist references`;

    const textResponse = await callGemini(`${systemInstruction}\n\n${prompt}`, GENERATION_MODEL, 0.3);
    const parsed = parseGeminiJson<ResetItinerary>(textResponse);

    // Safeguard step validation & cleanup
    if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error("INVALID_AI_RESPONSE");
    }

    // Limit step count (3 to 5)
    parsed.steps = parsed.steps.slice(0, 5);

    // Ensure total duration doesn't exceed 30 minutes
    let totalMinutes = parsed.steps.reduce((acc, step) => acc + (Number(step.durationMinutes) || 0), 0);
    if (totalMinutes > 30) {
      // Scale down steps duration proportionally
      parsed.steps.forEach(step => {
        let mins = Number(step.durationMinutes) || 5;
        step.durationMinutes = Math.max(1, Math.round((mins / totalMinutes) * 30));
      });
    }

    // Verify places integrity
    if (parsed.placeSuggestion) {
      const match = spots.find(s => s.title.toLowerCase() === parsed.placeSuggestion?.title.toLowerCase());
      if (match) {
        parsed.placeSuggestion = match;
        // Make sure the step referencing also aligns
        const stepWithPlace = parsed.steps.find(s => s.placeTitle && s.placeTitle.toLowerCase() === match.title.toLowerCase());
        if (stepWithPlace) {
          stepWithPlace.placeTitle = match.title;
        }
      } else {
        parsed.placeSuggestion = null;
      }
    }

    res.status(200).json({
      success: true,
      itinerary: parsed
    });
  } catch (error) {
    handleGeminiError(error, res);
  }
}

/**
 * POST /api/gemini/recommend
 * Body: { analysis, mood, examType, daysToExam, city, weather, places }
 */
export async function handleRecommend(req: Request, res: Response): Promise<void> {
  if (!hasGeminiApiKey()) {
    res.status(503).json({
      success: false,
      error: "GEMINI_NOT_CONFIGURED",
      message: "Add GOOGLE_GEMINI_API_KEY to your .env.local file to use SIGNAL."
    });
    return;
  }

  const { analysis, mood, examType, daysToExam, city, weather, places } = req.body;

  if (!analysis) {
    res.status(400).json({
      success: false,
      error: "INVALID_INPUT",
      message: "Entry analysis is required to generate recommendations."
    });
    return;
  }

  // FIRST THING: Crisis Guard Check
  if (analysis.riskFlag === "crisis") {
    res.status(200).json({
      success: true,
      isCrisis: true,
      helplines: CRISIS_HELPLINES
    });
    return;
  }

  try {
    const spots = Array.isArray(places) ? places : [];
    const spotsList = spots.map(p => `- ${p.title}: ${p.description}`).join("\n") || "None available";
    const isIndoor = weather ? weather.isIndoorWeather : false;

    // Highest Intensity Domains
    const sortedTriggers = Object.entries(analysis.triggerDomains || {})
      .map(([domain, value]) => ({ domain, value: Number(value) }))
      .sort((a, b) => b.value - a.value);
    const topTriggerDomains = sortedTriggers.slice(0, 2).map(t => `${t.domain} (intensity: ${t.value}/10)`).join(", ");

    const systemInstruction = `You are a practical study wellbeing advisor for Indian competitive exam students. Based on the analysis below, generate exactly 3 short, actionable recommendations. Each recommendation should address a different aspect of the student's situation.`;

    const prompt = `Generate exactly 3 study wellbeing recommendations based on this student context:

Student analysis:
  Primary stressor: ${analysis.primaryStressor}
  Cognitive distortions: ${(analysis.cognitiveDistortions || []).join(", ") || "none detected"}
  Trigger domains (highest): ${topTriggerDomains || "none"}
  Energy: ${analysis.energy}/5
  Risk: ${analysis.riskFlag}
  Weather: ${weather ? `${weather.weatherDescription}, ${weather.temperatureCelsius}°C` : "unknown"}
  Indoor conditions: ${isIndoor ? "indoor only" : "outdoor is feasible"}
  Available nearby places: ${spotsList}

Return ONLY this JSON:
{
  "recommendations": [
    {
      "title": "Short recommendation title",
      "why": "Why this helps this student (1 sentence, reference their specific triggers/stressors)",
      "action": "Exact concrete action (2-3 sentences max)",
      "effortLevel": "low"
    }
  ]
}

Rules:
  - Return EXACTLY 3 recommendations
  - effortLevel must be "low", "medium", or "high"
  - Match effort level to Student's Energy (${analysis.energy}/5):
    * If energy is 1-2, output only "low" effort recommendations to avoid burnout.
    * If energy is 3, output "low" or "medium" effort items.
    * If energy is 4-5, you may output any effort level ("low", "medium", or "high").
  - Reference the student's actual distortions or triggers in the "why" field
  - Do not repeat steps from the active itinerary
  - Do not suggest therapy, apps, or professional help
  - Do not use generic study tips`;

    const textResponse = await callGemini(`${systemInstruction}\n\n${prompt}`, GENERATION_MODEL, 0.3);
    const parsed = parseGeminiJson<{ recommendations: Recommendation[] }>(textResponse);

    if (!parsed || !parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      throw new Error("INVALID_AI_RESPONSE");
    }

    // Limit and pad recommendations to exactly 3
    let finalRecs = parsed.recommendations.slice(0, 3);
    while (finalRecs.length < 3) {
      finalRecs.push({
        title: "Short mindful breath reset",
        why: "To restore focused perspective during high cognitive strain.",
        action: "Inhale slowly for four counts, hold for four, exhale for four, and pause. Repeat this loop four times to reset.",
        effortLevel: "low"
      });
    }

    res.status(200).json({
      success: true,
      recommendations: finalRecs
    });
  } catch (error) {
    handleGeminiError(error, res);
  }
}

/**
 * POST /api/gemini/replan
 * Body: { currentItinerary, userConstraint, analysis, weather, places }
 */
export async function handleReplan(req: Request, res: Response): Promise<void> {
  if (!hasGeminiApiKey()) {
    res.status(503).json({
      success: false,
      error: "GEMINI_NOT_CONFIGURED",
      message: "Add GOOGLE_GEMINI_API_KEY to your .env.local file to use SIGNAL."
    });
    return;
  }

  const { currentItinerary, userConstraint, analysis, weather, places } = req.body;

  if (!currentItinerary) {
    res.status(400).json({
      success: false,
      error: "NO_ACTIVE_ITINERARY",
      message: "No active break itinerary is currently on screen to replan."
    });
    return;
  }

  if (!userConstraint || typeof userConstraint !== "string" || userConstraint.trim() === "") {
    res.status(400).json({
      success: false,
      error: "INVALID_INPUT",
      message: "A replanning userConstraint string is required."
    });
    return;
  }

  if (!analysis) {
    res.status(400).json({
      success: false,
      error: "INVALID_INPUT",
      message: "Analysis is required to evaluate safety thresholds."
    });
    return;
  }

  // FIRST THING: Crisis Guard Check
  if (analysis.riskFlag === "crisis") {
    res.status(200).json({
      success: true,
      isCrisis: true,
      helplines: CRISIS_HELPLINES
    });
    return;
  }

  try {
    const spots = Array.isArray(places) ? places : [];
    const spotsList = spots.map(p => `- ${p.title}: ${p.description}`).join("\n") || "None available";
    const isIndoor = weather ? weather.isIndoorWeather : false;

    const systemInstruction = `You are a wellbeing reset coach for high-pressure Indian exam students. The student has an active wellbeing reset plan but their situation has changed. Revise the plan to accommodate the constraint they've described.`;

    const prompt = `Revise the active wellbeing reset plan to accommodate the student's constraint.

ORIGINAL PLAN:
Title: ${currentItinerary.title}
Steps: ${JSON.stringify(currentItinerary.steps)}

STUDENT CONSTRAINT:
"${userConstraint}"

Context:
  Energy: ${analysis.energy}/5
  Risk level: ${analysis.riskFlag}
  Current weather: ${weather ? `${weather.weatherDescription}, ${weather.temperatureCelsius}°C` : "unknown"} (${isIndoor ? "indoor conditions only" : "outdoor feasible"})
  Available real places: ${spotsList}

Revise the plan:
  - If constraint says "raining" or "too hot" or "bad weather" or "can't go outside": move all steps indoors immediately, replace any outdoors steps with indoor actions.
  - If constraint says "10 minutes" or "only X minutes": trim and scale durations to fit exactly.
  - If constraint says "too tired" or "exhausted": reduce effort, add rest steps, keep energy ultra-gentle.
  - If constraint says "cannot go outside" or "no walking": remove any outdoor steps, replace with indoor action.

Return the revised plan in the exact same JSON structure as the original itinerary:
{
  "title": "Revised Reset Plan Title",
  "summary": "One sentence explaining what this replanned sequence does",
  "steps": [
    {
      "label": "step name",
      "durationMinutes": 5,
      "action": "specific, concrete action",
      "reason": "why this helps the student",
      "usesWeather": false,
      "placeTitle": null
    }
  ],
  "weatherAwareNote": "One sentence about how current weather affected this plan, or null",
  "placeSuggestion": null,
  "encouragement": "One final short sentence of genuine encouragement"
}

Do NOT invent new place names. Use only places from the available list.
Return ONLY valid JSON.`;

    const textResponse = await callGemini(`${systemInstruction}\n\n${prompt}`, GENERATION_MODEL, 0.3);
    const parsed = parseGeminiJson<ResetItinerary>(textResponse);

    if (!parsed.steps || !Array.isArray(parsed.steps) || parsed.steps.length === 0) {
      throw new Error("INVALID_AI_RESPONSE");
    }

    parsed.steps = parsed.steps.slice(0, 5);

    // Limit to 30 mins
    let totalMinutes = parsed.steps.reduce((acc, step) => acc + (Number(step.durationMinutes) || 0), 0);
    if (totalMinutes > 30) {
      parsed.steps.forEach(step => {
        let mins = Number(step.durationMinutes) || 5;
        step.durationMinutes = Math.max(1, Math.round((mins / totalMinutes) * 30));
      });
    }

    // Verify places integrity
    if (parsed.placeSuggestion) {
      const match = spots.find(s => s.title.toLowerCase() === parsed.placeSuggestion?.title.toLowerCase());
      if (match) {
        parsed.placeSuggestion = match;
        const stepWithPlace = parsed.steps.find(s => s.placeTitle && s.placeTitle.toLowerCase() === match.title.toLowerCase());
        if (stepWithPlace) {
          stepWithPlace.placeTitle = match.title;
        }
      } else {
        parsed.placeSuggestion = null;
      }
    }

    res.status(200).json({
      success: true,
      itinerary: parsed
    });
  } catch (error) {
    handleGeminiError(error, res);
  }
}
