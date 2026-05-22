# Step 4: Candidate Commands + AI

**Estimated time:** ~25 min  
**Depends on:** Steps 1-3  
**Core workflow + AI integration.**

---

## Goal

Add candidates to jobs, move them through pipeline stages, and generate AI summaries/questions via Hermes API.

## Commands Built

```
hermes candidate add --job <id> --name <name> [--email <email>] [--resume <text>]
hermes candidate invite --job <id> --name <name> [--email <email>]
hermes candidate list [--job <id>] [--stage <stage>]
hermes candidate show <id>
hermes candidate move <id> --stage <stage>
hermes candidate summary <id>
hermes candidate questions <id>
```

## Pipeline Stages

```
PENDING_ONBOARDING → APPLIED → SCREENING → INTERVIEW → MANAGER_REVIEW → HIRED
                                                              ↓
                                                           REJECTED
```

## AI Integration

- `hermes candidate summary <id>` — calls `generateCandidateSummary()` from `services/ai.ts`
- `hermes candidate questions <id>` — calls `generateInterviewQuestions()` from `services/ai.ts`
- Both store results in `db.json` and display to user
- Re-generates if called again (overwrites)

## Candidate Invite

- `hermes candidate invite` creates a candidate with `PENDING_ONBOARDING` stage
- Generates a unique onboard token
- Prints a shareable link: `https://hermes-hire.xyz/onboard/<token>`
- Sends email via Resend if `RESEND_API_KEY` is configured

## Acceptance Criteria

- [ ] HR can add a candidate to a job with resume text
- [ ] HR can move candidates through valid stage transitions
- [ ] Invalid transitions (e.g., APPLIED → HIRED) are rejected
- [ ] `candidate summary` calls Hermes and stores the result
- [ ] `candidate invite` prints a shareable link
