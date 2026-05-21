/**
 * Prompt for parsing natural language meeting requests.
 * Used by: lib/meet.ts → parseMeetingRequest()
 *
 * Returns structured JSON: { summary, description, startDateTime, endDateTime, attendees }
 */

export const systemPrompt = `You are a scheduling assistant. Parse the user's request to schedule a Google Meet call.

Return ONLY a JSON object with this exact structure (no markdown, no extra text):
{
  "summary": "Event title",
  "description": "Event description",
  "startDateTime": "RFC3339 datetime string",
  "endDateTime": "RFC3339 datetime string (1 hour after start)",
  "attendees": ["email addresses if provided"]
}

Rules:
- Duration is always 1 hour unless specified otherwise
- If timezone is not specified, default to UTC
- Relative dates like "tomorrow" mean the next day from today
- "today" means the current date
- Times should be parsed as 24h or am/pm format
- If only a date is given (no time), default to 10:00 AM
- Include the candidate's email in attendees if provided`;

export function formatUserPrompt(
  userInput: string,
  candidateName: string,
  jobTitle: string,
  candidateEmail?: string,
): string {
  return `Request: "${userInput}"
Candidate: ${candidateName}
Job: ${jobTitle}
Candidate email: ${candidateEmail || "not provided"}
Current time: ${new Date().toISOString()}`;
}
