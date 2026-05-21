# Step 4: Add Candidate + AI Summary

**Estimated time:** ~25 min  
**Depends on:** Steps 1 (auth), 2 (schema), 3 (jobs exist)  
**First AI-powered feature.**

---

## Goal

HR can add a candidate (name, email, resume text) to a job, then click "Generate AI Summary" to get a Hermes-powered candidate analysis.

## Files to Create

### `app/hr/candidates/page.tsx`
- Shows candidates for a selected job (pass `jobId` as search param)
- List/table view with: name, email, stage, AI summary status, created date
- "Add Candidate" button opens a dialog

### `app/hr/candidates/actions.ts` — Server Actions
```typescript
"use server";

export async function addCandidate(formData: FormData) {
  const session = await getSession();
  // validate HR role

  const candidate = await db.candidate.create({
    data: {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      resumeText: formData.get("resumeText") as string,
      jobId: formData.get("jobId") as string,
      auditLogs: [{ action: "Added by HR", userId: session.id, userName: session.name, timestamp: new Date().toISOString() }],
    },
  });

  revalidatePath("/hr/candidates");
}

export async function generateSummary(candidateId: string) {
  const session = await getSession();
  const candidate = await db.candidate.findUnique({ where: { id: candidateId }, include: { job: true } });
  if (!candidate) throw new Error("Candidate not found");

  const summary = await generateCandidateSummary(candidate.resumeText, candidate.job.title);

  await db.candidate.update({
    where: { id: candidateId },
    data: {
      aiSummary: summary,
      auditLogs: [
        ...(candidate.auditLogs as any[]),
        { action: "AI Summary generated", userId: session.id, userName: session.name, timestamp: new Date().toISOString() },
      ],
    },
  });

  revalidatePath(`/hr/candidates/${candidateId}`);
}
```

### `services/ai.ts` — Hermes Client
```typescript
const HERMES_API_URL = process.env.HERMES_API_URL || "https://api.hermes.ai/v1";

async function callHermes(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await fetch(`${HERMES_API_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.HERMES_API_KEY}`,
    },
    body: JSON.stringify({
      model: "hermes-3",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1024,
    }),
  });
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function generateCandidateSummary(resumeText: string, jobTitle: string) {
  return callHermes(
    "You are an expert HR recruiter. Summarize the candidate's resume for the given role. Highlight strengths, key skills, potential risks, and overall fit.",
    `Job: ${jobTitle}\n\nResume:\n${resumeText}`
  );
}
```

## Files to Modify
- `app/hr/jobs/page.tsx` — add "View Candidates" link per job row

## Files to Create
- `app/hr/candidates/page.tsx` — candidate list + add dialog
- `app/hr/candidates/actions.ts` — Server Actions
- `services/ai.ts` — Hermes client with `generateCandidateSummary()`

## Acceptance Criteria

- [ ] HR can add a candidate with name, email, phone, resume text to a job
- [ ] Candidate appears in the list
- [ ] HR clicks "Generate AI Summary" → Hermes returns analysis → stored on candidate
- [ ] UI shows the summary text after generation
- [ ] Audit log entry created for both actions
