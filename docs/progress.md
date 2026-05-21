# HermesHire — Build Progress

> Update this file by checking `[ ]` → `[x]` as each task is completed.

---

## ✅ Infrastructure & Setup

- [x] Initialize Next.js 16 project
- [x] Install Tailwind CSS v4
- [x] Install shadcn/ui (nova preset)
- [x] Install @tanstack/react-query
- [x] Install Prisma 7 + @prisma/adapter-pg
- [x] Install dotenv
- [x] Set up Prisma client singleton (`lib/db.ts`)
- [x] Create React Query provider (`app/providers.tsx`)
- [x] Update root layout with providers + Toaster
- [x] Create stage/role constants (`lib/constants.ts`)
- [x] Install @vapi-ai/web
- [x] Install googleapis (later replaced by gog CLI)
- [x] Create Hermes client (`services/ai.ts`)
- [x] Create prompt files (`prompts/`)
- [x] Create Hermes setup docs (`docs/hermes-setup.md`)
- [x] Set up gog CLI integration (`lib/meet.ts`)
- [x] Set up Vapi voice agent (`components/voice/Agent.tsx`, `lib/vapi.sdk.ts`, `lib/voice/`)
- [x] Configure API key: `HERMES_API_KEY=sk-nous-...`
- [x] Create landing page (`app/page.tsx`)
- [x] Create BUILD.md with build order

## 📚 Documentation

- [x] PRD (`docs/prd.md`)
- [x] README with project info
- [x] Domain glossary (`CONTEXT.md`)
- [x] Hermes setup guide (`docs/hermes-setup.md`)
- [ ] Delivery checklist (deploy, demo script)

---

## 🏗️ Build Steps

### Step 1 — Login + Middleware

- [ ] Create `/login` page with 3 role buttons
- [ ] Create mock user data (Alice HR, Bob Interviewer, Carol Manager)
- [ ] Create session cookie on role select
- [ ] Create `middleware.ts` to protect role routes
- [ ] Create `lib/auth.ts` — `getSession()` helper
- [ ] Update root page to redirect to `/login`

### Step 2 — Prisma Schema + Seed

- [ ] Define 5 models in `prisma/schema.prisma` (User, Job, Candidate, Interview, Feedback)
- [ ] Define Role and Stage enums
- [ ] Create `prisma/seed.ts` with mock users
- [ ] Run `pnpm db:push` successfully
- [ ] Run `pnpm db:seed` successfully

### Step 3 — HR Dashboard + Create Job

- [ ] Create `app/hr/layout.tsx` with sidebar + role guard
- [ ] Create `app/hr/dashboard/page.tsx`
- [ ] Create `app/hr/jobs/page.tsx` with job list
- [ ] Create Server Action: `createJob()`
- [ ] HR can create a job → appears in list

### Step 4 — Add Candidate + AI Summary

- [ ] Create `app/hr/candidates/page.tsx` with candidate list
- [ ] Create "Add Candidate" dialog form
- [ ] Create Server Action: `addCandidate()` with audit log
- [ ] Create "Generate AI Summary" button
- [ ] Hermes returns summary → stored on `Candidate.aiSummary`
- [ ] Audit log entry created for both actions

### Step 5 — Candidate Kanban + Stage Moves

- [ ] Create `app/hr/pipeline/page.tsx` — Kanban board grouped by stage
- [ ] Create `components/candidate-card.tsx`
- [ ] Stage dropdown shows only valid transitions
- [ ] Create Server Action: `moveCandidateStage()`
- [ ] Invalid transitions rejected
- [ ] Audit log entry created on move

### Step 6 — Interviewer Dashboard + AI Questions

- [ ] Create `app/interviewer/layout.tsx` with role guard
- [ ] Create `app/interviewer/dashboard/page.tsx` — assigned candidates
- [ ] Create `app/interviewer/candidates/[id]/page.tsx`
- [ ] "Generate AI Questions" button → Hermes → stored
- [ ] "Start Voice Interview" button (Vapi)

### Step 7 — Feedback Form + Voice Wiring

- [ ] Create `components/feedback-form.tsx` (rating, recommendation, comments)
- [ ] Create Server Action: `submitFeedback()`
- [ ] Auto-advance candidate to MANAGER_REVIEW after feedback
- [ ] Wire Vapi `Agent.tsx` `onComplete` → auto-generate feedback
- [ ] Interview status changes to COMPLETED

### Step 8 — Manager Review + Decision

- [ ] Create `app/manager/layout.tsx` with role guard
- [ ] Create `app/manager/dashboard/page.tsx` — candidates in MANAGER_REVIEW
- [ ] Create `app/manager/candidates/[id]/page.tsx` — AI summary + feedback side-by-side
- [ ] **Hire** button → stage `HIRED`, audit: "Hired by Manager"
- [ ] **Reject** button → stage `REJECTED`, audit: "Rejected by Manager"
- [ ] Create `components/schedule-meet.tsx` — natural language → gog → Meet link
- [ ] Create Server Action: `scheduleMeeting()`
- [ ] Meet link stored on Candidate, displayed in UI

### Step 9 — Candidate Detail Page + Audit Timeline

- [ ] Create `app/hr/candidates/[id]/page.tsx` — full detail view
- [ ] Create `components/audit-timeline.tsx` — reverse chronological log
- [ ] Create `lib/queries.ts` — `getCandidateWithDetails()`
- [ ] Add audit timeline to interviewer + manager views

### Step 10 — Polish, Seed Data, Demo Prep

- [ ] Enriched seed data with demo-ready story
- [ ] Loading states (Skeleton) on all pages
- [ ] Empty states when no data
- [ ] Error toasts via sonner
- [ ] Landing page polished
- [ ] Deploy to Vercel
- [ ] Set env vars in Vercel dashboard
- [ ] Demo script verified (under 3 min)

---

## 🔧 Skills Installed

- [x] `frontend-design` — polished UI generation
- [x] `vercel-react-best-practices` — React/Next.js performance
- [x] `web-design-guidelines` — UI compliance & accessibility
- [x] `dogfood` — exploratory QA / bug finding

## 🎯 ADRs

- [x] ADR-0001: Merge AIInsight and AuditLog into Candidate model

---

## How to use

When completing a task, change `[ ]` to `[x]` in this file. Example:

```diff
- [ ] Create `/login` page with 3 role buttons
+ [x] Create `/login` page with 3 role buttons
```
