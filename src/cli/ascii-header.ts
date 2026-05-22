import chalk, { type ChalkInstance } from "chalk";

const BOX_INNER = 88;

function boxRow(gold: ChalkInstance, text = "") {
  const pad = Math.max(0, BOX_INNER - text.length);
  const left = Math.floor(pad / 2);
  return gold(`  ║${" ".repeat(left)}${text}${" ".repeat(pad - left)}║`);
}

const LOGO = [
  "██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗          ██╗  ██╗██╗██████╗ ███████╗",
  "██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝          ██║  ██║██║██╔══██╗██╔════╝",
  "███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗  █████╗  ███████║██║██████╔╝█████╗  ",
  "██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║  ╚════╝  ██╔══██║██║██╔══██╗██╔══╝  ",
  "██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║          ██║  ██║██║██║  ██║███████╗",
  "╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝          ╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚══════╝",
];

export function printHeader() {
  const gold = chalk.hex("#d4a853");
  const border = gold(`  ╔${"═".repeat(BOX_INNER)}╗`);

  console.log("");
  console.log(border);
  console.log(boxRow(gold));
  for (const line of LOGO) {
    console.log(gold(`  ║${line}║`));
  }
  console.log(boxRow(gold));
  console.log(boxRow(gold, "Autonomous AI Hiring Copilot · v0.1.0"));
  console.log(gold(`  ╚${"═".repeat(BOX_INNER)}╝`));
  console.log("");
}
