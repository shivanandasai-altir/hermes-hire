#!/usr/bin/env node

/**
 * Hermes-Hire CLI launcher — runs TypeScript entry via tsx.
 */
import { spawnSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const tsxBin = join(root, "node_modules", "tsx", "dist", "cli.mjs");
const entry = join(root, "src", "cli", "index.ts");
const args = process.argv.slice(2);

const result = spawnSync(process.execPath, [tsxBin, entry, ...args], {
  stdio: "inherit",
  cwd: root,
  env: process.env,
});

process.exit(result.status ?? 1);
