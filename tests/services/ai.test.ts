import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  callHermes,
  stripCodeFences,
  generateCandidateSummary,
  generateInterviewQuestions,
  generateRecommendation,
} from "@/services/ai";

// ─── stripCodeFences ───

describe("stripCodeFences()", () => {
  it("removes triple backtick fences with no language annotation", () => {
    const input = "```\nhello world\n```";
    expect(stripCodeFences(input)).toBe("hello world");
  });

  it("removes triple backtick fences with json annotation", () => {
    const input = '```json\n{"key": "value"}\n```';
    expect(stripCodeFences(input)).toBe('{"key": "value"}');
  });

  it("removes triple backtick fences with typescript annotation", () => {
    const input = "```typescript\nconst x = 1;\n```";
    expect(stripCodeFences(input)).toBe("const x = 1;");
  });

  it("removes triple backtick fences with ts annotation", () => {
    const input = "```ts\nconst x = 1;\n```";
    expect(stripCodeFences(input)).toBe("const x = 1;");
  });

  it("removes triple backtick fences with js annotation", () => {
    const input = "```js\nconst x = 1;\n```";
    expect(stripCodeFences(input)).toBe("const x = 1;");
  });

  it("handles text without code fences", () => {
    const input = "plain text content";
    expect(stripCodeFences(input)).toBe("plain text content");
  });

  it("trims whitespace from result", () => {
    const input = "  \nhello\n  ";
    expect(stripCodeFences(input)).toBe("hello");
  });

  it("handles empty string", () => {
    expect(stripCodeFences("")).toBe("");
  });

  it("handles code fences at start only", () => {
    const input = "```\ncontent";
    expect(stripCodeFences(input)).toBe("content");
  });

  it("handles code fences at end only", () => {
    const input = "content\n```";
    expect(stripCodeFences(input)).toBe("content");
  });

  it("handles multiple fence lines", () => {
    const input = "```\nline1\nline2\nline3\n```";
    expect(stripCodeFences(input)).toBe("line1\nline2\nline3");
  });
});

// ─── callHermes ───

describe("callHermes()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("makes a POST request to the Hermes API endpoint", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Hello!" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await callHermes([
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "Say hello" },
    ]);

    expect(fetch).toHaveBeenCalledWith(
      "https://inference-api.nousresearch.com/v1/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-key",
        },
      }),
    );

    expect(result).toBe("Hello!");
  });

  it("uses custom model when provided", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "ok" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await callHermes(
      [{ role: "user", content: "test" }],
      { model: "custom-model", temperature: 0.7, maxTokens: 512 },
    );

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(callBody.model).toBe("custom-model");
    expect(callBody.temperature).toBe(0.7);
    expect(callBody.max_tokens).toBe(512);
  });

  it("uses default values when options are not provided", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "ok" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await callHermes([{ role: "user", content: "test" }]);

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(callBody.temperature).toBe(0.3);
    expect(callBody.max_tokens).toBe(1024);
  });

  it("throws on non-OK response", async () => {
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      callHermes([{ role: "user", content: "test" }]),
    ).rejects.toThrow("Hermes API error: 401 Unauthorized");
  });

  it("throws on 500 server error", async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      callHermes([{ role: "user", content: "test" }]),
    ).rejects.toThrow("Hermes API error: 500 Internal Server Error");
  });

  it("throws when API key is missing (still calls but server rejects)", async () => {
    process.env.HERMES_API_KEY = "";
    const mockResponse = {
      ok: false,
      status: 401,
      statusText: "Unauthorized",
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      callHermes([{ role: "user", content: "test" }]),
    ).rejects.toThrow("Hermes API error: 401 Unauthorized");
  });

  it("throws when response has empty content", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: null } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      callHermes([{ role: "user", content: "test" }]),
    ).rejects.toThrow("Hermes API returned empty response");
  });

  it("throws when choices array is empty", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      callHermes([{ role: "user", content: "test" }]),
    ).rejects.toThrow("Hermes API returned empty response");
  });

  it("throws on network failure", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

    await expect(
      callHermes([{ role: "user", content: "test" }]),
    ).rejects.toThrow("Network error");
  });

  it("uses custom API URL from environment variable", async () => {
    // The HERMES_API_URL is evaluated at module import time.
    // We need fresh module context to test this.
    vi.resetModules();
    process.env.HERMES_API_URL = "https://custom-api.example.com/v1";
    process.env.HERMES_API_KEY = "test-key";

    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "ok" } }],
      }),
    };
    globalThis.fetch = vi.fn().mockResolvedValue(mockResponse as Response);

    // Fresh import picks up the modified env
    const { callHermes: callCustom } = await import("@/services/ai");

    await callCustom([{ role: "user", content: "test" }]);

    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      "https://custom-api.example.com/v1/chat/completions",
      expect.anything(),
    );
  });
});

// ─── generateCandidateSummary ───

describe("generateCandidateSummary()", () => {
  beforeEach(() => {
    process.env = { ...process.env, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the correct system and user prompts", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Summary text" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await generateCandidateSummary("Resume text here", "Senior Engineer");

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );

    expect(callBody.messages[0].role).toBe("system");
    expect(callBody.messages[0].content).toContain("expert HR recruiter");
    expect(callBody.messages[1].role).toBe("user");
    expect(callBody.messages[1].content).toContain("Job: Senior Engineer");
    expect(callBody.messages[1].content).toContain("Resume text here");
  });

  it("returns the generated summary text", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Candidate is a strong match..." } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await generateCandidateSummary("resume", "job");
    expect(result).toBe("Candidate is a strong match...");
  });

  it("propagates API errors", async () => {
    const mockResponse = {
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await expect(
      generateCandidateSummary("resume", "job"),
    ).rejects.toThrow("Hermes API error: 429 Too Many Requests");
  });
});

// ─── generateInterviewQuestions ───

describe("generateInterviewQuestions()", () => {
  beforeEach(() => {
    process.env = { ...process.env, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the correct prompts", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Q1: ...\nQ2: ..." } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await generateInterviewQuestions(
      "Experienced React developer",
      "Frontend Engineer",
    );

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );

    expect(callBody.messages[0].role).toBe("system");
    expect(callBody.messages[1].content).toContain("Frontend Engineer");
    expect(callBody.messages[1].content).toContain("Experienced React developer");
  });

  it("returns generated questions", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "1. Tell me about yourself\n2. Your strengths" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await generateInterviewQuestions("profile", "role");
    expect(result).toBe("1. Tell me about yourself\n2. Your strengths");
  });
});

// ─── generateRecommendation ───

describe("generateRecommendation()", () => {
  beforeEach(() => {
    process.env = { ...process.env, HERMES_API_KEY: "test-key" };
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends the correct prompts with maxTokens override", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Recommendation: Hire" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    await generateRecommendation("Strong candidate", "Positive feedback");

    const callBody = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );

    expect(callBody.messages[0].role).toBe("system");
    expect(callBody.messages[1].content).toContain("Strong candidate");
    expect(callBody.messages[1].content).toContain("Positive feedback");
    // recommendation overrides maxTokens to 1536
    expect(callBody.max_tokens).toBe(1536);
  });

  it("returns the recommendation", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Strong Hire — recommend proceeding" } }],
      }),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as Response);

    const result = await generateRecommendation("summary", "feedback");
    expect(result).toBe("Strong Hire — recommend proceeding");
  });
});
