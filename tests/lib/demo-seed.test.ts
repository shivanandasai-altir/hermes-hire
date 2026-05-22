import { describe, it, expect } from "vitest";
import { createDemoDatabase, DEMO_USERS, DEMO_RESUME, buildDemoAuditLogs } from "@/lib/demo-seed";

describe("createDemoDatabase()", () => {
  it("returns a fully populated database", () => {
    const db = createDemoDatabase();
    expect(db.version).toBe(1);
    expect(db.users).toHaveLength(3);
    expect(db.jobs).toHaveLength(1);
    expect(db.candidates).toHaveLength(1);
    expect(db.interviews).toHaveLength(1);
    expect(db.feedback).toHaveLength(1);
  });

  it("creates users with correct roles", () => {
    const db = createDemoDatabase();
    const users = db.users;

    expect(users.find((u) => u.id === "alice")?.role).toBe("HR");
    expect(users.find((u) => u.id === "bob")?.role).toBe("INTERVIEWER");
    expect(users.find((u) => u.id === "carol")?.role).toBe("MANAGER");
  });

  it("creates a job with OPEN status", () => {
    const db = createDemoDatabase();
    const job = db.jobs[0];
    expect(job.title).toBe("Senior Frontend Engineer");
    expect(job.department).toBe("Engineering");
    expect(job.status).toBe("OPEN");
    expect(job.createdById).toBe("alice");
  });

  it("creates candidate with MANAGER_REVIEW stage", () => {
    const db = createDemoDatabase();
    const candidate = db.candidates[0];
    expect(candidate.name).toBe("Jane Doe");
    expect(candidate.email).toBe("jane.doe@example.com");
    expect(candidate.currentStage).toBe("MANAGER_REVIEW");
    expect(candidate.jobId).toBe("demo-job-1");
  });

  it("creates candidate with AI summary and questions", () => {
    const db = createDemoDatabase();
    const candidate = db.candidates[0];
    expect(candidate.aiSummary).toBeTruthy();
    expect(candidate.aiSummary).toContain("Strong React/TypeScript");
    expect(candidate.aiQuestions).toBeTruthy();
    expect(candidate.aiQuestions).toContain("complex state management");
    expect(candidate.aiRecommendation).toBeNull();
  });

  it("creates candidate with audit logs", () => {
    const db = createDemoDatabase();
    const candidate = db.candidates[0];
    expect(candidate.auditLogs).toHaveLength(4);
    expect(candidate.auditLogs[0].action).toBe("Candidate added");
    expect(candidate.auditLogs[3].action).toContain("MANAGER_REVIEW");
  });

  it("creates interview with COMPLETED status", () => {
    const db = createDemoDatabase();
    const interview = db.interviews[0];
    expect(interview.candidateId).toBe("demo-candidate-1");
    expect(interview.interviewerId).toBe("bob");
    expect(interview.status).toBe("COMPLETED");
  });

  it("creates feedback with high rating", () => {
    const db = createDemoDatabase();
    const feedback = db.feedback[0];
    expect(feedback.interviewId).toBe("demo-interview-1");
    expect(feedback.rating).toBe(5);
    expect(feedback.recommendation).toBe("Strong Hire");
    expect(feedback.comments).toContain("Excellent communication");
  });

  it("resetText contains demo resume", () => {
    const db = createDemoDatabase();
    expect(db.candidates[0].resumeText).toBe(DEMO_RESUME);
  });
});

describe("DEMO_USERS", () => {
  it("has Alice as HR", () => {
    const alice = DEMO_USERS.find((u) => u.id === "alice");
    expect(alice).toBeDefined();
    expect(alice!.role).toBe("HR");
  });

  it("has Bob as Interviewer", () => {
    const bob = DEMO_USERS.find((u) => u.id === "bob");
    expect(bob).toBeDefined();
    expect(bob!.role).toBe("INTERVIEWER");
  });

  it("has Carol as Manager", () => {
    const carol = DEMO_USERS.find((u) => u.id === "carol");
    expect(carol).toBeDefined();
    expect(carol!.role).toBe("MANAGER");
  });
});

describe("DEMO_RESUME", () => {
  it("contains relevant experience", () => {
    expect(DEMO_RESUME).toContain("Senior Frontend Engineer");
    expect(DEMO_RESUME).toContain("React/TypeScript");
    expect(DEMO_RESUME).toContain("WebSockets");
    expect(DEMO_RESUME).toContain("design system");
  });
});

describe("buildDemoAuditLogs()", () => {
  it("returns 4 audit entries", () => {
    const logs = buildDemoAuditLogs(new Date().toISOString());
    expect(logs).toHaveLength(4);
  });

  it("tracks progression from APPLIED to MANAGER_REVIEW", () => {
    const logs = buildDemoAuditLogs(new Date().toISOString());
    expect(logs[0].action).toBe("Candidate added");
    expect(logs[1].action).toContain("APPLIED to SCREENING");
    expect(logs[2].action).toContain("SCREENING to INTERVIEW");
    expect(logs[3].action).toContain("INTERVIEW to MANAGER_REVIEW");
  });

  it("uses the provided timestamp for all entries", () => {
    const ts = "2025-06-01T12:00:00.000Z";
    const logs = buildDemoAuditLogs(ts);
    for (const log of logs) {
      expect(log.timestamp).toBe(ts);
    }
  });
});
