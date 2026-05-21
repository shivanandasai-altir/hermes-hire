# HermesHire

HermesHire is an AI-native hiring command center that coordinates HR, Interviewers, and Managers across a structured recruitment pipeline. Each role has distinct responsibilities and views.

## Language

**HR**:
A user who creates jobs, adds candidates, generates AI summaries, moves candidates through pipeline stages, and assigns interviewers.
_Avoid_: Recruiter, Admin

**Interviewer**:
A user assigned to evaluate a specific candidate. Reviews AI summaries, generates AI interview questions, submits structured feedback, or conducts a voice interview via Vapi.
_Avoid_: Evaluator, Reviewer

**Manager**:
A user who makes final hiring decisions (Hire/Reject) and can schedule Google Meet calls with candidates using natural language.
_Avoid_: Approver, Director

**Job**:
An opening for a specific role, created by HR. Has a title, department, and status (OPEN/CLOSED).
_Avoid_: Position, Role (when referring to the opening)

**Candidate**:
A person being considered for a Job. Carries resume text, pipeline stage, AI-generated fields, and an audit log.
_Avoid_: Applicant, Prospect

**Interview**:
An assignment pairing a Candidate with an Interviewer. Created by HR when a candidate reaches the INTERVIEW stage.
_Avoid_: Interview assignment, Evaluation

**Feedback**:
Structured evaluation from an Interviewer for a specific Interview. Includes rating, recommendation, and comments. One-to-one with Interview.
_Avoid_: Review, Assessment

**Stage**:
The current position of a Candidate in the hiring pipeline. Valid values: APPLIED, SCREENING, INTERVIEW, MANAGER_REVIEW, HIRED, REJECTED. Transitions are validated — not all moves are allowed.
_Avoid_: Status, Phase

**Hire**:
The final positive outcome. Manager clicks Hire → stage becomes HIRED → audit log: "Hired by Manager".
_Avoid_: Approve, Accept

**Reject**:
The final negative outcome. Manager clicks Reject → stage becomes REJECTED → audit log: "Rejected by Manager".
_Avoid_: Decline, Pass

**AI Summary**:
A Hermes-generated analysis of a candidate's resume against a job. Stored on the Candidate record.
_Avoid_: AI analysis, Resume summary

**AI Questions**:
Hermes-generated interview questions tailored to the candidate and role. Stored on the Candidate record.

**Voice Interview**:
An interview conducted by a Vapi AI voice agent. Produces a transcript that Hermes converts into structured feedback.

**Audit Log**:
A JSON array on the Candidate record tracking every action taken (stage moves, AI generation, decisions). Each entry: `{ action, userId, userName, timestamp, details? }`.

## Relationships

- An **HR** creates one or more **Jobs**
- A **Job** has many **Candidates**
- A **Candidate** has one or more **Interviews**
- An **Interview** is assigned to exactly one **Interviewer**
- An **Interview** has exactly one **Feedback**
- A **Manager** makes the final **Hire** or **Reject** decision on a **Candidate**

## Stage Transitions

```
APPLIED → SCREENING → INTERVIEW → MANAGER_REVIEW → HIRED
                                     ↓
                                  REJECTED
```

A candidate can be Rejected from any active stage (APPLIED, SCREENING, INTERVIEW, MANAGER_REVIEW). Once HIRED or REJECTED, no further transitions are allowed.

## Example dialogue

> **Dev:** "What happens when the Manager wants to talk to the candidate before deciding?"
> **Domain expert:** "The Manager types something like 'Schedule a call with Jane tomorrow at 2pm' — Hermes parses that into a datetime, and we create a Google Calendar event with a Meet link via gog CLI."
> **Dev:** "So the Meet link goes on the Candidate record?"
> **Domain expert:** "Yes. And the audit log captures that the Manager requested a meeting."

## Flagged ambiguities

- "approve" was briefly considered as a Manager action but removed as redundant — "Hire" and "Reject" are the only two final outcomes.
- "AI model" conflates Hermes Agent, Vapi's GPT-4, and Google Gemini from an earlier prototype — resolved: Hermes Agent is the primary AI provider for summaries, questions, and recommendations.
