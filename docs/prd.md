# PRD: Hermes Hire — AI Hiring Orchestrator

> **Build time:** ~3 hours (hackathon MVP)
> **Status:** Ready for implementation

---

## Problem Statement

HR teams, interviewers, and hiring managers rely on scattered spreadsheets, email chains, and bloated ATS tools to manage recruitment workflows. There is no lightweight, role-based workspace that combines AI-assisted candidate summarization, interview question generation, feedback analysis, and decision support in a single focused interface. The result is slow hiring cycles, inconsistent evaluation, and lost context across handoffs.

---

## Solution

Hermes Hire is an AI-native hiring command center powered by Hermes Agent that lets HR, interviewers, and managers collaborate across the complete recruitment workflow:

- **HR** creates job openings, adds candidates with resume text, generates AI summaries, moves candidates through pipeline stages, and assigns interviewers.
- **Interviewers** view assigned candidates, generate AI interview questions, and submit structured feedback.
- **Managers** review AI summaries, interviewer feedback, and approve, reject, or hire candidates.

Every action is captured in an audit timeline for full transparency.

---

## User Stories

1. As an HR user, I want to log in with a role selector, so that I can quickly access the HR dashboard without setting up real authentication.
2. As an HR user, I want to create job openings with a title and department, so that I can start tracking candidates for specific roles.
3. As an HR user, I want to add candidates with their name, email, phone, and resume text, so that I can build a candidate pool for a job.
4. As an HR user, I want to generate an AI candidate summary from the resume text, so that I can quickly understand a candidate's strengths and fit.
5. As an HR user, I want to view candidates in a Kanban board organized by pipeline stage, so that I can visualize the hiring pipeline.
6. As an HR user, I want to drag or move candidates between stages (Applied → Screening → Interview → Manager Review → Hired/Rejected), so that I can track progress.
7. As an HR user, I want to assign an interviewer to a candidate who has reached the Interview stage, so that the right person conducts the interview.
8. As an interviewer, I want to see my assigned interviews on a dashboard, so that I know which candidates I need to evaluate.
9. As an interviewer, I want to read the candidate's AI summary, so that I can prepare for the interview efficiently.
10. As an interviewer, I want to generate AI-powered interview questions tailored to the candidate and role, so that I can conduct a structured interview.
11. As an interviewer, I want to submit feedback (rating, recommendation, comments) after an interview, so that my evaluation is captured.
12. As a manager, I want to see candidates in Manager Review stage, so that I can make final decisions.
13. As a manager, I want to review the AI summary and interviewer feedback side by side, so that I have all context for a decision.
14. As a manager, I want to approve, reject, or hire a candidate, so that the pipeline progresses to a final outcome.
15. As any user, I want to see an audit timeline on the candidate detail page, so that I can trace every action taken on that candidate.

---

## Implementation Decisions

### Authentication
- **Mock auth with role selector.** Three buttons on `/login`: "Login as HR", "Login as Interviewer", "Login as Manager".
- Creates a session cookie with `{ userId, name, role, email }`.
- `middleware.ts` guards all `/hr/`, `/interviewer/`, `/manager/` routes.
- Prisma `User` table seeded with 3-4 mock users at migration time.
- API routes and Server Actions read userId from cookie (not a JWT).

### Data Model (Simplified)
- **5 models** instead of the full 7: `User`, `Job`, `Candidate`, `Interview`, `Feedback`.
- `AIInsight` model **removed** — AI data stored directly on `Candidate` as nullable fields:
  - `aiSummary: String?`
  - `aiQuestions: String?`
  - `aiRecommendation: String?`
- `AuditLog` model **removed** — audit stored as a `Json` field on `Candidate`:
  - `auditLogs: Json` — array of `{ action, userId, userName, timestamp, details? }`
- Stage enum: `APPLIED`, `SCREENING`, `INTERVIEW`, `MANAGER_REVIEW`, `HIRED`, `REJECTED`

### API Strategy
- Use **Next.js Server Actions** (`'use server'`) for mutations (create job, add candidate, move stage, submit feedback, make decision).
- Use **Next.js Route Handlers** (`route.ts`) for reads (list jobs, list candidates, get candidate details, list my interviews).
- Use **Server Components** for data-fetching pages (dashboard, lists).
- Use **Client Components** for interactive pieces (Kanban board, forms, AI generation buttons).

### AI Integration (Hermes Agent)
- **Live from start.** No mock mode.
- AI service module at `services/ai.ts` with three functions:
  - `generateCandidateSummary(resumeText: string, jobTitle: string): Promise<string>`
  - `generateInterviewQuestions(candidateSummary: string, jobTitle: string): Promise<string>`
  - `generateRecommendation(candidateSummary: string, feedbackSummary: string): Promise<string>`
- Each function calls a Next.js API route (`/api/ai/summary`, `/api/ai/questions`, `/api/ai/recommendation`) which proxies to the Hermes Agent API.
- AI responses streamed or returned as plain text, stored in the `Candidate` model.

### Database & Deployment
- **PostgreSQL on Neon** (serverless, free tier).
- **Vercel** for deployment.
- Prisma with connection pooling (`?pgbouncer=true`).
- `postinstall` script: `prisma generate`.

### UI Components
- **shadcn/ui** for all UI primitives (buttons, cards, dialogs, forms, badges).
- Tailwind CSS v4 for styling.
- Role-based layouts with sidebar navigation.

### Testing
- **AI Service module** — unit tests for prompt construction and response parsing (mock HTTP).
- **Stage transition logic** — unit tests for valid/invalid stage transitions and audit log creation.

### Build Order
1. Login role selector + middleware
2. Prisma schema + seed + migrations
3. HR Dashboard + Create Job form
4. Add Candidate + AI Summary generation
5. Candidate Kanban board + stage moves
6. Interviewer Dashboard + Generate Questions
7. Feedback form
8. Manager Review + Decision buttons
9. Candidate detail page (with audit timeline)
10. Polish, seed data, demo prep

---

## Testing Decisions

- **What makes a good test:** Test external behavior, not implementation details. For the AI Service, test that given a resume text and job title, the function returns a non-empty string with expected structure. For stage transitions, test that valid transitions succeed and invalid ones throw.
- **Modules to test:**
  - `services/ai.test.ts` — unit test with mock fetch/Hermes responses.
  - `lib/stages.test.ts` — pure function tests for stage transition validation.
- **Prior art:** Fresh project — no existing tests. We'll set up Vitest.

---

## Out of Scope

- Real authentication (OAuth, email/password) — mock role selector only.
- Email notifications or calendar scheduling.
- Bulk candidate import (CSV).
- Resume file upload / parsing — resume text is pasted directly.
- Multi-tenant / org separation.
- Real-time WebSocket updates — user must refresh or navigate.
- Full CI/CD pipeline.

---

## Further Notes

- The demo story walks through all three roles in sequence: HR creates a job → adds candidate → AI summarizes → moves to interview → assigns interviewer → Interviewer generates questions → submits feedback → Manager reviews → makes decision.
- Every action writes to the audit log on the Candidate record.
- The project name (package.json) is already `hermes-hire`. The layout and globals are already scaffolded with Tailwind v4.
- Next.js 16 specific: `params` in page components is a `Promise` (must be awaited). Use `useActionState` for pending states in forms. Use `refresh()` from `next/cache` after mutations.
