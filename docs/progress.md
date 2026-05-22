# HermesHire — Build Progress

> CLI-first hackathon MVP. Updated automatically as phases complete.

---

## Legend

`✅` Done · `🔄` In progress · `❌` Not started

---

## ✅ Completed

- [x] Hermes-4-70B API key configured + verified
- [x] AI client (`services/ai.ts`) — `callHermes()`, `generateCandidateSummary()`, `generateInterviewQuestions()`, `generateRecommendation()`
- [x] Prompts (`prompts/`) — summary, questions, recommendation, meeting, voice-feedback
- [x] Email (`lib/email.ts`) — 3 branded templates, Resend, domain `hermes-hire.xyz` verified
- [x] Landing page (`app/page.tsx`) — CLI-focused, Magic UI Terminal, FlickeringGrid, 68 sections
- [x] Vapi voice agent integration (`components/voice/`, `lib/voice/`)
- [x] Google Meet scheduling (`lib/meet.ts` — Hermes + gog CLI)
- [x] Docs: PRD, CONTEXT.md, CLI design, Hermes API reference, setup guide

---

## 🏗️ CLI Build

### Step 1: Skeleton + Auth (15 min)
- [x] `bin/hermes.mjs` — entry point with commander
- [x] ASCII logo (big block "HERMES" text)
- [x] `hermes auth --as alice/bob/carol` — role switching
- [x] `hermes auth --key <api-key>` — API key persistence
- [x] `hermes status` — show config
- [x] `hermes voice <text>` — natural language → CLI translation
- [x] `public/install.sh` — one-curl install script
- [x] Wrapper script with `"$@"` argument passthrough

### Step 2: JSON Storage + Seed (15 min)
- [ ] `src/cli/storage/db.ts` — JSON read/write helpers
- [ ] Auto-incrementing IDs
- [ ] Seed data (3 users, 1 demo job, 1 demo candidate)
- [ ] Stage transition validation

### Step 3: Job Commands (10 min)
- [ ] `hermes job create <title> [--dept <dept>]`
- [ ] `hermes job list`
- [ ] `hermes job show <id>`
- [ ] Role guard (HR only for create)

### Step 4: Candidate Commands + AI (25 min)
- [ ] `hermes candidate add --job <id> --name <name>`
- [ ] `hermes candidate invite` — generates onboard link
- [ ] `hermes candidate list [--stage]`
- [ ] `hermes candidate show <id>`
- [ ] `hermes candidate move <id> --stage <stage>`
- [ ] `hermes candidate summary <id>` — calls Hermes API
- [ ] `hermes candidate questions <id>` — calls Hermes API
- [ ] Send invite email via Resend

### Step 5: Interview + Feedback (15 min)
- [ ] `hermes interview assign <candidate-id> --to <user>`
- [ ] `hermes interview list [--mine]`
- [ ] `hermes interview simulate <id>` — Hermes generates fake transcript + scores
- [ ] `hermes feedback submit <interview-id> --rating <1-5>`
- [ ] `hermes feedback show <id>`

### Step 6: Manager Review (10 min)
- [ ] `hermes review list` — shows candidates in MANAGER_REVIEW
- [ ] `hermes review show <id>` — AI summary + feedback side-by-side
- [ ] `hermes review hire <id>` — stage → HIRED, audit: "Hired by Manager"
- [ ] `hermes review reject <id>` — stage → REJECTED, audit: "Rejected by Manager"

### Step 7: Meet + Audit + Voice (15 min)
- [ ] `hermes meet schedule <id> "<natural language>"` — gog CLI integration
- [ ] `hermes audit <id>` — full timeline
- [ ] `hermes interview voice <id> --phone "<number>"` — Vapi live call

---

## ✅ Post-Hackathon (Web App)

- [ ] Prisma schema (5 models)
- [ ] Neon database
- [ ] Login + middleware
- [ ] Role dashboards (HR, Interviewer, Manager)
- [ ] Kanban pipeline
- [ ] shadcn UI pages
- [ ] Vercel deployment
