# HermesHire — Investor Demo Script

> **Format:** 5 min pitch + 5 min Q&A  
> **Demo mode:** CLI-first, live terminal, role-switching via `hermes auth --as`  
> **Integrations:** Hermes-4-70B · hermes-hire.xyz · Resend · Vapi · gog CLI · Neon

---

## 🎬 SCENE 0 — Welcome Speech (~90 seconds)

### What you say (look at the audience, not the screen)

> *"Good morning everyone. Thanks for being here.*
>
> *I want to start with a problem you've all felt.*
>
> *Think about the last time your company hired someone. HR creates a job in the ATS. Someone forwards the link to a recruiter. Resumes come in as PDF attachments in email. The interviewer gets a Slack message — 'can you evaluate this person?' They open a Google Doc, write some notes, send it back. The manager waits for three email threads to converge before making a decision.*
>
> *One hire. Three roles. Five different tools. Two weeks of coordination.*
>
> *That's not a pipeline. That's a Rube Goldberg machine.*
>
> *We asked a simple question: what if the hiring pipeline was just one thing — one interface, one data model, one source of truth — with AI built into every step, not bolted on at the end?*
>
> *So we built it.*
>
> *HermesHire is an AI-native hiring command center that lives in your terminal. Three roles — HR, Interviewer, Manager. One CLI. AI at every stage — from resume summaries to interview simulations to natural language scheduling.*
>
> *Everything is live. Everything is connected. Hermes-4-70B from Nous Research powers the AI. Resend sends the emails. Vapi handles phone interviews. gog CLI creates Google Calendar events. All from a single \`curl | bash\` install.*
>
> *Let me show you what that looks like."*

*(turn to the terminal and begin Scene 1)*

---

### Alternative: Shorter Version (~45 seconds)

Use this if you're on a tight agenda or sharing the stage.

> *"Hiring is the last multi-tool workflow in every company. HR in the ATS. Interviewers in Google Docs. Managers in email. No single source of truth, and AI is an afterthought.*
>
> *We built HermesHire — one CLI for all three roles, with AI native to every stage. Hermes-4-70B summaries, Resend emails, Vapi phone interviews, Google Meet scheduling — all from a \`curl | bash\` install.*
>
> *Let me show you."*

---

### Delivery Notes

| Element | How to deliver it |
|---------|-------------------|
| **Tone** | Conversational, not scripted. You're telling a story, not reading bullet points. |
| **Pacing** | The problem description should feel relatable — slow down on "HR creates / someone forwards / interviewer opens / manager waits" — each phrase is a beat. |
| **The question** | "What if the hiring pipeline was just one thing?" — pause here. Let it land. |
| **Transition** | "Let me show you" — then turn to the screen decisively. This is the handoff from speech to demo. |
| **Eye contact** | During the speech, face the audience. Don't look at the terminal until "Let me show you." |

---

## 📋 Complete Runbook — Install to Close

### Pre-Demo Setup (before you step on stage)

```bash
# Terminal: clean, dark theme, font ≥ 20pt, full screen
# NOTHING running — you start from raw shell prompt
#
# Your .env has:
#   HERMES_API_KEY=sk-nous-...
#   RESEND_API_KEY=re_...
#   DATABASE_URL=postgresql://...
#
# Database is freshly seeded:
#   pnpm db:seed
#
# Pre-warm AI:
#   Run one hermes candidate summary on the seeded candidate
#   (first call is slow — this warms the model)
#
# Disable:
#   - Notifications
#   - Screen saver
#   - All browser tabs except hermes-hire.xyz

export PS1="$ "
clear
```

---

## 🎬 SCENE 1 — The Problem & The Install (60 sec)

### What the audience sees

A clean terminal. Just a `$` prompt.

### What you say

> *"Hiring is broken. Three roles — HR, Interviewer, Manager — three different tools, three different logins, no single source of truth. A single hire takes 42 days and $4,000, and good candidates go cold while everyone waits for feedback."*

> *"We built the thing that should have existed all along."*

### Your hands

```bash
# Type this slowly and deliberately. Each line fills.
# The install script has a big gold logo — let it render fully.

