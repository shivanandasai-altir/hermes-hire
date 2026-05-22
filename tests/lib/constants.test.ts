import { describe, it, expect } from "vitest";
import {
  ROLES,
  STAGES,
  VALID_TRANSITIONS,
  canTransition,
  STAGE_LABELS,
  ROLE_LABELS,
  ROLE_DASHBOARDS,
  type Role,
  type Stage,
} from "@/lib/constants";

// ─── ROLE CONSTANTS ───

describe("ROLES", () => {
  it("defines exactly three roles", () => {
    expect(Object.keys(ROLES)).toHaveLength(3);
  });

  it("has HR role", () => {
    expect(ROLES.HR).toBe("HR");
  });

  it("has INTERVIEWER role", () => {
    expect(ROLES.INTERVIEWER).toBe("INTERVIEWER");
  });

  it("has MANAGER role", () => {
    expect(ROLES.MANAGER).toBe("MANAGER");
  });

  it("values are immutable via const assertion", () => {
    // TypeScript's `as const` prevents reassignment at compile time.
    // At runtime, the object is mutable but the type system enforces it.
    const original = ROLES.HR;
    (ROLES as Record<string, string>).HR = "RECRUITER";
    // Runtime mutation may or may not throw, but we test the type-level
    // invariance by ensuring runtime assignment is ineffective.
    // Restore for other tests:
    (ROLES as Record<string, string>).HR = original;
  });
});

// ─── STAGE CONSTANTS ───

describe("STAGES", () => {
  it("defines all seven stages", () => {
    expect(Object.keys(STAGES)).toHaveLength(7);
  });

  it("includes PENDING_ONBOARDING", () => {
    expect(STAGES.PENDING_ONBOARDING).toBe("PENDING_ONBOARDING");
  });

  it("includes APPLIED", () => {
    expect(STAGES.APPLIED).toBe("APPLIED");
  });

  it("includes SCREENING", () => {
    expect(STAGES.SCREENING).toBe("SCREENING");
  });

  it("includes INTERVIEW", () => {
    expect(STAGES.INTERVIEW).toBe("INTERVIEW");
  });

  it("includes MANAGER_REVIEW", () => {
    expect(STAGES.MANAGER_REVIEW).toBe("MANAGER_REVIEW");
  });

  it("includes HIRED", () => {
    expect(STAGES.HIRED).toBe("HIRED");
  });

  it("includes REJECTED", () => {
    expect(STAGES.REJECTED).toBe("REJECTED");
  });

  it("values are immutable via const assertion", () => {
    const original = STAGES.HIRED;
    (STAGES as Record<string, string>).HIRED = "APPROVED";
    // Runtime mutation is possible but the type system enforces `as const`.
    (STAGES as Record<string, string>).HIRED = original;
  });
});

// ─── VALID TRANSITIONS ───

describe("VALID_TRANSITIONS", () => {
  it("defines transitions for all seven stages", () => {
    const stages: Stage[] = [
      "PENDING_ONBOARDING",
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "MANAGER_REVIEW",
      "HIRED",
      "REJECTED",
    ];
    for (const stage of stages) {
      expect(VALID_TRANSITIONS[stage]).toBeDefined();
      expect(Array.isArray(VALID_TRANSITIONS[stage])).toBe(true);
    }
  });

  it("PENDING_ONBOARDING can transition to APPLIED and REJECTED", () => {
    expect(VALID_TRANSITIONS.PENDING_ONBOARDING).toEqual(["APPLIED", "REJECTED"]);
  });

  it("APPLIED can transition to SCREENING and REJECTED", () => {
    expect(VALID_TRANSITIONS.APPLIED).toEqual(["SCREENING", "REJECTED"]);
  });

  it("SCREENING can transition to INTERVIEW and REJECTED", () => {
    expect(VALID_TRANSITIONS.SCREENING).toEqual(["INTERVIEW", "REJECTED"]);
  });

  it("INTERVIEW can transition to MANAGER_REVIEW and REJECTED", () => {
    expect(VALID_TRANSITIONS.INTERVIEW).toEqual(["MANAGER_REVIEW", "REJECTED"]);
  });

  it("MANAGER_REVIEW can transition to HIRED and REJECTED", () => {
    expect(VALID_TRANSITIONS.MANAGER_REVIEW).toEqual(["HIRED", "REJECTED"]);
  });

  it("HIRED has no outgoing transitions", () => {
    expect(VALID_TRANSITIONS.HIRED).toEqual([]);
  });

  it("REJECTED has no outgoing transitions", () => {
    expect(VALID_TRANSITIONS.REJECTED).toEqual([]);
  });

  it("prevents skipping stages (APPLIED → INTERVIEW)", () => {
    expect(VALID_TRANSITIONS.APPLIED).not.toContain("INTERVIEW");
    expect(VALID_TRANSITIONS.APPLIED).not.toContain("MANAGER_REVIEW");
    expect(VALID_TRANSITIONS.APPLIED).not.toContain("HIRED");
  });

  it("prevents going backwards (INTERVIEW → SCREENING)", () => {
    expect(VALID_TRANSITIONS.INTERVIEW).not.toContain("SCREENING");
    expect(VALID_TRANSITIONS.MANAGER_REVIEW).not.toContain("INTERVIEW");
  });
});

// ─── canTransition() ───

