import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { seedNeonDatabase, neonHasData } from "@/lib/prisma-seed";
import type { Stage } from "@/lib/constants";
import { assertStageTransition } from "./db";
import type {
  AuditLogEntry,
  Candidate,
  Database,
  Feedback,
  Interview,
  Job,
} from "./types";

export { seedNeonDatabase, neonHasData };

function parseAuditLogs(value: unknown): AuditLogEntry[] {
  if (!Array.isArray(value)) return [];
  return value as AuditLogEntry[];
}

export async function readDbFromNeon(): Promise<Database> {
  const [users, jobs, candidates, interviews, feedback] = await Promise.all([
    db.user.findMany({ orderBy: { id: "asc" } }),
    db.job.findMany({ orderBy: { id: "asc" } }),
    db.candidate.findMany({ orderBy: { id: "asc" } }),
    db.interview.findMany({ orderBy: { id: "asc" } }),
    db.feedback.findMany({ orderBy: { id: "asc" } }),
  ]);

  return {
    version: 1,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      role: u.role as Database["users"][0]["role"],
    })),
    jobs: jobs.map(
      (j): Job => ({
        id: j.id,
        title: j.title,
        department: j.department,
        status: j.status as Job["status"],
        createdById: j.createdById,
        createdAt: j.createdAt.toISOString(),
      }),
    ),
    candidates: candidates.map(
      (c): Candidate => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        resumeText: c.resumeText,
        currentStage: c.currentStage as Stage,
        jobId: c.jobId,
        aiSummary: c.aiSummary,
        aiQuestions: c.aiQuestions,
        aiRecommendation: c.aiRecommendation,
        meetLink: c.meetLink,
        auditLogs: parseAuditLogs(c.auditLogs),
        createdAt: c.createdAt.toISOString(),
      }),
    ),
    interviews: interviews.map(
      (i): Interview => ({
        id: i.id,
        candidateId: i.candidateId,
        interviewerId: i.interviewerId,
        status: i.status as Interview["status"],
        scheduledAt: i.scheduledAt?.toISOString() ?? null,
        transcript: i.transcript,
        vapiCallId: i.vapiCallId,
      }),
    ),
    feedback: feedback.map(
      (f): Feedback => ({
        id: f.id,
        interviewId: f.interviewId,
        rating: f.rating,
        recommendation: f.recommendation,
        comments: f.comments,
        createdAt: f.createdAt.toISOString(),
      }),
    ),
  };
}

export async function moveCandidateStageNeon(
  candidateId: string,
  newStage: Stage,
  audit: Omit<AuditLogEntry, "timestamp" | "action"> & {
    action?: string;
    details?: string;
  },
): Promise<Candidate> {
  const row = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!row) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  const from = row.currentStage as Stage;
  assertStageTransition(from, newStage);

  const logs = parseAuditLogs(row.auditLogs);
  logs.push({
    action: audit.action ?? `Moved from ${from} to ${newStage}`,
    userId: audit.userId,
    userName: audit.userName,
    timestamp: new Date().toISOString(),
    details: audit.details,
  });

  await db.candidate.update({
    where: { id: candidateId },
    data: {
      currentStage: newStage,
      auditLogs: logs as unknown as Prisma.InputJsonValue,
    },
  });

  const database = await readDbFromNeon();
  const candidate = database.candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    throw new Error(`Candidate ${candidateId} not found after update`);
  }
  return candidate;
}

export async function nextIdNeon(
  _collection: "jobs" | "candidates" | "interviews" | "feedback",
): Promise<string> {
  // Prisma generates cuid IDs automatically for new rows, so this is only
  // useful as a client-side placeholder. Return a random cuid-like string.
  return generateClientId();
}

function generateClientId(): string {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `c${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export async function createJobInNeon(
  title: string,
  department: string,
  createdById: string,
): Promise<Job> {
  const row = await db.job.create({
    data: {
      title,
      department,
      status: "OPEN",
      createdById,
    },
  });
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    status: row.status as Job["status"],
    createdById: row.createdById,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function createCandidateInNeon(
  data: {
    name: string;
    email?: string;
    phone?: string;
    resumeText?: string;
    jobId: string;
    currentStage?: Stage;
    onboardToken?: string;
  },
  audit: { userId: string; userName: string },
): Promise<Candidate> {
  const row = await db.candidate.create({
    data: {
      name: data.name,
      email: data.email ?? "",
      phone: data.phone ?? null,
      resumeText: data.resumeText ?? "",
      currentStage: data.currentStage ?? "APPLIED",
      jobId: data.jobId,
      onboardToken: data.onboardToken ?? null,
      auditLogs: [
        {
          action: audit.userId.startsWith("user-")
            ? `Added by ${audit.userName}`
            : `Invited by ${audit.userName}`,
          userId: audit.userId,
          userName: audit.userName,
          timestamp: new Date().toISOString(),
        },
      ] as unknown as Prisma.InputJsonValue,
    },
  });
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    resumeText: row.resumeText,
    currentStage: row.currentStage as Stage,
    jobId: row.jobId,
    aiSummary: row.aiSummary,
    aiQuestions: row.aiQuestions,
    aiRecommendation: row.aiRecommendation,
    meetLink: row.meetLink,
    auditLogs: parseAuditLogs(row.auditLogs),
    createdAt: row.createdAt.toISOString(),
  };
}

export function getNeonDbLabel(): string {
  const url = process.env.DATABASE_URL ?? "";
  try {
    const host = new URL(url).hostname;
    return host.includes("neon") ? `Neon (${host})` : `Postgres (${host})`;
  } catch {
    return "Postgres (DATABASE_URL)";
  }
}
