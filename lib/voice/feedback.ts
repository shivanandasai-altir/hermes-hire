import type { SavedMessage } from "@/types/vapi";
import { callHermes, stripCodeFences } from "@/services/ai";
import { voiceFeedbackPrompt, formatVoiceFeedbackPrompt } from "@/prompts";

interface CategoryScore {
  name: string;
  score: number;
  comment: string;
}

export interface VoiceFeedback {
  totalScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  areasForImprovement: string[];
  finalAssessment: string;
}

/**
 * Generates structured feedback from a Vapi voice interview transcript.
 */
export async function generateFeedbackFromTranscript(
  transcript: SavedMessage[],
): Promise<VoiceFeedback> {
  const formattedTranscript = transcript
    .map((sentence) => `- ${sentence.role}: ${sentence.content}`)
    .join("\n");

  const content = await callHermes([
    { role: "system", content: voiceFeedbackPrompt },
    { role: "user", content: formatVoiceFeedbackPrompt(formattedTranscript) },
  ], { maxTokens: 2048 });

  return JSON.parse(stripCodeFences(content)) as VoiceFeedback;
}
