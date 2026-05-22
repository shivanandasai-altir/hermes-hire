import { describe, it, expect } from "vitest";
import {
  formatSummaryPrompt,
  formatQuestionsPrompt,
  formatRecommendationPrompt,
  formatMeetingPrompt,
  formatVoiceFeedbackPrompt,
} from "@/prompts";

describe("formatSummaryPrompt()", () => {
  it("includes job title and resume text", () => {
    const result = formatSummaryPrompt("Resume content here", "Senior Engineer");
    expect(result).toContain("Job: Senior Engineer");
    expect(result).toContain("Resume content here");
  });

  it("handles empty resume text", () => {
    const result = formatSummaryPrompt("", "Engineer");
    expect(result).toContain("Job: Engineer");
    expect(result).toContain("Resume:");
  });

  it("handles multi-line resume text", () => {
    const resume = "Line 1\nLine 2\nLine 3";
    const result = formatSummaryPrompt(resume, "Role");
    expect(result).toContain("Line 1");
    expect(result).toContain("Line 2");
    expect(result).toContain("Line 3");
  });
});

describe("formatQuestionsPrompt()", () => {
  it("includes candidate profile and job title", () => {
    const result = formatQuestionsPrompt("React expert, 5 years XP", "Frontend Engineer");
    expect(result).toContain("Frontend Engineer");
    expect(result).toContain("React expert, 5 years XP");
  });

  it("handles empty profile", () => {
    const result = formatQuestionsPrompt("", "Role");
    expect(result).toContain("Role");
  });
});

describe("formatRecommendationPrompt()", () => {
  it("includes candidate summary and feedback summary", () => {
    const result = formatRecommendationPrompt(
      "Strong candidate with leadership",
      "Positive feedback from interview",
    );
    expect(result).toContain("Strong candidate with leadership");
    expect(result).toContain("Positive feedback from interview");
  });

  it("clearly separates summary and feedback sections", () => {
    const result = formatRecommendationPrompt("Summary", "Feedback");
    expect(result).toMatch(/summary/i);
    expect(result).toMatch(/feedback/i);
  });
});

describe("formatMeetingPrompt()", () => {
  const currentTimePattern = /Current time: /;

  it("includes user request, candidate name, job title", () => {
    const result = formatMeetingPrompt(
      "Schedule tomorrow at 2pm",
      "Jane Doe",
      "Engineer",
    );
    expect(result).toContain('Request: "Schedule tomorrow at 2pm"');
    expect(result).toContain("Candidate: Jane Doe");
    expect(result).toContain("Job: Engineer");
  });

  it("includes candidate email when provided", () => {
    const result = formatMeetingPrompt(
      "Schedule a call",
      "Jane",
      "Engineer",
      "jane@example.com",
    );
    expect(result).toContain("jane@example.com");
  });

  it('indicates when candidate email is not provided', () => {
    const result = formatMeetingPrompt("Schedule a call", "Jane", "Engineer");
    expect(result).toContain("not provided");
  });

  it("includes current timestamp", () => {
    const before = Date.now();
    const result = formatMeetingPrompt("test", "name", "role");
    const after = Date.now();
    // Extract the ISO time from the result
    const timeMatch = result.match(/Current time: (.+)/);
    expect(timeMatch).not.toBeNull();
    const timestamp = new Date(timeMatch![1]).getTime();
    expect(timestamp).toBeGreaterThanOrEqual(before);
    expect(timestamp).toBeLessThanOrEqual(after + 100);
  });
});

describe("formatVoiceFeedbackPrompt()", () => {
  it("includes the formatted transcript", () => {
    const transcript = "- user: Hello\n- assistant: Hi there!";
    const result = formatVoiceFeedbackPrompt(transcript);
    expect(result).toContain("- user: Hello");
    expect(result).toContain("- assistant: Hi there!");
  });

  it("handles empty transcript (wraps with prefix)", () => {
    const result = formatVoiceFeedbackPrompt("");
    expect(result).toContain("Transcript:");
    expect(result).toContain("Please score the candidate");
  });

  it("handles long transcripts", () => {
    const lines = Array.from({ length: 100 }, (_, i) => `- user: Message ${i}`);
    const transcript = lines.join("\n");
    const result = formatVoiceFeedbackPrompt(transcript);
    expect(result).toContain("Message 0");
    expect(result).toContain("Message 99");
  });
});
