# HermesHire — Autonomous AI Hiring Copilot

> AI-powered collaborative hiring workflow platform · in your terminal

**Status:** Hackathon MVP · One-curl install

```bash
curl -fsSL https://hermes-hire.xyz/install.sh | bash
```

## Overview

HermesHire is an AI-native hiring command center that runs in your terminal. Switch between HR, Interviewer, and Manager roles with a single command. Create jobs, manage candidates, generate AI summaries, simulate interviews, and make hiring decisions — all without opening a browser.

```
hermes auth --as alice     →  HR
hermes auth --as bob       →  Interviewer
hermes auth --as carol     →  Manager
```

One `curl | bash` installs the CLI. Your Hermes API key powers the AI. A Neon Postgres database (or local JSON fallback) stores everything. No Docker, no web server, no setup.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| CLI | Node.js + `commander` + `chalk` + `conf` |
| AI | [Nous Research Hermes 4](https://inference-api.nousresearch.com/v1) (Hermes-4-70B) |
| Storage | [Neon](https://neon.tech/) Postgres (default with `DATABASE_URL`) or local JSON (`~/.hermeshire/db.json`) |
| Voice | [Vapi](https://vapi.ai/) (AI phone interviews) |
| Calendar | [gog CLI](https://gogcli.sh/) (Google Meet scheduling) |
| Email | [Resend](https://resend.com/) (candidate notifications) |
| Landing | [Next.js](https://nextjs.org/) + [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/) + Magic UI |
| Deploy | [Vercel](https://vercel.com/) |

## Quick Install

```bash
curl -fsSL https://hermes-hire.xyz/install.sh | bash
hermes auth --key sk-nous-...
hermes auth --as alice
hermes --help
```

## Database Setup (Neon)

Add your Neon connection string to `.env`:

```env
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require"
```

Create tables and seed demo data:

```bash
pnpm db:push          # push schema to Neon
pnpm db:seed          # seed 3 users + demo job/candidate
# or from CLI (reads .env from project root):
pnpm hermes auth --seed --force
pnpm hermes status
```

Without `DATABASE_URL`, the CLI uses `~/.hermeshire/db.json` instead.

## CLI Commands

```
hermes auth --key <key>          Set Hermes API key
hermes auth --as alice/bob/carol Switch role
hermes status                    Show config

hermes job create <title> [--dept <dept>]
hermes job list
hermes job show <id>

hermes candidate add --job <id> --name <name> [--resume <text>]
hermes candidate invite --job <id> --name <name>
hermes candidate list [--job <id>] [--stage <stage>]
hermes candidate show <id>
hermes candidate move <id> --stage <stage>
hermes candidate summary <id>
hermes candidate questions <id>

hermes interview assign <candidate-id> --to <user>
hermes interview list [--mine]
hermes interview simulate <id>
hermes interview voice <id> --phone "<number>"

hermes feedback submit <interview-id> --rating <1-5> [--notes <text>]
hermes feedback show <id>

hermes review list
hermes review show <id>
hermes review hire <id>
hermes review reject <id>

hermes meet schedule <id> "<natural language>"
hermes audit <id>

hermes voice "<natural language>"   → translates to CLI command
```

## Demo Flow

```bash
# 1. Install
curl -fsSL https://hermes-hire.xyz/install.sh | bash

# 2. Auth
hermes auth --key sk-nous-...

# 3. HR — create job + add candidate + AI summary
hermes auth --as alice
hermes job create "Senior Frontend Engineer" --dept Engineering
hermes candidate invite --job 1 --name "Rahul" --email rahul@email.com
hermes candidate summary 1

# 4. Move to interview + assign
hermes candidate move 1 --stage INTERVIEW
hermes interview assign 1 --to bob

# 5. Interviewer — questions + simulate
hermes auth --as bob
hermes candidate questions 1
hermes interview simulate 1

# 6. Manager — review + hire
hermes auth --as carol
hermes review list
hermes review hire 1

# 7. Audit
hermes audit 1
```

## Pipeline Stages

```
PENDING_ONBOARDING → APPLIED → SCREENING → INTERVIEW → MANAGER_REVIEW → HIRED
                                           ↓                        ↓
                                        REJECTED                REJECTED
```

## AI Features

| Feature | Command | Powered By |
|---------|---------|------------|
| Candidate Summary | `hermes candidate summary <id>` | Hermes-4-70B |
| Interview Questions | `hermes candidate questions <id>` | Hermes-4-70B |
| Interview Simulation | `hermes interview simulate <id>` | Hermes-4-70B |
| Voice-to-Command | `hermes voice "<text>"` | Hermes-4-70B |
| Meet Parsing | `hermes meet schedule <id> "..."` | Hermes-4-70B + gog CLI |

## Project Structure

```
├── bin/hermes.mjs            # CLI entry point
├── public/install.sh          # one-curl install script
├── services/ai.ts             # Hermes API client
├── prompts/                   # AI system prompts (5 files)
├── prisma/
│   ├── schema.prisma          # 5 models (User, Job, Candidate, …)
│   └── seed.ts                # Neon demo seed
├── lib/
│   ├── demo-seed.ts           # shared demo dataset
│   ├── prisma-seed.ts         # Neon seed helpers
│   ├── db.ts                  # Prisma client
│   ├── meet.ts                # Google Meet via gog
│   ├── email.ts               # Resend email templates
│   └── voice/                 # Vapi voice feedback
├── components/                # Landing page + Magic UI sections
├── app/                       # Next.js landing page
└── docs/
    ├── cli-design.md          # Full CLI architecture
    ├── hermes-api-reference.md# Hermes API docs
    ├── progress.md            # Build tracker
    └── steps/                 # 7 implementation steps
```

## Build Progress

| Step | What | Status |
|------|------|--------|
| **1** | CLI skeleton + auth + install | ✅ Done |
| **2** | Storage + seed (Neon + JSON fallback) | ✅ Done |
| **3** | Job commands | ❌ Pending |
| **4** | Candidate commands + AI | ❌ Pending |
| **5** | Interview + feedback | ❌ Pending |
| **6** | Manager review | ❌ Pending |
| **7** | Meet + audit + voice | ❌ Pending |

See [`docs/progress.md`](docs/progress.md) for detailed checklist.

## Environment Variables

| Variable | Required | For |
|----------|----------|-----|
| `DATABASE_URL` | ✅ (team) | Neon Postgres — shared CLI + web data |
| `HERMES_API_KEY` | ✅ | AI features (summary, questions, voice-to-command) |
| `RESEND_API_KEY` | ❌ | Email notifications to candidates |
| `NEXT_PUBLIC_VAPI_WEB_TOKEN` | ❌ | Vapi phone interviews |

## Domain Glossary

See [`CONTEXT.md`](CONTEXT.md) for definitions of HR, Interviewer, Manager, Stage transitions, Hire/Reject semantics.

## License

MIT
