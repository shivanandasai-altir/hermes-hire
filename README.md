# HermesHire — Autonomous AI Hiring Copilot

> AI-powered collaborative hiring workflow platform

**Status:** Hackathon MVP · Build time ~3 hours

## Overview

HermesHire is an AI-native hiring command center powered by Hermes Agent that helps HR teams, interviewers, and managers collaborate across the complete recruitment workflow.

For the hackathon MVP, HR can create a job opening, add candidates with resume text, generate AI summaries, move candidates to interview, and assign interviewers. Interviewers can view assigned candidates, generate AI interview questions, and submit feedback. Managers can review candidate summaries, interview feedback, and hire or reject candidates. Managers can also schedule Google Meet calls with candidates using natural language.

The platform replaces scattered spreadsheets, emails, and traditional ATS complexity with a lightweight role-based hiring workspace featuring AI-assisted candidate summaries, interview question generation, feedback analysis, decision support, and transparent hiring history.

Built using Next.js, PostgreSQL, Prisma, and Hermes 3/4 as a focused hackathon MVP designed to ship within ~3 hours.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) 16.2.6 (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| UI | [shadcn/ui](https://ui.shadcn.com/) (nova preset) |
| Fonts | [Fraunces](https://fonts.google.com/specimen/Fraunces) (display) + [Sora](https://fonts.google.com/specimen/Sora) (body) |
| State | [TanStack Query](https://tanstack.com/query) 5 |
| ORM | [Prisma](https://www.prisma.io/) 7 (Postgres adapter) |
| Database | [Neon](https://neon.tech/) (serverless Postgres) |
| AI | [Nous Research Hermes 4](https://inference-api.nousresearch.com/v1) (Hermes-4-70B) |
| Voice | [Vapi](https://vapi.ai/) (AI interviewer calls) |
| Calendar | [gog CLI](https://gogcli.sh/) (Google Meet scheduling) |
| Analytics | [Vercel Analytics](https://vercel.com/analytics) + [Speed Insights](https://vercel.com/speed-insights) |
| Deployment | [Vercel](https://vercel.com/) |

## Data Model

```
User ──creates──→ Job ──has──→ Candidate ──has──→ Interview ──has──→ Feedback
```

- **User** — HR, Interviewer, or Manager role
- **Job** — Job opening with title, department, status
- **Candidate** — Name, email, resume text, pipeline stage, AI fields (summary, questions, recommendation), Meet link, audit logs (JSON)
- **Interview** — Assignment linking candidate ↔ interviewer
- **Feedback** — Rating, recommendation, comments (1:1 with Interview)

Stages: `APPLIED → SCREENING → INTERVIEW → MANAGER_REVIEW → HIRED / REJECTED`

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- A [Neon](https://neon.tech/) Postgres database (free tier)
- A [Nous Research](https://portal.nousresearch.com) API key (free credits available)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and HERMES_API_KEY

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL connection string |
| `HERMES_API_KEY` | ✅ | Nous Research API key (sk-nous-...) |
| `HERMES_API_URL` | ❌ | Default: `https://inference-api.nousresearch.com/v1` |
| `HERMES_MODEL` | ❌ | Default: `Hermes-4-70B` (also: `Hermes-4.3-36B`, `Hermes-4-405B`) |
| `NEXT_PUBLIC_VAPI_WEB_TOKEN` | ❌ | Vapi voice agent token (for AI interviewer calls) |

### Google Meet Scheduling Setup (optional)

```bash
brew install gogcli
gog auth add your@email.com --services calendar
```

## Project Structure

```
├── app/
│   ├── generated/prisma/     # Prisma v7 generated client
│   ├── globals.css           # Tailwind + shadcn + Hermes design tokens
│   ├── layout.tsx            # Root layout (fonts, providers, Analytics, Toaster)
│   ├── page.tsx              # Landing page (Fraunces display type, gold accents)
│   ├── providers.tsx         # React Query provider
│   ├── login/                # Role selector (HR / Interviewer / Manager)
│   ├── hr/                   # HR pages (dashboard, jobs, candidates, pipeline)
│   ├── interviewer/          # Interviewer pages (dashboard, candidate detail)
│   ├── manager/              # Manager pages (dashboard, review + decision)
│   └── api/                  # Route handlers (planned)
├── components/
│   ├── ui/                   # 19 shadcn/ui components
│   └── voice/
│       └── Agent.tsx         # Vapi voice call UI + transcript capture
├── prompts/                  # All AI system prompts (isolated from code)
│   ├── index.ts              # Barrel exports
│   ├── summary.ts            # HR candidate summary prompt
│   ├── questions.ts          # Interviewer questions prompt
│   ├── recommendation.ts     # Manager recommendation prompt
│   ├── meeting.ts            # Meeting scheduling parser prompt
│   └── voice-feedback.ts     # Voice interview feedback prompt
├── services/
│   └── ai.ts                 # Centralized Hermes API client
├── lib/
│   ├── auth.ts               # Session cookie helper
│   ├── constants.ts          # Roles, stages, valid transitions
│   ├── db.ts                 # Prisma client singleton (v7 adapter pattern)
│   ├── meet.ts               # Hermes-powered Google Meet scheduling via gog CLI
│   ├── queries.ts            # Shared DB query helpers (planned)
│   ├── vapi.sdk.ts           # Vapi voice SDK init
│   ├── utils.ts              # cn() utility
│   └── voice/
│       ├── assistant-config.ts  # Vapi AI interviewer config
│       └── feedback.ts          # Transcript → structured feedback via Hermes
├── middleware.ts             # Route guard for role-based pages
├── types/
│   └── vapi.ts               # Vapi message types
├── prisma/
│   ├── schema.prisma         # 5 models + 2 enums
│   └── seed.ts               # Seed data script
└── docs/
    ├── prd.md                # Product Requirements Document
    ├── hermes-setup.md       # Hermes agent setup guide
    ├── hermes-api-reference.md # Full API reference (endpoints, models, auth)
    ├── progress.md           # Build progress tracker
    ├── steps/                # 10 detailed implementation step docs
    └── adr/
        └── 0001-merge-aiinsight-and-auditlog-into-candidate.md
```

## Demo Flow

```
HR creates a job → adds candidate → AI summarizes resume
→ moves to Interview → assigns Interviewer
→ Interviewer generates AI questions → submits feedback
→ Manager reviews → makes final decision (hire/reject)
  └── or schedules a Google Meet call via natural language
```

Every action is tracked in an audit timeline on the candidate detail page.

## Key Features

| Feature | Description | Powered By |
|---------|-------------|------------|
| AI Candidate Summary | Resume analysis & fit assessment | Hermes-4-70B |
| AI Interview Questions | Role-specific technical + behavioral questions | Hermes-4-70B |
| Hiring Recommendation | Data-driven hire/reject decision support | Hermes-4-70B |
| Voice Interview | AI agent calls candidate, captures transcript | Vapi |
| Google Meet Scheduling | Natural language → structured datetime → Calendar event | Hermes + gog CLI |
| Audit Timeline | Full action history per candidate | Prisma (JSON field on Candidate) |

## AI Architecture

```
Browser → Next.js Server Action → services/ai.ts (callHermes)
  → POST https://inference-api.nousresearch.com/v1/chat/completions
  → Hermes-4-70B response → stored on Candidate model
```

All AI prompts live in `prompts/` — separated from business logic. Swap models by changing `HERMES_MODEL` in `.env`.

Available models: `Hermes-4.3-36B` (fast), `Hermes-4-70B` (balanced), `Hermes-4-405B` (best reasoning).

## Build Progress

| Phase | Status | Commands |
|-------|--------|----------|
| **1-3: Skeleton + Auth** | ✅ Done | `auth`, `status`, `voice`, `--help` |
| **4: Core Commands** | ❌ Pending | `hermes job`, `hermes candidate` |
| **5: Interview + Feedback** | ❌ Pending | `hermes interview`, `hermes feedback` |
| **6: Manager Review** | ❌ Pending | `hermes review` — hire/reject |
| **7: Meet + Audit** | ❌ Pending | `hermes meet`, `hermes audit` |

Detailed checklist: [`docs/progress.md`](docs/progress.md)

## Domain Glossary

See [`CONTEXT.md`](CONTEXT.md) for the project's domain language: definitions of HR, Interviewer, Manager, Stage transitions, Hire/Reject semantics, and flagged ambiguities.

## Skills

This project uses agent skills for development assistance:

| Skill | Purpose |
|-------|---------|
| `frontend-design` | Polished UI generation |
| `vercel-react-best-practices` | React/Next.js performance optimization |
| `web-design-guidelines` | UI compliance & accessibility audit |
| `dogfood` | Exploratory QA / bug finding |

## License

MIT
