import { Command } from "commander";
import chalk from "chalk";
import { getConfig, setConfig } from "../storage/config";

const USERS: Record<string, { name: string; role: string }> = {
  alice: { name: "Alice", role: "HR" },
  bob: { name: "Bob", role: "INTERVIEWER" },
  carol: { name: "Carol", role: "MANAGER" },
};

export const authCommand = new Command("auth")
  .description("Manage authentication and role switching")
  .option("-k, --key <api-key>", "Set Hermes API key")
  .option("-a, --as <user>", "Switch active user (alice, bob, carol)")
  .option("--vapi-key <key>", "Set Vapi API key")
  .option("--seed", "Seed demo data")
  .action((opts) => {
    if (opts.key) {
      setConfig("hermesApiKey", opts.key);
      console.log(chalk.green("✅ API key saved"));
      return;
    }

    if (opts.vapiKey) {
      setConfig("vapiApiKey", opts.vapiKey);
      console.log(chalk.green("✅ Vapi API key saved"));
      return;
    }

    if (opts.as) {
      const user = USERS[opts.as.toLowerCase()];
      if (!user) {
        console.log(chalk.red(`❌ Unknown user: ${opts.as}. Use: alice, bob, carol`));
        return;
      }
      setConfig("activeUserId", opts.as.toLowerCase());
      console.log(chalk.green(`✅ Switched to ${chalk.bold(user.name)} (${user.role})`));
      return;
    }

    if (opts.seed) {
      setConfig("activeUserId", "alice");
      console.log(chalk.green("✅ Demo data seeded"));
      console.log(chalk.dim("   Users: alice (HR), bob (Interviewer), carol (Manager)"));
      return;
    }

    // Show current status
    const cfg = getConfig();
    const activeUser = cfg.activeUserId ? USERS[cfg.activeUserId] : null;
    console.log("");
    console.log(chalk.hex("#d4a853")("  Current Session"));
    console.log(chalk.dim("  ───────────────────"));
    if (activeUser) {
      console.log(`  User:  ${chalk.bold(activeUser.name)} (${activeUser.role})`);
    } else {
      console.log(`  User:  ${chalk.dim("not set")}`);
    }
    console.log(`  API:   ${cfg.hermesApiKey ? chalk.green("✓ configured") : chalk.red("✗ missing")}`);
    console.log(`  Vapi:  ${cfg.vapiApiKey ? chalk.green("✓ configured") : chalk.dim("not set")}`);
    console.log("");
  });
