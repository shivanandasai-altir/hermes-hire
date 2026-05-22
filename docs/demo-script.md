# HermesHire — Investor Demo Script

> **Format:** 5 min pitch + 5 min Q&A  
> **Demo mode:** CLI-first, live terminal, role-switching via `hermes auth --as`

---

## 🎬 ACT I — The Problem & Setup (45 sec)

**You (on stage):**

> *"Hiring is broken. It's slow, manual, and involves 3 different people — HR, Interviewers, Managers — each working in silos, each with their own tools. HR uses the ATS. Interviewers use docs. Managers use email. Nobody sees the full picture.*
>
> *A single hire takes 20+ touchpoints. Resumes get lost. Feedback takes days. Good candidates go cold.*
>
> *HermesHire collapses all of that into one command line — one unified, AI-powered hiring command center."*

**Your hands:**

```bash
# Terminal starts clean. You already have a seeded database.
# Type this first to show the header — it's big and impressive:

hermes status
```

> *"Let me show you what I mean. Three people. One terminal. AI at every step."*

---

## 🎬 ACT II — HR: Creates a Job & Invites a Candidate (1 min)

```bash
hermes auth --as alice
```

> *(point at screen)* "I'm Alice, HR. One command, I'm in."

```bash
hermes job create "Senior Frontend Engineer" --dept Engineering
```

> *"Job created in seconds. No ATS login, no dropdowns, no waiting for page loads."*

```bash
hermes candidate invite --job 1 --name "Rahul Sharma" --email rahul@example.com
```

> *(read the output)* "The system generates an invite link and sends an email — all from the terminal."

```bash
hermes candidate list --job 1
```

> *"Rahul is now in the pipeline, Pending Onboarding. One command, visible."*

**Key moment:** Show you went from zero to a candidate in ~4 commands, under 10 seconds of typing.

---

## 🎬 ACT III — AI-Generated Candidate Summary (45 sec)

```bash
hermes candidate move 1 --stage APPLIED
hermes candidate summary 1
```

> *(dramatic pause while the AI thinks)* "Hermes-4-70B reads the resume against the job description and generates a structured summary — instantly."

```bash
# after summary appears:
hermes candidate questions 1
```

> *"And interview questions, tailored to this candidate and this role. Interviewers don't need to prep anymore — the AI does it for them."*

**Key moment:** This is the first "wow" — AI delivering real value in seconds.

---

## 🎬 ACT IV — Role Switch: Interviewer Simulates (1 min)

```bash
hermes candidate move 1 --stage INTERVIEW
hermes interview assign 1 --to bob
```

> *"Alice moves Rahul to INTERVIEW and assigns Bob as the interviewer."*

```bash
hermes auth --as bob
```

> *(flip roles)* "Now I'm Bob, the interviewer. I see my queue."

```bash
hermes interview list --mine
```

> *"My assigned interviews. One command."*

```bash
hermes interview simulate 1
```

> *"This is the cool part. Hermes simulates a full AI interview — generates a realistic transcript, scores the candidate on communication, technical depth, and problem-solving, and produces a structured recommendation."*

```bash
# output shows:
# Total Score: 85/100
# Recommendation: Strong Hire
# Communication: 88/100
# Technical: 82/100
# Problem Solving: 78/100
```

> *"No calendar coordination. No scheduling. The AI interviews the candidate against the job in under 5 seconds."*

---

## 🎬 ACT V — Manager: Review + Decision (45 sec)

```bash
hermes auth --as carol
```

> *"Now I'm Carol, the Manager. Alice sourced. Bob interviewed. Now I decide."*

```bash
hermes review list
```

> *"Candidates awaiting my decision — with AI summary and feedback side by side."*

```bash
hermes review show 1
```

> *"I see the full picture: AI summary, interview questions, Bob's feedback with ratings. Everything in one view."*

```bash
hermes review hire 1
```

> *"One command. Done. Hired."*

---

## 🎬 ACT VI — Audit Trail + Voice (45 sec)

```bash
hermes audit 1
```

> *"And every action is logged with timestamps. Full transparency. No black boxes. HR can see exactly what happened, who did what, and when."*

```bash
hermes auth --as alice
hermes voice "schedule a meet with candidate 1 tomorrow at 2pm"
```

> *"Or forget command syntax entirely. Just type naturally, and Hermes translates it into the right CLI command. It's a copilot, not just a tool."*

*(show the copied command, or run it)*

```bash
hermes meet schedule 1 "tomorrow at 2pm"
```

> *"Natural language → Google Meet link → stored on the candidate record."*

---

## 🎬 ACT VII — Close (30 sec)

> *(step away from keyboard, look at audience)*
>
> *"Here's what you need to remember:*
>
> **One installation.** `curl | bash` — that's it.  
> **Three roles.** HR, Interviewer, Manager. Same terminal. Same data. Real-time.  
> **AI at every stage.** Summaries, questions, simulated interviews, voice-to-command.  
> **No more context switching.** No Slack threads, no email chains, no lost feedback.  
>
> *HermesHire turns hiring from a slow, multi-tool slog into a single, fast, AI-powered conversation. *
>
> *That's the demo. Happy to take questions."*

---

## 📋 Recommended Workflow (Full Demo Runbook)

This is the exact sequence of commands to execute during the demo, with timing cues.

### Pre-Demo Setup (before you step on stage)

```bash
# Already have:
# 1. Neon database seeded (pnpm db:seed)
# 2. API key configured (hermes auth --key sk-nous-...)
# 3. Terminal at project root
# 4. Screen recording ready
```

