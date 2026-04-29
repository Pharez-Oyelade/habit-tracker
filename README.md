# Habit Tracker PWA

A mobile-first Progressive Web App for building and tracking daily habits.
Built with Next.js App Router, TypeScript, Tailwind CSS, and localStorage
persistence. Designed to feel like a real product while remaining fully
front-end with no remote database or external authentication service.

---

## Project Overview

Habit Tracker lets a user:

- Sign up with an email and password
- Log in and log out
- Create, edit, and delete habits
- Mark a habit complete or incomplete for today
- View a live streak counter per habit
- Reload the app and retain all saved state
- Install the app to their home screen as a PWA
- Load the cached app shell when offline

This project is Stage 3 of a structured frontend curriculum. The focus is
technical discipline, deterministic behavior, and testability. All state is
local, no server, no database, no external auth.

---

## Setup Instructions

### Requirements

- Node.js 18 or later
- npm 9 or later

### Install

```bash
git clone https://github.com/your-username/habit-tracker.git
cd habit-tracker
npm install
```

### Icons

The PWA manifest references two icon files that must be present:

- `public/icon-192.png` (192×192)
- `public/icon-512.png` (512×512)

Create these before building or running the project in PWA mode.

Place your own PNG icons at these paths before running a production build.
Placeholder icons are sufficient for development.

---

## Run Instructions

### Development server

```bash
npm run dev
```

