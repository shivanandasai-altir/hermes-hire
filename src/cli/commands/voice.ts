import { Command } from "commander";
import chalk from "chalk";
import { getConfig } from "../storage/config";
import { getDbStats, readDb } from "../storage/store";

const USERS: Record<string, { name: string; role: string }> = {
  alice: { name: "Alice", role: "HR" },
  bob: { name: "Bob", role: "INTERVIEWER" },
  carol: { name: "Carol", role: "MANAGER" },
};

export const voiceCommand = new Command("voice")
  .description("Convert natural language to CLI command")
  .argument("[text]", "Natural language request")
  .action(async (text: string | undefined) => {
    if (!text) {
      console.log(chalk.hex("#d4a853")("\n  🎤 Hermes-Hire Voice Mode"));
      console.log(chalk.dim("  Type natural language. Ctrl+C to exit.\n"));
      console.log(chalk.yellow("  Interactive voice mode coming soon."));
      console.log(chalk.dim('  For now: hermes voice "add rahul as candidate"'));
      return;
    }

    const cfg = getConfig();
    const apiKey = cfg.hermesApiKey;
    if (!apiKey) {
      console.log(chalk.red("❌ No API key set. Run: hermes auth --key <key>"));
      return;
    }

    const apiUrl = cfg.hermesApiUrl || "https://inference-api.nousresearch.com/v1";
    const model = cfg.hermesModel || "Hermes-4-70B";
    const activeUserId = cfg.activeUserId;

    let context = `Current user: ${activeUserId || "none"}. `;
    if (activeUserId) {
      const user = USERS[activeUserId];
      if (user) context += `Role: ${user.role}. `;
    }
    const db = await readDb();
    const stats = await getDbStats(db);
    context += `Jobs: ${stats.jobs}. Candidates: ${stats.candidates}.`;

    // Include job info so Hermes picks a real job ID
    if (db.jobs.length > 0) {
      context += `\nAvailable jobs:\n`;
      for (const job of db.jobs) {
        context += `- ID: ${job.id} — ${job.title} (${job.department})\n`;
      }
    }
    if (db.candidates.length > 0) {
      context += `\nAvailable candidates:\n`;
      for (const c of db.candidates.slice(0, 5)) {
        context += `- ID: ${c.id} — ${c.name} (Stage: ${c.currentStage})\n`;
      }
    }

    try {
      console.log(chalk.dim("  Translating..."));
      const response = await fetch(`${apiUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: "system",
              content:
                "You are a CLI translator. Convert natural language requests into hermes CLI commands. " +
                "Return ONLY the exact command to run. No explanation, no markdown, no backticks.\n\n" +
                "Examples:\n" +
                '- "add rahul as candidate" → hermes candidate invite --job 1 --name "Rahul" --email rahul@email.com\n' +
                '- "create a job for frontend engineer" → hermes job create "Frontend Engineer" --dept Engineering\n' +
                '- "move candidate 1 to interview" → hermes candidate move 1 --stage INTERVIEW\n' +
                '- "show my queue" → hermes interview list --mine\n' +
                '- "hire candidate 1" → hermes review hire 1\n' +
                '- "switch to bob" → hermes auth --as bob\n' +
                '- "generate ai summary for candidate 1" → hermes candidate summary 1\n' +
                '- "simulate interview for candidate 1" → hermes interview simulate 1\n' +
                '- "schedule meet with candidate 1 tomorrow at 2pm" → hermes meet schedule 1 "tomorrow at 2pm"\n' +
                '- "show audit for candidate 1" → hermes audit 1\n\n' +
                `Context: ${context}`,
            },
            { role: "user", content: text },
          ],
          temperature: 0.1,
          max_tokens: 200,
        }),
      });

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const command = data.choices?.[0]?.message?.content?.trim();

      if (!command) {
        console.log(chalk.red("❌ Could not translate request"));
        return;
      }

      console.log(`\n  ${chalk.hex("#d4a853")("→")} ${chalk.bold(command)}\n`);

      // Copy to clipboard + show instruction
      try {
        const { execSync } = await import("node:child_process");
        execSync(`echo ${JSON.stringify(command)} | pbcopy`, { timeout: 1000 });
        console.log(chalk.dim("  📋 Copied to clipboard — paste and press Enter to run"));
      } catch {
        console.log(chalk.dim("  (copy the command above and paste it to run)"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.log(chalk.red(`❌ Error: ${message}`));
    }
  });
