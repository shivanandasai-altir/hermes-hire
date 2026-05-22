import { hasDatabaseUrl } from "@/lib/load-env";
import type { Stage } from "@/lib/constants";
import type { AuditLogEntry, Candidate, Database } from "./types";
import * as jsonDb from "./db";
import * as neonDb from "./prisma-db";

export type StorageBackend = "neon" | "json";

export function getStorageBackend(): StorageBackend {
  return hasDatabaseUrl() ? "neon" : "json";
}

export async function readDb(): Promise<Database> {
  if (getStorageBackend() === "neon") {
    return neonDb.readDbFromNeon();
  }
  return jsonDb.readDb();
}

export async function seedAllDatabases(force = false): Promise<{
  backend: StorageBackend;
  json?: Database;
  neon?: Database;
}> {
  const backend = getStorageBackend();
  const result: { backend: StorageBackend; json?: Database; neon?: Database } = {
    backend,
  };

  if (backend === "neon") {
    await neonDb.seedNeonDatabase(force);
    result.neon = await neonDb.readDbFromNeon();
    return result;
  }

  result.json = jsonDb.seedDatabase(force);
  return result;
}

export async function getDbStats(db: Database) {
  const base = jsonDb.getDbStats(db);
  return {
    ...base,
    backend: getStorageBackend(),
    label:
      getStorageBackend() === "neon"
        ? neonDb.getNeonDbLabel()
        : base.dbPath,
  };
}

export async function moveCandidateStage(
  candidateId: string,
  newStage: Stage,
  audit: Omit<AuditLogEntry, "timestamp" | "action"> & {
    action?: string;
    details?: string;
  },
): Promise<Candidate> {
  if (getStorageBackend() === "neon") {
    return neonDb.moveCandidateStageNeon(candidateId, newStage, audit);
  }
  const db = jsonDb.readDb();
  return jsonDb.moveCandidateStage(db, candidateId, newStage, audit);
}

export async function nextId(
  collection: jsonDb.IdCollection,
): Promise<string> {
  if (getStorageBackend() === "neon") {
    return neonDb.nextIdNeon(collection);
  }
  const db = jsonDb.readDb();
  return jsonDb.nextId(db, collection);
}

export { assertStageTransition } from "./db";
export { DB_PATH } from "./db";
