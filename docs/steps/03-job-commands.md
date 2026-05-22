# Step 3: Job Commands

**Estimated time:** ~10 min  
**Depends on:** Steps 1-2  
**First data command.**

---

## Goal

`hermes job create` and `hermes job list` — create and browse job openings.

## Commands Built

```
hermes job create <title> [--dept <department>]
hermes job list
hermes job show <id>
```

## Behavior

- `create` — adds a job to db.json, assigns auto-incrementing ID, status defaults to "OPEN"
- `list` — shows all jobs in a table (ID, Title, Department, Status, Candidate count)
- Only HR can create jobs (checks active user role)

## Example

```
$ hermes auth --as alice
$ hermes job create "Senior Frontend Engineer" --dept Engineering
  ✅ Job created (ID: 1)

$ hermes job list
  ┌────┬──────────────────────────────┬─────────────┬────────┬──────┐
  │ ID │ Title                        │ Department  │ Status │ Jobs │
  ├────┼──────────────────────────────┼─────────────┼────────┼──────┤
  │ 1  │ Senior Frontend Engineer     │ Engineering │ OPEN   │ 0    │
  └────┴──────────────────────────────┴─────────────┴────────┴──────┘
```

## Acceptance Criteria

- [ ] HR can create a job with title + department
- [ ] Job list shows all jobs with candidate count
- [ ] Non-HR users cannot create jobs