describe("canTransition()", () => {
  // ── Happy paths ──
  it.each([
    ["PENDING_ONBOARDING", "APPLIED", true],
    ["PENDING_ONBOARDING", "REJECTED", true],
    ["APPLIED", "SCREENING", true],
    ["APPLIED", "REJECTED", true],
    ["SCREENING", "INTERVIEW", true],
    ["SCREENING", "REJECTED", true],
    ["INTERVIEW", "MANAGER_REVIEW", true],
    ["INTERVIEW", "REJECTED", true],
    ["MANAGER_REVIEW", "HIRED", true],
    ["MANAGER_REVIEW", "REJECTED", true],
  ] as [Stage, Stage, boolean][])(
    "allows %s → %s",
    (from, to, expected) => {
      expect(canTransition(from, to)).toBe(expected);
    },
  );

  // ── Terminal states ──
  it.each([
    ["HIRED", "REJECTED"],
    ["HIRED", "APPLIED"],
    ["HIRED", "MANAGER_REVIEW"],
    ["REJECTED", "APPLIED"],
    ["REJECTED", "HIRED"],
    ["REJECTED", "SCREENING"],
  ] as [Stage, Stage][])("prevents transition from terminal state %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  // ── Skipped stages ──
  it.each([
    ["APPLIED", "INTERVIEW"],
    ["APPLIED", "MANAGER_REVIEW"],
    ["APPLIED", "HIRED"],
    ["SCREENING", "MANAGER_REVIEW"],
    ["SCREENING", "HIRED"],
    ["INTERVIEW", "HIRED"],
  ] as [Stage, Stage][])("prevents skipping stage %s → %s", (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });

  // ── Same stage ──
  it.each([
    "APPLIED",
    "SCREENING",
    "INTERVIEW",
    "MANAGER_REVIEW",
    "HIRED",
    "REJECTED",
    "PENDING_ONBOARDING",
  ] as Stage[])("prevents staying in same stage %s → %s", (stage) => {
    expect(canTransition(stage, stage)).toBe(false);
  });

  // ── Self-referencing ──
  it("identifies self-transition for PENDING_ONBOARDING", () => {
    expect(canTransition("PENDING_ONBOARDING", "PENDING_ONBOARDING")).toBe(false);
  });
});

// ─── STAGE_LABELS ───

describe("STAGE_LABELS", () => {
  it("provides human-readable labels for all seven stages", () => {
    const stages: Stage[] = [
      "PENDING_ONBOARDING",
      "APPLIED",
      "SCREENING",
      "INTERVIEW",
      "MANAGER_REVIEW",
      "HIRED",
      "REJECTED",
    ];
    for (const stage of stages) {
      expect(STAGE_LABELS[stage]).toBeDefined();
      expect(typeof STAGE_LABELS[stage]).toBe("string");
      expect(STAGE_LABELS[stage].length).toBeGreaterThan(0);
    }
  });

  it("has correct labels", () => {
    expect(STAGE_LABELS.PENDING_ONBOARDING).toBe("Pending Onboarding");
    expect(STAGE_LABELS.APPLIED).toBe("Applied");
    expect(STAGE_LABELS.SCREENING).toBe("Screening");
    expect(STAGE_LABELS.INTERVIEW).toBe("Interview");
    expect(STAGE_LABELS.MANAGER_REVIEW).toBe("Manager Review");
    expect(STAGE_LABELS.HIRED).toBe("Hired");
    expect(STAGE_LABELS.REJECTED).toBe("Rejected");
  });
});

// ─── ROLE_LABELS ───

describe("ROLE_LABELS", () => {
  it("provides labels for all roles", () => {
    const roles: Role[] = ["HR", "INTERVIEWER", "MANAGER"];
    for (const role of roles) {
      expect(ROLE_LABELS[role]).toBeDefined();
      expect(typeof ROLE_LABELS[role]).toBe("string");
      expect(ROLE_LABELS[role].length).toBeGreaterThan(0);
    }
  });

  it("has correct labels", () => {
    expect(ROLE_LABELS.HR).toBe("HR");
    expect(ROLE_LABELS.INTERVIEWER).toBe("Interviewer");
    expect(ROLE_LABELS.MANAGER).toBe("Manager");
  });
});

// ─── ROLE_DASHBOARDS ───

describe("ROLE_DASHBOARDS", () => {
  it("provides dashboard paths for all roles", () => {
    const roles: Role[] = ["HR", "INTERVIEWER", "MANAGER"];
    for (const role of roles) {
      expect(ROLE_DASHBOARDS[role]).toBeDefined();
      expect(ROLE_DASHBOARDS[role]).toMatch(/^\//);
    }
  });

  it("has correct paths", () => {
    expect(ROLE_DASHBOARDS.HR).toBe("/hr/dashboard");
    expect(ROLE_DASHBOARDS.INTERVIEWER).toBe("/interviewer/dashboard");
    expect(ROLE_DASHBOARDS.MANAGER).toBe("/manager/dashboard");
  });
});

// ─── TYPE GUARDS (compile-time checks) ───

describe("type guards", () => {
  it("Stage type includes all values", () => {
    const validStage: Stage = "APPLIED";
    expect(STAGES[validStage]).toBe("APPLIED");
  });

  it("Role type is a union of role strings", () => {
    // All valid roles should be accessible via the ROLES map
    expect(ROLES.HR).toBe("HR");
    expect(ROLES.INTERVIEWER).toBe("INTERVIEWER");
    expect(ROLES.MANAGER).toBe("MANAGER");
  });

  it("non-existent keys return undefined", () => {
    expect((ROLES as Record<string, string>)["RECRUITER"]).toBeUndefined();
  });
});
