import { NextResponse } from "next/server";

interface OnboardRequest {
  token: string;
  name: string;
  email: string;
  phone?: string;
  resumeText: string;
}

/**
 * POST /api/onboard
 *
 * Receives candidate onboarding form submissions.
 * Stores the data and returns success.
 *
 * In production, this writes to Neon/Prisma.
 * For the hackathon demo, it stores in a simple JSON store.
 */

// In-memory store (resets on server restart — replace with DB in production)
const onboardedCandidates = new Map<string, OnboardRequest>();

export async function POST(request: Request) {
  try {
    const body: OnboardRequest = await request.json();

    // Validate
    if (!body.token || !body.name || !body.email || !body.resumeText) {
      return NextResponse.json(
        { error: "Missing required fields: token, name, email, resumeText" },
        { status: 400 },
      );
    }

    if (body.email.length < 3 || !body.email.includes("@")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Store the submission
    onboardedCandidates.set(body.token, {
      token: body.token,
      name: body.name,
      email: body.email,
      phone: body.phone || "",
      resumeText: body.resumeText,
    });

    console.log(`✅ Onboarded: ${body.name} (${body.email}) — token: ${body.token}`);

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully",
      candidate: {
        name: body.name,
        email: body.email,
      },
    });
  } catch (error) {
    console.error("Onboard error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/onboard?token=abc123
 *
 * Check if a token has been onboarded.
 * Used by the CLI to check candidate status.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Missing token parameter" },
      { status: 400 },
    );
  }

  const candidate = onboardedCandidates.get(token);

  if (!candidate) {
    return NextResponse.json(
      { onboarded: false },
      { status: 200 },
    );
  }

  return NextResponse.json({
    onboarded: true,
    candidate: {
      name: candidate.name,
      email: candidate.email,
      phone: candidate.phone,
      resumeText: candidate.resumeText,
    },
  });
}
