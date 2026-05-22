import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { getConfig } from "../storage/config";
import { createJob, getJobs, readDb } from "../storage/store";
import type { Job } from "../storage/types";

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

function requireHr(): { id: string; name: string } {
  const user = getActiveUser();
  if (!user) {
    console.log(chalk.red("❌ Not logged in. Use: hermes auth --as <user>"));
    process.exit(1);
  }
  if (user.role !== "HR") {
    console.log(
      chalk.red(
        `❌ Only HR can create jobs (current: ${chalk.bold(user.name)} — ${user.role})`,
      ),
    );
    process.exit(1);
  }
  return { id: user.id, name: user.name };
}

export const jobCommand = new Command("job")
  .description("Manage job openings")
  .addCommand(
    new Command("create")
      .description("Create a new job opening")
      .argument("<title>", "Job title")
      .option("-d, --dept <department>", "Department", "General")
      .action(async (title: string, opts: { dept: string }) => {
        const user = requireHr();

        const job = await createJob(title, opts.dept, user.id);

        console.log(
          chalk.green(`  ✅ Job created (ID: ${chalk.bold(String(job.id))})`),
        );
      }),
  )
  .addCommand(
    new Command("list")
      .description("List all job openings")
      .action(async () => {
        const db = await readDb();
        const jobs = db.jobs;
        const candidates = db.candidates;

        if (jobs.length === 0) {
          console.log(chalk.dim("  No jobs found."));
          return;
        }

        const table = new Table({
          head: ["ID", "Title", "Department", "Status", "Candidates"],
          colWidths: [28, 32, 15, 8, 12],
          style: {
            head: [],
            border: [],
          },
        });

        for (const job of jobs) {
          const count = candidates.filter((c) => c.jobId === job.id).length;
          table.push([
            String(job.id),
            job.title,
            job.department,
            job.status,
            String(count),
          ]);
        }

        console.log("");
        console.log(table.toString());
      }),
  )
  .addCommand(
    new Command("show")
      .description("Show job details and candidates")
      .argument("<id>", "Job ID")
      .action(async (idStr: string) => {
        const db = await readDb();
        const job = db.jobs.find((j) => String(j.id) === idStr);

        if (!job) {
          console.log(chalk.red(`❌ Job #${idStr} not found`));
          return;
        }

        const creator = db.users.find((u) => u.id === job.createdById);
        const relatedCandidates = db.candidates.filter((c) => c.jobId === job.id);

        console.log("");
        console.log(chalk.hex("#d4a853")(`  Job #${job.id} — ${chalk.bold(job.title)}`));
        console.log(chalk.dim("  ──────────────────────────────────"));
        console.log(`  ${chalk.bold("Department:")}   ${job.department}`);
        console.log(`  ${chalk.bold("Status:")}       ${job.status}`);
        console.log(
          `  ${chalk.bold("Created by:")}  ${creator ? creator.name : job.createdById} (${job.createdById})`,
        );
        console.log(`  ${chalk.bold("Created at:")}  ${new Date(job.createdAt).toLocaleString()}`);

        if (relatedCandidates.length === 0) {
          console.log(chalk.dim("\n  No candidates for this job yet."));
        } else {
          console.log(chalk.hex("#d4a853")(`\n  Candidates (${relatedCandidates.length}):`));

          const table = new Table({
            head: ["ID", "Name", "Stage"],
            colWidths: [28, 28, 20],
            style: { head: [], border: [] },
          });

          for (const c of relatedCandidates) {
            table.push([String(c.id), c.name, c.currentStage]);
          }

          console.log(table.toString());
        }

        console.log("");
      }),
  );
