export const HERMES_LOGO = `
  ╔══════════════════════════════════════════╗
  ║     ◈    HermesHire                      ║
  ║    ◈ ◈   Autonomous AI Hiring Copilot    ║
  ║   ◈   ◈  CLI v0.1.0                     ║
  ║  ◈     ◈                                ║
  ║ ═══════════════════════════════════════ ║
  ║  hermes auth --as alice  →  HR          ║
  ║  hermes auth --as bob    →  Interviewer  ║
  ║  hermes auth --as carol  →  Manager      ║
  ╚══════════════════════════════════════════╝
`;

export const HERMES_HEADER = `
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   ██╗  ██╗███████╗██████╗ ███╗   ███╗███████╗███████╗
  ║   ██║  ██║██╔════╝██╔══██╗████╗ ████║██╔════╝██╔════╝
  ║   ███████║█████╗  ██████╔╝██╔████╔██║█████╗  ███████╗
  ║   ██╔══██║██╔══╝  ██╔══██╗██║╚██╔╝██║██╔══╝  ╚════██║
  ║   ██║  ██║███████╗██║  ██║██║ ╚═╝ ██║███████╗███████║
  ║   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝╚══════╝
  ║                                                      ║
  ║     ◈    HermesHire    ◈                             ║
  ║    ◈ ◈   Autonomous AI Hiring Copilot                ║
  ║   ◈   ◈  CLI · v0.1.0                               ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
`;

export const HERMES_SMALL = `
  ╭──────────────────────────────────────────╮
  │  ❖ HermesHire — AI Hiring Copilot ❖    │
  ╰──────────────────────────────────────────╯
`;

export function printLogo() {
  console.log(HERMES_HEADER);
}

export function printSmallLogo() {
  console.log(HERMES_SMALL);
}
