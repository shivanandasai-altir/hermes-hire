# Step 6: Interviewer Dashboard + AI Questions

**Estimated time:** ~20 min  
**Depends on:** Steps 1 (auth), 2 (schema), 5 (candidates reach INTERVIEW stage)  
**Second role.**

---

## Goal

Interviewer logs in, sees assigned candidates, reads the AI summary, generates AI-powered interview questions, and can launch a voice interview (Vapi).

## Files to Create

### `app/interviewer/layout.tsx`
- Server Component that checks session role (must be INTERVIEWER)
- Sidebar nav: Dashboard, Logout

### `app/interviewer/dashboard/page.tsx`
- Server Component that fetches interviews where `interviewerId` matches the current user
- Shows a list of assigned candidates with: candidate name, job title, status (ASSIGNED/COMPLETED), scheduled date
- Each row links to the candidate detail page

### `app/interviewer/candidates/[id]/page.tsx`
- Candidate detail for the interviewer:
  - AI summary (read-only)
  - "Generate AI Questions" button → calls Hermes, stores on candidate, displays them
  - "Start Voice Interview" button → launches Vapi Agent component (bonus)
  - Manual feedback form (if not using voice)

### `app/interviewer/actions.ts` — Server Actions
```typescript
"use server";

export async function generateQuestions(candidateId: string) {
  const session = await getSession();
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });
  if (!candidate) throw new Error("Candidate not found");

  const profile = candidate.aiSummary || candidate.resumeText;
  const questions = await generateInterviewQuestions(profile, candidate.job.title);

  const auditLogs = candidate.auditLogs as any[];
  auditLogs.push({
    action: "AI Questions generated",
    userId: session.id,
    userName: session.name,
    timestamp: new Date().toISOString(),
  });

  await db.candidate.update({
    where: { id: candidateId },
    data: { aiQuestions: questions, auditLogs },
  });

  revalidatePath(`/interviewer/candidates/${candidateId}`);
}
```

### `services/ai.ts` — Add function
```typescript
export async function generateInterviewQuestions(candidateProfile: string, jobTitle: string) {
  return callHermes(
    "You are a senior technical interviewer. Generate 5-7 targeted interview questions covering technical skills, problem-solving, and behavioral fit.",
    `Role: ${jobTitle}\n\nCandidate Profile:\n${candidateProfile}`
  );
}
```

## Files to Create
- `app/interviewer/layout.tsx`
- `app/interviewer/dashboard/page.tsx`
- `app/interviewer/candidates/[id]/page.tsx`
- `app/interviewer/actions.ts`

## Files to Modify
- `services/ai.ts` — add `generateInterviewQuestions()`

## Acceptance Criteria

- [ ] Interviewer logs in → sees assigned candidates on dashboard
- [ ] Interviewer opens candidate → sees AI summary
- [ ] Interviewer clicks "Generate AI Questions" → Hermes returns questions → displayed on page
- [ ] Questions are stored on `Candidate.aiQuestions`
- [ ] Audit log entry created
