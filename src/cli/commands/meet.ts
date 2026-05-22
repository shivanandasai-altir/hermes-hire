import { Command } from "commander";
import chalk from "chalk";
import { readDb } from "../storage/store";
import { getConfig } from "../storage/config";

const USERS: Record<string, { name: string; role: string }> = {
  alice: { name: "Alice", role: "HR" },
  bob: { name: "Bob", role: "INTERVIEWER" },
  carol: { name: "Carol", role: "MANAGER" },
};

function getActiveUser(): { id: string; name: string; role: string } | null {
  const cfg = getConfig();
  if (!cfg.activeUserId) return null;
  const user = USERS[cfg.activeUserId];
  if (!user) return null;
  return { id: cfg.activeUserId, name: user.name, role: user.role };
}

function requireRole(allowed: string[]): { id: string; name: string } {
  const user = getActiveUser();
  if (!user) {
    console.log(chalk.red("❌ Not logged in. Use: hermes auth --as <user>"));
    process.exit(1);
  }
  if (!allowed.includes(user.role)) {
    console.log(chalk.red(`❌ ${user.role} cannot run this command`));
    process.exit(1);
  }
  return { id: user.id, name: user.name };
}

export const meetCommand = new Command("meet")
  .description("Schedule Google Meet calls");

meetCommand
  .command("schedule")
  .description("Schedule a Google Meet call with natural language")
  .argument("<candidate-id>", "Candidate ID")
  .argument("<request>", 'Natural language request (e.g. "tomorrow at 2pm")')
  .action(async (candidateId: string, request: string) => {
    const user = requireRole(["HR", "MANAGER"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    console.log(chalk.dim("  🤖 Parsing request with Hermes..."));
    console.log(chalk.dim(`  "${request}"`));

    try {
      const { scheduleMeetingWithHermes } = await import("@/lib/meet");
      const result = await scheduleMeetingWithHermes(
        request,
        candidate.name,
        job?.title || "Unknown",
        candidate.email || undefined,
      );

      if (!result.success) {
        console.log(chalk.red(`\n  ❌ ${result.error}`));
        if (result.error?.includes("gog")) {
          console.log(chalk.dim("  Install: brew install gogcli"));
          console.log(chalk.dim("  Auth:    gog auth add your@email.com --services calendar"));
        }
        return;
      }

      // Store the meet link on the candidate
      if (result.meetLink) {
        candidate.meetLink = result.meetLink;
        candidate.auditLogs.push({
          action: `Google Meet scheduled: ${result.meetLink}`,
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
        });
        const { writeDb } = await import("../storage/db");
        writeDb(db);
      }

      console.log(chalk.hex("#d4a853")(`\n  📅 Google Meet created!`));
      console.log(`  ${chalk.bold(result.meetLink || "No link returned")}`);
      console.log(chalk.dim("  Link stored on candidate record"));
    } catch (err: unknown) {
      console.log(chalk.red(`\n  ❌ Error: ${err instanceof Error ? err.message : "Unknown"}`));
    }
  });
