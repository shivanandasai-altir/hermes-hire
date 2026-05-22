# HermesHire — Build Progress

> **Pivot:** CLI-first for hackathon MVP. Web app is post-MVP.

---

## ✅ Complete

- [x] Hermes 4 API key configured (`HERMES_API_KEY=sk-nous-...`)
- [x] API verified — Hermes-4-70B responding
- [x] Hermes API client built (`services/ai.ts`)
- [x] All AI prompts written (`prompts/`)
- [x] Hermes setup guide (`docs/hermes-setup.md`)
- [x] Full API reference (`docs/hermes-api-reference.md`)
- [x] System design for CLI (`docs/cli-design.md`)
- [x] Domain glossary (`CONTEXT.md`)
- [x] gog CLI for Google Meet scheduling (`lib/meet.ts`)
- [x] Vapi voice agent components (`components/voice/`)
- [x] 68 Magic UI Pro sections in repo (`components/sections/`)
- [x] Animated landing page (`app/page.tsx`)
- [x] Vercel Analytics + Speed Insights installed

---

## 🏗️ CLI Build Steps

### Phase 1: Skeleton (~15 min)
- [ ] Initialize `package.json` for CLI
- [ ] Install deps: `commander`, `chalk`, `conf`
- [ ] Create entry point `bin/hermes.js`
- [ ] Implement `hermes --help` with all subcommands

### Phase 2: Storage (~15 min)
- [ ] Create JSON file storage (`src/storage/db.ts`)
- [ ] Create config management (`src/storage/config.ts`)
- [ ] Seed demo users (Alice HR, Bob Interviewer, Carol Manager)

### Phase 3: Auth (~5 min)
- [ ] `hermes auth --key <api-key>`
- [ ] `hermes auth --as <name>`
- [ ] `hermes status`

### Phase 4: Core Commands (~25 min)
- [ ] `hermes job create/list/show`
- [ ] `hermes candidate add/list/show/move`
- [ ] `hermes candidate summary <id>` — calls Hermes
- [ ] `hermes candidate questions <id>` — calls Hermes

### Phase 5: Interview + Feedback (~15 min)
- [ ] `hermes interview assign/list`
- [ ] `hermes feedback submit/show`

### Phase 6: Manager Review (~10 min)
- [ ] `hermes review list`
- [ ] `hermes review hire/reject <candidate-id>`

### Phase 7: Meet Scheduling (~10 min)
- [ ] `hermes meet schedule <id> "natural language"`
- [ ] Wires through `lib/meet.ts` → gog → Meet link

### Phase 8: Install Script + Polish (~15 min)
- [ ] Create `scripts/install.sh`
- [ ] Demo seed data (pre-seeded AI content)
- [ ] `hermes audit <candidate-id>` — timeline

---

## 🔮 Post-Hackathon (Web App)

- [ ] Prisma schema (5 models)
- [ ] Neon database
- [ ] Login + middleware
- [ ] Role dashboards (HR, Interviewer, Manager)
- [ ] Kanban pipeline
- [ ] shadcn UI pages
- [ ] Vercel deployment
