# Step 7: Feedback Form + Voice Agent Wiring

**Estimated time:** ~25 min  
**Depends on:** Steps 1, 2, 6 (interviewer + candidate detail page exists)  
**Completes the interviewer workflow.**

---

## Goal

Interviewer submits structured feedback (rating, recommendation, comments) for an interview. Optionally, the Vapi voice agent can auto-generate feedback from a call transcript.

## Files to Create

### `components/feedback-form.tsx` (Client Component)
```tsx
"use client";

interface FeedbackFormProps {
  interviewId: string;
  candidateId: string;
  onSubmit: (data: { rating: number; recommendation: string; comments: string }) => Promise<void>;
}
```

Fields:
- **Rating:** shadcn `Select` (1-5 stars or numeric)
- **Recommendation:** `Select` — "Strong Hire", "Hire", "No Hire", "Strong No Hire"
- **Comments:** `Textarea` — free text notes
- Submit button → calls Server Action

### `app/interviewer/actions.ts` — Add Server Action
```typescript
"use server";

export async function submitFeedback(interviewId: string, data: { rating: number; recommendation: string; comments: string }) {
  const session = await getSession();

  await db.feedback.create({
    data: {
      interviewId,
      rating: data.rating,
      recommendation: data.recommendation,
      comments: data.comments,
    },
  });

  await db.interview.update({
    where: { id: interviewId },
    data: { status: "COMPLETED" },
  });

  // Optionally auto-advance candidate to MANAGER_REVIEW
  const interview = await db.interview.findUnique({ where: { id: interviewId }, include: { candidate: true } });
  if (interview?.candidate.currentStage === "INTERVIEW") {
    const candidate = await db.candidate.findUnique({ where: { id: interview.candidateId } });
    const auditLogs = candidate?.auditLogs as any[] || [];
    auditLogs.push({
      action: "Feedback submitted, moved to Manager Review",
      userId: session.id,
      userName: session.name,
      timestamp: new Date().toISOString(),
    });
    await db.candidate.update({
      where: { id: interview.candidateId },
      data: { currentStage: "MANAGER_REVIEW", auditLogs },
    });
  }

  revalidatePath(`/interviewer/candidates/${interview.candidateId}`);
}
```

## Voice Agent Wiring (Bonus Path)

### `app/interviewer/candidates/[id]/page.tsx` — Add voice tab
- Add a "Voice Interview" button that renders `Agent.tsx` (from `components/voice/Agent.tsx`)
- `Agent.tsx` connects via Vapi SDK, captures transcript, generates feedback
- On `onComplete`, call `submitFeedback()` with the generated data

### Config requirements
- `NEXT_PUBLIC_VAPI_WEB_TOKEN` env var must be set
- `NEXT_PUBLIC_VAPI_WORKFLOW_ID` env var must be set (for generate flow)
- `Agent.tsx` expects `interviewer` config from `lib/voice/assistant-config.ts`

## Auto-Advance Logic
After feedback is submitted, the candidate is automatically moved from `INTERVIEW` to `MANAGER_REVIEW` stage. The audit log captures this transition.

## Files to Create
- `components/feedback-form.tsx`

## Files to Modify
- `app/interviewer/actions.ts` — add `submitFeedback()`
- `app/interviewer/candidates/[id]/page.tsx` — add feedback form + voice button

## Acceptance Criteria

- [ ] Interviewer can submit feedback with rating, recommendation, comments
- [ ] Feedback is stored in the `Feedback` table linked to the interview
- [ ] Interview status changes to COMPLETED
- [ ] Candidate auto-advances to MANAGER_REVIEW stage
- [ ] Audit log captures the feedback submission
- [ ] Voice interview flow (if configured) generates feedback from transcript
