import { execSync } from "node:child_process";

interface MeetingDetails {
  summary: string;
  description: string;
  startDateTime: string; // RFC3339
  endDateTime: string;   // RFC3339
  attendees: string[];
}

interface ScheduleResult {
  success: boolean;
  meetLink?: string;
  eventId?: string;
  error?: string;
}

/**
 * Step 1: Hermes Agent parses natural language into structured meeting data.
 */
export async function parseMeetingRequest(
  userInput: string,
  candidateName: string,
  jobTitle: string,
  candidateEmail?: string,
): Promise<MeetingDetails> {
  const systemPrompt = `You are a scheduling assistant. Parse the user's request to schedule a Google Meet call.

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

  const userPrompt = `Request: "${userInput}"
Candidate: ${candidateName}
Job: ${jobTitle}
Candidate email: ${candidateEmail || "not provided"}
Current time: ${new Date().toISOString()}`;

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
        temperature: 0.1,
        max_tokens: 512,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Hermes parse error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from Hermes");

  const jsonStr = content.replace(/```json\s*|\s*```/g, "").trim();
  const parsed = JSON.parse(jsonStr);

  return {
    summary: parsed.summary || `Interview: ${candidateName} - ${jobTitle}`,
    description: parsed.description || `Interview with ${candidateName} for ${jobTitle}`,
    startDateTime: parsed.startDateTime,
    endDateTime: parsed.endDateTime,
    attendees: parsed.attendees || [],
  };
}

/**
 * Step 2: Create a Google Calendar event with Meet link using gog CLI.
 *
 * Requires `gog` CLI installed (brew install gogcli) and authenticated.
 * Calendar ID "primary" refers to the authenticated user's primary calendar.
 */
export async function createCalendarEvent(meeting: MeetingDetails): Promise<ScheduleResult> {
  try {
    // Verify gog is installed
    execSync("gog --version", { stdio: "ignore" });
  } catch {
    return {
      success: false,
      error:
        "gog CLI not found. Install it: brew install gogcli, then run 'gog auth add <email>'",
    };
  }

  try {
    const args = [
      "calendar",
      "create",
      "primary",
      "--from", meeting.startDateTime,
      "--to", meeting.endDateTime,
      "--summary", meeting.summary,
      "--description", meeting.description,
      "--with-meet",
      "--json",
    ];

    if (meeting.attendees.length > 0) {
      args.push("--attendees", meeting.attendees.join(","));
    }

    const output = execSync(`gog ${args.map(a => `'${a.replace(/'/g, "'\\''")}'`).join(" ")}`, {
      encoding: "utf-8",
      timeout: 15000,
    });

    const result = JSON.parse(output);

    return {
      success: true,
      meetLink: result.hangoutLink ?? undefined,
      eventId: result.id ?? undefined,
    };
  } catch (error) {
    console.error("gog calendar error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create calendar event",
    };
  }
}

/**
 * Combined: Hermes parses → gog creates. One-shot scheduling.
 */
export async function scheduleMeetingWithHermes(
  userInput: string,
  candidateName: string,
  jobTitle: string,
  candidateEmail?: string,
): Promise<ScheduleResult> {
  try {
    const meeting = await parseMeetingRequest(
      userInput,
      candidateName,
      jobTitle,
      candidateEmail,
    );
    return await createCalendarEvent(meeting);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to schedule meeting",
    };
  }
}
