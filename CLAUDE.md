# FieldFlow: project instructions

Full stack demo for a fictional home-repair company: dispatch board, technician view, job costing, and one AI feature. Read `docs/SCOPE.md` before starting any task.

## Stack

- TypeScript (strict), Next.js App Router, React
- Supabase: Postgres, Auth, Row Level Security
- Claude API for the field-notes feature
- Zod for validation, Vitest for unit tests, Playwright for end-to-end tests
- Deployed on Vercel. CI on GitHub Actions.

## Commands

Update this section once the project is scaffolded.

- `npm run dev`: start the dev server
- `npm run lint`: ESLint
- `npm run typecheck`: `tsc --noEmit`
- `npm run test`: Vitest
- `npm run test:e2e`: Playwright

Before saying a task is done, run lint, typecheck, and tests, and report the result.

## Code rules

- TypeScript strict. No `any`. No `@ts-ignore` without a comment explaining why.
- Validate every external input (forms, API bodies, AI output) with Zod.
- Keep business logic (cost and margin calculations) in plain functions that are easy to unit test.
- Prefer small components and small functions. Use clear names.
- Do not add a new dependency without asking me first and explaining why.

## Database and security

- Every table has Row Level Security enabled. Never disable it to "make something work".
- Roles are `office` and `technician`. Technicians can only see jobs assigned to them.
- Schema changes go through migration files, never manual edits.
- Never put secrets in the repo. Use environment variables. `.env.local` is gitignored.

## AI feature rules

- Call the Claude API only from server code (route handlers or server actions), never from the browser.
- Read the model ID from the `ANTHROPIC_MODEL` environment variable. Check the official docs for the current model ID.
- Ask the model for structured JSON, validate it with Zod, and handle invalid output gracefully.
- A person always reviews AI output before it is saved.
- Add basic rate limiting and a maximum input length.

## Data rules

- All data is fictional. Never use real names, emails, phone numbers, or anything from an employer.

## Workflow

- Plan first: for any non-trivial task, describe the plan and wait for my approval before writing code.
- One feature per branch, small commits, clear commit messages.
- Explain what you changed and why in simple English. I need to understand every line, because I will explain it in a video.
- If a requirement is unclear, ask instead of guessing.
- When you find a bug in code you generated earlier, tell me. I keep a log of these for the README.
