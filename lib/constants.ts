export const ROLES = {
  HR: "HR",
  INTERVIEWER: "INTERVIEWER",
  MANAGER: "MANAGER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const STAGES = {
  PENDING_ONBOARDING: "PENDING_ONBOARDING",
  APPLIED: "APPLIED",
  SCREENING: "SCREENING",
  INTERVIEW: "INTERVIEW",
  MANAGER_REVIEW: "MANAGER_REVIEW",
  HIRED: "HIRED",
  REJECTED: "REJECTED",
} as const;

export type Stage = (typeof STAGES)[keyof typeof STAGES];

export const VALID_TRANSITIONS: Record<Stage, Stage[]> = {
  PENDING_ONBOARDING: ["APPLIED", "REJECTED"],
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["MANAGER_REVIEW", "REJECTED"],
  MANAGER_REVIEW: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: [],
};

export function canTransition(from: Stage, to: Stage): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export const STAGE_LABELS: Record<Stage, string> = {
  PENDING_ONBOARDING: "Pending Onboarding",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  MANAGER_REVIEW: "Manager Review",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export const ROLE_LABELS: Record<Role, string> = {
  HR: "HR",
  INTERVIEWER: "Interviewer",
  MANAGER: "Manager",
};

export const ROLE_DASHBOARDS: Record<Role, string> = {
  HR: "/hr/dashboard",
  INTERVIEWER: "/interviewer/dashboard",
  MANAGER: "/manager/dashboard",
};
