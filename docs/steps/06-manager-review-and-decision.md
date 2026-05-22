# Step 6: Manager Review + Decision

**Estimated time:** ~10 min  
**Depends on:** Steps 1-5  
**Final decision.**

---

## Goal

Managers review candidates in `MANAGER_REVIEW` stage, view AI summary + feedback, and make final decisions.

## Commands Built

```
hermes review list
hermes review show <candidate-id>
hermes review hire <candidate-id>
hermes review reject <candidate-id>
```

## Behavior

- `review list` — shows candidates in MANAGER_REVIEW stage with AI summary preview
- `review show` — displays full AI summary + interviewer feedback side-by-side
- `review hire` — sets stage to HIRED, audit log: "Hired by Manager"
- `review reject` — sets stage to REJECTED, audit log: "Rejected by Manager"
- Only MANAGER role can execute these commands

## Acceptance Criteria

- [ ] Manager sees only candidates in MANAGER_REVIEW stage
- [ ] `review show` displays AI summary + feedback
- [ ] `hire` sets stage to HIRED with audit log
- [ ] `reject` sets stage to REJECTED with audit log
- [ ] Non-manager roles cannot execute review commands
