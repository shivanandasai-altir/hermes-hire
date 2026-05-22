import { Command } from "commander";
import chalk from "chalk";
import { getConfig } from "../storage/config";
import { getDbStats, readDb, getStorageBackend, DB_PATH } from "../storage/store";

const USERS: Record<string, { name: string; role: string }> = {
  alice: { name: "Alice", role: "HR" },
  bob: { name: "Bob", role: "INTERVIEWER" },
  carol: { name: "Carol", role: "MANAGER" },
};

export const statusCommand = new Command("status")
  .description("Show current config and database stats")
  .action(async () => {
    const cfg = getConfig();
    const active = cfg.activeUserId ? USERS[cfg.activeUserId] : null;
    const backend = getStorageBackend();

    console.log(chalk.hex("#d4a853")("\n  Hermes-Hire Status"));
    console.log(chalk.dim("  ───────────────────"));
    console.log(
      `  Active user:  ${active ? chalk.bold(active.name) + " (" + active.role + ")" : chalk.dim("not set")}`,
    );
    console.log(`  Hermes API:   ${cfg.hermesApiKey ? chalk.green("✓") : chalk.red("✗")}`);
    console.log(`  Vapi:         ${cfg.vapiApiKey ? chalk.green("✓") : chalk.dim("not set")}`);
    console.log(`  Model:        ${chalk.dim(cfg.hermesModel || "Hermes-4-70B")}`);
    console.log(`  Storage:      ${backend === "neon" ? chalk.green("Neon") : chalk.dim("Local JSON")}`);
    console.log("");

    try {
      const db = await readDb();
      const stats = await getDbStats(db);

      console.log(chalk.hex("#d4a853")("  Database"));
      console.log(chalk.dim("  ───────────────────"));
      console.log(
        `  ${backend === "neon" ? "Host" : "Path"}:       ${chalk.dim(stats.label)}`,
      );
      console.log(`  Users:        ${stats.users}`);
      console.log(`  Jobs:         ${stats.jobs}`);
      console.log(`  Candidates:   ${stats.candidates}`);
      console.log(`  Interviews:   ${stats.interviews}`);
      console.log(`  Feedback:     ${stats.feedback}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(chalk.hex("#d4a853")("  Database"));
      console.log(chalk.dim("  ───────────────────"));
      console.log(chalk.red(`  Error: ${message}`));
      if (backend === "neon") {
        console.log(chalk.dim("  Tip: pnpm db:push && pnpm db:seed"));
      } else {
        console.log(chalk.dim(`  Tip: hermes auth --seed  (writes ${DB_PATH})`));
      }
    }
    console.log("");
  });
