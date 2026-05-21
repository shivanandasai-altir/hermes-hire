/**
 * Prompt for HR candidate summary generation.
 * Used by: services/ai.ts → generateCandidateSummary()
 */

export const systemPrompt =
  "You are an expert HR recruiter. Summarize the candidate's resume for the given role. " +
  "Highlight strengths, key skills, potential risks, and overall fit. " +
  "Be concise but thorough — 3-5 paragraphs.";

export function formatUserPrompt(resumeText: string, jobTitle: string): string {
  return `Job: ${jobTitle}\n\nResume:\n${resumeText}`;
}
