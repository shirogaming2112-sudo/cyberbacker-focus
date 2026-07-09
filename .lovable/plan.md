## Goals

1. Make the login page logo look professional — smaller, left-aligned, with proper padding — instead of stretched to the top corner of the navy panel.
2. Diagnose and fix the error thrown when opening the Dashboard.

## 1. Login page — logo & panel layout

`src/routes/login.tsx` currently uses `lg:justify-between` on the navy panel with three direct children (logo, hero copy, copyright). That's what makes the logo "stretched apart" — it's pinned to the very top corner while the hero is far below it.

Change the left panel structure to a proper padded frame:

- Wrap the panel content in a column with fixed top / middle / bottom regions, but pad the logo away from the edge instead of pinning it there.
- Reduce the logo size from `h-10` to `h-8` and left-align it inside a padded header row (`px-2 py-1`) so it reads as a brand mark, not a hero image.
- Increase panel padding from `lg:p-10` to `lg:p-12` and give the logo row its own `mb-auto` spacer so vertical rhythm stays balanced without the "stretched" gap.
- Keep the hero copy vertically centered and the copyright pinned to the bottom.
- Apply the same "smaller, left-aligned, padded" treatment to the mobile logo (`h-8`, `justify-start`, subtle left padding) so it matches the desktop feel.

No color, copy, or role-picker changes.

## 2. Dashboard error

The user reports "Error message shown" when opening `/dashboard`. Console logs and dev-server logs are clean, so the error is surfacing through the route's `errorComponent`. I need to reproduce it before editing.

Steps:

1. Drive Playwright against `http://localhost:8080/login`, click **Login as Cyberbacker**, wait for `/dashboard`, capture the rendered error text and any `pageerror` events, and screenshot the page.
2. Based on the captured error, fix the offending code. The most likely suspects, in order:
   - `ClockWidget` reads `schedules` from `useStore` and initializes `scheduleId` from `schedules[0]?.id` at render time — safe, but the select can end up with an empty string value which some shadcn `Select` versions reject. If that's the throw, guard the `<Select>` so it only renders when `schedules.length > 0` and show an inline "No active schedule — request one" hint otherwise.
   - `_app.dashboard.tsx` derives `activeSchedule` from mock `schedules` and `client` from mock `clients`; both are optional-chained already, so unlikely to throw. If the error is here, add defensive fallbacks.
   - Any stale `localStorage` value from an older store shape (`cb.store.v1`) surviving the `v2` migration. If the thrown error is a `TypeError` on `state.tokens`/`state.referrals`, harden `load()` in `src/lib/mock-store.ts` to wrap `JSON.parse` in a try/catch that discards non-object payloads and always merges over `base` (already the case, but confirm no missing keys).
3. Re-run the Playwright repro after the fix, confirm `/dashboard` renders with no `pageerror`, and screenshot the final state.

## Out of scope

No changes to routes, permissions, mock data shape, admin surfaces, or backend spec. UI-only.

## Technical notes

- Files touched: `src/routes/login.tsx`, and one of `src/components/app/clock-widget.tsx` / `src/routes/_app.dashboard.tsx` / `src/lib/mock-store.ts` depending on what the repro shows.
- Verification: `tsgo` typecheck + Playwright smoke (login → dashboard, screenshot, assert no page errors).
