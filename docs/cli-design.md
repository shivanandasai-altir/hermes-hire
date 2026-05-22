# HermesHire CLI — System Design

## One-command install

```bash
curl -fsSL https://hermeshire.sh/install.sh | bash
```

This installs the `hermes` CLI globally. Then:

```bash
hermes auth --key sk-nous-...
hermes job create --title "Senior Frontend Engineer"
hermes candidate add --name "Jane Doe" --resume "..."
hermes candidate summary 1
hermes candidate move 1 --stage INTERVIEW
hermes interview assign 1 --to bob
hermes interview voice 1 --phone "+1-555-0123"   # Vapi calls candidate
hermes feedback submit 1 --rating 5 --notes "Strong hire"
hermes review hire 1
```

---

## HLD

```
User Terminal
    |
    | hermes <command> [args]
    v
┌─────────────────────────────────────┐
│         hermes CLI (Node.js)        │
│                                     │
│  ┌───────────────────────────────┐  │
│  │      Command Router           │  │  commander — parses args
│  │   (commander + chalk)         │  │
│  └───────────┬───────────────────┘  │
│              │                      │
│  ┌───────────▼───────────────────┐  │
│  │       Handler Layer           │  │
│  │  job / candidate / interview  │  │
│  │  feedback / review / meet     │  │
│  └───────────┬───────────────────┘  │
│              │                      │
│  ┌───────────▼───────────────────┐  │
│  │       Services Layer          │  │
│  │                               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Hermes-4-70B API       │  │  │  AI summaries, questions, feedback
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Vapi REST API          │  │  │  Outbound phone calls + polling
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  gog CLI                │  │  │  Google Meet scheduling
│  │  └─────────────────────────┘  │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │  Prisma + Neon          │  │  │  Shared PostgreSQL (same DB as web app)
│  │  └─────────────────────────┘  │  │
│  └───────────┬───────────────────┘  │
│              │                      │
└──────────────┼──────────────────────┘
               │
     ┌─────────▼───────────────┐
     │   ~/.hermeshire/        │
     │   ├── db.json           │  all data
     │   ├── config.json       │  API keys, active user
     │   └── logs/             │  audit trail
     └─────────────────────────┘
```

---

## Database — Neon + Prisma

Same schema as the web app. The CLI and web app share the exact same database.

```prisma
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
  transcript     String?
  vapiCallId     String?
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

**Key difference from JSON storage:** The `Interview` model gains `transcript` and `vapiCallId` fields for Vapi voice interview storage.

```env
# Shared across all team members
DATABASE_URL="postgresql://user:pass@ep-xxx.neon.tech/hermes-hire?sslmode=require"
```

Everyone sets the same `DATABASE_URL` → everyone sees the same data. Multi-user solved with zero infrastructure.

---

## Candidate Onboarding (Path 1 — Onboarding Link)

Candidates don't install the CLI. Instead, HR generates a unique onboarding link and shares it.

### Flow

```
HR runs:  hermes candidate invite --job 1 --name "Jane Doe" --email jane@example.com
            ↓
CLI creates a candidate record with a unique onboardToken (cuid)
CLI prints: "📨 Share this link with Jane:"
            "https://hermeshire.app/onboard/abc123xyz"
            ↓
Jane opens the link in her browser
            ↓
Simple form page (no login required):
  ┌──────────────────────────────────┐
  │  ✅ You've been invited to       │
  │     interview for:               │
  │     Senior Frontend Engineer     │
  │                                  │
  │  Name:  [Jane Doe           ]    │
  │  Email: [jane@example.com   ]    │
  │  Phone: [+1-555-0123       ]    │
  │  Resume: [Paste your resume ]    │
  │                                  │
  │  [Submit Application]            │
  └──────────────────────────────────┘
            ↓
Form POSTs to a simple API endpoint → updates the candidate record in Neon
HR sees:  hermes candidate list
          → Jane Doe's status changed from "PENDING_ONBOARDING" to "APPLIED"
          → Her resume and phone are now filled in
```

### What HR sees before vs after

```bash
# Before Jane submits
$ hermes candidate list
ID  Name      Stage              Resume
1   Jane Doe  PENDING_ONBOARDING  (awaiting candidate)

# After Jane submits
$ hermes candidate list
ID  Name      Stage   Resume
1   Jane Doe  APPLIED  "6 years React, TypeScript..."

