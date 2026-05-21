# Step 1: Login + Middleware

**Estimated time:** ~20 min  
**Depends on:** Nothing  
**Creates the foundation** for all role-based routing.

---

## Goal

A `/login` page with a 3-button role selector. Selecting a role creates a session cookie and redirects to the role-specific dashboard. A `middleware.ts` protects all role routes from unauthenticated access.

## Files to Create

### `app/login/page.tsx`
- Three prominent buttons: "Login as HR", "Login as Interviewer", "Login as Manager"
- Each button sets a session cookie with `{ userId, name, role, email }`
- Hardcoded mock user data:

```typescript
const MOCK_USERS = [
  { id: "user-hr", name: "Alice HR", email: "alice@hermeshire.com", role: "HR" },
  { id: "user-int", name: "Bob Interviewer", email: "bob@hermeshire.com", role: "INTERVIEWER" },
  { id: "user-mgr", name: "Carol Manager", email: "carol@hermeshire.com", role: "MANAGER" },
];
```

- Cookie name: `session`, value: `JSON.stringify(user)`, path: `/`, maxAge: 86400 (24h)
- After setting cookie, redirect via `redirect()`:
  - HR → `/hr/dashboard`
  - INTERVIEWER → `/interviewer/dashboard`
  - MANAGER → `/manager/dashboard`

### `middleware.ts` (root of project)
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPrefixes = ["/hr", "/interviewer", "/manager"];

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPrefixes.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### `lib/auth.ts` (optional helper)
- `getSession()` — reads and parses session cookie, returns user object or null
- Used by Server Actions and pages to identify the current user

```typescript
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "HR" | "INTERVIEWER" | "MANAGER";
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;
  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}
```

## Files to Modify

### `app/layout.tsx`
- Remove any redirect-to-login logic from root page (it's fine to keep the default landing page or redirect to `/login`)

### `app/page.tsx`
- Either show a landing page with a "Get Started → /login" link, or simply redirect to `/login`

## Acceptance Criteria

- [ ] Visiting `/login` shows 3 role buttons
- [ ] Clicking a button redirects to the correct dashboard
- [ ] Visiting `/hr/dashboard` without a session redirects to `/login`
- [ ] Visiting `/interviewer/dashboard` without a session redirects to `/login`
- [ ] Visiting `/manager/dashboard` without a session redirects to `/login`
- [ ] Session cookie is readable by Server Actions and Route Handlers
