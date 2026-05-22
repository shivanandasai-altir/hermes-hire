import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateFeedbackFromTranscript, type VoiceFeedback } from "@/lib/voice/feedback";

describe("generateFeedbackFromTranscript()", () => {
  beforeEach(() => {
    process.env = { ...process.env, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends formatted transcript to Hermes and returns structured feedback", async () => {
    const mockFeedback: VoiceFeedback = {
      totalScore: 85,
      categoryScores: [
        { name: "Communication", score: 90, comment: "Clear and concise" },
        { name: "Technical Skills", score: 85, comment: "Strong knowledge" },
        { name: "Culture Fit", score: 80, comment: "Good alignment" },
      ],
      strengths: ["Excellent communication", "Strong technical background"],
      areasForImprovement: ["Could provide more specific examples"],
      finalAssessment: "Strong candidate overall",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockFeedback) } }],
      }),
    } as Response);

    const transcript = [
      { role: "user" as const, content: "Hello, I'm Jane" },
      { role: "assistant" as const, content: "Nice to meet you, Jane!" },
      { role: "user" as const, content: "I have 5 years of React experience" },
    ];

    const result = await generateFeedbackFromTranscript(transcript);

    // Verify the request
    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );

    expect(callBody.messages[0].role).toBe("system");
    expect(callBody.messages[1].content).toContain("- user: Hello, I'm Jane");
    expect(callBody.messages[1].content).toContain("- assistant: Nice to meet you, Jane!");
    expect(callBody.max_tokens).toBe(2048);

    // Verify the response
    expect(result.totalScore).toBe(85);
    expect(result.categoryScores).toHaveLength(3);
    expect(result.strengths).toHaveLength(2);
    expect(result.areasForImprovement).toHaveLength(1);
    expect(result.finalAssessment).toBe("Strong candidate overall");
  });

  it("handles empty transcript", async () => {
    const mockFeedback: VoiceFeedback = {
      totalScore: 0,
      categoryScores: [],
      strengths: [],
      areasForImprovement: ["No conversation to evaluate"],
      finalAssessment: "No interview conducted",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockFeedback) } }],
      }),
    } as Response);

    const result = await generateFeedbackFromTranscript([]);

    expect(result.totalScore).toBe(0);
    expect(result.categoryScores).toHaveLength(0);
    expect(result.finalAssessment).toBe("No interview conducted");
  });

  it("handles single-message transcript", async () => {
    const mockFeedback: VoiceFeedback = {
      totalScore: 50,
      categoryScores: [{ name: "Communication", score: 50, comment: "Limited data" }],
      strengths: [],
      areasForImprovement: ["Insufficient conversation"],
      finalAssessment: "Incomplete interview",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockFeedback) } }],
      }),
    } as Response);

    const result = await generateFeedbackFromTranscript([
      { role: "user" as const, content: "Hi" },
    ]);

    expect(result.totalScore).toBe(50);
  });

  it("strips code fences from AI response", async () => {
    const mockFeedback: VoiceFeedback = {
      totalScore: 75,
      categoryScores: [],
      strengths: [],
      areasForImprovement: [],
      finalAssessment: "Good",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          {
            message: {
              content:
                "```json\n" + JSON.stringify(mockFeedback) + "\n```",
            },
          },
        ],
      }),
    } as Response);

    const result = await generateFeedbackFromTranscript([
      { role: "user" as const, content: "Test" },
    ]);

    expect(result.finalAssessment).toBe("Good");
  });

  it("throws when API call fails", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    } as Response);

    await expect(
      generateFeedbackFromTranscript([{ role: "user", content: "hi" }]),
    ).rejects.toThrow("Hermes API error: 401 Unauthorized");
  });

  it("throws when response is not valid VoiceFeedback JSON", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "not json at all" } }],
      }),
    } as Response);

    await expect(
      generateFeedbackFromTranscript([{ role: "user", content: "hi" }]),
    ).rejects.toThrow();
  });

  it("supports long transcripts with many messages", async () => {
    const manyMessages = Array.from({ length: 50 }, (_, i) => ({
      role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
      content: `Message ${i}`,
    }));

    const mockFeedback: VoiceFeedback = {
      totalScore: 90,
      categoryScores: [{ name: "Engagement", score: 90, comment: "Very engaged" }],
      strengths: ["Consistent"],
      areasForImprovement: [],
      finalAssessment: "Excellent",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockFeedback) } }],
      }),
    } as Response);

    const result = await generateFeedbackFromTranscript(manyMessages);
    expect(result.totalScore).toBe(90);
  });

  it("preserves score types (category scores have correct schema)", async () => {
    const mockFeedback: VoiceFeedback = {
      totalScore: 92,
      categoryScores: [
        { name: "Technical", score: 95, comment: "Excellent" },
        { name: "Behavioral", score: 88, comment: "Good" },
      ],
      strengths: ["Deep technical knowledge"],
      areasForImprovement: ["Soft skills"],
      finalAssessment: "Hire",
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: JSON.stringify(mockFeedback) } }],
      }),
    } as Response);

    const result = await generateFeedbackFromTranscript([
      { role: "user", content: "test" },
    ]);

    // TypeScript structural check
    const category = result.categoryScores[0];
    expect(category).toHaveProperty("name");
    expect(category).toHaveProperty("score");
    expect(category).toHaveProperty("comment");
    expect(typeof category.score).toBe("number");
    expect(typeof category.name).toBe("string");
    expect(typeof category.comment).toBe("string");
  });
});
