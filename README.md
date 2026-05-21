# Hermes Hire — AI Hiring Orchestrator

> Role-based AI hiring command center powered by Hermes Agent.

**Status:** Hackathon MVP · Build time ~3 hours

## Overview

HermesHire is an AI-native hiring command center that helps HR teams, interviewers, and managers collaborate across the complete recruitment workflow.

- **HR** creates job openings, adds candidates with resume text, generates AI summaries, moves candidates through pipeline stages, and assigns interviewers.
- **Interviewers** view assigned candidates, generate AI interview questions, and submit structured feedback.
- **Managers** review candidate summaries, interview feedback, and approve, reject, or hire candidates.

The platform replaces scattered spreadsheets, emails, and traditional ATS complexity with a lightweight role-based hiring workspace featuring AI-assisted candidate summaries, interview question generation, feedback analysis, decision support, and transparent hiring history.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js](https://nextjs.org/) 16.2.6 (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS](https://tailwindcss.com/) v4 |
| UI | [shadcn/ui](https://ui.shadcn.com/) (nova preset) |
| State | [TanStack Query](https://tanstack.com/query) 5 |
| ORM | [Prisma](https://www.prisma.io/) 7 (Postgres adapter) |
| Database | [Neon](https://neon.tech/) (serverless Postgres) |
| AI | Hermes Agent API |
| Deployment | [Vercel](https://vercel.com/) |

## Data Model

```
User ──creates──→ Job ──has──→ Candidate ──has──→ Interview ──has──→ Feedback
```

- **User** — HR, Interviewer, or Manager role
- **Job** — Job opening with title, department, status
- **Candidate** — Name, email, resume text, pipeline stage, AI fields, audit logs
- **Interview** — Assignment linking candidate ↔ interviewer
- **Feedback** — Rating, recommendation, comments (1:1 with Interview)

Stages: `APPLIED → SCREENING → INTERVIEW → MANAGER_REVIEW → HIRED / REJECTED`

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm
- A [Neon](https://neon.tech/) Postgres database (free tier)

### Setup

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Edit .env with your Neon DATABASE_URL

# Push schema to database
pnpm db:push

# Seed with sample data
pnpm db:seed

# Start development server
pnpm dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `HERMES_API_KEY` | Hermes Agent API key (for AI features) |

## Project Structure

```
├── app/
│   ├── generated/prisma/     # Prisma generated client
│   ├── globals.css           # Tailwind + shadcn styles
│   ├── layout.tsx            # Root layout (providers, toaster)
│   ├── page.tsx              # Landing page (→ login)
│   ├── providers.tsx         # React Query provider
│   ├── hr/                   # HR pages
│   ├── interviewer/          # Interviewer pages
│   ├── manager/              # Manager pages
│   ├── login/                # Role selector
│   └── api/                  # Route handlers + AI proxy
├── components/
│   └── ui/                   # shadcn/ui components
├── lib/
│   ├── constants.ts          # Roles, stages, transitions
│   ├── db.ts                 # Prisma client singleton
│   └── utils.ts              # cn() utility
├── prisma/
│   └── schema.prisma         # Database schema
└── docs/
    └── prd.md                # Product Requirements Document
```

## Demo Flow

```
HR creates a job → adds candidate → AI summarizes resume
→ moves to Interview → assigns Interviewer
→ Interviewer generates AI questions → submits feedback
→ Manager reviews → makes final decision (hire/reject)
```

Every action is tracked in an audit timeline on the candidate detail page.

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
