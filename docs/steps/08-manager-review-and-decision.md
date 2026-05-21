# Step 8: Manager Review + Decision

**Estimated time:** ~20 min  
**Depends on:** Steps 1, 2, 7 (candidates reach MANAGER_REVIEW)  
**Third role + final decision.**

---

## Goal

Manager sees candidates in `MANAGER_REVIEW` stage, reviews AI summary + interview feedback side-by-side, and makes a final decision: **Hire** or **Reject**. Manager can also schedule a Google Meet call with the candidate via natural language.

## Files to Create

### `app/manager/layout.tsx`
- Server Component that checks session role (must be MANAGER)
- Sidebar nav: Dashboard, Logout

### `app/manager/dashboard/page.tsx`
- Server Component that fetches all candidates with `currentStage: "MANAGER_REVIEW"`
- Card or table view with: candidate name, job title, days in review
- Each row links to candidate detail page

### `app/manager/candidates/[id]/page.tsx`
- Full review page with two panels:
  - **Left:** AI Summary (from `Candidate.aiSummary`)
  - **Right:** Interview Feedback (from `Feedback` table, linked via `Interview`)
- At the bottom:
  - **Hire** button (green) → stage = `HIRED`
  - **Reject** button (red) → stage = `REJECTED`
  - **Schedule Meet** input → text box + "Schedule" button

### `app/manager/actions.ts` — Server Actions
```typescript
"use server";

export async function hireCandidate(candidateId: string) {
  const session = await getSession();
  const candidate = await db.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate) throw new Error("Candidate not found");

  const auditLogs = candidate.auditLogs as any[];
  auditLogs.push({
    action: "Hired by Manager",
    userId: session.id,
    userName: session.name,
    timestamp: new Date().toISOString(),
  });

  await db.candidate.update({
    where: { id: candidateId },
    data: { currentStage: "HIRED", auditLogs },
  });

  revalidatePath("/manager/dashboard");
}

export async function rejectCandidate(candidateId: string) {
  // Same pattern as hireCandidate, but stage = "REJECTED"
  // audit log: "Rejected by Manager"
}

export async function scheduleMeeting(candidateId: string, userInput: string) {
  const session = await getSession();
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });
  if (!candidate) throw new Error("Candidate not found");

  const result = await scheduleMeetingWithHermes(
    userInput,
    candidate.name,
    candidate.job.title,
    candidate.email,
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to schedule meeting");
  }

  const auditLogs = candidate.auditLogs as any[];
  auditLogs.push({
    action: `Google Meet scheduled: ${result.meetLink}`,
    userId: session.id,
    userName: session.name,
    timestamp: new Date().toISOString(),
  });

  await db.candidate.update({
    where: { id: candidateId },
    data: { meetLink: result.meetLink, auditLogs },
  });

  revalidatePath(`/manager/candidates/${candidateId}`);
}
```

### `components/schedule-meet.tsx` (Client Component)
- Text input + "Schedule" button
- Calls `scheduleMeeting()` Server Action
- Shows loading state during Hermes parsing + gog execution
- Displays the resulting Meet link as a clickable link
- Handles error state (gog not installed, Hermes down, etc.)

## Key Decision: Hire/Reject Only

Two unambiguous buttons. No "Approve" — it was redundant with "Hire".

| Action | Stage | Audit Log |
|--------|-------|-----------|
| Hire | `HIRED` | "Hired by Manager" |
| Reject | `REJECTED` | "Rejected by Manager" |

## Files to Create
- `app/manager/layout.tsx`
- `app/manager/dashboard/page.tsx`
- `app/manager/candidates/[id]/page.tsx`
- `app/manager/actions.ts`
- `components/schedule-meet.tsx`

## Acceptance Criteria

- [ ] Manager sees only candidates in MANAGER_REVIEW stage
- [ ] Manager can view AI summary + interviewer feedback side-by-side
- [ ] Clicking Hire → stage becomes HIRED, audit log created
- [ ] Clicking Reject → stage becomes REJECTED, audit log created
- [ ] Manager can type "Schedule call tomorrow at 2pm" → creates Google Meet → link displayed
- [ ] Meet link is stored on Candidate and visible in audit timeline
