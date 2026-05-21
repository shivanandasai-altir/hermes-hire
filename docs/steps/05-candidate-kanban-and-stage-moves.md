# Step 5: Candidate Kanban + Stage Moves

**Estimated time:** ~25 min  
**Depends on:** Steps 1, 2, 3, 4 (candidates exist in the DB)  
**Visual pipeline.**

---

## Goal

A Kanban-style board grouping candidates by stage. HR can move candidates between stages using dropdowns or buttons. Stage transitions are validated against the allowed paths.

## Files to Create

### `app/hr/pipeline/page.tsx`
- Fetches all candidates for the HR user's jobs, grouped by stage
- Displays columns: APPLIED, SCREENING, INTERVIEW, MANAGER_REVIEW, HIRED, REJECTED
- Each column is a scrollable list of candidate cards
- Each card shows: name, email, AI summary badge (if generated)

### `components/candidate-card.tsx` (Client Component)
```tsx
"use client";

interface CandidateCardProps {
  candidate: { id: string; name: string; email: string; currentStage: Stage; aiSummary: string | null };
  onMove: (candidateId: string, newStage: Stage) => void;
}
```

- Shows candidate name, email
- Badge if AI summary exists
- Stage dropdown with only valid next stages (computed from `canTransition()`)

### `app/hr/pipeline/actions.ts` — Server Action
```typescript
"use server";

export async function moveCandidateStage(candidateId: string, newStage: Stage) {
  const session = await getSession();
  const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new Error("Candidate not found");

  if (!canTransition(candidate.currentStage as Stage, newStage)) {
    throw new Error(`Cannot move from ${candidate.currentStage} to ${newStage}`);
  }

  const auditLogs = candidate.auditLogs as any[];
  auditLogs.push({
    action: `Moved from ${candidate.currentStage} to ${newStage}`,
    userId: session.id,
    userName: session.name,
    timestamp: new Date().toISOString(),
  });

  await db.candidate.update({
    where: { id: candidateId },
    data: { currentStage: newStage, auditLogs },
  });

  revalidatePath("/hr/pipeline");
}
```

## Key Pattern: Stage Transition Validation

From `lib/constants.ts` (already created):

```typescript
export const VALID_TRANSITIONS: Record<Stage, Stage[]> = {
  APPLIED: ["SCREENING", "REJECTED"],
  SCREENING: ["INTERVIEW", "REJECTED"],
  INTERVIEW: ["MANAGER_REVIEW", "REJECTED"],
  MANAGER_REVIEW: ["HIRED", "REJECTED"],
  HIRED: [],
  REJECTED: [],
};
```

The stage dropdown should only show valid next stages. For example, a candidate at `APPLIED` can only move to `SCREENING` or `REJECTED`.

## Files to Create
- `app/hr/pipeline/page.tsx` — Kanban board
- `components/candidate-card.tsx` — candidate card
- `app/hr/pipeline/actions.ts` — Server Action for stage moves

## Files to Modify
- `app/hr/layout.tsx` — add "Pipeline" nav link

## Acceptance Criteria

- [ ] HR sees candidates grouped by stage in columns
- [ ] Each candidate card shows name, email, AI summary badge
- [ ] Stage dropdown only shows valid transitions
- [ ] Moving a candidate updates the stage and creates an audit log entry
- [ ] Invalid transitions (e.g., APPLIED → HIRED) are rejected
