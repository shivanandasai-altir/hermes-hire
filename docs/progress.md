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

### Step 2: Storage + Seed (15 min)
- [x] `src/cli/storage/db.ts` — JSON read/write helpers (fallback)
- [x] `prisma/schema.prisma` — 5 models (User, Job, Candidate, Interview, Feedback)
- [x] `lib/demo-seed.ts` + `lib/prisma-seed.ts` + `prisma/seed.ts`
- [x] `src/cli/storage/store.ts` — Neon when `DATABASE_URL` set, else JSON
- [x] Auto-incrementing IDs
- [x] Seed data (3 users, 1 demo job, 1 demo candidate)
- [x] Stage transition validation
- [x] `pnpm db:push` + `pnpm db:seed` → Neon

### Step 3: Job Commands (10 min)
- [x] `hermes job create <title> [--dept <dept>]`
- [x] `hermes job list`
- [x] `hermes job show <id>`
- [x] Role guard (HR only for create)

### Step 4: Candidate Commands + AI (25 min)
- [x] `hermes candidate add --job <id> --name <name>`
- [x] `hermes candidate invite` — generates onboard link
- [x] `hermes candidate list [--stage]`
- [x] `hermes candidate show <id>`
- [x] `hermes candidate move <id> --stage <stage>`
- [x] `hermes candidate summary <id>` — calls Hermes API
- [x] `hermes candidate questions <id>` — calls Hermes API
- [x] Send invite email via Resend

### Step 5: Interview + Feedback (15 min)
- [x] `hermes interview assign <candidate-id> --to <user>`
- [x] `hermes interview list [--mine]`
- [x] `hermes interview simulate <id>` — Hermes generates fake transcript + scores
- [x] `hermes feedback submit <interview-id> --rating <1-5>`
- [x] `hermes feedback show <id>`

### Step 6: Manager Review (10 min)
- [x] `hermes review list` — shows candidates in MANAGER_REVIEW
- [x] `hermes review show <id>` — AI summary + feedback side-by-side
- [x] `hermes review hire <id>` — stage → HIRED, audit: "Hired by Manager"
- [x] `hermes review reject <id>` — stage → REJECTED, audit: "Rejected by Manager"

### Step 7: Meet + Audit + Voice (15 min)
- [x] `hermes meet schedule <id> "<natural language>"` — gog CLI integration
- [x] `hermes audit <id>` — full timeline
- [x] `hermes interview voice <id> --phone "<number>"` — Vapi live call

### Step 8: Uploadthing File Upload (15 min)
- [x] Set up Uploadthing API route + client
- [x] Replace file upload zones with UploadDropzone
- [x] Store resumeFileUrl on Candidate record
- [x] Keep extracted text (resumeText) for AI
- [x] Update Prisma schema with resumeFileUrl field

---

## ✅ Post-Hackathon (Web App)

- [x] Prisma schema (5 models)
- [x] Neon database (seed via `pnpm db:seed`)
- [ ] Login + middleware
- [ ] Role dashboards (HR, Interviewer, Manager)
- [ ] Kanban pipeline
- [ ] shadcn UI pages
- [ ] Vercel deployment
