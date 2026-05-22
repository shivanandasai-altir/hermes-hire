import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { getConfig } from "../storage/config";
import { readDb, createCandidate } from "../storage/store";
import { appendAuditLog } from "../storage/db";
import { canTransition, VALID_TRANSITIONS } from "@/lib/constants";
import type { Stage } from "@/lib/constants";
import type { Candidate as CandidateType } from "../storage/types";

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

function stageColor(stage: string): string {
  const colors: Record<string, string> = {
    PENDING_ONBOARDING: "yellow",
    APPLIED: "blue",
    SCREENING: "cyan",
    INTERVIEW: "magenta",
    MANAGER_REVIEW: "red",
    HIRED: "green",
    REJECTED: "red",
  };
  return colors[stage] || "white";
}

const STAGE_LABELS: Record<string, string> = {
  PENDING_ONBOARDING: "Pending",
  APPLIED: "Applied",
  SCREENING: "Screening",
  INTERVIEW: "Interview",
  MANAGER_REVIEW: "Manager Review",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

export const candidateCommand = new Command("candidate")
  .description("Manage candidates");

// ─── ADD ───
candidateCommand
  .command("add")
  .description("Add a candidate to a job")
  .requiredOption("--job <id>", "Job ID")
  .requiredOption("--name <name>", "Candidate name")
  .option("--email <email>", "Candidate email")
  .option("--phone <phone>", "Candidate phone")
  .option("--resume <text>", "Resume text")
  .action(async (opts) => {
    const user = requireRole(["HR"]);
    const candidate = await createCandidate(
      {
        name: opts.name,
        email: opts.email,
        phone: opts.phone,
        resumeText: opts.resume,
        jobId: opts.job,
        currentStage: "APPLIED",
      },
      { userId: user.id, userName: user.name },
    );
    console.log(chalk.green(`  ✅ Candidate added (ID: ${chalk.bold(candidate.id)})`));
  });

// ─── INVITE ───
candidateCommand
  .command("invite")
  .description("Invite a candidate (generates onboard link)")
  .requiredOption("--job <id>", "Job ID")
  .requiredOption("--name <name>", "Candidate name")
  .option("--email <email>", "Candidate email")
  .action(async (opts) => {
    const user = requireRole(["HR"]);
    const token = `onboard-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    const candidate = await createCandidate(
      {
        name: opts.name,
        email: opts.email,
        phone: undefined,
        resumeText: "",
        jobId: opts.job,
        currentStage: "PENDING_ONBOARDING",
        onboardToken: token,
      },
      { userId: user.id, userName: user.name },
    );
    console.log(chalk.hex("#d4a853")(`  📨 Invite link for ${chalk.bold(candidate.name)}:`));
    console.log(chalk.dim(`  https://hermes-hire.xyz/onboard/${token}`));
  });

// ─── LIST ───
candidateCommand
  .command("list")
  .description("List candidates")
  .option("--job <id>", "Filter by job ID")
  .option("--stage <stage>", "Filter by stage")
  .action(async (opts) => {
    requireRole(["HR", "INTERVIEWER", "MANAGER"]);
    const db = await readDb();
    let candidates = db.candidates;

    if (opts.job) {
      candidates = candidates.filter((c) => String(c.jobId) === opts.job);
    }
    if (opts.stage) {
      candidates = candidates.filter((c) => c.currentStage === opts.stage.toUpperCase());
    }

    if (candidates.length === 0) {
      console.log(chalk.dim("  No candidates found."));
      return;
    }

    const table = new Table({
      head: ["ID", "Name", "Stage", "Job ID"],
      colWidths: [28, 24, 18, 28],
      style: { head: [], border: [] },
    });

    for (const c of candidates) {
      const label = STAGE_LABELS[c.currentStage] || c.currentStage;
      table.push([String(c.id), c.name, label, c.jobId]);
    }

    console.log("");
    console.log(table.toString());
  });

// ─── SHOW ───
candidateCommand
  .command("show")
  .description("Show candidate details")
  .argument("<id>", "Candidate ID")
  .action(async (idStr: string) => {
    requireRole(["HR", "INTERVIEWER", "MANAGER"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === idStr);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${idStr} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    const label = STAGE_LABELS[candidate.currentStage] || candidate.currentStage;
    const colorFn = stageColor(candidate.currentStage) === "green" ? chalk.green : chalk.hex("#d4a853");

    console.log("");
    console.log(colorFn(`  Candidate #${candidate.id} — ${chalk.bold(candidate.name)}`));
    console.log(chalk.dim("  ──────────────────────────────────"));
    console.log(`  Name:     ${candidate.name}`);
    console.log(`  Email:    ${candidate.email || chalk.dim("—")}`);
    console.log(`  Phone:    ${candidate.phone || chalk.dim("—")}`);
    console.log(`  Stage:    ${label}`);
    console.log(`  Job:      ${job ? job.title : candidate.jobId}`);

    if (candidate.aiSummary) {
      console.log(chalk.hex("#d4a853")(`\n  🤖 AI Summary:`));
      console.log(chalk.dim(`  ${candidate.aiSummary}`));
    }
    if (candidate.aiQuestions) {
      console.log(chalk.hex("#d4a853")(`\n  ❓ AI Questions:`));
      console.log(chalk.dim(`  ${candidate.aiQuestions}`));
    }
    console.log("");
  });

// ─── MOVE ───
candidateCommand
  .command("move")
  .description("Move candidate to a new stage")
  .argument("<id>", "Candidate ID")
  .requiredOption("--stage <stage>", "Target stage")
  .action(async (idStr: string, opts) => {
    const user = requireRole(["HR"]);
    const newStage = opts.stage.toUpperCase() as Stage;

    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === idStr);
    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${idStr} not found`));
      return;
    }

    const allowed = VALID_TRANSITIONS[candidate.currentStage as Stage];
    if (!canTransition(candidate.currentStage as Stage, newStage)) {
      console.log(chalk.red(`❌ Cannot move from ${candidate.currentStage} to ${newStage}`));
      console.log(chalk.dim(`   Allowed transitions: ${(allowed || []).join(", ") || "none"}`));
      return;
    }

    const { moveCandidateStage } = await import("../storage/store");
    await moveCandidateStage(idStr, newStage, {
      userId: user.id,
      userName: user.name,
    });

    console.log(chalk.green(`  ✅ Moved to ${newStage}`));
  });

// ─── SUMMARY ───
candidateCommand
  .command("summary")
  .description("Generate AI summary for a candidate")
  .argument("<id>", "Candidate ID")
  .action(async (idStr: string) => {
    const user = requireRole(["HR"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === idStr);
    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${idStr} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    if (!job) {
      console.log(chalk.red(`❌ Job #${candidate.jobId} not found`));
      return;
    }

    if (!candidate.resumeText) {
      console.log(chalk.red(`❌ Candidate has no resume text. Add resume first.`));
      return;
    }

    console.log(chalk.dim("  Generating AI summary..."));
    try {
      const { generateCandidateSummary } = await import("@/services/ai");
      const summary = await generateCandidateSummary(candidate.resumeText, job.title);

      // Update candidate
      const { moveCandidateStage } = await import("../storage/store");
      const db2 = await readDb();
      const c2 = db2.candidates.find((c) => String(c.id) === idStr);
      if (c2) {
        c2.aiSummary = summary;
        c2.auditLogs.push({
          action: "AI Summary generated",
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
        });
      }
      const { writeDb } = await import("../storage/db");
      writeDb(db2);

      console.log(chalk.hex("#d4a853")(`\n  🤖 AI Summary:`));
      console.log(chalk.dim(`  ${summary}`));
    } catch (err: unknown) {
      console.log(chalk.red(`❌ AI Error: ${err instanceof Error ? err.message : "Unknown"}`));
    }
  });

