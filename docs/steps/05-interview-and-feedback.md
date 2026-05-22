# Step 5: Interview + Feedback

**Estimated time:** ~15 min  
**Depends on:** Steps 1-4  
**Interviewer role.**

---

## Goal

Assign interviewers to candidates, simulate AI interviews, and submit structured feedback.

## Commands Built

```
hermes interview assign <candidate-id> --to <user-id>
hermes interview list [--mine]
hermes interview show <id>
hermes interview simulate <candidate-id>
hermes feedback submit <interview-id> --rating <1-5> [--recommendation <text>] [--notes <text>]
hermes feedback show <id>
```

## Interview Simulation

`hermes interview simulate <id>`:
1. Reads candidate profile + job title from db.json
2. Calls Hermes with a prompt to generate a realistic interview transcript
3. Feeds the fake transcript into `generateFeedbackFromTranscript()`
4. Returns structured scores: total, communication, technical, problem-solving, etc.
5. Saves feedback to db.json

## Feedback

- Rating: 1-5 scale
- Recommendation: "Strong Hire", "Hire", "No Hire", "Strong No Hire"
- Comments: free text
- Stored in `feedback` array in db.json, linked to interview

## Acceptance Criteria

- [ ] HR can assign an interviewer to a candidate at INTERVIEW stage
- [ ] Interviewer can list their assigned interviews
- [ ] `interview simulate` generates fake transcript + scores via Hermes
- [ ] Feedback is stored and linked to the interview