curl -fsSL https://hermes-hire.xyz/install.sh | bash
```

Wait for the install to complete. The ASCII "HERMES HIRE" logo fills the terminal with the gold header. Let it breathe for 3 seconds.

> *"One curl piped to bash. Installed in 15 seconds. No Docker, no database setup, no config files to edit."*

```bash
hermes auth --key sk-nous-...
```

> *"One API key — Nous Research's Hermes-4-70B. The AI is not GPT-4. We chose Hermes because it's open, it's powerful, and it's purpose-built for structured reasoning."*

```bash
hermes status
```

The status command shows: API key configured, active user (none), database connected.

> *"The domain — hermes-hire.xyz — real. The email service — Resend — real. The database — Neon Postgres — real. Everything is connected. This is not a prototype."*

> *"Now let me show you what this can do."*

---

## 🎬 SCENE 2 — HR: Creates a Job & Invites a Candidate (60 sec)

### What you say

> *"I'm Alice, HR. One command, I'm in."*

### Your hands

```bash
hermes auth --as alice
```

Terminal shows: "Active user: Alice (HR)"

```bash
hermes job create "Senior Frontend Engineer" --dept Engineering
```

> *"Job created. No form. No page load. One command."*

```bash
hermes candidate invite --job 1 --name "Rahul Sharma" --email rahul@example.com
```

### What happens on screen

```
📨 Invite link for Rahul Sharma:
  https://hermes-hire.xyz/onboard/<token>
📧 Email sent to rahul@example.com
```

> *"The email went out through **Resend** from our verified domain **hermes-hire.xyz**. Branded template, tracked delivery. The candidate opens the link, fills in their resume, and they're in the pipeline. The domain is real. The email is real. The onboarding page is real."*

```bash
hermes candidate list --job 1
```

Shows Rahul in PENDING_ONBOARDING stage.

> *"One candidate. One command. Visible."*

**Key moment:** Zero to candidate in ~4 commands, ~10 seconds of typing, with real infrastructure behind every line.

---

## 🎬 SCENE 3 — AI Summary & Questions (45 sec)

### What you say

> *"Rahul has submitted his resume. Let's get the AI to work."*

### Your hands

```bash
hermes candidate move 1 --stage APPLIED
hermes candidate summary 1
```

*Wait 3-5 seconds for the response.*

### What happens on screen

```
🤖 AI Summary:
  Rahul Sharma has 6 years of frontend engineering experience
  with React, TypeScript, and Next.js. His background aligns
  well with the Senior Frontend Engineer role at a fast-paced
  startup. Key strengths: component architecture, performance
  optimization, team leadership. Areas to explore: experience
  with design systems at scale.
```

> *"This is **Hermes-4-70B** running on Nous Research's inference API — not a GPT wrapper. The model reads the resume against the job description, understands the context, and produces a structured evaluation. This is what the model was built for."*

```bash
hermes candidate questions 1
```

### What happens on screen

```
❓ AI Interview Questions:
  1. Walk me through a complex component you built from scratch.
  2. How do you approach performance optimization in a React app?
  3. Describe a time you mentored a junior engineer.
  4. How would you design a design system for a team of 20?
```

> *"Interview questions — tailored to this candidate, this role, this seniority level. Interviewers don't need to prep. The AI does it for them."*

**Key moment:** First "wow" — AI delivering real, usable value in seconds.

---

## 🎬 SCENE 4 — HR Moves to Interview + Assigns (20 sec)

```bash
hermes candidate move 1 --stage INTERVIEW
hermes interview assign 1 --to bob
```

> *"Alice moves Rahul to INTERVIEW stage and assigns Bob — the technical interviewer — to evaluate him."*

---

## 🎬 SCENE 5 — Interviewer: AI Interview Simulation (50 sec)

```bash
hermes auth --as bob
```

> *"Now I'm Bob. One command. Same terminal. Same data. Different permissions."*

```bash
hermes interview list --mine
```

Shows: Rahul assigned to Bob.

> *"My queue. One command."*

```bash
hermes interview simulate 1
```

*Wait 3-5 seconds.*

### What happens on screen

```
📝 Interview Complete
  Total Score: 85/100
  Recommendation: Strong Hire
  Communication:  88/100
  Technical:      82/100
  Problem Solving: 78/100
  Strengths: System architecture, communication, technical depth
```

> *"The AI simulated a full interview — generated a realistic transcript, scored the candidate across three dimensions, and produced a structured hiring recommendation. No calendar coordination. No scheduling. The AI interviews the candidate against the job in under 5 seconds."*

> *"And if you want a real phone call instead — we've integrated **Vapi**. The AI voice agent calls the candidate's actual number, conducts the interview, transcribes it, and returns the same structured feedback. But the simulation alone already gives you 80% of the signal."*

**Key moment:** This is the demo centerpiece — AI replacing a multi-day coordination cycle with a 5-second command.

---

## 🎬 SCENE 6 — Manager: Review + Decision (40 sec)

```bash
hermes auth --as carol
```

> *"Now I'm Carol, the Manager. Alice sourced. Bob interviewed. Now I decide."*

```bash
hermes review list
```

Shows Rahul in MANAGER_REVIEW with AI summary preview and feedback preview side by side.

> *"Everything in one view. AI summary. Interview feedback. Ratings. No tab switching. No email forwards."*

```bash
hermes review show 1
```

Full detail view: AI summary, interview questions, Bob's feedback with scores.

> *"I see the full picture before I decide."*

```bash
hermes review hire 1
```

```
✅ Rahul Sharma hired!
  Stage → HIRED · Audit logged
