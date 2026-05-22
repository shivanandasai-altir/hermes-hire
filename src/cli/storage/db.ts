import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  canTransition,
  VALID_TRANSITIONS,
  type Stage,
} from "@/lib/constants";
import { createDemoDatabase } from "@/lib/demo-seed";
import type {
  AuditLogEntry,
  Candidate,
  Database,
} from "./types";

export const DB_DIR = path.join(os.homedir(), ".hermeshire");
export const DB_PATH = path.join(DB_DIR, "db.json");

export function emptyDatabase(): Database {
  return {
    version: 1,
    users: [],
    jobs: [],
    candidates: [],
    interviews: [],
    feedback: [],
  };
}

export function ensureDbDir(): void {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
}

export function dbExists(): boolean {
  return fs.existsSync(DB_PATH);
}

export function readDb(): Database {
  ensureDbDir();
  if (!dbExists()) {
    return emptyDatabase();
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  const parsed = JSON.parse(raw) as Database;
  return {
    ...emptyDatabase(),
    ...parsed,
    users: parsed.users ?? [],
    jobs: parsed.jobs ?? [],
    candidates: parsed.candidates ?? [],
    interviews: parsed.interviews ?? [],
    feedback: parsed.feedback ?? [],
  };
}

export function writeDb(db: Database): void {
  ensureDbDir();
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2) + "\n", "utf-8");
}

export type IdCollection = "jobs" | "candidates" | "interviews" | "feedback";

export function nextId(db: Database, collection: IdCollection): string {
  const items = db[collection];
  const highest = items.reduce((max, item) => {
    const n = Number(item.id);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return String(highest + 1);
}

export function assertStageTransition(from: Stage, to: Stage): void {
  if (from === to) {
    throw new Error(`Candidate is already in stage ${to}`);
  }
  if (!canTransition(from, to)) {
    const allowed = VALID_TRANSITIONS[from]?.join(", ") || "none";
    throw new Error(`Invalid stage transition: ${from} → ${to}. Allowed: ${allowed}`);
  }
}

export function appendAuditLog(
  candidate: Candidate,
  entry: Omit<AuditLogEntry, "timestamp"> & { timestamp?: string },
): void {
  candidate.auditLogs.push({
    ...entry,
    timestamp: entry.timestamp ?? new Date().toISOString(),
  });
}

export function moveCandidateStage(
  db: Database,
  candidateId: string,
  newStage: Stage,
  audit: Omit<AuditLogEntry, "timestamp" | "action"> & {
    action?: string;
    details?: string;
  },
): Candidate {
  const candidate = db.candidates.find((c) => c.id === candidateId);
  if (!candidate) {
    throw new Error(`Candidate ${candidateId} not found`);
  }

  const from = candidate.currentStage;
  assertStageTransition(from, newStage);

  candidate.currentStage = newStage;
  appendAuditLog(candidate, {
    action: audit.action ?? `Moved from ${from} to ${newStage}`,
    userId: audit.userId,
    userName: audit.userName,
    details: audit.details,
  });

  writeDb(db);
  return candidate;
}

export function createSeedDatabase(): Database {
  return createDemoDatabase();
}

export function seedDatabase(force = false): Database {
  if (dbExists() && !force) {
    const existing = readDb();
    if (
      existing.jobs.length > 0 ||
      existing.candidates.length > 0 ||
      existing.users.length > 0
    ) {
      throw new Error(
        "Database already has data. Use --seed --force to replace demo data.",
      );
    }
  }

  const db = createSeedDatabase();
  writeDb(db);
  return db;
}

export function getDbStats(db: Database) {
  return {
    users: db.users.length,
    jobs: db.jobs.length,
    candidates: db.candidates.length,
    interviews: db.interviews.length,
    feedback: db.feedback.length,
    dbPath: DB_PATH,
  };
}
