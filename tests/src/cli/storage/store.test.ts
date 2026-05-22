import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock load-env so it doesn't load from .env file
vi.mock("@/lib/load-env", () => ({
  hasDatabaseUrl: vi.fn(),
  loadProjectEnv: vi.fn(),
}));

describe("getStorageBackend()", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns "neon" when DATABASE_URL is set', async () => {
    const loadEnv = await import("@/lib/load-env");
    vi.mocked(loadEnv.hasDatabaseUrl).mockReturnValue(true);

    const { getStorageBackend } = await import("@/src/cli/storage/store");
    expect(getStorageBackend()).toBe("neon");
  });

  it('returns "json" when DATABASE_URL is not set', async () => {
    const loadEnv = await import("@/lib/load-env");
    vi.mocked(loadEnv.hasDatabaseUrl).mockReturnValue(false);

    const { getStorageBackend } = await import("@/src/cli/storage/store");
    expect(getStorageBackend()).toBe("json");
  });

  it('returns "json" when DATABASE_URL is empty', async () => {
    const loadEnv = await import("@/lib/load-env");
    vi.mocked(loadEnv.hasDatabaseUrl).mockReturnValue(false);

    const { getStorageBackend } = await import("@/src/cli/storage/store");
    expect(getStorageBackend()).toBe("json");
  });
});

describe("Storage Module Exports", () => {
  it("exports expected API surface", async () => {
    const store = await import("@/src/cli/storage/store");
    expect(typeof store.readDb).toBe("function");
    expect(typeof store.seedAllDatabases).toBe("function");
    expect(typeof store.getDbStats).toBe("function");
    expect(typeof store.moveCandidateStage).toBe("function");
    expect(typeof store.nextId).toBe("function");
    expect(typeof store.createCandidate).toBe("function");
    expect(typeof store.createJob).toBe("function");
    expect(typeof store.getJobs).toBe("function");
    expect(typeof store.assertStageTransition).toBe("function");
    expect(typeof store.getStorageBackend).toBe("function");
  });
});
