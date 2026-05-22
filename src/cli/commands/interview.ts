import { Command } from "commander";
import chalk from "chalk";
import Table from "cli-table3";
import { getConfig } from "../storage/config";
import { readDb } from "../storage/store";

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

export const interviewCommand = new Command("interview")
  .description("Manage interviews");

// ─── ASSIGN ───
interviewCommand
  .command("assign")
  .description("Assign an interviewer to a candidate")
  .argument("<candidate-id>", "Candidate ID")
  .requiredOption("--to <user>", "User ID (alice, bob, carol)")
  .action(async (candidateId: string, opts) => {
    const user = requireRole(["HR"]);
    const targetUser = USERS[opts.to];
    if (!targetUser) {
      console.log(chalk.red(`❌ Unknown user: ${opts.to}. Use: alice, bob, carol`));
      return;
    }

    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);
    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    const { createInterviewInDb } = await import("../storage/db");
    const interview = createInterviewInDb(db, {
      candidateId: String(candidate.id),
      interviewerId: opts.to,
    });

    // Update audit log
    candidate.auditLogs.push({
      action: `Assigned to ${targetUser.name} for interview`,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    });
    const { writeDb } = await import("../storage/db");
    writeDb(db);

    console.log(chalk.green(`  ✅ Interview created (ID: ${chalk.bold(interview.id)})`));
    console.log(chalk.dim(`  ${candidate.name} → ${targetUser.name} (${targetUser.role})`));
  });

// ─── LIST ───
interviewCommand
  .command("list")
  .description("List interviews")
  .option("--mine", "Show only my assigned interviews")
  .action(async (opts) => {
    const activeUser = requireRole(["HR", "INTERVIEWER", "MANAGER"]);
    const db = await readDb();
    let interviews = db.interviews;

    if (opts.mine) {
      interviews = interviews.filter((i) => i.interviewerId === activeUser.id || i.interviewerId === activeUser.name.toLowerCase());
    }

    if (interviews.length === 0) {
      console.log(chalk.dim("  No interviews found."));
      return;
    }

    const table = new Table({
      head: ["ID", "Candidate", "Interviewer", "Status"],
      colWidths: [28, 22, 16, 14],
      style: { head: [], border: [] },
    });

    for (const i of interviews) {
      const c = db.candidates.find((x) => String(x.id) === i.candidateId);
      const intName = USERS[i.interviewerId]?.name || i.interviewerId;
      table.push([
        String(i.id),
        c?.name || i.candidateId,
        intName,
        i.status,
      ]);
    }

    console.log("");
    console.log(table.toString());
  });

// ─── SHOW ───
interviewCommand
  .command("show")
  .description("Show interview details")
  .argument("<id>", "Interview ID")
  .action(async (idStr: string) => {
    requireRole(["HR", "INTERVIEWER", "MANAGER"]);
    const db = await readDb();
    const interview = db.interviews.find((i) => String(i.id) === idStr);

    if (!interview) {
      console.log(chalk.red(`❌ Interview #${idStr} not found`));
      return;
    }

    const candidate = db.candidates.find((c) => String(c.id) === interview.candidateId);
    const interviewer = USERS[interview.interviewerId];
    const feedback = db.feedback.find((f) => f.interviewId === interview.id);

    console.log("");
    console.log(chalk.hex("#d4a853")(`  Interview #${interview.id}`));
    console.log(chalk.dim("  ──────────────────────────────────"));
    console.log(`  Candidate:  ${candidate?.name || interview.candidateId}`);
    console.log(`  Interviewer: ${interviewer?.name || interview.interviewerId}`);
    console.log(`  Status:     ${interview.status}`);

    if (feedback) {
      console.log(chalk.hex("#d4a853")(`\n  📝 Feedback:`));
      console.log(`  Rating:  ${"★".repeat(feedback.rating)}${"☆".repeat(5 - feedback.rating)} (${feedback.rating}/5)`);
      console.log(`  Recommendation: ${feedback.recommendation}`);
      console.log(`  Comments: ${feedback.comments}`);
    }
    console.log("");
  });

