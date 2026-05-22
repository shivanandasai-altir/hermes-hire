# Step 2: Storage + Seed Data

**Estimated time:** ~15 min  
**Depends on:** Step 1  
**Persistence layer.**

---

## Goal

Store jobs, candidates, interviews, and feedback with demo seed data. Supports:

1. **Neon (recommended)** — shared Postgres via `DATABASE_URL` in `.env` (CLI + web app)
2. **Local JSON fallback** — `~/.hermeshire/db.json` when `DATABASE_URL` is unset

## Key Files

| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | 5 models: User, Job, Candidate, Interview, Feedback |
| `lib/demo-seed.ts` | Shared demo dataset (users, job, candidate, interview, feedback) |
| `lib/prisma-seed.ts` | Neon seed + clear helpers |
| `prisma/seed.ts` | `pnpm db:seed` entry point |
| `src/cli/storage/db.ts` | JSON read/write (fallback) |
| `src/cli/storage/store.ts` | Picks Neon vs JSON from `DATABASE_URL` |
| `~/.hermeshire/db.json` | Local fallback data file |

## Setup (Neon)

```bash
# .env
DATABASE_URL="postgresql://...@ep-xxx.neon.tech/neondb?sslmode=require"

pnpm db:push      # create tables on Neon
pnpm db:seed      # seed demo data
# or replace existing:
pnpm db:reset-seed
```

CLI (with `.env` in project root):

```bash
hermes auth --seed --force
hermes status     # shows Neon host + counts
```

## Setup (local JSON only)

Unset `DATABASE_URL` or run CLI outside the repo without `.env`:

```bash
hermes auth --seed --force
# writes ~/.hermeshire/db.json
```

## Schema (Prisma)

- **User** — string id (`alice`, `bob`, `carol`)
- **Job / Candidate / Interview / Feedback** — auto-increment integer ids
- **Stage** enum includes `PENDING_ONBOARDING`
- **auditLogs** — JSON on `Candidate`

## Acceptance Criteria

- [x] Reading and writing works (Neon via Prisma, or local JSON)
- [x] Auto-incrementing IDs for jobs, candidates, interviews, feedback
- [x] Seed creates 3 users + 1 demo job + 1 demo candidate (+ interview + feedback)
- [x] Stage transition validation (`assertStageTransition`, `moveCandidateStage`)
- [x] `pnpm db:push` + `pnpm db:seed` populate Neon
