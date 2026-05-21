# Step 2: Prisma Schema + Seed

**Estimated time:** ~15 min  
**Depends on:** Nothing (foundational)  
**Creates the database schema** and seed data.

---

## Goal

Define 5 Prisma models (`User`, `Job`, `Candidate`, `Interview`, `Feedback`) with enums and relations. Create a seed script with mock users. Push schema to Neon.

## Prisma Schema (`prisma/schema.prisma`)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../app/generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  HR
  INTERVIEWER
  MANAGER
}

enum Stage {
  APPLIED
  SCREENING
  INTERVIEW
  MANAGER_REVIEW
  HIRED
  REJECTED
}

model User {
  id         String      @id @default(cuid())
  name       String
  email      String      @unique
  role       Role
  jobs       Job[]
  interviews Interview[]
  createdAt  DateTime    @default(now())
}

model Job {
  id          String      @id @default(cuid())
  title       String
  department  String
  status      String      @default("OPEN")
  createdById String
  createdBy   User        @relation(fields: [createdById], references: [id])
  candidates  Candidate[]
  createdAt   DateTime    @default(now())
}

model Candidate {
  id               String     @id @default(cuid())
  name             String
  email            String
  phone            String?
  resumeText       String
  currentStage     Stage      @default(APPLIED)
  jobId            String
  job              Job        @relation(fields: [jobId], references: [id])
  aiSummary        String?
  aiQuestions      String?
  aiRecommendation String?
  meetLink         String?
  auditLogs        Json       @default("[]")
  interviews       Interview[]
  createdAt        DateTime   @default(now())
}

model Interview {
  id             String    @id @default(cuid())
  candidateId    String
  interviewerId  String
  status         String    @default("ASSIGNED")
  scheduledAt    DateTime?
  candidate      Candidate @relation(fields: [candidateId], references: [id], onDelete: Cascade)
  interviewer    User      @relation(fields: [interviewerId], references: [id])
  feedback       Feedback?
  createdAt      DateTime  @default(now())
}

model Feedback {
  id             String    @id @default(cuid())
  interviewId    String    @unique
  rating         Int
  recommendation String
  comments       String
  interview      Interview @relation(fields: [interviewId], references: [id], onDelete: Cascade)
  createdAt      DateTime  @default(now())
}
```

### Key design decisions

- **No `AIInsight` model** — AI data is stored as nullable fields (`aiSummary`, `aiQuestions`, `aiRecommendation`) directly on `Candidate`
- **No `AuditLog` model** — audit entries stored as a `Json` array on `Candidate.auditLogs`
- **Interview → Feedback is 1:1** — via `@unique` on `interviewId`
- **Cascade deletes** — deleting a Candidate removes their Interviews and Feedback

## Seed Script (`prisma/seed.ts`)

```typescript
import { db } from "@/lib/db";

const MOCK_USERS = [
  { id: "user-hr", name: "Alice HR", email: "alice@hermeshire.com", role: "HR" },
  { id: "user-int", name: "Bob Interviewer", email: "bob@hermeshire.com", role: "INTERVIEWER" },
  { id: "user-mgr", name: "Carol Manager", email: "carol@hermeshire.com", role: "MANAGER" },
];

async function main() {
  for (const user of MOCK_USERS) {
    await db.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }
  console.log("Seeded users");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => { /* db.$disconnect handled by process exit */ });
```

Add to `package.json`:
```json
{
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

> **Note:** This project uses `tsx` for executing TypeScript seed files. Install it: `pnpm add -D tsx`

## Files to Create
- `prisma/schema.prisma` (overwrite the default)
- `prisma/seed.ts`

## Files to Modify
- `package.json` — add `"prisma": { "seed": "tsx prisma/seed.ts" }`

## Acceptance Criteria

- [ ] `pnpm db:push` runs without errors
- [ ] `pnpm db:seed` inserts 3 users into the database
- [ ] Prisma Client is generated to `app/generated/prisma/`
- [ ] `lib/db.ts` can import and instantiate `PrismaClient`