// ─── QUESTIONS ───
candidateCommand
  .command("questions")
  .description("Generate AI interview questions for a candidate")
  .argument("<id>", "Candidate ID")
  .action(async (idStr: string) => {
    const user = requireRole(["HR", "INTERVIEWER"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === idStr);
    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${idStr} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    if (!job) {
      console.log(chalk.red(`❌ Job #${candidate.jobId} not found`));
      return;
    }

    const profile = candidate.aiSummary || candidate.resumeText;
    if (!profile) {
      console.log(chalk.red(`❌ No candidate profile available. Generate summary or add resume first.`));
      return;
    }

    console.log(chalk.dim("  Generating AI questions..."));
    try {
      const { generateInterviewQuestions } = await import("@/services/ai");
      const questions = await generateInterviewQuestions(profile, job.title);

      const db2 = await readDb();
      const c2 = db2.candidates.find((c) => String(c.id) === idStr);
      if (c2) {
        c2.aiQuestions = questions;
        c2.auditLogs.push({
          action: "AI Questions generated",
          userId: user.id,
          userName: user.name,
          timestamp: new Date().toISOString(),
        });
      }
      const { writeDb } = await import("../storage/db");
      writeDb(db2);

      console.log(chalk.hex("#d4a853")(`\n  ❓ AI Interview Questions:`));
      console.log(chalk.dim(`  ${questions}`));
    } catch (err: unknown) {
      console.log(chalk.red(`❌ AI Error: ${err instanceof Error ? err.message : "Unknown"}`));
    }
  });
