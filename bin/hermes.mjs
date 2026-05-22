#!/usr/bin/env node

// CLI entry point for Hermes-Hire
// Built with commander, chalk, conf

import { Command } from "commander";
import chalk from "chalk";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

// ─── ASCII HEADER ───
const BOX_INNER = 88;

function boxRow(gold, text = "") {
  const pad = Math.max(0, BOX_INNER - text.length);
  const left = Math.floor(pad / 2);
  return gold(`  ║${" ".repeat(left)}${text}${" ".repeat(pad - left)}║`);
}

function printHeader() {
  const gold = chalk.hex("#d4a853");
  const border = gold(`  ╔${"═".repeat(BOX_INNER)}╗`);

  const logo = [
    "██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗          ██╗  ██╗██╗██████╗ ███████╗",
    "██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝          ██║  ██║██║██╔══██╗██╔════╝",
    "███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗  █████╗  ███████║██║██████╔╝█████╗  ",
    "██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║  ╚════╝  ██╔══██║██║██╔══██╗██╔══╝  ",
    "██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║          ██║  ██║██║██║  ██║███████╗",
    "╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝          ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝",
  ];

  console.log("");
  console.log(border);
  console.log(boxRow(gold));
  for (const line of logo) {
    console.log(gold(`  ║${line}║`));
  }
  console.log(boxRow(gold));
  console.log(boxRow(gold, "Autonomous AI Hiring Copilot · v0.1.0"));
  console.log(gold(`  ╚${"═".repeat(BOX_INNER)}╝`));
  console.log("");
}

const program = new Command();

program
  .name("hermes")
  .description(
    "Hermes-Hire — Autonomous AI Hiring Copilot — your terminal is the interface",
  )
  .version("0.1.0")
  .hook("preAction", () => {
    if (process.argv.length > 2) {
      printHeader();
    }
  });

// ─── AUTH ───
const USERS = {
  alice: { name: "Alice", role: "HR" },
  bob: { name: "Bob", role: "INTERVIEWER" },
  carol: { name: "Carol", role: "MANAGER" },
};

import Conf from "conf";
const config = new Conf({
  projectName: "hermeshire",
  defaults: { hermesApiUrl: "https://inference-api.nousresearch.com/v1", hermesModel: "Hermes-4-70B" },
});

program
  .command("auth")
  .description("Manage authentication and role switching")
  .option("-k, --key <api-key>", "Set Hermes API key")
  .option("-a, --as <user>", "Switch active user (alice, bob, carol)")
  .option("--vapi-key <key>", "Set Vapi API key")
  .option("--seed", "Seed demo data")
  .action((opts) => {
    if (opts.key) { config.set("hermesApiKey", opts.key); console.log(chalk.green("✅ API key saved")); return; }
    if (opts.vapiKey) { config.set("vapiApiKey", opts.vapiKey); console.log(chalk.green("✅ Vapi API key saved")); return; }
    if (opts.as) {
      const user = USERS[opts.as.toLowerCase()];
      if (!user) { console.log(chalk.red("❌ Unknown user. Use: alice, bob, carol")); return; }
      config.set("activeUserId", opts.as.toLowerCase());
      console.log(chalk.green(`✅ Switched to ${chalk.bold(user.name)} (${user.role})`));
      return;
    }
    if (opts.seed) {
      config.set("activeUserId", "alice");
      console.log(chalk.green("✅ Demo data seeded"));
      console.log(chalk.dim("   Users: alice (HR), bob (Interviewer), carol (Manager)"));
      return;
    }
    // Status
    const cfg = config.store;
    const active = cfg.activeUserId ? USERS[cfg.activeUserId] : null;
    console.log("");
    console.log(chalk.hex("#d4a853")("  Current Session"));
    console.log(chalk.dim("  ───────────────────"));
    console.log(`  User:  ${active ? chalk.bold(active.name) + " (" + active.role + ")" : chalk.dim("not set")}`);
    console.log(`  API:   ${cfg.hermesApiKey ? chalk.green("✓ configured") : chalk.red("✗ missing")}`);
    console.log(`  Vapi:  ${cfg.vapiApiKey ? chalk.green("✓ configured") : chalk.dim("not set")}`);
    console.log("");
  });

// ─── STATUS ───
program
  .command("status")
  .description("Show current config and stats")
  .action(() => {
    const cfg = config.store;
    const active = cfg.activeUserId ? USERS[cfg.activeUserId] : null;
    console.log(chalk.hex("#d4a853")("\n  Hermes-Hire Status"));
    console.log(chalk.dim("  ───────────────────"));
    console.log(`  Active user:  ${active ? chalk.bold(active.name) + " (" + active.role + ")" : chalk.dim("not set")}`);
    console.log(`  Hermes API:   ${cfg.hermesApiKey ? chalk.green("✓") : chalk.red("✗")}`);
    console.log(`  Vapi:         ${cfg.vapiApiKey ? chalk.green("✓") : chalk.dim("not set")}`);
    console.log(`  Model:        ${chalk.dim(cfg.hermesModel || "Hermes-4-70B")}`);
    console.log("");
  });

// ─── VOICE-TO-COMMAND ───
program
  .command("voice")
  .description("Convert natural language to CLI command")
  .argument("[text]", "Natural language request")
  .action(async (text) => {
    if (!text) {
      console.log(chalk.hex("#d4a853")("\n  🎤 Hermes-Hire Voice Mode"));
      console.log(chalk.dim("  Type natural language. Ctrl+C to exit.\n"));
      // Interactive mode would go here
      console.log(chalk.yellow("  Interactive voice mode coming soon."));
      console.log(chalk.dim("  For now: hermes voice \"add rahul as candidate\""));
      return;
    }

    const apiKey = config.get("hermesApiKey");
    if (!apiKey) {
      console.log(chalk.red("❌ No API key set. Run: hermes auth --key <key>"));
      return;
    }

    const apiUrl = config.get("hermesApiUrl") || "https://inference-api.nousresearch.com/v1";
    const model = config.get("hermesModel") || "Hermes-4-70B";
    const activeUserId = config.get("activeUserId");

    // Build context for Hermes
    let context = `Current user: ${activeUserId || "none"}. `;
    if (activeUserId) {
      const user = USERS[activeUserId];
      if (user) context += `Role: ${user.role}. `;
    }
    const jobCount = 0; // Will be dynamic once DB is built
    context += `Jobs: ${jobCount}.`;

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

      const data = await response.json();
      const command = data.choices?.[0]?.message?.content?.trim();

      if (!command) {
        console.log(chalk.red("❌ Could not translate request"));
        return;
      }

      console.log(`\n  ${chalk.hex("#d4a853")("→")} ${chalk.bold(command)}\n`);
      console.log(chalk.dim("  (command translation only — execution coming soon)"));
    } catch (error) {
      console.log(chalk.red(`❌ Error: ${error.message}`));
    }
  });

program.parse(process.argv);
