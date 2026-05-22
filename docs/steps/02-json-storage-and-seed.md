# Step 2: JSON Storage + Seed Data

**Estimated time:** ~15 min  
**Depends on:** Step 1  
**Persistence layer.**

---

## Goal

A local JSON database at `~/.hermeshire/db.json` that stores all jobs, candidates, interviews, and feedback. Seed data with demo users.

## Key Files

- `src/cli/storage/db.ts` — JSON read/write helpers
- `~/.hermeshire/db.json` — Data file

## Schema

```json
{
  "version": 1,
  "jobs": [{ "id": 1, "title": "...", "department": "...", "status": "OPEN" }],
  "candidates": [{ "id": 1, "name": "...", "currentStage": "APPLIED", ... }],
  "interviews": [{ "id": 1, "candidateId": 1, "interviewerId": "bob", "status": "ASSIGNED" }],
  "feedback": [{ "id": 1, "interviewId": 1, "rating": 4, "recommendation": "Hire", "comments": "..." }]
}
```

## Acceptance Criteria

- [ ] Reading and writing to db.json works
- [ ] Auto-incrementing IDs for jobs, candidates, interviews, feedback
- [ ] Seed data creates 3 users + 1 demo job + 1 demo candidate
