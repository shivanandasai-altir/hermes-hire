import { ROLES, STAGES, type Role } from "@/lib/constants";
import type { AuditLogEntry, Database } from "@/src/cli/storage/types";

export const DEMO_RESUME = `Jane Doe — Senior Frontend Engineer

8+ years building React/TypeScript products at scale.
- Led design system migration at Acme Corp (40% faster feature delivery)
- Shipped real-time collaboration features with WebSockets + optimistic UI
- Mentored 4 engineers; strong communicator across eng/design/product

Skills: React, Next.js, TypeScript, GraphQL, Tailwind, testing (Vitest, Playwright)`;

export const DEMO_USERS = [
  { id: "alice", name: "Alice", email: "alice@hermes-hire.xyz", role: ROLES.HR as Role },
  { id: "bob", name: "Bob", email: "bob@hermes-hire.xyz", role: ROLES.INTERVIEWER as Role },
  { id: "carol", name: "Carol", email: "carol@hermes-hire.xyz", role: ROLES.MANAGER as Role },
] as const;

export function buildDemoAuditLogs(now: string): AuditLogEntry[] {
  return [
    {
      action: "Candidate added",
      userId: "alice",
      userName: "Alice",
      timestamp: now,
      details: "Demo seed data",
    },
    {
      action: "Moved from APPLIED to SCREENING",
      userId: "alice",
      userName: "Alice",
      timestamp: now,
    },
    {
      action: "Moved from SCREENING to INTERVIEW",
      userId: "alice",
      userName: "Alice",
      timestamp: now,
    },
    {
      action: "Moved from INTERVIEW to MANAGER_REVIEW",
      userId: "alice",
      userName: "Alice",
      timestamp: now,
    },
  ];
}

/** Shared demo dataset for JSON file and Neon (same IDs and content). */
export function createDemoDatabase(): Database {
  const now = new Date().toISOString();

  return {
    version: 1,
    users: DEMO_USERS.map((u) => ({ id: u.id, name: u.name, role: u.role })),
    jobs: [
      {
        id: 1,
        title: "Senior Frontend Engineer",
        department: "Engineering",
        status: "OPEN",
        createdById: "alice",
        createdAt: now,
      },
    ],
    candidates: [
      {
        id: 1,
        name: "Jane Doe",
        email: "jane.doe@example.com",
        phone: "+1-555-0100",
        resumeText: DEMO_RESUME,
        currentStage: STAGES.MANAGER_REVIEW,
        jobId: 1,
        aiSummary:
          "Strong React/TypeScript background with leadership experience. Excellent fit for Senior Frontend Engineer — recommend proceeding to final review.",
        aiQuestions:
          "1. Describe a complex state management challenge you solved.\n2. How do you approach design system consistency across teams?\n3. Tell us about mentoring engineers through a difficult delivery.",
        aiRecommendation: null,
        meetLink: null,
        auditLogs: buildDemoAuditLogs(now),
        createdAt: now,
      },
    ],
    interviews: [
      {
        id: 1,
        candidateId: 1,
        interviewerId: "bob",
        status: "COMPLETED",
        scheduledAt: null,
        transcript: null,
        vapiCallId: null,
      },
    ],
    feedback: [
      {
        id: 1,
        interviewId: 1,
        rating: 5,
        recommendation: "Strong Hire",
        comments:
          "Excellent communication, deep React knowledge, and clear examples of leadership.",
        createdAt: now,
      },
    ],
  };
}