$ hermes candidate summary 1
🤖 Generating AI summary...
→ Jane is a strong frontend engineer with...
```

### What's needed to build this

| Component | Effort | Notes |
|-----------|--------|-------|
| `hermes candidate invite` command | ~10 min | Generates token, inserts candidate with PENDING_ONBOARDING stage |
| Onboarding web page (single route) | ~20 min | Simple form, no auth, no shadcn — just raw HTML or a minimal Next.js page |
| API endpoint to receive submission | ~10 min | Validates token, updates DB |
| `PENDING_ONBOARDING` stage | ~2 min | Add to Stage enum + VALID_TRANSITIONS → can move to APPLIED |

**Total: ~42 min**

### Stage flow with onboarding

```
PENDING_ONBOARDING → APPLIED → SCREENING → INTERVIEW → MANAGER_REVIEW → HIRED
                                           ↓                        ↓
                                        REJECTED                REJECTED
```

`PENDING_ONBOARDING` → `APPLIED` is automatic (candidate submits form).
HR can also skip the link and add candidates directly (existing flow).

---

## LLD

### File structure

```
hermeshire-cli/
├── bin/
│   ├── hermes.js          ← Entry point (Node.js shebang)
│   └── install.sh         ← One-command install script
├── src/
│   ├── cli.ts             ← Command definitions (commander)
│   ├── db.ts              ← Prisma client (reuse from lib/db.ts)
│   ├── commands/
│   │   ├── auth.ts        ← hermes auth --key / --as
│   │   ├── job.ts         ← hermes job create/list/show
│   │   ├── candidate.ts   ← hermes candidate add/list/summary/move
│   │   ├── interview.ts   ← hermes interview assign/list/voice/simulate
│   │   ├── feedback.ts    ← hermes feedback submit/show
│   │   ├── review.ts      ← hermes review list/hire/reject
│   │   └── meet.ts        ← hermes meet schedule
│   ├── services/
│   │   ├── ai.ts          ← Hermes API client (callHermes)
│   │   ├── vapi.ts        ← Vapi REST API client (outbound calls)
│   │   ├── meet.ts        ← Google Meet via gog CLI
│   │   └── display.ts     ← Terminal output (chalk, cli-table3)
│   ├── storage/
│   │   ├── index.ts       ← Storage interface
│   │   └── db.ts          ← JSON file read/write + config
│   └── prompts/           ← Reuse from prompts/ folder
├── package.json
└── README.md
```

### Storage format — `~/.hermeshire/db.json`

```json
{
  "version": 1,
  "users": [
    { "id": "user-hr", "name": "Alice", "role": "HR" },
    { "id": "user-int", "name": "Bob", "role": "INTERVIEWER" },
    { "id": "user-mgr", "name": "Carol", "role": "MANAGER" }
  ],
  "jobs": [
    {
      "id": 1,
      "title": "Senior Frontend Engineer",
      "department": "Engineering",
      "status": "OPEN",
      "createdById": "user-hr",
      "createdAt": "2025-05-22T10:00:00Z"
    }
  ],
  "candidates": [
    {
      "id": 1,
      "name": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+1-555-0123",
      "resumeText": "...",
      "currentStage": "MANAGER_REVIEW",
      "jobId": 1,
      "aiSummary": "...",
      "aiQuestions": "...",
      "aiRecommendation": null,
      "meetLink": null,
      "auditLogs": [ "...", "..." ],
      "createdAt": "2025-05-22T10:00:00Z"
    }
  ],
  "interviews": [
    {
      "id": 1,
      "candidateId": 1,
      "interviewerId": "user-int",
      "status": "COMPLETED",
      "scheduledAt": null,
      "transcript": null,
      "vapiCallId": "call_abc123"
    }
  ],
  "feedback": [
    {
      "id": 1,
      "interviewId": 1,
      "rating": 5,
      "recommendation": "Strong Hire",
      "comments": "Excellent communication, strong React knowledge.",
      "createdAt": "2025-05-22T11:00:00Z"
    }
  ]
}
```

### Config — `~/.hermeshire/config.json`

```json
{
  "activeUserId": "user-hr",
  "hermesApiKey": "sk-nous-...",
  "hermesApiUrl": "https://inference-api.nousresearch.com/v1",
  "hermesModel": "Hermes-4-70B",
  "vapiApiKey": "vapi-...",
  "vapiAssistantId": "assistant_xyz"
}
```

---

## Vapi Phone Call Integration

### Architecture

```
CLI runs: hermes interview voice 1 --phone "+1-555-0123"
                                    ↓
                 POST https://api.vapi.ai/call
                 {
                   "phoneNumberId": "...",
                   "assistantId": "assistant_xyz",
                   "customer": { "number": "+1-555-0123" },
                   "assistantOverrides": {
                     "model": {
                       "messages": [
                         { "role": "system", "content": "You are an AI interviewer..." }
                       ]
                     }
                   }
                 }
                                    ↓
                    Vapi starts outbound call to candidate
                    AI interviewer conducts the conversation
                                    ↓
                    Vapi webhook POSTs transcript to our endpoint
                    (or we poll GET /call/:id for status)
                                    ↓
                    Transcript → Hermes generateFeedbackFromTranscript()
                    → Structured feedback saved to Interview + Feedback records