```

> *"One command. Done. Hired."*

**Key moment:** Show the speed of decision-making when all context is unified.

---

## 🎬 SCENE 7 — Audit Trail (20 sec)

```bash
hermes audit 1
```

### What happens on screen

```
📋 Audit Timeline: Rahul Sharma
  ──────────────────────────────────
  Apr 15, 2025 10:32 AM
  ✅ Hired by Manager
    by Carol

  Apr 15, 2025 10:28 AM
  🎙️ Interview simulated, moved to Manager Review
    by Bob

  Apr 15, 2025 10:25 AM
  ➡️ Moved to INTERVIEW
    by Alice

  Apr 15, 2025 10:22 AM
  ❓ AI Questions generated
    by Alice

  Apr 15, 2025 10:20 AM
  🤖 AI Summary generated
    by Alice

  Apr 15, 2025 10:15 AM
  📨 Invited to job (Senior Frontend Engineer)
    by Alice

  6 entries total
```

> *"Every action, every role switch, every AI generation — logged with timestamps. Full transparency. No black boxes. If a candidate asks 'what happened to my application?', you can show them the exact timeline."*

---

## 🎬 SCENE 8 — Natural Language + Google Meet (40 sec)

```bash
hermes auth --as alice
```

> *"Back to HR. Let's say you don't want to remember command syntax."*

```bash
hermes voice "schedule a meet with candidate 1 tomorrow at 2pm"
```

### What happens on screen

```
  Translating...
  → hermes meet schedule 1 "tomorrow at 2pm"

  📋 Copied to clipboard — paste and press Enter to run
```

> *"Natural language → translated into the correct command. No syntax to remember. Hermes-4-70B acts as a translation layer between English and the CLI. It knows the pipeline, the stages, the roles."*

*(Paste and run)*

```bash
hermes meet schedule 1 "tomorrow at 2pm"
```

### What happens on screen

```
  🤖 Parsing request with Hermes...
  "tomorrow at 2pm"

  📅 Google Meet created!
  https://meet.google.com/abc-defg-hij
  Link stored on candidate record
```

> *"Hermes parses 'tomorrow at 2pm' — understands the datetime — calls **gog CLI** behind the scenes which creates a real Google Calendar event with a Meet link. The link is stored on the candidate record and logged in the audit trail."*

> *"The domain. The email. The calendar. The AI. Everything is connected. Everything is real."*

---

## 🎬 SCENE 9 — Close (20 sec)

> *(step away from keyboard, look at audience)*

> *"Here's what you need to remember:*

> **One install.** `curl | bash` — running in 15 seconds.

> **Three roles.** HR, Interviewer, Manager. Same terminal. Same data. Real-time role switching.

> **AI at every stage.** Summaries, questions, simulated interviews, natural language translation — all powered by Hermes-4-70B.

> **Real integrations, not mockups.** Nous Research. hermes-hire.xyz. Resend. Vapi. gog CLI. Neon. Everything is connected and working today.

> *HermesHire turns hiring from a slow, multi-tool slog into a single, fast, AI-powered conversation.*

> *That's the demo. Happy to take questions."*

---

## ⏱ Timing Summary

| Scene | What Happens | Duration | Cumulative |
|-------|-------------|----------|------------|
| 1 | Land + Install + Auth | 60s | 1:00 |
| 2 | HR creates job + invites candidate | 60s | 2:00 |
| 3 | AI summary + questions | 45s | 2:45 |
| 4 | Move to INTERVIEW + assign | 20s | 3:05 |
| 5 | Simulate interview | 50s | 3:55 |
| 6 | Manager review + hire | 40s | 4:35 |
| 7 | Audit timeline | 20s | 4:55 |
| 8 | Voice-to-command + Meet | 40s | 5:35 |
| 9 | Close | 20s | 5:55 |

**Budget buffer:** ~5 seconds of slack. Keep the pace tight. If running over, skip Scene 8 (voice + Meet) and mention it in Q&A.

---

## 📦 Command Cheat Sheet (for your reference)

```bash
# ── Scene 1: Install & Auth ──
curl -fsSL https://hermes-hire.xyz/install.sh | bash
hermes auth --key sk-nous-...
hermes status

