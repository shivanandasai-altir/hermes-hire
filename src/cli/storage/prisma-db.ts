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
  candidateId: number,
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
      auditLogs: logs,
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
  collection: "jobs" | "candidates" | "interviews" | "feedback",
): Promise<number> {
  const model = {
    jobs: db.job,
    candidates: db.candidate,
    interviews: db.interview,
    feedback: db.feedback,
  }[collection];

  const agg = await model.aggregate({ _max: { id: true } });
  return (agg._max.id ?? 0) + 1;
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
