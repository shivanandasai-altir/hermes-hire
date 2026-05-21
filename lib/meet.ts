import { execSync } from "node:child_process";
import { callHermes, stripCodeFences } from "@/services/ai";
import { meetingPrompt, formatMeetingPrompt } from "@/prompts";

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
  const content = await callHermes([
    { role: "system", content: meetingPrompt },
    { role: "user", content: formatMeetingPrompt(userInput, candidateName, jobTitle, candidateEmail) },
  ], { temperature: 0.1, maxTokens: 512 });

  const parsed = JSON.parse(stripCodeFences(content));

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
