// lib/server/gemini.ts
// SERVER-SIDE ONLY. Handles authenticating and querying Google Gemini.

import { GoogleGenAI } from "@google/genai";
import { getGeminiApiKey } from "./env";

// Centralized model name — change here only if SDK issues require it
export const ANALYSIS_MODEL = "gemini-2.5-flash";
export const GENERATION_MODEL = "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

/**
 * Returns a configured GoogleGenAI instance.
 * Sets the 'User-Agent' header to 'aistudio-build' for telemetry.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = getGeminiApiKey();
    client = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return client;
}

/**
 * Invokes the Gemini API with a prompt and configs.
 * Features a strict 15-second AbortController timeout.
 */
export async function callGemini(
  prompt: string,
  model: string = ANALYSIS_MODEL,
  temperature: number = 0.3
): Promise<string> {
  const ai = getGeminiClient();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const apiCallPromise = ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature,
      },
    });

    // Race the API call with an abort event trigger
    const abortPromise = new Promise<never>((_, reject) => {
      controller.signal.addEventListener("abort", () => {
        const err = new Error("GEMINI_TIMEOUT");
        (err as any).name = "AbortError";
        reject(err);
      });
    });

    const response = await Promise.race([apiCallPromise, abortPromise]);
    clearTimeout(timeoutId);

    if (!response || response.text === undefined || response.text === null) {
      const err = new Error("INVALID_AI_RESPONSE");
      (err as any).statusCode = 422;
      throw err;
    }

    return response.text;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Check if aborted or timeout
    if (
      error.name === "AbortError" || 
      error.message?.includes("timeout") || 
      error.message === "GEMINI_TIMEOUT"
    ) {
      const err = new Error("GEMINI_TIMEOUT");
      (err as any).statusCode = 408;
      throw err;
    }

    // Check for API-specific rate limits or invalid keys in error messages
    const errorMsg = error.message || "";
    if (errorMsg.includes("API_KEY_INVALID") || errorMsg.includes("key is invalid")) {
      const err = new Error("INVALID_GEMINI_KEY");
      (err as any).statusCode = 401;
      throw err;
    }

    if (errorMsg.includes("429") || errorMsg.includes("RATE_LIMIT") || errorMsg.includes("Quota exceeded")) {
      const err = new Error("GEMINI_RATE_LIMITED");
      (err as any).statusCode = 429;
      throw err;
    }

    throw error;
  }
}

/**
 * Parses JSON response from Gemini, supporting markdown code fences.
 */
export function parseGeminiJson<T>(response: string): T {
  let clean = response.trim();

  // If response has markdown code fences (```json ... ```), extract content first
  if (clean.includes("```")) {
    const jsonMatch = clean.match(/```json\s*([\s\S]*?)\s*```/) || clean.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      clean = jsonMatch[1].trim();
    }
  }

  try {
    return JSON.parse(clean) as T;
  } catch (error: any) {
    const err = new Error("INVALID_AI_RESPONSE");
    (err as any).code = "INVALID_AI_RESPONSE";
    (err as any).statusCode = 422;
    (err as any).originalResponse = response;
    throw err;
  }
}
