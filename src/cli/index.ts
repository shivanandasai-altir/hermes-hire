#!/usr/bin/env node

import { Command } from "commander";
import { printLogo } from "./ascii";
import { authCommand } from "./commands/auth";
// import { jobCommand } from "./commands/job";
// import { candidateCommand } from "./commands/candidate";
// import { interviewCommand } from "./commands/interview";
// import { feedbackCommand } from "./commands/feedback";
// import { reviewCommand } from "./commands/review";
// import { meetCommand } from "./commands/meet";
// import { auditCommand } from "./commands/audit";

const program = new Command();

program
  .name("hermes")
  .description("HermesHire — Autonomous AI Hiring Copilot")
  .version("0.1.0")
  .hook("preAction", () => {
    printLogo();
  });

program.addCommand(authCommand);
// program.addCommand(jobCommand);
// program.addCommand(candidateCommand);
// program.addCommand(interviewCommand);
// program.addCommand(feedbackCommand);
// program.addCommand(reviewCommand);
// program.addCommand(meetCommand);
// program.addCommand(auditCommand);

program.parse(process.argv);