Opens at [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm run start
```

The production build is required for E2E tests and for service worker
functionality. The service worker is only active in production mode.

---

## Test Instructions

### Run all tests

```bash
npm test
```

This runs unit tests with coverage, integration tests, and E2E tests in sequence.

### Unit tests only (with coverage report)

```bash
npm run test:unit
```

Runs Vitest in `run` mode with `@vitest/coverage-v8`. Coverage is reported
for all files inside `src/lib`. Minimum threshold is 80% line coverage.

### Integration tests only

```bash
npm run test:integration
```

Runs Vitest component and integration tests using React Testing Library
and JSDOM. No browser is required.

### End-to-end tests only

```bash
npm run test:e2e
```

Runs Playwright against a production build on `localhost:3000`. Ensure
`npm run build` has been run before executing E2E tests, or set
`reuseExistingServer: false` in `playwright.config.ts` to let Playwright
build automatically.

### Individual test file

```bash
# Unit
npx vitest run tests/unit/slug.test.ts

# Integration
npx vitest run tests/integration/auth-flow.test.tsx

# E2E
npx playwright test tests/e2e/app.spec.ts
```

---

## Local Persistence Structure

All application state is stored in the browser's `localStorage` under
three keys. No data ever leaves the device.

### `habit-tracker-users`

Stores a JSON array of all registered users.

```json
[
  {
    "id": "uuid-string",
    "email": "user@example.com",
    "password": "plaintext-password",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

**Notes:**
- `id` is generated with `crypto.randomUUID()` at signup
- Passwords are stored in plain text. This is intentional for this
  local-only stage.
- Email is normalised to lowercase before storage
- Multiple users can register on the same device

### `habit-tracker-session`

Stores the active session or `null` when logged out.

```json
{
  "userId": "uuid-string",
  "email": "user@example.com"
}
```

**Notes:**
- Set to `null` on logout, not removed entirely, to maintain a consistent
  parse contract
- Read on app boot to determine whether to redirect to `/dashboard` or `/login`
- `AuthContext` reads this once on mount via a client-side `useEffect`

### `habit-tracker-habits`

Stores a JSON array of all habits across all users on the device.

```json
[
  {
    "id": "uuid-string",
    "userId": "uuid-string",
    "name": "Drink Water",
    "description": "8 glasses a day",
    "frequency": "daily",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "completions": ["2025-01-10", "2025-01-11"]
  }
]
```

**Notes:**
- All users' habits coexist in one array, isolated by `userId`
- `HabitsContext` always filters by `session.userId` before exposing
  habits to the UI. Users never see each other's data
- `completions` holds unique ISO calendar dates in `YYYY-MM-DD` format
- When the current user's habits are updated, the context reads the full
  array, replaces only the current user's entries, and writes back the
  merged array — preserving other users' habits untouched
- Only `daily` frequency is supported in this stage

---

## PWA Implementation

### Manifest — `public/manifest.json`

Declares the app's identity for the browser install prompt. Includes
`name`, `short_name`, `start_url`, `display: standalone`, `theme_color`,
`background_color`, and icons at 192px and 512px.

Linked in `src/app/layout.tsx` via Next.js metadata:

```ts
export const metadata = {
  manifest: '/manifest.json',
};
```

### Service Worker — `public/sw.js`

Implements a **cache-first** strategy for the app shell:

- **Install event** — caches `/`, `/login`, `/signup`, and `/dashboard`
- **Activate event** — deletes outdated caches from previous versions
- **Fetch event** — returns cached response if available, otherwise
  fetches from network

This means after the app has been loaded once, all four routes render
from cache when the device is offline, satisfying the offline E2E test.

### Registration — `ServiceWorkerRegistrar`

A `'use client'` component rendered inside the root layout that runs
`navigator.serviceWorker.register('/sw.js')` inside a `useEffect`.
This pattern is required because `layout.tsx` is a Server Component
by default and cannot call browser APIs directly.

### Install prompt

Once the service worker is active and the manifest is valid, browsers
will show a native install prompt. No additional JavaScript is needed to
trigger this — the browser handles it automatically when the PWA
criteria are met.

---

## Trade-offs and Limitations

### Plain-text passwords

Passwords are stored in plain text in localStorage. This is a deliberate
simplification for this local-only, front-end stage. In a real system,
passwords would be hashed server-side (bcrypt, argon2) and never stored
in the client.

### No server or database

All data lives in the browser's localStorage. This means:
- Data does not sync across devices or browsers
- Clearing browser data or using incognito mode deletes all habits
- Multiple users on the same device share the same storage, but their
  habits are isolated by `userId`

### Single frequency type

Only `daily` frequency is implemented. The `frequency` field exists in
the data shape and UI to support future expansion, but the select is
currently locked to `daily`.

### Offline writes not supported

The service worker only caches the app shell for offline reading. If a
user creates or edits habits while offline, those writes are made to
localStorage (which works offline) but the UI may behave unexpectedly
if network-dependent resources fail to load. Full offline write support
would require a more sophisticated sync strategy.

### Service worker in development

Next.js does not serve `public/sw.js` through its dev middleware in a
way that makes it activatable. The offline E2E test therefore runs
against the production build (`npm run build && npm run start`).

### No token expiry

The session stored in localStorage has no expiry time. A user remains
logged in indefinitely until they explicitly click logout. A production
system would use short-lived JWT tokens or server-managed sessions.

---

## Test File Map

The table below maps each required test file to the behaviour it verifies,
as required by section 16.4 of the Technical Requirements Document.

| Test File | Type | Behaviour Verified |
|---|---|---|
| `tests/unit/slug.test.ts` | Unit | `getHabitSlug` converts habit names to lowercase hyphenated slugs, trims spaces, collapses repeated spaces, and removes non-alphanumeric characters |
| `tests/unit/validators.test.ts` | Unit | `validateHabitName` rejects empty names, rejects names over 60 characters, and returns a trimmed value for valid input with the correct error messages |
| `tests/unit/streaks.test.ts` | Unit | `calculateCurrentStreak` returns 0 for empty completions, returns 0 when today is not completed, counts consecutive days backwards correctly, ignores duplicate dates, and breaks the streak when a calendar day is missing |
| `tests/unit/habits.test.ts` | Unit | `toggleHabitCompletion` adds a date when absent, removes a date when present, never mutates the original habit object, and never returns duplicate completion dates |
| `tests/integration/auth-flow.test.tsx` | Integration | Signup creates a user and session in localStorage, duplicate email signup shows the correct error, login stores a session for a valid user, and invalid credentials show the correct error without creating a session |
| `tests/integration/habit-form.test.tsx` | Integration | Empty habit name shows a validation error, creating a habit renders it as a card with the correct slug-based testid, editing a habit updates name while preserving id/userId/createdAt/completions, deleting requires explicit confirmation before removing, and toggling completion updates the streak display immediately |
| `tests/e2e/app.spec.ts` | E2E (Playwright) | Full user journey including: splash screen visibility and redirect, authenticated redirect from `/`, unauthenticated access block on `/dashboard`, signup flow, login with per-user habit isolation, habit creation from dashboard, completion toggle with streak update, session and habit persistence after reload, logout and redirect, and offline app shell rendering after first load |
