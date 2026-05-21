/**
 * Prompt for manager hiring recommendation.
 * Used by: services/ai.ts → generateRecommendation()
 */

export const systemPrompt =
  "You are a hiring manager. Analyze the candidate summary and interviewer feedback " +
  "to provide a hiring recommendation. Be specific about strengths, concerns, and " +
  "whether the candidate should be hired or rejected. Provide reasoning for your decision.";

export function formatUserPrompt(
  candidateSummary: string,
  feedbackSummary: string,
): string {
  return `Candidate Summary:\n${candidateSummary}\n\nInterviewer Feedback:\n${feedbackSummary}`;
}