```

### Vapi REST API Client (`services/vapi.ts`)

```typescript
const VAPI_API_URL = "https://api.vapi.ai";

interface VapiCallRequest {
  phoneNumberId: string;
  assistantId: string;
  customer: { number: string };
  assistantOverrides?: {
    model?: {
      messages: Array<{ role: string; content: string }>;
    };
  };
}

export async function createPhoneCall(
  phoneNumber: string,
  interviewQuestions: string,
): Promise<{ callId: string; status: string }> {
  const res = await fetch(`${VAPI_API_URL}/call`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      phoneNumberId: process.env.VAPI_PHONE_NUMBER_ID,
      assistant: {
        firstMessage: "Hello! I'm your AI interviewer from HermesHire...",
        model: {
          provider: "openai",
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are a professional interviewer. Ask these questions:\n${interviewQuestions}`,
            },
          ],
        },
        voice: { provider: "11labs", voiceId: "sarah" },
      },
      customer: { number: phoneNumber },
    }),
  });
  return res.json();
}

export async function getCallStatus(callId: string): Promise<{
  status: string;
  transcript?: string;
  endedAt?: string;
}> {
  const res = await fetch(`${VAPI_API_URL}/call/${callId}`, {
    headers: { Authorization: `Bearer ${process.env.VAPI_API_KEY}` },
  });
  return res.json();
}

export async function pollUntilComplete(
  callId: string,
  maxWaitMs = 300_000,
  intervalMs = 5_000,
): Promise<{ transcript: string }> {
  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    const status = await getCallStatus(callId);
    if (status.status === "ended" && status.transcript) {
      return { transcript: status.transcript };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
    process.stdout.write(".");
  }
  throw new Error("Call did not complete in time");
}
```

### CLI voice command (`interview.ts`)

The `hermes interview voice` command does:

1. Fetch candidate + interview from DB
2. Generate interview questions via Hermes (if not already generated)
3. Call Vapi API to start outbound call
4. Show spinner: "📞 Calling Jane Doe (+1-555-0123)..."
5. Poll Vapi until call ends
6. Get transcript → call Hermes `generateFeedbackFromTranscript()`
7. Save feedback to `db.json`
8. Show result: "✅ Interview complete. Score: 82/100"

### Two modes

| Mode | Command | What happens | Cost |
|------|---------|--------------|------|
| **Live call** | `hermes interview voice 1 --phone "+1-555-0123"` | Vapi calls the candidate's phone | ~$0.10/min |
| **Simulation** | `hermes interview simulate 1` | Hermes generates a fake transcript + feedback | Free |

### Simulation mode

When Vapi is not configured or `--simulate` is passed:

```
Prompt to Hermes:
"Generate a realistic interview transcript between an AI interviewer and a candidate
named Jane Doe for a Senior Frontend Engineer role. The candidate's resume shows
6 years of React experience. Include questions about React hooks, TypeScript,
and system design. Format as JSON array of { role, content } objects."

→ Fake transcript → generateFeedbackFromTranscript() → structured feedback
```

Same output format, zero infrastructure needed.

---

## Workflow

### Install

```bash
curl -fsSL https://hermeshire.sh/install.sh | bash
```

Script:
1. Detects OS + arch
2. Checks/installs Node.js (>=18)
3. Downloads CLI package to `~/.hermeshire/bin/`
4. Symlinks `~/.local/bin/hermes` → `~/.hermeshire/bin/hermes.js`
5. Adds to PATH
6. Prompts for Hermes API key
7. Seeds demo data

### Demo flow

```bash
# 1. Install
curl -fsSL https://hermeshire.sh/install.sh | bash

# 2. Auth
hermes auth --key sk-nous-...

# 3. HR creates a job + adds candidate
hermes auth --as alice
hermes job create "Senior Frontend Engineer" --dept Engineering
hermes candidate add --job 1 --name "Jane Doe" --email jane@example.com \
  --resume "6 years React, TypeScript, led frontend team of 5..."

# 4. AI summarizes
hermes candidate summary 1

# 5. Move to interview + assign
hermes candidate move 1 --stage INTERVIEW
hermes interview assign 1 --to bob

# 6. Interviewer takes over
hermes auth --as bob
hermes interview list
hermes candidate questions 1

# 7a. Live voice interview (needs Vapi key + credits)
hermes interview voice 1 --phone "+1-555-0123"

# 7b. OR simulate (free, works offline)
hermes interview simulate 1

# 8. Manager decides
hermes auth --as carol
hermes review list
hermes review show 1
hermes review hire 1

# 9. Audit trail
hermes audit 1
```

---

## Command Reference

### Auth
```
hermes auth --key <api-key>          Set Hermes API key
hermes auth --vapi-key <key>         Set Vapi API key
hermes auth --vapi-assistant <id>    Set Vapi assistant ID
hermes auth --as <name>              Switch active user
hermes auth --seed                   Seed demo data
hermes status                        Show config + stats
```

### Jobs
```
hermes job create <title> [--dept <dept>]
hermes job list
hermes job show <id>
```

### Candidates
```
hermes candidate add --job <id> --name <name> [--email <email>] [--phone <phone>] [--resume <text>]
hermes candidate list [--job <id>] [--stage <stage>]
hermes candidate show <id>
hermes candidate summary <id>
hermes candidate questions <id>
hermes candidate move <id> --stage <stage>
```

### Interviews
```
hermes interview assign <candidate-id> --to <user-id>
hermes interview list [--mine]
hermes interview show <id>

# Voice — two modes:
hermes interview voice <candidate-id> --phone "<number>"   # 🔴 Real call (Vapi credits)
hermes interview simulate <candidate-id>                    # 🟢 Fake transcript (free)
```

### Feedback
```
hermes feedback submit <interview-id> --rating <1-5> [--recommendation <text>] [--notes <text>]
hermes feedback show <id>
```

### Review (Manager)
```
hermes review list
hermes review show <candidate-id>
hermes review hire <candidate-id>
hermes review reject <candidate-id>
```

### Meet (Google Meet)
```
hermes meet schedule <candidate-id> "<natural language>"
```

### Audit
```
hermes audit <candidate-id>
```

---

## Data flow for voice interview

```
hermes interview voice 1 --phone "+1-555-0123"
  │
  ├─ 1. Read candidate from db.json (id=1)
  ├─ 2. Read job title
  ├─ 3. Generate questions via Hermes (if not cached)
  ├─ 4. POST https://api.vapi.ai/call
  │      { phone, assistantId, customer }
  ├─ 5. Print "📞 Calling Jane Doe..."
  ├─ 6. Loop: poll GET /call/{id} every 5s
  │      └─ Show dots: .....
  ├─ 7. Call ends → get transcript
  ├─ 8. POST transcript → Hermes generateFeedbackFromTranscript()
  │      → { totalScore, categoryScores, strengths, ... }
  ├─ 9. Save feedback + transcript to db.json
  ├─10. Print result:
  │      ┌──────────────────────────────────────────┐
  │      │ ✅ Interview Complete                     │
  │      │ Total Score: 82/100                       │
  │      │ Communication: 85  Technical: 78          │
  │      │ Strengths: React, System Design           │
  │      │ Recommendation: Strong Hire               │
  │      └──────────────────────────────────────────┘
  └─11. Update audit log
```

---

## Env / Config

The CLI looks for these in `~/.hermeshire/config.json`:

| Key | Required? | Default | For |
|-----|-----------|---------|-----|
| `hermesApiKey` | ✅ | — | Hermes-4-70B API |
| `hermesApiUrl` | ❌ | `https://inference-api.nousresearch.com/v1` | |
| `vapiApiKey` | ❌ | — | Vapi phone calls (optional) |
| `vapiAssistantId` | ❌ | — | Vapi assistant config |
| `vapiPhoneNumberId` | ❌ | — | Vapi phone number pool |

If Vapi keys are missing, `hermes interview voice` falls back to simulation mode automatically.

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `commander` | CLI argument parsing |
| `chalk` | Colored terminal output |
| `cli-table3` | Table formatting |
| `conf` | Config file management |
| `node:fs` | JSON file storage |
| `node:path` | File paths |

**No database. No web server. No Docker.**

---

## Install Script (`install.sh`)

```bash
#!/usr/bin/env bash
set -euo pipefail

REPO="ssk090/hermes-hire"
VERSION="${VERSION:-latest}"
INSTALL_DIR="${INSTALL_DIR:-$HOME/.hermeshire}"
BIN_DIR="${BIN_DIR:-$HOME/.local/bin}"

# Detect OS + arch
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) ARCH="x64" ;;
  aarch64|arm64) ARCH="arm64" ;;
esac

# Check for Node.js
if ! command -v node &> /dev/null; then
  echo "Installing Node.js via fnm..."
  curl -fsSL https://fnm.vercel.app/install | bash
  export PATH="$HOME/.local/share/fnm:$PATH"
  fnm install 20 && fnm use 20
fi

# Download CLI
echo "Downloading HermesHire CLI..."
mkdir -p "$INSTALL_DIR"
DOWNLOAD_URL="https://github.com/$REPO/releases/download/$VERSION/hermes-$OS-$ARCH.tar.gz"
curl -fsSL "$DOWNLOAD_URL" | tar xz -C "$INSTALL_DIR"

# Symlink
mkdir -p "$BIN_DIR"
ln -sf "$INSTALL_DIR/hermes" "$BIN_DIR/hermes"

# PATH
if [[ ":$PATH:" != *":$BIN_DIR:"* ]]; then
  echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.bashrc"
  echo "export PATH=\"\$PATH:$BIN_DIR\"" >> "$HOME/.zshrc"
fi

echo "✅ HermesHire installed!"
echo "Run: hermes auth --key <your-hermes-api-key>"
```

---

## Voice-to-Command (Natural Language → CLI)

Speak naturally in the terminal. Hermes translates to the exact CLI command and executes it.

### Usage

```bash
# Single voice command
hermes --voice "add rahul as candidate"
→ hermes candidate invite --job 1 --name "Rahul" --email rahul@email.com

# Interactive session
hermes --voice
🎤 You: create a job for frontend engineer
→ hermes job create "Frontend Engineer" --dept Engineering
✅ Job created (ID: 1)

🎤 You: add rahul as candidate
→ hermes candidate invite --job 1 --name "Rahul" --email rahul@email.com
📨 Share this link with Rahul: https://hermeshire.app/onboard/abc123

🎤 You: generate ai summary for candidate 1
→ hermes candidate summary 1
🤖 Rahul is a strong candidate with...

# Pipe text directly
echo "hire candidate 1" | hermes --voice
→ hermes review hire 1
✅ Candidate 1 hired
```

### How it works

```
You type/speak: "add rahul as candidate"
                ↓
Hermes prompt:
  "You are a CLI translator. Convert this natural language request
  into a hermes CLI command. Return ONLY the command.
  Context: Job ID 1 is 'Frontend Engineer'.
  User said: 'add rahul as candidate'"
                ↓
Hermes returns: "hermes candidate invite --job 1 --name Rahul --email rahul@email.com"
                ↓
CLI executes the command
```

### What Hermes fills in automatically

| You say | Hermes infers | Command produced |
|---------|---------------|------------------|
| "add rahul as candidate" | Latest job ID = 1, email = rahul@email.com | `hermes candidate invite --job 1 --name "Rahul" --email rahul@email.com` |
| "move candidate 1 to interview" | Stage = INTERVIEW | `hermes candidate move 1 --stage INTERVIEW` |
| "schedule meet with jane tomorrow 2pm" | Candidate 1, parses datetime | `hermes meet schedule 1 "tomorrow at 2pm"` |
| "show what carol needs to review" | Switch user + list | `hermes auth --as carol && hermes review list` |
| "hire candidate 1" | Action = hire | `hermes review hire 1` |

### Why this is powerful for the demo

The entire demo can be run as a script:

```bash
hermes --voice "switch to alice"
hermes --voice "create a job for senior frontend engineer"
hermes --voice "add jane doe as a candidate with 6 years react experience"
hermes --voice "generate ai summary for candidate 1"
hermes --voice "move candidate 1 to interview stage and assign to bob"
hermes --voice "switch to bob"
hermes --voice "generate interview questions for candidate 1"
hermes --voice "simulate interview for candidate 1"
hermes --voice "switch to carol"
hermes --voice "show me the review queue"
hermes --voice "hire candidate 1"
hermes --voice "show audit for candidate 1"
```

Each line is a natural sentence → Hermes translates → CLI executes. The audience sees the translation and the result.

---

## Why CLI wins for a 3-hour hackathon

| Aspect | Web App | CLI |
|--------|---------|-----|
| Build time | ~3.5 hours | **~1 hour** |
| Dependencies | 50+ npm packages | **5 npm packages** |
| Infrastructure | Neon DB + Vercel + shadcn + fonts | **JSON file** |
| Auth | Login page + cookies + middleware | **`--as` flag** |
| Demo | "Open browser, navigate to URL" | **"One curl command"** |
| Voice | Web SDK (browser only) | **REST API (anywhere)** |
| AI features | Same Hermes API | Same Hermes API |
