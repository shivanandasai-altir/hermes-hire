import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We use vi.mock to control the env loading behavior
vi.mock("@/lib/load-env", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/load-env")>();
  return {
    ...actual,
    // Override loadProjectEnv to not load from .env file
    loadProjectEnv: vi.fn(),
  };
});

describe("hasDatabaseUrl()", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("returns true when DATABASE_URL is set and non-empty", async () => {
    process.env.DATABASE_URL = "postgresql://localhost:5432/hermes";
    const { hasDatabaseUrl } = await import("@/lib/load-env");
    // hasDatabaseUrl calls loadProjectEnv which is now a no-op mock
    expect(hasDatabaseUrl()).toBe(true);
  });

  it("returns false when DATABASE_URL is empty", async () => {
    process.env.DATABASE_URL = "";
    const { hasDatabaseUrl } = await import("@/lib/load-env");
    expect(hasDatabaseUrl()).toBe(false);
  });

  it("returns false when DATABASE_URL is undefined", async () => {
    delete process.env.DATABASE_URL;
    const { hasDatabaseUrl } = await import("@/lib/load-env");
    expect(hasDatabaseUrl()).toBe(false);
  });

  it("returns false when DATABASE_URL is whitespace-only", async () => {
    process.env.DATABASE_URL = "   ";
    const { hasDatabaseUrl } = await import("@/lib/load-env");
    expect(hasDatabaseUrl()).toBe(false);
  });
});
