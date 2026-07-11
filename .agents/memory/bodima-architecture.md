---
name: bodima-architecture
description: Key architecture decisions and gotchas for the bodima.lk full-stack app
---

## Auth Token Wiring
`setAuthTokenGetter(() => token)` must be called in `AuthContext.tsx` inside a `useEffect` on `[token]` change. Without this, the generated API client sends requests without Authorization headers even when the user is logged in. The getter is exported from `@workspace/api-client-react`.

## JWT Secret
`SESSION_SECRET` env var is required. The middleware fails fast at startup if not set (no hardcoded fallback).

## DB Schema Column Naming
`desc` is a PostgreSQL reserved word — must be quoted as `"desc"` in raw SQL inserts. Drizzle handles this automatically via its column mapper. Seed scripts must quote it explicitly.

## DB Package — New Schema Tables
After adding new files under `lib/db/src/schema/`, run `pnpm -w run typecheck:libs` to rebuild the composite TypeScript declarations before the api-server can import them. The db package exports `.ts` source directly; composite build creates `.d.ts` files that api-server references.

**Why:** `@workspace/db` has `composite: true` and `emitDeclarationOnly: true`. Without rebuilding, api-server tsc cannot resolve new table exports even though the source files exist.

## Booking Status Business Logic
- Students: can only set status to `cancelled` on their own bookings
- Owners: can only set status to `confirmed` or `rejected` on bookings for their listings
- Admin: unrestricted

## Access Control Patterns
- `GET /listings/:id` — public but non-approved listings return 404 unless caller is the owner or admin (uses `optionalAuth` middleware)
- `PATCH /messages/conversations/:id/read` — must verify caller is a participant (studentId or ownerId) before updating; otherwise IDOR
- Owner listing CRUD — checks `ownerId === req.user.userId || role === 'admin'`

## Test Credentials (seeded)
- admin@bodima.lk / password (role: admin)
- owner@bodima.lk / password (role: owner)
- student@bodima.lk / password (role: student)
