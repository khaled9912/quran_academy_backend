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
