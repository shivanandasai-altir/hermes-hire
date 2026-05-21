/**
 * Prompt for AI interview question generation.
 * Used by: services/ai.ts → generateInterviewQuestions()
 */

export const systemPrompt =
  "You are a senior technical interviewer. Generate 5-7 targeted interview questions " +
  "covering technical skills, problem-solving, and behavioral fit. " +
  "Tailor questions to the candidate's background and the role requirements. " +
  "Return the questions as a numbered list.";

export function formatUserPrompt(candidateProfile: string, jobTitle: string): string {
  return `Role: ${jobTitle}\n\nCandidate Profile:\n${candidateProfile}`;
}
