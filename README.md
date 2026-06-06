# Quran Academy Backend

This repository contains the backend for the Quran Academy app, built on Node/Express and Supabase.

Prerequisites
- Node 18+
- psql (optional, for direct DB access)
- supabase CLI (optional, recommended for deploying Edge Functions and storage)
- A Supabase project (URL and service role key)

Environment
Create a `.env` file with at least:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_DB_URL=postgres://user:pass@host:port/dbname    # optional for psql scripts
CLIENT_URL=http://localhost:3000
PORT=4000
```

Apply schema

Using psql (recommended if you have a direct DB URL):

```bash
SUPABASE_DB_URL=postgres://... npm run db:seed # or npm run db:apply to apply schema then seed
```

Using supabase CLI (project must be set up):

```bash
supabase db push --schema supabase/schema.sql
```

Seed data

```bash
SUPABASE_DB_URL=postgres://... npm run db:seed
```

Create storage buckets (uses supabase CLI)

```bash
npm run buckets:create
```

Edge Functions

Example edge function template is at `supabase/functions/send_notification`.
Deploy with the supabase CLI:

```bash
supabase functions deploy send_notification --project-ref your-project-ref
```

Run locally

```bash
npm run dev
```

What I added
- `supabase/schema.sql` — normalized schema and RLS policies
- `supabase/seed.sql` — sample data for admin/teacher/student/course
- `scripts/apply_schema.sh`, `scripts/create_buckets.sh`
- `supabase/functions/send_notification` — Edge Function template
- npm scripts: `db:apply`, `db:seed`, `buckets:create`

Next steps (optional):
- Add CI pipeline to deploy schema and functions
- Add automated tests calling endpoints
- Harden RLS policies and test them with service/anon roles
# Quran Academy Backend

This backend project is built as a lightweight Express API layer that uses Supabase for database storage and authentication.

## Why this setup

- Uses Supabase PostgreSQL for schema, storage, and auth.
- Provides a separate backend service that can be deployed on Render, Railway, or Vercel.
- Keeps the frontend (`quran_academy`) and backend separated.

## Project structure

- `src/index.ts` - Express entrypoint
- `src/lib/supabase.ts` - Supabase client setup
- `src/middleware/verifyAuth.ts` - optional auth middleware
- `src/routes` - API endpoints for courses, enrollments, sessions, attendance, contact
- `supabase/schema.sql` - database schema for Supabase

## Setup

1. Copy env vars from your Supabase project into `.env`:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CLIENT_URL=http://localhost:3000
PORT=4000
```

2. Install dependencies:

```bash
cd /Users/khaled/quran_academy_backend
npm install
```

3. Run the backend locally:

```bash
npm run dev
```

## Database setup

Use `supabase/schema.sql` to create the tables in your Supabase database. If you already have a Supabase project, run the SQL in the SQL editor.

## API endpoints

- `GET /api/courses`
- `POST /api/courses` (protected)
- `GET /api/enrollments` (protected)
- `POST /api/enrollments` (protected)
- `GET /api/sessions`
- `POST /api/sessions` (protected)
- `PATCH /api/sessions/:id` (protected)
- `DELETE /api/sessions/:id` (protected)
- `GET /api/attendance` (protected)
- `PATCH /api/attendance/:id` (protected)
- `POST /api/contact`

## Notes

- This backend intentionally keeps auth and persistence separated from the frontend.
- The frontend should send `Authorization: Bearer <access_token>` for protected routes.
- Supabase Auth remains the source of truth for users and roles.
