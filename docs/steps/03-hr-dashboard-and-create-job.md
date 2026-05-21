# Step 3: HR Dashboard + Create Job

**Estimated time:** ~25 min  
**Depends on:** Steps 1 (auth), 2 (schema)  
**First role-specific page.**

---

## Goal

An HR dashboard with a sidebar layout, a "Create Job" form, and a list of existing jobs. HR is the primary content creator — all hiring starts here.

## Files to Create

### `app/hr/layout.tsx`
- Server Component that checks session role
- Redirects non-HR users away
- Wraps children in a sidebar layout:

```tsx
// Layout with sidebar nav
// Links: Dashboard, Jobs, Candidates, Logout
// Sidebar shows "HermesHire" branding and current user name
```

### `app/hr/dashboard/page.tsx`
- Server Component that fetches jobs created by the current HR user
- Shows a welcome message + quick stats (total jobs, total candidates across jobs)
- Links to "Create New Job" and "View All Jobs"

### `app/hr/jobs/page.tsx`
- List of all jobs created by this HR (Table/Card layout using shadcn `Table` or `Card`)
- Each row shows: title, department, status (OPEN/CLOSED), candidate count, created date
- "New Job" button opens a dialog

### `app/hr/jobs/actions.ts` — Server Actions
```typescript
"use server";

export async function createJob(formData: FormData) {
  const session = await getSession();
  if (!session || session.role !== "HR") throw new Error("Unauthorized");

  const title = formData.get("title") as string;
  const department = formData.get("department") as string;

  await db.job.create({
    data: { title, department, createdById: session.id },
  });

  revalidatePath("/hr/jobs");
}
```

## Key Patterns

- Use **Server Components** for data fetching (dashboard, job list)
- Use **Server Actions** for mutations (create job)
- Use **Client Component** for the "New Job" dialog (shadcn `Dialog`)
- Call `revalidatePath()` after mutations to refresh data

## Files to Create
- `app/hr/layout.tsx` — role guard + sidebar nav
- `app/hr/dashboard/page.tsx` — dashboard view
- `app/hr/jobs/page.tsx` — job list + create dialog
- `app/hr/jobs/actions.ts` — Server Actions

## Acceptance Criteria

- [ ] HR user can navigate to `/hr/dashboard`
- [ ] HR user sees their name and role in the sidebar
- [ ] Non-HR users are redirected away from `/hr/*`
- [ ] HR can create a job via a form → appears in the list
- [ ] Job list shows title, department, status
