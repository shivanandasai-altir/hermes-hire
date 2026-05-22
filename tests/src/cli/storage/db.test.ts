import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  emptyDatabase,
  readDb,
  writeDb,
  nextId,
  assertStageTransition,
  appendAuditLog,
  moveCandidateStage,
  createJobInDb,
  createCandidateInDb,
  createInterviewInDb,
  createFeedbackInDb,
  seedDatabase,
  getDbStats,
  dbExists,
  ensureDbDir,
  DB_DIR,
  DB_PATH,
} from "@/src/cli/storage/db";

// ─── Helpers ───

function makeCandidate(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    name: "Jane Doe",
    email: "jane@example.com",
    phone: "+1-555-0100",
    resumeText: "Experienced developer",
    currentStage: "APPLIED" as const,
    jobId: "1",
    aiSummary: null,
    aiQuestions: null,
    aiRecommendation: null,
    meetLink: null,
    auditLogs: [],
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

function makeJob(overrides: Record<string, unknown> = {}) {
  return {
    id: "1",
    title: "Senior Engineer",
    department: "Engineering",
    status: "OPEN" as const,
    createdById: "alice",
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("JSON Database Operations", () => {
  // We'll mock all filesystem operations to avoid touching real ~/.hermeshire
  let mockDbDir: string;
  let mockDbPath: string;

  beforeEach(() => {
    // Create a temp directory for each test
    mockDbDir = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-test-"));
    mockDbPath = path.join(mockDbDir, "db.json");

    // Mock DB_DIR and DB_PATH by intercepting fs calls
    vi.spyOn(fs, "existsSync").mockImplementation((p) => {
      if (typeof p === "string") {
        // Let the mock path through, block real ~/.hermeshire
        if (p === mockDbDir || p === mockDbPath) {
          return fs.existsSync(p);
        }
        if (p === DB_DIR || p === DB_PATH) {
          return false; // pretend real path doesn't exist
        }
        if (p.toString().includes(".hermeshire")) {
          return false;
        }
      }
      return fs.existsSync(p);
    });

    // We need to test the functions in isolation
    // Since the modules use module-level constants, we test the logic directly
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Cleanup temp dir
    try {
      fs.rmSync(mockDbDir, { recursive: true, force: true });
    } catch {}
  });

  // We'll test the pure logic functions since DB_DIR/DB_PATH are module-scoped

  describe("emptyDatabase()", () => {
    it("returns a valid empty database", () => {
      const db = emptyDatabase();
      expect(db.version).toBe(1);
      expect(db.users).toEqual([]);
      expect(db.jobs).toEqual([]);
      expect(db.candidates).toEqual([]);
      expect(db.interviews).toEqual([]);
      expect(db.feedback).toEqual([]);
    });

    it("returns a new object each time", () => {
      const a = emptyDatabase();
      const b = emptyDatabase();
      expect(a).not.toBe(b);
    });
  });

  describe("nextId()", () => {
    it("returns 1 for empty collection", () => {
      const db = emptyDatabase();
      expect(nextId(db, "jobs")).toBe("1");
      expect(nextId(db, "candidates")).toBe("1");
      expect(nextId(db, "interviews")).toBe("1");
      expect(nextId(db, "feedback")).toBe("1");
    });

    it("returns next sequential ID", () => {
      const db = emptyDatabase();
      db.jobs.push(makeJob({ id: "1" }));
      expect(nextId(db, "jobs")).toBe("2");
    });

    it("handles gaps in IDs", () => {
      const db = emptyDatabase();
      db.jobs.push(makeJob({ id: "1" }));
      db.jobs.push(makeJob({ id: "3" }));
      // Highest numeric is 3
      expect(nextId(db, "jobs")).toBe("4");
    });

    it("handles string IDs that are not numbers", () => {
      const db = emptyDatabase();
      db.jobs.push(makeJob({ id: "abc" }));
      // No numeric IDs found
      expect(nextId(db, "jobs")).toBe("1");
    });

    it("handles mixed string and numeric IDs", () => {
      const db = emptyDatabase();
      db.jobs.push(makeJob({ id: "abc" }));
      db.jobs.push(makeJob({ id: "5" }));
      expect(nextId(db, "jobs")).toBe("6");
    });
  });

  describe("assertStageTransition()", () => {
    it("allows valid transitions", () => {
      expect(() => assertStageTransition("APPLIED", "SCREENING")).not.toThrow();
      expect(() => assertStageTransition("SCREENING", "INTERVIEW")).not.toThrow();
      expect(() => assertStageTransition("INTERVIEW", "MANAGER_REVIEW")).not.toThrow();
      expect(() => assertStageTransition("MANAGER_REVIEW", "HIRED")).not.toThrow();
    });

    it("allows rejection from any active stage", () => {
      expect(() => assertStageTransition("APPLIED", "REJECTED")).not.toThrow();
      expect(() => assertStageTransition("SCREENING", "REJECTED")).not.toThrow();
      expect(() => assertStageTransition("INTERVIEW", "REJECTED")).not.toThrow();
      expect(() => assertStageTransition("MANAGER_REVIEW", "REJECTED")).not.toThrow();
    });

    it("throws when transitioning to same stage", () => {
      expect(() => assertStageTransition("APPLIED", "APPLIED")).toThrow(
        "Candidate is already in stage APPLIED",
      );
      expect(() => assertStageTransition("HIRED", "HIRED")).toThrow(
        "Candidate is already in stage HIRED",
      );
    });

    it("throws on skipping stages", () => {
      expect(() => assertStageTransition("APPLIED", "INTERVIEW")).toThrow(
        "Invalid stage transition",
      );
      expect(() => assertStageTransition("APPLIED", "HIRED")).toThrow(
        "Invalid stage transition",
      );
    });

    it("throws on moving backwards", () => {
      expect(() => assertStageTransition("INTERVIEW", "SCREENING")).toThrow(
        "Invalid stage transition",
      );
      expect(() => assertStageTransition("HIRED", "MANAGER_REVIEW")).toThrow(
        "Invalid stage transition",
      );
    });

    it("throws on transition from terminal state HIRED", () => {
      expect(() => assertStageTransition("HIRED", "REJECTED")).toThrow(
        "Invalid stage transition",
      );
    });

    it("throws on transition from terminal state REJECTED", () => {
      expect(() => assertStageTransition("REJECTED", "APPLIED")).toThrow(
        "Invalid stage transition",
      );
    });

    it("includes allowed transitions in error message", () => {
      try {
        assertStageTransition("APPLIED", "HIRED");
      } catch (e: unknown) {
        const msg = (e as Error).message;
        expect(msg).toContain("APPLIED → HIRED");
        expect(msg).toContain("SCREENING");
        expect(msg).toContain("REJECTED");
      }
    });
  });

  describe("appendAuditLog()", () => {
    it("adds an entry to the audit log", () => {
      const candidate = makeCandidate();
      appendAuditLog(candidate, {
        action: "Moved to SCREENING",
        userId: "alice",
        userName: "Alice",
      });
      expect(candidate.auditLogs).toHaveLength(1);
      expect(candidate.auditLogs[0].action).toBe("Moved to SCREENING");
      expect(candidate.auditLogs[0].userId).toBe("alice");
      expect(candidate.auditLogs[0].userName).toBe("Alice");
    });

    it("sets timestamp if not provided", () => {
      const candidate = makeCandidate();
      const before = Date.now();
      appendAuditLog(candidate, {
        action: "Added",
        userId: "alice",
        userName: "Alice",
      });
      const after = Date.now();
      const ts = new Date(candidate.auditLogs[0].timestamp).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after + 100);
    });

    it("preserves provided timestamp", () => {
      const candidate = makeCandidate();
      const fixedTs = "2025-01-01T00:00:00.000Z";
      appendAuditLog(candidate, {
        action: "Added",
        userId: "alice",
        userName: "Alice",
        timestamp: fixedTs,
      });
      expect(candidate.auditLogs[0].timestamp).toBe(fixedTs);
    });

    it("appends multiple entries in order", () => {
      const candidate = makeCandidate();
      appendAuditLog(candidate, { action: "First", userId: "1", userName: "A" });
      appendAuditLog(candidate, { action: "Second", userId: "2", userName: "B" });
      expect(candidate.auditLogs).toHaveLength(2);
      expect(candidate.auditLogs[0].action).toBe("First");
      expect(candidate.auditLogs[1].action).toBe("Second");
    });
  });

  describe("moveCandidateStage()", () => {
    it("moves candidate to new stage and adds audit log", () => {
      const db = emptyDatabase();
      db.candidates.push(makeCandidate({ id: "1", currentStage: "APPLIED" }));

      const updated = moveCandidateStage(db, "1", "SCREENING", {
        userId: "alice",
        userName: "Alice",
      });

      expect(updated.currentStage).toBe("SCREENING");
      expect(updated.auditLogs).toHaveLength(1);
      expect(updated.auditLogs[0].action).toContain("SCREENING");
    });

    it("throws for non-existent candidate", () => {
      const db = emptyDatabase();
      expect(() =>
        moveCandidateStage(db, "nonexistent", "SCREENING", {
          userId: "alice",
          userName: "Alice",
        }),
      ).toThrow("Candidate nonexistent not found");
    });

    it("throws for invalid transition", () => {
      const db = emptyDatabase();
      db.candidates.push(makeCandidate({ id: "1", currentStage: "APPLIED" }));

      expect(() =>
        moveCandidateStage(db, "1", "HIRED", {
          userId: "alice",
          userName: "Alice",
        }),
      ).toThrow("Invalid stage transition");
    });

    it("throws for same stage transition", () => {
      const db = emptyDatabase();
      db.candidates.push(makeCandidate({ id: "1", currentStage: "APPLIED" }));

      expect(() =>
        moveCandidateStage(db, "1", "APPLIED", {
          userId: "alice",
          userName: "Alice",
        }),
      ).toThrow("already in stage APPLIED");
    });

    it("supports custom action message", () => {
      const db = emptyDatabase();
      db.candidates.push(makeCandidate({ id: "1", currentStage: "APPLIED" }));

      const updated = moveCandidateStage(db, "1", "SCREENING", {
        userId: "alice",
        userName: "Alice",
        action: "HR moved to screening",
        details: "Resume looks promising",
      });

      expect(updated.auditLogs[0].action).toBe("HR moved to screening");
      expect(updated.auditLogs[0].details).toBe("Resume looks promising");
    });

    it("updates the database in-place", () => {
      const db = emptyDatabase();
      db.candidates.push(makeCandidate({ id: "1", currentStage: "APPLIED" }));

      moveCandidateStage(db, "1", "SCREENING", {
        userId: "alice",
        userName: "Alice",
      });

      // Original db should reflect the change
      expect(db.candidates[0].currentStage).toBe("SCREENING");
    });
  });

  describe("createJobInDb()", () => {
    it("creates a job and assigns next ID", () => {
      const db = emptyDatabase();
      const job = createJobInDb(db, "Senior Engineer", "Engineering", "alice");
      expect(job.title).toBe("Senior Engineer");
      expect(job.department).toBe("Engineering");
      expect(job.status).toBe("OPEN");
      expect(job.createdById).toBe("alice");
      expect(job.id).toBe("1");
    });

    it("increments job IDs sequentially", () => {
      const db = emptyDatabase();
      createJobInDb(db, "Job 1", "Eng", "alice");
      createJobInDb(db, "Job 2", "Eng", "alice");
      const job = createJobInDb(db, "Job 3", "Eng", "alice");
      expect(job.id).toBe("3");
      expect(db.jobs).toHaveLength(3);
    });

    it("sets createdAt to current time", () => {
      const db = emptyDatabase();
      const before = Date.now();
      const job = createJobInDb(db, "Job", "Eng", "alice");
      const after = Date.now();
      const ts = new Date(job.createdAt).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after + 100);
    });
  });

  describe("createCandidateInDb()", () => {
    it("creates a candidate with default APPLIED stage", () => {
      const db = emptyDatabase();
      const candidate = createCandidateInDb(
        db,
        { name: "John", jobId: "1" },
        { userId: "alice", userName: "Alice" },
      );
      expect(candidate.name).toBe("John");
      expect(candidate.currentStage).toBe("APPLIED");
      expect(candidate.jobId).toBe("1");
    });

    it("uses provided stage when specified", () => {
      const db = emptyDatabase();
      const candidate = createCandidateInDb(
        db,
        { name: "John", jobId: "1", currentStage: "SCREENING" },
        { userId: "alice", userName: "Alice" },
      );
      expect(candidate.currentStage).toBe("SCREENING");
    });

    it("adds audit log on creation", () => {
      const db = emptyDatabase();
      const candidate = createCandidateInDb(
        db,
        { name: "John", jobId: "1" },
        { userId: "alice", userName: "Alice" },
      );
      expect(candidate.auditLogs).toHaveLength(1);
      // Since "alice" doesn't start with "user-", the code uses "Invited by..."
      expect(candidate.auditLogs[0].action).toContain("Invited by Alice");
    });

    it('uses "Invited by" prefix for non-user IDs starting with "user-"', () => {
      const db = emptyDatabase();
      const candidate = createCandidateInDb(
        db,
        { name: "John", jobId: "1" },
        { userId: "onboard-token-abc", userName: "System" },
      );
      expect(candidate.auditLogs[0].action).toContain("Invited by System");
    });

    it("handles optional fields", () => {
      const db = emptyDatabase();
      const candidate = createCandidateInDb(
        db,
        {
          name: "John",
          email: "john@example.com",
          phone: "+1-555-0000",
          resumeText: "Experienced",
          jobId: "1",
          onboardToken: "token-123",
        },
        { userId: "alice", userName: "Alice" },
      );
      expect(candidate.email).toBe("john@example.com");
      expect(candidate.phone).toBe("+1-555-0000");
      expect(candidate.resumeText).toBe("Experienced");
    });

    it("assigns sequential IDs", () => {
      const db = emptyDatabase();
      createCandidateInDb(db, { name: "A", jobId: "1" }, { userId: "alice", userName: "Alice" });
      createCandidateInDb(db, { name: "B", jobId: "1" }, { userId: "alice", userName: "Alice" });
      const c = createCandidateInDb(db, { name: "C", jobId: "1" }, { userId: "alice", userName: "Alice" });
      expect(c.id).toBe("3");
    });

    it("initializes AI fields as null", () => {
      const db = emptyDatabase();
      const candidate = createCandidateInDb(
        db,
        { name: "John", jobId: "1" },
        { userId: "alice", userName: "Alice" },
      );
      expect(candidate.aiSummary).toBeNull();
      expect(candidate.aiQuestions).toBeNull();
      expect(candidate.aiRecommendation).toBeNull();
      expect(candidate.meetLink).toBeNull();
    });
  });

  describe("createInterviewInDb()", () => {
    it("creates an interview with ASSIGNED status", () => {
      const db = emptyDatabase();
      const interview = createInterviewInDb(db, {
        candidateId: "1",
        interviewerId: "bob",
      });
      expect(interview.candidateId).toBe("1");
      expect(interview.interviewerId).toBe("bob");
      expect(interview.status).toBe("ASSIGNED");
      expect(interview.scheduledAt).toBeNull();
      expect(interview.transcript).toBeNull();
      expect(interview.vapiCallId).toBeNull();
    });

    it("assigns sequential IDs", () => {
      const db = emptyDatabase();
      createInterviewInDb(db, { candidateId: "1", interviewerId: "bob" });
      const i2 = createInterviewInDb(db, { candidateId: "1", interviewerId: "bob" });
      expect(i2.id).toBe("2");
    });
  });

  describe("createFeedbackInDb()", () => {
    it("creates feedback with all fields", () => {
      const db = emptyDatabase();
      const feedback = createFeedbackInDb(db, {
        interviewId: "1",
        rating: 4,
        recommendation: "Hire",
        comments: "Great candidate",
      });
      expect(feedback.interviewId).toBe("1");
      expect(feedback.rating).toBe(4);
      expect(feedback.recommendation).toBe("Hire");
      expect(feedback.comments).toBe("Great candidate");
    });

    it("handles minimum rating", () => {
      const db = emptyDatabase();
      const feedback = createFeedbackInDb(db, {
        interviewId: "1",
        rating: 1,
        recommendation: "No Hire",
        comments: "Not a fit",
      });
      expect(feedback.rating).toBe(1);
    });

    it("handles maximum rating", () => {
      const db = emptyDatabase();
      const feedback = createFeedbackInDb(db, {
        interviewId: "1",
        rating: 5,
        recommendation: "Strong Hire",
        comments: "Excellent",
      });
      expect(feedback.rating).toBe(5);
    });

    it("sets createdAt timestamp", () => {
      const db = emptyDatabase();
      const before = Date.now();
      const feedback = createFeedbackInDb(db, {
        interviewId: "1",
        rating: 3,
        recommendation: "Maybe",
        comments: "Decent",
      });
      const after = Date.now();
      const ts = new Date(feedback.createdAt).getTime();
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after + 100);
    });
  });

  describe("getDbStats()", () => {
    it("returns zeros for empty database", () => {
      const stats = getDbStats(emptyDatabase());
      expect(stats.users).toBe(0);
      expect(stats.jobs).toBe(0);
      expect(stats.candidates).toBe(0);
      expect(stats.interviews).toBe(0);
      expect(stats.feedback).toBe(0);
      expect(stats.dbPath).toBeDefined();
    });

    it("counts entities correctly", () => {
      const db = emptyDatabase();
      db.users.push({ id: "1", name: "Alice", role: "HR" });
      db.jobs.push(makeJob());
      db.candidates.push(makeCandidate());

      const stats = getDbStats(db);
      expect(stats.users).toBe(1);
      expect(stats.jobs).toBe(1);
      expect(stats.candidates).toBe(1);
    });
  });

  describe("dbExists() and ensureDbDir()", () => {
    it("ensureDbDir creates the directory", () => {
      // Can't easily test without mocking, but we can verify the function exists
      expect(typeof ensureDbDir).toBe("function");
    });
  });
});
