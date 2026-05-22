# Step 7: Meet Scheduling + Audit + Voice

**Estimated time:** ~15 min  
**Depends on:** Steps 1-6  
**Polishing features.**

---

## Goal

Google Meet scheduling via natural language, full audit timeline, and live Vapi phone calls.

## Commands Built

```
hermes meet schedule <candidate-id> "<natural language>"
hermes audit <candidate-id>
hermes interview voice <candidate-id> --phone "<number>"
```

## Meet Scheduling

- `hermes meet schedule 1 "tomorrow at 2pm"`:
  1. Calls Hermes to parse the natural language → `{ startDateTime, endDateTime, summary }`
  2. Calls `gog calendar create` with `--with-meet` flag
  3. Stores the Meet link on the candidate record
  4. Returns the link: `📅 https://meet.google.com/abc-defg-hij`

- Requires `gog` CLI installed (`brew install gogcli`) and authenticated

## Audit Timeline

- `hermes audit <id>` shows the full action history for a candidate
- Reads `auditLogs` JSON array from the candidate record
- Displays reverse chronological: timestamp, user, action description

## Voice Interview (Vapi)

- `hermes interview voice 1 --phone "+1-555-0123"`:
  1. Calls Vapi REST API to start an outbound phone call
  2. Polls Vapi until call completes
  3. Gets transcript → Hermes generates feedback
  4. Stores feedback in db.json

- Requires `VAPI_API_KEY` configured via `hermes auth --vapi-key <key>`

## Acceptance Criteria

- [ ] `meet schedule` parses NL and creates a Google Meet event (or shows error if gog not installed)
- [ ] `audit` shows full timeline for a candidate
- [ ] Voice interview starts a Vapi call (when configured) or shows helpful error