# ── Scene 2: HR creates & invites ──
hermes auth --as alice
hermes job create "Senior Frontend Engineer" --dept Engineering
hermes candidate invite --job 1 --name "Rahul Sharma" --email rahul@example.com
hermes candidate list --job 1

# ── Scene 3: AI features ──
hermes candidate move 1 --stage APPLIED
hermes candidate summary 1
hermes candidate questions 1

# ── Scene 4: Assign interviewer ──
hermes candidate move 1 --stage INTERVIEW
hermes interview assign 1 --to bob

# ── Scene 5: Interviewer simulates ──
hermes auth --as bob
hermes interview list --mine
hermes interview simulate 1

# ── Scene 6: Manager decides ──
hermes auth --as carol
hermes review list
hermes review show 1
hermes review hire 1

# ── Scene 7: Audit ──
hermes audit 1

# ── Scene 8: Voice + Meet ──
hermes auth --as alice
hermes voice "schedule a meet with candidate 1 tomorrow at 2pm"
hermes meet schedule 1 "tomorrow at 2pm"
```

---

## 🎯 Callout Map — Where Each Integration Gets Mentioned

| Integration | Scene | Trigger | The Line |
|-------------|-------|---------|----------|
| **Hermes-hire.xyz domain** | 1 | `curl \| bash` URL | "The domain — hermes-hire.xyz — real." |
| **Hermes API key** | 1 | `hermes auth --key` | "Nous Research's Hermes-4-70B. Open, powerful, built for structured reasoning." |
| **Neon Postgres** | 1 | `hermes status` | "The database — Neon Postgres — real." |
| **Resend** | 2 | After invite email sends | "The email went out through Resend from our verified domain. Branded. Tracked. Real." |
| **Hermes-4-70B** | 3 | `hermes candidate summary 1` | "This is Hermes-4-70B — not a GPT wrapper. It reads resume against job description." |
| **Vapi** | 5 | After simulation output | "And if you want a real phone call — we've integrated Vapi. The AI agent calls the candidate." |
| **gog CLI** | 8 | `hermes meet schedule` | "Hermes calls gog CLI — creates a real Google Calendar event with a Meet link." |

---

## 🚨 Demo Tips

### Do NOT show
- **npm install / pnpm install** — `curl | bash` covers this
- **Browser tabs** — kill everything except the terminal
- **Typing mistakes** — practice with a script open on a second monitor
- **Long AI waits** — pre-warm the model before stepping on stage

### DO show
- **The `curl | bash` output** — the gold ASCII logo is theatrical. Let it finish.
- **Fast role switching** — `hermes auth --as bob` → immediate context change
- **The audit log at the end** — it visually recaps the entire demo
- **The Meet link** — it proves the calendar integration is real

### Backup plan
- AI slow? Run `hermes candidate show 1` to show pre-generated content.
- API down? Scroll through a recorded terminal session in a text file.
- Running short on time? **Kill Scene 8** (voice + Meet) and mention it in Q&A.

---

## 🗣️ Q&A Prep

| Question | Answer |
|----------|--------|
| *"Isn't the CLI a barrier?"* | "It's our wedge. Developers love it. And every command has `hermes voice` as a natural language fallback — you never need to memorize syntax. Next: a web UI that mirrors the CLI exactly." |
| *"How is this different from an ATS?"* | "$8K+/year, weeks to set up, training required. HermesHire is `curl \| bash` — running in 15 seconds. AI-native from day one, not bolted on. One tool for all three roles, not three separate logins." |
| *"Are these real integrations or mocks?"* | "Every single one is real. Hermes-4-70B from Nous Research. Resend email from hermes-hire.xyz. Vapi voice calls. gog CLI for Google Calendar. Neon Postgres for the database. We built a product, not a prototype." |
| *"Where's the moat?"* | "1) The hiring-specific AI layer — we've fine-tuned prompts for pipeline-aware summaries, questions, and simulations. 2) Voice-to-command trained on hiring workflows specifically. 3) Shared database between CLI and the upcoming web UI — switching costs compound." |
| *"How do you make money?"* | "Free for single-team CLI. Tiered for multi-job, multi-user with AI credits. Enterprise for dedicated Hermes API + custom pipeline rules." |
| *"What's next?"* | "Web UI (shared DB with CLI), calendar sync, Slack notifications, multi-language voice interviews, API for embedding in other tools." |
