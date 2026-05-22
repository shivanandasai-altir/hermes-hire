import { loadProjectEnv } from "../lib/load-env";
import { seedNeonDatabase } from "../lib/prisma-seed";
import { readDbFromNeon } from "../src/cli/storage/prisma-db";

loadProjectEnv();

const force = process.argv.includes("--force");

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set. Add your Neon connection string to .env");
    process.exit(1);
  }

  await seedNeonDatabase(force);
  const demo = await readDbFromNeon();
  console.log("✅ Neon database seeded");
  console.log(
    `   ${demo.users.length} users · ${demo.jobs.length} job · ${demo.candidates.length} candidate · ${demo.interviews.length} interview · ${demo.feedback.length} feedback`,
  );
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(async () => {
    const { db } = await import("../lib/db");
    await db.$disconnect();
  });
