# Step 9: Candidate Detail Page + Audit Timeline

**Estimated time:** ~15 min  
**Depends on:** Steps 4, 5, 6, 7, 8 (all AI data + decisions exist)  
**Consolidation page.**

---

## Goal

A unified candidate detail page accessible by all roles (with role-appropriate views) showing all information, AI-generated content, interview history, and a chronological audit timeline.

## Key Design

Single route: `/(role)/candidates/[id]/page.tsx` — but content adapts based on role.

## Files to Create

### `app/hr/candidates/[id]/page.tsx`
- **HR view:** 
  - Candidate info (name, email, phone, resume text)
  - Current stage badge
  - AI Summary section (generated or "Generate" button)
  - AI Questions section (if generated)
  - Linked Job title
  - Interview history (assigned interviewer, status, feedback link)
  - Audit timeline

### `app/interviewer/candidates/[id]/page.tsx` (expand existing)
- **Interviewer view:**
  - Candidate info (read-only)
  - AI Summary (read-only)
  - AI Questions (generate or read)
  - Feedback form (if not yet submitted)
  - Voice Interview button

### `app/manager/candidates/[id]/page.tsx` (expand existing)
- **Manager view:**
  - AI Summary + AI Questions
  - Interviewer feedback
  - Hire/Reject buttons
  - Schedule Meet button
  - Meet link (if scheduled)

## Audit Timeline Component

### `components/audit-timeline.tsx`
```tsx
interface AuditTimelineProps {
  logs: Array<{ action: string; userName: string; timestamp: string; details?: string }>;
}
```

- Renders a vertical timeline (shadcn style)
- Each entry: icon (determined by action type), user name, action description, relative timestamp ("2 hours ago")
- Actions that produced output show a preview/summary

```tsx
"use client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ACTION_ICONS: Record<string, string> = {
  "Added": "➕",
  "AI Summary": "🤖",
  "AI Questions": "❓",
  "Moved": "➡️",
  "Feedback": "📝",
  "Hired": "✅",
  "Rejected": "❌",
  "Google Meet": "📅",
};

export function AuditTimeline({ logs }: { logs: Array<{ action: string; userName: string; timestamp: string }> }) {
  const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sorted.map((log, i) => {
            const iconKey = Object.keys(ACTION_ICONS).find(k => log.action.includes(k));
            return (
              <div key={i} className="flex gap-3 items-start">
                <span className="text-lg mt-0.5">{iconKey ? ACTION_ICONS[iconKey] : "•"}</span>
                <div>
                  <p className="text-sm"><strong>{log.userName}</strong> {log.action}</p>
                  <p className="text-xs text-muted-foreground">{formatRelativeTime(log.timestamp)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
```

## Data Fetching Pattern

Since all detail pages need similar data, create a shared query:

```typescript
// lib/queries.ts
export async function getCandidateWithDetails(candidateId: string) {
  return db.candidate.findUnique({
    where: { id: candidateId },
    include: {
      job: true,
      interviews: {
        include: {
          interviewer: { select: { id: true, name: true, email: true } },
          feedback: true,
        },
      },
    },
  });
}
```

## Files to Create
- `app/hr/candidates/[id]/page.tsx`
- `components/audit-timeline.tsx`
- `lib/queries.ts` (shared query helpers)

## Files to Modify
- `app/interviewer/candidates/[id]/page.tsx` — add audit timeline
- `app/manager/candidates/[id]/page.tsx` — add audit timeline

## Acceptance Criteria

- [ ] All roles can access candidate detail (with appropriate permissions)
- [ ] Audit timeline shows all actions in reverse chronological order
- [ ] Each entry includes user name, action description, and timestamp
- [ ] AI content (summary, questions) is displayed when available
- [ ] Interview history shows all past interviews and their feedback
- [ ] Meet link is clickable when one exists
