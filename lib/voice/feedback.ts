import type { SavedMessage } from "@/types/vapi";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

interface VoiceFeedback {
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

/**
 * Generates structured feedback from a Vapi voice interview transcript
 * using the Hermes Agent API.
 */
export async function generateFeedbackFromTranscript(
  transcript: SavedMessage[],
): Promise<VoiceFeedback> {
  const formattedTranscript = transcript
    .map((sentence) => `- ${sentence.role}: ${sentence.content}`)
    .join("\n");

  const systemPrompt = `You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.

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
  "strengths": ["string", ...],
  "areasForImprovement": ["string", ...],
  "finalAssessment": "string (2-3 sentence summary)"
}`;

  const userPrompt = `Transcript:\n${formattedTranscript}\n\nPlease score the candidate from 0 to 100 in each category.`;

  const response = await fetch(
    `${process.env.HERMES_API_URL || "https://api.hermes.ai/v1"}/chat/completions`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HERMES_API_KEY}`,
      },
      body: JSON.stringify({
        model: "hermes-3",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2048,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Hermes API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Empty response from Hermes API");
  }

  // Extract JSON from response (handle markdown-wrapped JSON)
  const jsonStr = content.replace(/```json\s*|\s*```/g, "").trim();
  const parsed = JSON.parse(jsonStr) as VoiceFeedback;

  return parsed;
}
