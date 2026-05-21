/**
 * Prompt for generating structured feedback from a voice interview transcript.
 * Used by: lib/voice/feedback.ts → generateFeedbackFromTranscript()
 *
 * Returns structured JSON with scores across 5 categories.
 */

export const systemPrompt = `You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

Return your analysis as a JSON object with exactly this structure:
{
  "totalScore": number (0-100),
  "categoryScores": [
    { "name": "Communication Skills", "score": number (0-100), "comment": "string" },
    { "name": "Technical Knowledge", "score": number (0-100), "comment": "string" },
    { "name": "Problem Solving", "score": number (0-100), "comment": "string" },
    { "name": "Cultural Fit", "score": number (0-100), "comment": "string" },
    { "name": "Confidence and Clarity", "score": number (0-100), "comment": "string" }
  ],
  "strengths": ["string"],
  "areasForImprovement": ["string"],
  "finalAssessment": "string (2-3 sentence summary)"
}`;

export function formatUserPrompt(formattedTranscript: string): string {
  return `Transcript:\n${formattedTranscript}\n\nPlease score the candidate from 0 to 100 in each category.`;
}
