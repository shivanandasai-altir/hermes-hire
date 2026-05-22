# Step 1: CLI Skeleton + Auth

**Estimated time:** ~15 min  
**Creates the foundation** for all CLI commands.

---

## Goal

A working `hermes` command with ASCII logo, `--help`, `auth`, and `status` commands.

## Key Files

- `bin/hermes.mjs` — Entry point (Node.js, ESM)
- `public/install.sh` — One-curl install script

## Commands Built

- `hermes auth --as alice/bob/carol` — Role switching
- `hermes auth --key <api-key>` — Save Hermes API key
- `hermes status` — Show current config
- `hermes --help` — Command listing

## Implementation Details

- Uses `commander` for CLI parsing, `chalk` for colors, `conf` for config storage
- Config stored at `~/.config/hermeshire/config.json`
- ASCII logo renders big block "HERMES" text on every command
- The `voice` command translates natural language to CLI commands via Hermes API

## Acceptance Criteria

- [ ] `node bin/hermes.mjs --help` shows all commands
- [ ] `hermes auth --as alice` switches to HR role
- [ ] API key is persisted and shown in `hermes status`
- [ ] `curl -fsSL https://hermes-hire.xyz/install.sh | bash` installs the CLI
