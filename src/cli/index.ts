#!/usr/bin/env node

import { loadProjectEnv } from "@/lib/load-env";

loadProjectEnv();

import { Command } from "commander";
import chalk from "chalk";
import { printHeader } from "./ascii-header";
import { authCommand } from "./commands/auth";
import { statusCommand } from "./commands/status";
import { voiceCommand } from "./commands/voice";
import { jobCommand } from "./commands/job";

const program = new Command();

program
  .name("hermes")
  .description(
    "Hermes-Hire — Autonomous AI Hiring Copilot — your terminal is the interface",
  )
  .version("0.1.0")
  .hook("preAction", (_thisCommand, actionCommand) => {
    const name = actionCommand.name();
    if (name && name !== "hermes") {
      printHeader();
    }
  });

program.addCommand(authCommand);
program.addCommand(statusCommand);
program.addCommand(voiceCommand);
program.addCommand(jobCommand);

program.parse(process.argv);
