import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseMeetingRequest, scheduleMeetingWithHermes } from "@/lib/meet";

// ─── parseMeetingRequest ───

describe("parseMeetingRequest()", () => {
  beforeEach(() => {
    process.env = { ...process.env, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("parses a meeting request into structured meeting details", async () => {
    const mockMeetingDetails = {
      summary: "Interview: Jane Doe - Senior Engineer",
      description: "Interview with Jane Doe for Senior Engineer position",
      startDateTime: "2025-06-01T14:00:00Z",
      endDateTime: "2025-06-01T15:00:00Z",
      attendees: ["jane@example.com"],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify(mockMeetingDetails),
            },
          },
        ],
      }),
    } as Response);

    const result = await parseMeetingRequest(
      "Schedule interview tomorrow at 2pm",
      "Jane Doe",
      "Senior Engineer",
      "jane@example.com",
    );

    expect(result.summary).toBe("Interview: Jane Doe - Senior Engineer");
    expect(result.description).toContain("Interview with Jane Doe");
    expect(result.startDateTime).toBe("2025-06-01T14:00:00Z");
    expect(result.endDateTime).toBe("2025-06-01T15:00:00Z");
    expect(result.attendees).toEqual(["jane@example.com"]);
  });

  it("uses defaults when fields are missing from response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                startDateTime: "2025-06-01T10:00:00Z",
                endDateTime: "2025-06-01T11:00:00Z",
                attendees: [],
              }),
            },
          },
        ],
      }),
    } as Response);

    const result = await parseMeetingRequest(
      "Schedule a call",
      "Jane",
      "Engineer",
    );

    expect(result.summary).toBe("Interview: Jane - Engineer");
    expect(result.description).toBe("Interview with Jane for Engineer");
    expect(result.attendees).toEqual([]);
  });

  it("handles missing candidate email gracefully", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: JSON.stringify({
                summary: "Meeting",
                description: "desc",
                startDateTime: "2025-06-01T10:00:00Z",
                endDateTime: "2025-06-01T11:00:00Z",
                attendees: [],
              }),
            },
          },
        ],
      }),
    } as Response);

    const result = await parseMeetingRequest("Schedule", "Jane", "Engineer");
    expect(result.summary).toBe("Meeting");
    expect(result.attendees).toEqual([]);
  });

  it("strips code fences from AI response before parsing", async () => {
    const mockData = {
      summary: "Interview",
      description: "desc",
      startDateTime: "2025-06-01T10:00:00Z",
      endDateTime: "2025-06-01T11:00:00Z",
      attendees: [],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "```json\n" + JSON.stringify(mockData) + "\n```",
            },
          },
        ],
      }),
    } as Response);

    const result = await parseMeetingRequest("Schedule", "Jane", "Engineer");
    expect(result.summary).toBe("Interview");
  });

  it("throws when Hermes API returns non-JSON response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content: "Not JSON at all",
            },
          },
        ],
      }),
    } as Response);

    await expect(
      parseMeetingRequest("Schedule", "Jane", "Engineer"),
    ).rejects.toThrow();
  });

  it("throws when API call fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
    } as Response);

    await expect(
      parseMeetingRequest("Schedule", "Jane", "Engineer"),
    ).rejects.toThrow("Hermes API error: 500 Server Error");
  });
});

// ─── scheduleMeetingWithHermes ───

describe("scheduleMeetingWithHermes()", () => {
  beforeEach(() => {
    process.env = { ...process.env, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns success false with error when Hermes parsing fails", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("API unavailable"));

    const result = await scheduleMeetingWithHermes(
      "Schedule a call",
      "Jane",
      "Engineer",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBe("API unavailable");
  });

  it("returns success false with error when Hermes returns invalid JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "bad data" } }],
      }),
    } as Response);

    const result = await scheduleMeetingWithHermes(
      "Schedule a call",
      "Jane",
      "Engineer",
    );

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
