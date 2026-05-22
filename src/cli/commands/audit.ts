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

export const auditCommand = new Command("audit")
  .description("Show audit timeline for a candidate")
  .argument("<candidate-id>", "Candidate ID")
  .action(async (candidateId: string) => {
    requireRole(["HR", "INTERVIEWER", "MANAGER"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    console.log("");
    console.log(chalk.hex("#d4a853")(`  📋 Audit Timeline: ${chalk.bold(candidate.name)}`));
    console.log(chalk.dim("  ──────────────────────────────────"));

    const logs = candidate.auditLogs;
    if (!logs || logs.length === 0) {
      console.log(chalk.dim("  No audit entries."));
      console.log("");
      return;
    }

    // Sort reverse chronological
    const sorted = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );

    for (const log of sorted) {
      const date = new Date(log.timestamp);
      const dateStr = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const timeStr = date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const icon = getActionIcon(log.action);
      console.log(`  ${chalk.dim(`${dateStr} ${timeStr}`)}`);
      console.log(`  ${icon} ${log.action}`);
      if (log.userName) {
        console.log(`    ${chalk.dim("by")} ${log.userName}`);
      }
      console.log("");
    }

    console.log(chalk.dim(`  ${logs.length} entries total`));
    console.log("");
  });

function getActionIcon(action: string): string {
  if (action.includes("Added") || action.includes("Invited")) return "➕";
  if (action.includes("Summary")) return "🤖";
  if (action.includes("Questions")) return "❓";
  if (action.includes("Moved")) return "➡️";
  if (action.includes("Feedback") || action.includes("simulated")) return "📝";
  if (action.includes("Hired")) return "✅";
  if (action.includes("Rejected")) return "❌";
  if (action.includes("Google Meet") || action.includes("Meet")) return "📅";
  if (action.includes("Interview simulated")) return "🎙️";
  return "•";
}