// ─── SIMULATE ───
interviewCommand
  .command("simulate")
  .description("Simulate an AI interview for a candidate")
  .argument("<candidate-id>", "Candidate ID")
  .action(async (candidateId: string) => {
    const user = requireRole(["HR", "INTERVIEWER"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    if (!job) {
      console.log(chalk.red(`❌ Job not found`));
      return;
    }

    const profile = candidate.aiSummary || candidate.resumeText;
    if (!profile) {
      console.log(chalk.red(`❌ No candidate profile available`));
      return;
    }

    console.log(chalk.dim("  Simulating AI interview..."));
    try {
      const { callHermes, stripCodeFences } = await import("@/services/ai");

      // Step 1: Generate a fake transcript
      const transcriptText = await callHermes([
        {
          role: "system",
          content: "Generate a realistic interview transcript between an AI interviewer and a candidate. " +
            `The candidate's profile: ${profile}. The job: ${job.title}. ` +
            "Include 3-4 question-answer exchanges. Format as JSON array of {role, content} objects. " +
            "Role is 'user' for interviewer questions and 'assistant' for candidate answers.",
        },
        { role: "user", content: "Generate the interview transcript." },
      ], { maxTokens: 2048, temperature: 0.7 });

      let transcript;
      try {
        transcript = JSON.parse(stripCodeFences(transcriptText));
      } catch {
        // If Hermes returns raw text instead of JSON, create a simple transcript
        transcript = [
          { role: "user", content: "Tell me about yourself and your experience." },
          { role: "assistant", content: profile.slice(0, 300) },
        ];
      }

      // Step 2: Generate feedback from transcript
      const { generateFeedbackFromTranscript } = await import("@/lib/voice/feedback");
      const feedback = await generateFeedbackFromTranscript(transcript);

      // Step 3: Store the feedback
      const { createInterviewInDb, createFeedbackInDb, writeDb } = await import("../storage/db");
      const db2 = await readDb();

      // Find or create an interview for this candidate
      let interview = db2.interviews.find((i) => String(i.candidateId) === String(candidate.id) && i.status === "ASSIGNED");
      if (!interview) {
        interview = createInterviewInDb(db2, {
          candidateId: String(candidate.id),
          interviewerId: user.id,
        });
      }

      // Update interview status and transcript
      interview.status = "COMPLETED";
      interview.transcript = JSON.stringify(transcript);

      // Create feedback entry
      const fb = createFeedbackInDb(db2, {
        interviewId: interview.id,
        rating: Math.round(feedback.totalScore / 20),
        recommendation: feedback.totalScore >= 80 ? "Strong Hire" : feedback.totalScore >= 60 ? "Hire" : "No Hire",
        comments: `Total Score: ${feedback.totalScore}/100. ${feedback.finalAssessment}\nStrengths: ${feedback.strengths.join(", ")}`,
      });

      // Update candidate stage if in INTERVIEW
      if (candidate.currentStage === "INTERVIEW") {
        const dbC = db2.candidates.find((c) => String(c.id) === String(candidate.id));
        if (dbC) {
          dbC.currentStage = "MANAGER_REVIEW";
          dbC.auditLogs.push({
            action: "Interview simulated, moved to Manager Review",
            userId: user.id,
            userName: user.name,
            timestamp: new Date().toISOString(),
          });
        }
      }

      writeDb(db2);

      console.log(chalk.hex("#d4a853")(`\n  📝 Interview Complete`));
      console.log(`  Total Score: ${chalk.bold(String(feedback.totalScore))}/100`);
      console.log(`  Recommendation: ${chalk.bold(fb.recommendation)}`);
      console.log(`  Communication:  ${feedback.categoryScores[0]?.score || "—"}/100`);
      console.log(`  Technical:      ${feedback.categoryScores[1]?.score || "—"}/100`);
      console.log(`  Problem Solving: ${feedback.categoryScores[2]?.score || "—"}/100`);
      console.log(`  Strengths: ${chalk.dim(feedback.strengths.slice(0, 3).join(", "))}`);

    } catch (err: unknown) {
      console.log(chalk.red(`❌ Simulation error: ${err instanceof Error ? err.message : "Unknown"}`));
    }
  });

// ─── VOICE ───
interviewCommand
  .command("voice")
  .description("Start a live phone interview via Vapi")
  .argument("<candidate-id>", "Candidate ID")
  .requiredOption("--phone <number>", "Candidate phone number")
  .action(async (candidateId: string, opts) => {
    const user = requireRole(["HR", "INTERVIEWER"]);
    const db = await readDb();
    const candidate = db.candidates.find((c) => String(c.id) === candidateId);

    if (!candidate) {
      console.log(chalk.red(`❌ Candidate #${candidateId} not found`));
      return;
    }

    const job = db.jobs.find((j) => j.id === candidate.jobId);
    const vapiKey = getConfig().vapiApiKey;

    if (!vapiKey) {
      console.log(chalk.red("❌ Vapi API key not configured."));
      console.log(chalk.dim("  Set it: hermes auth --vapi-key <key>"));
      console.log(chalk.dim("  Or simulate instead: hermes interview simulate " + candidateId));
      return;
    }

    console.log(chalk.dim(`  📞 Calling ${candidate.name} at ${opts.phone}...`));

    try {
      const questions = candidate.aiQuestions || "Tell me about yourself and your experience.";

      const response = await fetch("https://api.vapi.ai/call", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${vapiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
          assistant: {
            firstMessage: `Hello ${candidate.name}, I'm your AI interviewer from HermesHire.`,
            model: {
              provider: "openai",
              model: "gpt-4",
              messages: [
                {
                  role: "system",
                  content: `You are interviewing ${candidate.name} for ${job?.title || "a role"}. Questions: ${questions}`,
                },
              ],
            },
            voice: { provider: "11labs", voiceId: "sarah" },
          },
          customer: { number: opts.phone },
        }),
      });

      const data = await response.json();

      if (data.id) {
        console.log(chalk.green(`  ✅ Call started!`));
        console.log(chalk.dim(`  Call ID: ${data.id}`));
        console.log(chalk.dim(`  Status: ${data.status || "in progress"}`));
        console.log("");
        console.log(chalk.dim("  The AI interviewer will call the candidate and conduct"));
        console.log(chalk.dim("  the interview. Results will be available when complete."));

        // Store Vapi call ID on interview
        const { createInterviewInDb, writeDb } = await import("../storage/db");
        const interview = createInterviewInDb(db, {
          candidateId: String(candidate.id),
          interviewerId: user.id,
        });
        interview.vapiCallId = data.id;
        writeDb(db);
      } else {
        console.log(chalk.red(`❌ Vapi error: ${data.message || JSON.stringify(data)}`));
      }
    } catch (err: unknown) {
      console.log(chalk.red(`❌ Error: ${err instanceof Error ? err.message : "Unknown"}`));
    }
  });
