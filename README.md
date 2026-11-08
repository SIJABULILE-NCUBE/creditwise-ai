# CreditWise AI

Helps working South Africans see their finances the way a lender does, so that they apply for credit they can afford. Product details are in `docs/PRD.md`; the build plan is in `IMPLEMENTATION_PLAN.md`.

## What you need

- Node.js 22 LTS and npm
- Docker Desktop, running (the local Supabase needs it)
- Playwright browsers: `npx playwright install chromium webkit`

## Set up

1. `npm install`
2. Copy `.env.example` to `.env` and fill it in. `npx supabase status` prints the local URL and keys. `.env` is never committed.
3. `npx supabase start`
4. `npx supabase db reset`, then `npm run seed`

Then run `npm run dev:api` (port 3001) and `npm run dev` (port 5173) in two terminals, and open http://localhost:5173.

## Commands

| Purpose | Command |
| --- | --- |
| Start the local backend | `npx supabase start` |
| Reset the database and load seed data | `npx supabase db reset` then `npm run seed` |
| Start the API / the app | `npm run dev:api` / `npm run dev` |
| Unit and component tests | `npm test` |
| Database and permission tests | `npx supabase test db` |
| Integration tests | `npm run test:integration` |
| End-to-end tests | `npm run test:e2e` |
| Lint / type check / secret scan | `npm run lint` / `npm run typecheck` / `npm run scan` |
| Full check | `npm run check` (Supabase running and seeded) |
| Build for release | `npm run build` |

## Test accounts (after `npm run seed`)

The password for all of them is your `SEED_TEST_PASSWORD`.

| Email | Use it for |
| --- | --- |
| thando.nkosi@example.com | Amber, 3 open flags, chat and ticks |
| sibusiso.ndlovu@example.com | Red, negative Money left, 1 querying flag |
| ayanda.mthembu@example.com | No debts or transactions: empty states |
| setup.user@example.com | Lands on Set Up |

Emails sent by the local backend appear in the local inbox; `npx supabase status` prints its address.
