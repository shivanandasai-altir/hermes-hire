import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Resend as a proper constructor function (supports `new`)
vi.mock("resend", () => {
  const mockSend = vi.fn();
  return {
    Resend: vi.fn().mockImplementation(function (this: { emails: { send: typeof mockSend } }) {
      this.emails = { send: mockSend };
    }),
  };
});

describe("sendEmail()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns success false when RESEND_API_KEY is not configured", async () => {
    process.env.RESEND_API_KEY = "";

    const { sendEmail } = await import("@/lib/email");

    const result = await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Resend not configured");
  });

  it("includes a warning log when sending without API key", async () => {
    process.env.RESEND_API_KEY = "";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const { sendEmail } = await import("@/lib/email");

    await sendEmail({
      to: "test@example.com",
      subject: "Test",
      html: "<p>Hello</p>",
    });

    expect(warnSpy).toHaveBeenCalledWith(
      "RESEND_API_KEY not set. Skipping email send.",
    );
    warnSpy.mockRestore();
  });
});

describe("sendCandidateInviteEmail()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns success false when Resend is not configured", async () => {
    process.env.RESEND_API_KEY = "";

    const { sendCandidateInviteEmail } = await import("@/lib/email");

    const result = await sendCandidateInviteEmail({
      candidateName: "Rahul Sharma",
      candidateEmail: "rahul@example.com",
      jobTitle: "Senior Frontend Engineer",
      companyName: "Acme Corp",
      onboardLink: "https://hermes-hire.xyz/onboard/abc123",
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe("Resend not configured");
  });

  it("works without company description", async () => {
    process.env.RESEND_API_KEY = "";

    const { sendCandidateInviteEmail } = await import("@/lib/email");

    const result = await sendCandidateInviteEmail({
      candidateName: "Jane",
      candidateEmail: "jane@example.com",
      jobTitle: "Engineer",
      onboardLink: "https://hermes-hire.xyz/onboard/xyz",
    });

    expect(result.success).toBe(false);
  });

  it("uses default company name when not provided", async () => {
    process.env.RESEND_API_KEY = "";

    const { sendCandidateInviteEmail } = await import("@/lib/email");

    const result = await sendCandidateInviteEmail({
      candidateName: "Jane",
      candidateEmail: "jane@example.com",
      jobTitle: "Engineer",
      onboardLink: "https://hermes-hire.xyz/onboard/xyz",
    });

    expect(result.success).toBe(false);
  });
});
