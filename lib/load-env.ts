import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

let loaded = false;

/** Load `.env` from project root (for CLI and seed scripts). */
export function loadProjectEnv(): void {
  if (loaded) return;

  const roots = [
    process.cwd(),
    resolve(dirname(fileURLToPath(import.meta.url)), ".."),
  ];

  for (const root of roots) {
    const envPath = resolve(root, ".env");
    if (existsSync(envPath)) {
      config({ path: envPath });
      loaded = true;
      return;
    }
  }

  config();
  loaded = true;
}

export function hasDatabaseUrl(): boolean {
  loadProjectEnv();
  return Boolean(process.env.DATABASE_URL?.trim());
}
