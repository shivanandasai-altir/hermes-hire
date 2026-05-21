# ADR-0001: Merge AIInsight and AuditLog into the Candidate model

Instead of three separate tables (`AIInsight`, `AuditLog`, `Candidate`), AI data is stored as nullable columns on `Candidate` and audit history as a `Json` field on `Candidate`.

**Context:** A 3-hour hackathon MVP with 5 core models. Every extra model adds setup cost (Prisma schema, migration, query patterns, API routes, admin UI). The AIInsight table would store one row per candidate per type (summary, questions, recommendation) — effectively a 1:1 relationship since the MVP only keeps the latest version. The AuditLog table would have many rows per candidate but is only read as a list on the candidate detail page — a JSON array inside the candidate row is simpler and faster for this read pattern.

**Trade-off:** Lost ability to query "all audit logs across candidates" with SQL (e.g., "how many times was reject triggered last week"). Won matter post-MVP but not for the hackathon. The JSON field approach is easy to migrate out of later (read JSON → write to separate table → drop column).
