/**
 * Centralized Hermes Agent client.
 *
 * All AI features in the app flow through this module:
 * - Candidate summaries
 * - Interview questions
 * - Hiring recommendations
 * - Meeting scheduling (via lib/meet.ts which imports callHermes)
 * - Voice feedback (via lib/voice/feedback.ts which imports callHermes)
 *
 * Prompts are in /prompts — edit them there, not here.
 */

import {
  summaryPrompt,
  formatSummaryPrompt,
  questionsPrompt,
  formatQuestionsPrompt,
  recommendationPrompt,
  formatRecommendationPrompt,
} from "@/prompts";

const HERMES_API_URL = process.env.HERMES_API_URL || "https://inference-api.nousresearch.com/v1";
const HERMES_MODEL = process.env.HERMES_MODEL || "Hermes-4-70B";

export interface HermesMessage {
  role: "system" | "user";
  content: string;
}

export interface HermesOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Core Hermes API caller. All AI functions go through here.
 */
export async function callHermes(
  messages: HermesMessage[],
  options: HermesOptions = {},
): Promise<string> {
  const response = await fetch(`${HERMES_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HERMES_API_KEY}`,
    },
    body: JSON.stringify({
      model: options.model || HERMES_MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("Hermes API returned empty response");
  }

  return content;
}

/**
 * Strip markdown code fences from a response, if present.
 */
export function stripCodeFences(text: string): string {
  return text.replace(/```(?:json|typescript|ts|js)?\s*|\s*```/g, "").trim();
}

// ─── HIRING-SPECIFIC FUNCTIONS ───

export async function generateCandidateSummary(
  resumeText: string,
  jobTitle: string,
): Promise<string> {
  return callHermes([
    { role: "system", content: summaryPrompt },
    { role: "user", content: formatSummaryPrompt(resumeText, jobTitle) },
  ]);
}

export async function generateInterviewQuestions(
  candidateProfile: string,
  jobTitle: string,
): Promise<string> {
  return callHermes([
    { role: "system", content: questionsPrompt },
    { role: "user", content: formatQuestionsPrompt(candidateProfile, jobTitle) },
  ]);
}

export async function generateRecommendation(
  candidateSummary: string,
  feedbackSummary: string,
): Promise<string> {
  return callHermes([
    { role: "system", content: recommendationPrompt },
    { role: "user", content: formatRecommendationPrompt(candidateSummary, feedbackSummary) },
  ], { maxTokens: 1536 });
}