### Demo Commands — Timed Sequence

| Time  | Who  | Command | What happens on screen |
|-------|------|---------|------------------------|
| 0:00  | —    | `hermes status` | ASCII logo + config display |
| 0:20  | HR   | `hermes auth --as alice` | Role switch → "Active: Alice (HR)" |
| 0:30  | HR   | `hermes job create "Senior Frontend Engineer" --dept Engineering` | Job created with ID |
| 0:45  | HR   | `hermes candidate invite --job 1 --name "Rahul Sharma" --email rahul@example.com` | Invite link + email sent |
| 1:00  | HR   | `hermes candidate list --job 1` | Table: Rahul in PENDING_ONBOARDING |
| 1:10  | HR   | `hermes candidate move 1 --stage APPLIED` | Stage moved |
| 1:20  | HR   | `hermes candidate summary 1` | AI generates summary (3-5 sec) |
| 1:35  | HR   | `hermes candidate questions 1` | AI generates questions |
| 1:50  | HR   | `hermes candidate move 1 --stage INTERVIEW` | Stage moved |
| 2:00  | HR   | `hermes interview assign 1 --to bob` | Interview created |
| 2:10  | Bob  | `hermes auth --as bob` | Role switch |
| 2:20  | Bob  | `hermes interview list --mine` | Table: Rahul assigned to Bob |
| 2:30  | Bob  | `hermes interview simulate 1` | AI interview simulation → scores |
| 3:00  | Carol | `hermes auth --as carol` | Role switch |
| 3:10  | Carol | `hermes review list` | Candidates awaiting review |
| 3:20  | Carol | `hermes review show 1` | Full review view |
| 3:40  | Carol | `hermes review hire 1` | ✅ Hired! |
| 3:50  | —    | `hermes audit 1` | Full timeline of all actions |
| 4:15  | HR   | `hermes auth --as alice` | Back to HR |
| 4:25  | HR   | `hermes voice "schedule meet with candidate 1 tomorrow at 2pm"` | AI translates → copies command |
| 4:35  | HR   | *(paste & run)* `hermes meet schedule 1 "tomorrow at 2pm"` | Meet link generated |
| 4:50  | —    | *Wrap up* | The takeaway |

### Timing Notes

| Segment | Duration | What to emphasize |
|---------|----------|-------------------|
| ASCII header | 15s (let it breathe) | "This isn't a web app — it's your terminal" |
| HR creates | 45s | Speed. One command per action. No UI load times. |
| AI summary | 30s (let AI think) | "This is the real deal — Hermes-4-70B, not a toy" |
| Role switch | 5s | "Same data, different permissions" |
| Simulate | 30s | "This is the wow moment — AI interviews the candidate" |
| Manager decision | 20s | "Everything in one view. One command to hire." |
| Audit + voice | 30s | Transparency + natural language accessibility |
| Close | 20s | The mission statement |

---

## 🚨 Demo Script Tips

### Do NOT show

- **Installation** (`curl | bash`) — skip this, assume it's installed
- **Database setup** — pre-seeded
- **Errors** — practice the exact flow, use a fresh seed for each demo
- **Loading spinners** — type fast, make it feel instant

### DO show

- **The ASCII header** — it's impressive and sets the tone
- **Fast role switching** — `hermes auth --as bob` — immediate context change
- **AI thinking time** — let it breathe, narrate what's happening
- **The audit log at the end** — it visually shows everything you just did

### Hardware setup

- **Dark terminal theme** — makes the gold ASCII art pop
- **Large font** — at least 20pt so the back row can read
- **Screen at max brightness**
- **Disable notifications and popups**
- **Pre-warm the AI** — run a summary before the demo (first AI call is slow)

### Backup plan if AI is slow/non-responsive

- Have a pre-seeded output you can scroll through
- Fallback line: *"Let me show you what it looks like"* — then run `hermes candidate show 1` to show previously generated content

---

## 🗣️ Q&A Prep (Common Investor Questions)

| Question | Answer |
|----------|--------|
| *"Isn't the CLI a barrier? Nobody uses terminals anymore."* | "Actually, that's our wedge. Developers and technical founders love it. And every command has a natural language fallback — `hermes voice "do X"` — so you never need to memorize syntax. Next: a web UI that mirrors the CLI exactly." |
| *"How is this different from an ATS like Greenhouse?"* | "Greenhouse costs $8K+/year. Takes weeks to set up. Requires training. HermesHire is `curl \| bash` — running in 30 seconds. AI-native from day one, not bolted on. And it's one tool for all three roles, not three separate logins." |
| *"Where's the moat?"* | "Two things: 1) The voice-to-command translation layer — we've trained Hermes to understand hiring workflows specifically. 2) The pipeline-aware AI — summaries, questions, and simulations understand the stage context, not just the resume. Plus, shared database between CLI and web means switching costs go up as data accumulates." |
| *"Who's the customer?"* | "Two segments: 1) Technical founders and small teams (5-50 people) who want a fast, programmable hiring pipeline. 2) Engineering-led recruiting teams who want AI integration and can't get it from legacy ATS providers." |
| *"How do you make money?"* | "Free for single-team CLI use. Tiered for multi-job, multi-user with AI credits. Enterprise for dedicated Hermes API + custom pipeline rules." |
| *"What's next?"* | "Web UI (shared DB with CLI), calendar sync, Slack notifications, multi-language voice interviews, API for embedding in other tools." |
