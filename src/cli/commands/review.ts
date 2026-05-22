import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { getConfig } from "../storage/config";
import { readDb, moveCandidateStage } from "../storage/store";

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

function requireManager(): { id: string; name: string } {
  const user = getActiveUser();
  if (!user) {
    console.log(chalk.red("❌ Not logged in. Use: hermes auth --as <user>"));
    process.exit(1);
  }
  if (user.role !== "MANAGER") {
    console.log(chalk.red(`❌ Only Manager can run this command (current: ${user.name} — ${user.role})`));
    process.exit(1);
  }
  return { id: user.id, name: user.name };
}

export const reviewCommand = new Command("review")
  .description("Review candidates and make decisions");

// ─── LIST ───
reviewCommand
  .command("list")
  .description("List candidates awaiting manager review")
  .action(async () => {
    requireManager();
    const db = await readDb();
    const candidates = db.candidates.filter((c) => c.currentStage === "MANAGER_REVIEW");

    if (candidates.length === 0) {
      console.log(chalk.dim("  No candidates awaiting review."));
      return;
    }

    const table = new Table({
      head: ["ID", "Name", "AI Summary", "Feedback"],
      colWidths: [28, 22, 36, 24],
      style: { head: [], border: [] },
    });

    for (const c of candidates) {
      const job = db.jobs.find((j) => j.id === c.jobId);
      const interview = db.interviews.find((i) => String(i.candidateId) === String(c.id));
      const feedback = interview ? db.feedback.find((f) => f.interviewId === interview.id) : null;

      const summaryPreview = c.aiSummary ? c.aiSummary.slice(0, 40) + "…" : chalk.dim("—");
      const fbPreview = feedback ? `${feedback.recommendation} (${feedback.rating}/5)` : chalk.dim("—");

      table.push([String(c.id), c.name, summaryPreview, fbPreview]);
    }

    console.log("");
    console.log(chalk.hex("#d4a853")(`  Candidates awaiting review (${candidates.length})`));
    console.log(table.toString());
  });

// ─── SHOW ───
reviewCommand
  .command("show")
  .description("Show full review details for a candidate")
  .argument("<candidate-id>", "Candidate ID")
  .action(async (candidateId: string) => {
    requireManager();
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    const interview = db.interviews.find((i) => String(i.candidateId) === String(candidate.id));
    const feedback = interview ? db.feedback.find((f) => f.interviewId === interview.id) : null;

    console.log("");
    console.log(chalk.hex("#d4a853")(`  Review: ${chalk.bold(candidate.name)}`));
    console.log(chalk.dim("  ──────────────────────────────────"));

    // Candidate info
    console.log(`  Role:     ${job?.title || candidate.jobId}`);
    console.log(`  Stage:    ${candidate.currentStage}`);

    // AI Summary
    console.log(chalk.hex("#d4a853")("\n  🤖 AI Summary:"));
    if (candidate.aiSummary) {
      console.log(`  ${chalk.dim(candidate.aiSummary)}`);
    } else {
      console.log(chalk.dim("  Not generated"));
    }

    // AI Questions
    if (candidate.aiQuestions) {
      console.log(chalk.hex("#d4a853")("\n  ❓ AI Questions:"));
      console.log(`  ${chalk.dim(candidate.aiQuestions)}`);
    }

    // Interview Feedback
    console.log(chalk.hex("#d4a853")("\n  📝 Interview Feedback:"));
    if (feedback) {
      const interviewer = interview ? USERS[interview.interviewerId] : null;
      console.log(`  Interviewer: ${interviewer?.name || interview?.interviewerId || "—"}`);
      console.log(`  Rating:  ${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)} (${feedback.rating}/5)`);
      console.log(`  Rec:     ${chalk.bold(feedback.recommendation)}`);
      console.log(`  Notes:   ${feedback.comments || chalk.dim("—")}`);
    } else {
      console.log(chalk.dim("  No feedback submitted yet"));
    }

    // Audit log preview
    const logs = candidate.auditLogs;
    if (logs.length > 0) {
      console.log(chalk.hex("#d4a853")(`\n  📋 Activity (${logs.length} entries):`));
      const recent = logs.slice(-3).reverse();
      for (const log of recent) {
        console.log(`  ${chalk.dim(new Date(log.timestamp).toLocaleDateString())} ${log.action}`);
      }
    }

    console.log("");
    console.log(chalk.dim("  Run: hermes review hire <id>  or  hermes review reject <id>"));
    console.log("");
  });

// ─── HIRE ───
reviewCommand
  .command("hire")
  .description("Hire a candidate")
  .argument("<candidate-id>", "Candidate ID")
  .action(async (candidateId: string) => {
    const manager = requireManager();
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    await moveCandidateStage(candidateId, "HIRED", {
      action: "Hired by Manager",
      userId: manager.id,
      userName: manager.name,
    });

    console.log(chalk.green(`  ✅ ${chalk.bold(candidate.name)} hired!`));
    console.log(chalk.dim("  Stage → HIRED · Audit logged"));
  });

// ─── REJECT ───
reviewCommand
  .command("reject")
  .description("Reject a candidate")
  .argument("<candidate-id>", "Candidate ID")
  .action(async (candidateId: string) => {
    const manager = requireManager();
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    await moveCandidateStage(candidateId, "REJECTED", {
      action: "Rejected by Manager",
      userId: manager.id,
      userName: manager.name,
    });

    console.log(chalk.red(`  ❌ ${chalk.bold(candidate.name)} rejected`));
    console.log(chalk.dim("  Stage → REJECTED · Audit logged"));
  });
