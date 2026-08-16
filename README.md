# NutriKader — Offline-First CRUD Vertical Slice

NutriKader is a Next.js 16 + React 19 dashboard. This version evolves the **Balita** entity from local mock data into a complete offline-first CRUD vertical slice.

## Architecture

- **PostgreSQL on Supabase** is the server source of truth.
- **Next.js Route Handlers** expose authenticated CRUD and batch sync APIs.
- **IndexedDB** stores the Balita cache, pending `sync_queue`, conflict records, and the device's offline login verifier.
- **Service Worker** caches the application shell/static assets only. It is **not** the database.
- **Zustand** stores UI/session state in memory; Balita records are not stored in `localStorage`.
- Offline mutations are queued and batch-synced to `POST /api/sync` when connectivity returns.
- Every Balita row has a monotonic `version`. Updates/deletes require the expected version.
- Conflicts are returned as HTTP 409 / sync conflicts and require an explicit **Use Server** or **Use Local** choice.
- Server authorization checks the authenticated session role; the UI sidebar is not the security boundary.

## Important scope decision

The supplied chat context did not include a separate architecture document file; only the project archive was available. The implementation therefore follows the architecture requirements explicitly stated in the task/ringkasan: **Supabase PostgreSQL, IndexedDB, service-worker app-shell caching, batch `/api/sync`, version-based optimistic concurrency, and server-side role authorization**.

The vertical slice is intentionally limited to **Balita**. Other dashboard entities still use the existing `src/lib/mock-data.ts`.

`mock-data.ts` is retained and is used by `scripts/seed-balita.ts` to seed the initial Balita dataset into PostgreSQL.

## Prerequisites

- Node.js 20.9+ (prefer an LTS release such as Node 22)
- npm
- A Supabase project
- Supabase SQL Editor access for the migration

## Environment

Copy `.env.example` to `.env.local`:

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY

SESSION_COOKIE_NAME=nutrikader_session
SESSION_TTL_DAYS=7

DEMO_ADMIN_EMAIL=admin@nutrikader.id
DEMO_ADMIN_PASSWORD=admin123
DEMO_WARGA_EMAIL=warga@nutrikader.id
DEMO_WARGA_PASSWORD=warga123
```

**Never expose `SUPABASE_SERVICE_ROLE_KEY` as a `NEXT_PUBLIC_*` variable.** It is server-only.

## Database migration

1. Create/open a Supabase project.
2. Open **SQL Editor**.
3. Run:

```text
supabase/migrations/001_balita_vertical_slice.sql
```

The migration creates:

- `users`
- `sessions`
- `balita`
- `verify_user_password()`
- `seed_user()`

Password hashes are generated server-side in PostgreSQL with `crypt()`; plaintext passwords are not stored in the `users` table.

## Seed mock data

After setting `.env.local`:

```bash
npm install
npm run db:seed
```

The seed script imports `balitaData` and `posyanduData` from `src/lib/mock-data.ts`, validates its Posyandu references, creates/updates the demo users, and upserts the 12 mock Balita records.

## Run locally

```bash
npm install
npm run lint
npx tsc --noEmit
npm run test
npm run build
npm run dev
```

Open `http://localhost:3000`.

### Online login

The browser sends credentials to `POST /api/auth`.

Successful login:

1. PostgreSQL verifies the password hash.
2. The server creates a random session token.
3. Only a SHA-256 hash of that token is stored in `sessions`.
4. The raw token is returned only as an **HttpOnly, SameSite cookie**.
5. The browser caches a password-derived verifier in IndexedDB for later offline unlock.

The browser never receives the server password hash.

### Offline login limitation

For security, the client no longer ships plaintext demo passwords in JavaScript. Offline login requires **one successful online login on that device first**, which creates the local verifier.

This is intentional: first-ever offline authentication cannot be securely bootstrapped from a server-only password without some trusted credential having already reached the device.

## Balita CRUD

### Online

```text
GET    /api/balita
GET    /api/balita/:id
POST   /api/balita
PUT    /api/balita/:id
DELETE /api/balita/:id?version=N
```

Only `admin` can mutate/read the Balita API in this vertical slice because the existing UI defines Data Balita as an admin-only section.

### Offline

Create/update/delete operations are written to IndexedDB first when the network is unavailable.

Pending operations are stored in:

```text
sync_queue
```

The application sync engine:

- runs when the browser returns online,
- also checks every 30 seconds,
- sends at most 50 operations per batch,
- updates the local cache after successful server application,
- materializes conflicts instead of overwriting them.

## Conflict handling

Example:

```text
Server: Balita B001 version 8
Local:  Balita B001 version 7
             |
             | offline update
             v
        sync to server
             |
             v
           409
             |
      ┌──────┴──────┐
      │             │
Use Server      Use Local
      │             │
local ← server   PUT using
version 8        server version 8
```

The UI does not silently choose a winner.

## Deployment to Vercel

1. Push the project to Git.
2. Import it into Vercel as a Next.js application.
3. Add these Vercel Environment Variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
SESSION_COOKIE_NAME
SESSION_TTL_DAYS
DEMO_ADMIN_EMAIL
DEMO_ADMIN_PASSWORD
DEMO_WARGA_EMAIL
DEMO_WARGA_PASSWORD
```

4. Run the Supabase migration before using the application.
5. Run the seed script from a trusted development environment if demo data is required.
6. Deploy with the normal Next.js build command.

No `DATABASE_URL` is required because the application talks to Supabase through its server-side REST API.

## Security notes

This is still a prototype/application MVP, not a complete medical-record compliance implementation.

For production data:

- use strong non-demo passwords,
- rotate the Supabase service-role key if it is ever exposed,
- keep the service-role key server-only,
- add rate limiting and audit logs,
- add appropriate data retention/access controls,
- review Indonesian personal-data/privacy requirements,
- consider field-level access rules for sensitive child/guardian information.

The application currently uses the server-side session + role boundary for Balita. Client-side route visibility is only a UX layer.

## Verification checklist

### Verified from source / implementation

- [x] Balita database schema with `version`, `updated_at`, `updated_by`.
- [x] PostgreSQL password hashing function.
- [x] HttpOnly session cookie implementation.
- [x] Server-side admin authorization on Balita CRUD/sync.
- [x] CRUD API routes.
- [x] Optimistic-concurrency checks on update/delete.
- [x] IndexedDB stores for Balita, sync queue, conflicts, and offline auth verifier.
- [x] Batch `/api/sync`.
- [x] Explicit server/local conflict choice.
- [x] Mock data retained and used by the seed script.
- [x] Unit tests for sync queue coalescing and conflict policy are included.
- [x] Integration-style sync-result test is included.

### Not verified in this artifact-building environment

- [ ] Real Supabase PostgreSQL connection.
- [ ] Actual migration execution against Supabase.
- [ ] Actual seed execution against Supabase.
- [ ] `npm install` for this modified dependency set.
- [ ] `npm run lint`.
- [ ] `npx tsc --noEmit`.
- [ ] `npm test`.
- [ ] `npm run build`.
- [ ] Browser CRUD against a real PostgreSQL database.
- [ ] Browser IndexedDB behavior.
- [ ] Real service-worker registration.
- [ ] DevTools network-offline simulation.
- [ ] Reconnect/batch-sync behavior in a real browser.
- [ ] Real concurrent-user conflict scenario.

Do not interpret the unchecked items as passing. They require execution in a real Node/browser/Supabase environment.
