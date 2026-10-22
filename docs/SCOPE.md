# FieldFlow: Job Dispatch & Costing (Demo)

A small full stack tool for a **fictional** home-repair company. It helps the office assign jobs to technicians and see the real cost and margin of each job.

> This is a portfolio project. All data is fictional. No code, data, or designs come from any employer.

## 1. Goal

Build a working tool end to end in about 7 days, put it in front of real people, and improve it based on what they do (not on what I assume).

## 2. Fictional business

"Northside Repairs" is a small company with an office team and field technicians. Jobs come in by phone, get assigned by the office, and technicians report materials and hours after the visit.

## 3. Users

| Role | What they need |
|------|----------------|
| Office coordinator | See all jobs, assign technicians, change status |
| Technician | See own jobs on a phone, send field notes after a visit |
| Owner | See cost and margin per job |

## 4. Assumptions to validate

These are guesses. I will check them with real testers (see section 9) and change the app if they are wrong.

- Office staff lose time tracking job status in spreadsheets or messages.
- Technicians prefer writing quick free-text notes over filling long forms.
- Owners want margin per job at a glance.

## 5. In scope (MVP)

1. Login with two roles: `office` and `technician` (Supabase Auth + Row Level Security).
2. Dispatch board: create jobs, assign a technician, change status (new, assigned, in progress, done).
3. Technician view, mobile friendly: list of my jobs, job details, send field notes.
4. Cost tracking: materials and hours per job, margin report.
5. **AI feature:** a technician writes free-text field notes; Claude turns them into a structured report (materials, hours, customer summary). A person reviews and confirms before saving.
6. Automated checks: lint, type check, unit tests, one end-to-end test, run in CI.
7. Deployed on Vercel with a public demo account.

## 6. Out of scope

- Payments, invoicing, or QuickBooks integration
- Real customer data of any kind
- Native mobile app
- Complex scheduling (maps, routes, calendars)
- Multi-company support

Optional extra, only if time remains: an n8n flow that posts to Slack when a job is closed.

## 7. Tech stack

TypeScript (strict) · Next.js (App Router) · Supabase (Postgres, Auth, RLS) · Vercel · Claude API · Zod · Vitest · Playwright · GitHub Actions

## 8. Working rules

- AI tools (Claude Code, Cursor) are my default way of working. I read every change before accepting it.
- Secrets live only in server-side environment variables.
- Every AI output is validated (Zod) and reviewed by a human before it is saved.
- I keep a list of real mistakes found in AI-generated code and how I fixed them (goes in the README).

## 9. User testing log

Fill this in with real sessions. Do not invent entries.

| Date | Tester (role or relation) | What they tried | Where they got stuck | What I changed |
|------|---------------------------|-----------------|----------------------|----------------|
|      |                           |                 |                      |                |

## 10. Plan (7 days)

| Day | Focus |
|-----|-------|
| 1 | Repo, Next.js + TypeScript, Supabase project, first Vercel deploy, CLAUDE.md |
| 2 | Database schema, auth, roles, RLS, seed data |
| 3-4 | Dispatch board, technician view, cost tracking and margin report |
| 5 | AI feature: field notes to structured report |
| 6 | Tests, CI, user testing sessions, fixes |
| 7 | README, Loom video, final polish |

## 11. Definition of done

- A stranger can open the demo URL, log in with the demo account, and complete the main flow without help.
- CI is green (lint, types, tests).
- README explains what it does, the stack, my decisions, how I used AI tools, and what I changed after user testing.
- A 2 to 3 minute Loom video shows the app and explains one technical decision.
