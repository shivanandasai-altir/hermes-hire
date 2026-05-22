import { describe, it, expect, beforeEach, vi } from "vitest";

// conf uses a file-based store. We mock it with an in-memory store.
// The real Conf class exposes: store (getter), get(key), set(key, value), clear()
const mockStores = new Map<string, Record<string, unknown>>();

const MockConf = vi.fn().mockImplementation(function (
  this: {
    _projectName: string;
    store: Record<string, unknown>;
  },
  opts: { projectName: string; defaults: Record<string, unknown> },
) {
  this._projectName = opts.projectName;
  if (!mockStores.has(opts.projectName)) {
    mockStores.set(opts.projectName, { ...opts.defaults });
  }
  const data = mockStores.get(opts.projectName)!;

  // The conf module accesses `config.store` directly (getter)
  Object.defineProperty(this, "store", {
    get: () => data,
    enumerable: true,
    configurable: true,
  });

  // Conf has set(key, value) method
  this.set = (key: string, value: unknown) => {
    data[key] = value;
  };

  // Conf has get(key) method
  this.get = (key: string) => data[key];

  // Conf has clear() method
  this.clear = () => {
    Object.keys(data).forEach((k) => delete data[k]);
  };
});

vi.mock("conf", () => ({
  default: MockConf,
}));

describe("CLI Config", () => {
  beforeEach(() => {
    mockStores.clear();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("exports getConfig function", async () => {
    const config = await import("@/src/cli/storage/config");
    expect(typeof config.getConfig).toBe("function");
  });

  it("exports setConfig function", async () => {
    const config = await import("@/src/cli/storage/config");
    expect(typeof config.setConfig).toBe("function");
  });

  it("exports clearConfig function", async () => {
    const config = await import("@/src/cli/storage/config");
    expect(typeof config.clearConfig).toBe("function");
  });

  it("has default values for hermesApiUrl and hermesModel", async () => {
    const config = await import("@/src/cli/storage/config");
    const cfg = config.getConfig();
    expect(cfg.hermesApiUrl).toBe("https://inference-api.nousresearch.com/v1");
    expect(cfg.hermesModel).toBe("Hermes-4-70B");
  });

  it("allows setting and getting values", async () => {
    const config = await import("@/src/cli/storage/config");
    config.setConfig("activeUserId", "alice");
    config.setConfig("hermesApiKey", "sk-test");

    const cfg = config.getConfig();
    expect(cfg.activeUserId).toBe("alice");
    expect(cfg.hermesApiKey).toBe("sk-test");
  });

  it("overwrites existing values", async () => {
    const config = await import("@/src/cli/storage/config");
    config.setConfig("activeUserId", "alice");
    config.setConfig("activeUserId", "bob");

    expect(config.getConfig().activeUserId).toBe("bob");
  });

  it("clearConfig resets all values", async () => {
    const config = await import("@/src/cli/storage/config");
    config.setConfig("activeUserId", "alice");
    config.setConfig("hermesApiKey", "sk-test");

    config.clearConfig();

    const cfg = config.getConfig();
    expect(cfg.activeUserId).toBeUndefined();
    expect(cfg.hermesApiKey).toBeUndefined();
  });
});
