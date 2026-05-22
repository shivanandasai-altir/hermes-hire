import { Prisma } from "@/app/generated/prisma/client";
import { db } from "@/lib/db";
import { buildDemoAuditLogs, DEMO_RESUME, DEMO_USERS } from "@/lib/demo-seed";
import { STAGES } from "@/lib/constants";
export async function neonHasData(): Promise<boolean> {
  const [jobs, users] = await Promise.all([db.job.count(), db.user.count()]);
  return jobs > 0 || users > 0;
}

export async function clearNeonDatabase(): Promise<void> {
  await db.feedback.deleteMany();
  await db.interview.deleteMany();
  await db.candidate.deleteMany();
  await db.job.deleteMany();
  await db.user.deleteMany();
}

export async function seedNeonDatabase(force = false): Promise<void> {
  if (!force && (await neonHasData())) {
    throw new Error(
      "Neon database already has data. Use --force or run: pnpm db:seed -- --force",
    );
  }

  if (force) {
    await clearNeonDatabase();
  }

  const now = new Date().toISOString();
  const auditLogs = buildDemoAuditLogs(now);
  for (const user of DEMO_USERS) {
    await db.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  }

  const job = await db.job.create({
    data: {
      title: "Senior Frontend Engineer",
      department: "Engineering",
      status: "OPEN",
      createdById: "alice",
    },
  });

  await db.candidate.create({
    data: {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      phone: "+1-555-0100",
      resumeText: DEMO_RESUME,
      currentStage: STAGES.MANAGER_REVIEW,
      jobId: job.id,
      aiSummary:
        "Strong React/TypeScript background with leadership experience. Excellent fit for Senior Frontend Engineer — recommend proceeding to final review.",
      aiQuestions:
        "1. Describe a complex state management challenge you solved.\n2. How do you approach design system consistency across teams?\n3. Tell us about mentoring engineers through a difficult delivery.",
      auditLogs: auditLogs as unknown as Prisma.InputJsonValue,
    },
  });

  const candidate = await db.candidate.findFirstOrThrow({
    where: { email: "jane.doe@example.com" },
  });

  const interview = await db.interview.create({
    data: {
      candidateId: candidate.id,
      interviewerId: "bob",
      status: "COMPLETED",
    },
  });

  await db.feedback.create({
    data: {
      interviewId: interview.id,
      rating: 5,
      recommendation: "Strong Hire",
      comments:
        "Excellent communication, deep React knowledge, and clear examples of leadership.",
    },
  });
}
