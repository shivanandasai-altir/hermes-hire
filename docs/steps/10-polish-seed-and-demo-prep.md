# Step 10: Polish, Seed Data, and Demo Prep

**Estimated time:** ~20 min  
**Depends on:** All previous steps  
**Ship ready.**

---

## Goal

Polish the UI, create a compelling seed dataset that tells the demo story, set up Vercel deployment, and verify the full flow works end-to-end.

## 1. Enriched Seed Data

Replace the minimal seed with a demo-ready dataset:

```typescript
// prisma/seed.ts — expanded

const MOCK_USERS = [
  { id: "user-hr", name: "Alice Chen", email: "alice@hermeshire.com", role: "HR" as const },
  { id: "user-int", name: "Bob Martinez", email: "bob@hermeshire.com", role: "INTERVIEWER" as const },
  { id: "user-mgr", name: "Carol Williams", email: "carol@hermeshire.com", role: "MANAGER" as const },
];

const DEMO_JOB = {
  id: "job-1",
  title: "Senior Frontend Engineer",
  department: "Engineering",
  createdById: "user-hr",
};

const DEMO_CANDIDATE = {
  id: "candidate-1",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+1-555-0100",
  resumeText: `Experienced frontend engineer with 6 years building React applications...
  // ~200 words of realistic resume text
  `,
  currentStage: "MANAGER_REVIEW" as const,
  jobId: "job-1",
  aiSummary: "Jane is a strong candidate...",  // Pre-seeded AI content
  aiQuestions: "1. Describe your experience...\n2. How do you handle...",
  auditLogs: [
    { action: "Added by HR", userName: "Alice Chen", userId: "user-hr", timestamp: "2025-05-20T09:00:00Z" },
    { action: "AI Summary generated", userName: "Alice Chen", userId: "user-hr", timestamp: "2025-05-20T09:01:00Z" },
    { action: "Moved from APPLIED to SCREENING", userName: "Alice Chen", userId: "user-hr", timestamp: "2025-05-20T09:05:00Z" },
    { action: "Moved from SCREENING to INTERVIEW", userName: "Alice Chen", userId: "user-hr", timestamp: "2025-05-20T09:10:00Z" },
    { action: "AI Questions generated", userName: "Bob Martinez", userId: "user-int", timestamp: "2025-05-20T10:00:00Z" },
    { action: "Feedback submitted, moved to Manager Review", userName: "Bob Martinez", userId: "user-int", timestamp: "2025-05-20T11:00:00Z" },
  ],
};
```

The seed data should demonstrate the full demo flow: HR → Interviewer → Manager, with pre-seeded AI content so the demo doesn't require live API calls.

## 2. UI Polish

- **Consistent spacing** across all pages
- **Loading states** — use shadcn `Skeleton` for loading pages
- **Empty states** — use shadcn `Card` with helpful messages when no data exists
- **Error states** — display toast messages via `sonner` for errors
- **Role-based theming** (optional): subtle color accents per role
  - HR: blue accent
  - Interviewer: green accent
  - Manager: purple accent

## 3. Landing Page

Update `app/page.tsx` to be a polished landing page:

- Hero section: "Hire smarter with AI"
- "Get Started" button → redirects to `/login`
- Three role cards showing what each role does
- Footer with "Built with Hermes Agent"

## 4. Vercel Deployment

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel --prod
```

### Required Environment Variables in Vercel Dashboard

| Variable | Source |
|----------|--------|
| `DATABASE_URL` | Neon connection string |
| `HERMES_API_KEY` | Hermes Agent key |
| `HERMES_API_URL` | (optional) Custom endpoint |
| `NEXT_PUBLIC_VAPI_WEB_TOKEN` | Vapi dashboard |

### Prisma in Production
- Build command: `prisma generate && next build`
- No migration — use `prisma db push` or run migrations separately

## 5. Demo Script

The demo should follow this exact flow:

```
1. Login as HR (Alice Chen)
2. Navigate to Pipeline — show Jane Doe in Manager Review
3. Click into Jane's detail — show AI Summary, AI Questions, audit timeline
4. Switch to Manager (Carol Williams)
5. Show Jane in Manager Review queue
6. Open Jane's detail — show AI Summary + Interview Feedback side-by-side
7. Click "Schedule Meet" — type "Schedule call tomorrow at 3pm"
8. Show the resulting Meet link
9. Click "Hire" — show the HIRED badge and audit log entry
10. Show the complete audit timeline as the finale
```

## 6. Verification Checklist

- [ ] Full flow works end-to-end locally
- [ ] Seed data creates a complete demo story
- [ ] Loading states present on all data-fetching pages
- [ ] Empty states shown when no data
- [ ] Error messages shown for failed API calls (Hermes, gog)
- [ ] Vercel build succeeds
- [ ] Environment variables configured in Vercel
- [ ] Demo script executable in under 3 minutes
