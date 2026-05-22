import { Command } from "commander";
import chalk from "chalk";
import { readDb } from "../storage/store";

const USERS: Record<string, { name: string; role: string }> = {
  alice: { name: "Alice", role: "HR" },
  bob: { name: "Bob", role: "INTERVIEWER" },
  carol: { name: "Carol", role: "MANAGER" },
};

function getActiveUser(): { id: string; name: string; role: string } | null {
  const cfg = require("../storage/config").getConfig();
  if (!cfg.activeUserId) return null;
  const user = USERS[cfg.activeUserId];
  if (!user) return null;
  return { id: cfg.activeUserId, name: user.name, role: user.role };
}

function requireRole(allowed: string[]): { id: string; name: string; role: string } {
  const user = getActiveUser();
  if (!user) {
    console.log(chalk.red("❌ Not logged in. Use: hermes auth --as <user>"));
    process.exit(1);
  }
  if (!allowed.includes(user.role)) {
    console.log(chalk.red(`❌ ${user.role} cannot run this command`));
    process.exit(1);
  }
  return user;
}

export const feedbackCommand = new Command("feedback")
  .description("Manage feedback");

// ─── SUBMIT ───
feedbackCommand
  .command("submit")
  .description("Submit feedback for an interview")
  .argument("<interview-id>", "Interview ID")
  .requiredOption("--rating <number>", "Rating 1-5")
  .option("--recommendation <text>", "Recommendation (Strong Hire, Hire, No Hire, Strong No Hire)")
  .option("--notes <text>", "Comments")
  .action(async (interviewId: string, opts) => {
    const user = requireRole(["HR", "INTERVIEWER"]);
    const db = await readDb();
    const interview = db.interviews.find((i) => String(i.id) === interviewId);

    if (!interview) {
      console.log(chalk.red(`❌ Interview #${interviewId} not found`));
      return;
    }

    const rating = parseInt(opts.rating, 10);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      console.log(chalk.red("❌ Rating must be a number between 1 and 5"));
      return;
    }

    const recommendation = opts.recommendation || (rating >= 4 ? "Strong Hire" : rating >= 3 ? "Hire" : rating >= 2 ? "No Hire" : "Strong No Hire");
    const comments = opts.notes || "";

    const { createFeedbackInDb, writeDb } = await import("../storage/db");
    const fb = createFeedbackInDb(db, {
      interviewId: interview.id,
      rating,
      recommendation,
      comments,
    });

    // Update interview status
    interview.status = "COMPLETED";

    // Update candidate stage
    const candidate = db.candidates.find((c) => String(c.id) === interview.candidateId);
    if (candidate && candidate.currentStage === "INTERVIEW") {
      candidate.currentStage = "MANAGER_REVIEW";
      candidate.auditLogs.push({
        action: "Feedback submitted, moved to Manager Review",
        userId: user.id,
        userName: user.name,
        timestamp: new Date().toISOString(),
      });
    }

    writeDb(db);

    console.log(chalk.green(`  ✅ Feedback submitted for interview ${interviewId}`));
    console.log(chalk.dim(`  Rating: ${"★".repeat(rating)}${"☆".repeat(5 - rating)} (${rating}/5)`));
    console.log(chalk.dim(`  Recommendation: ${recommendation}`));
  });

// ─── SHOW ───
feedbackCommand
  .command("show")
  .description("Show feedback details")
  .argument("<id>", "Feedback ID or Interview ID")
  .action(async (idStr: string) => {
    requireRole(["HR", "INTERVIEWER", "MANAGER"]);
    const db = await readDb();

    // Try finding by feedback ID first, then by interview ID
    let feedback = db.feedback.find((f) => String(f.id) === idStr);
    if (!feedback) {
      feedback = db.feedback.find((f) => f.interviewId === idStr);
    }

    if (!feedback) {
      console.log(chalk.red(`❌ Feedback not found for #${idStr}`));
      return;
    }

    const interview = db.interviews.find((i) => i.id === feedback.interviewId);
    const candidate = interview ? db.candidates.find((c) => String(c.id) === interview.candidateId) : null;

    console.log("");
    console.log(chalk.hex("#d4a853")(`  📝 Feedback`));
    console.log(chalk.dim("  ──────────────────────────────────"));
    console.log(`  Candidate:  ${candidate?.name || "—"}`);
    console.log(`  Rating:     ${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)} (${feedback.rating}/5)`);
    console.log(`  Recommendation: ${feedback.recommendation}`);
    console.log(`  Comments:   ${feedback.comments || chalk.dim("—")}`);
    console.log(`  Submitted:  ${new Date(feedback.createdAt).toLocaleString()}`);
    console.log("");
  });
