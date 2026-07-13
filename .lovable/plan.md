## 1. Admin → User Attendance: scope by HB + pay-period date filter

File: `src/routes/_app.admin.user-attendance.tsx`

- Read the current user from `useAuth()`. When their `appRole === "hb"`, restrict the User dropdown and the rows to users whose `headbacker` matches the logged-in HB's name. MB/Software keep the full list. Cyberbacker never reaches this route.
- Add a **Pay period** select next to the User select with options:
  - `1–15 (current month)`
  - `16–end (current month)`
  - `1–15 (previous month)`
  - `16–end (previous month)`
  - `All`
- Filter `rows` by `date` falling inside the chosen half-month window (inclusive). CSV/Export button stays; it exports the filtered rows.
- No changes to mock data shape.

## 2. PTO: credits, dashboard tile, and request modal

### Data model (mock only)

New file `src/mock/pto.ts` exporting:
- `PtoStatus = "eligible" | "ineligible"`
- `PtoRequest { id, userId, days, startDate, endDate, reason, status: "pending"|"approved"|"rejected", files?: EodFile[], createdAt }`
- Seed: current user is `eligible`, a couple of seeded approved/pending requests for realism.

Extend `src/lib/mock-store.ts` (bump key to `cb.store.v3`, keep the safe `{...base, ...parsed}` merge so old payloads don't crash):
- State fields: `ptoStatus`, `ptoRequests`.
- Actions: `addPtoRequest(r)`, `updatePtoRequest(id, patch)`.

### Credit accrual rule (client-side derivation)

Helper `getPtoCredits(user, requests, status)` in `src/lib/pto.ts`:
- If `status !== "eligible"` → `earned = 0`.
- Otherwise `earned = number of completed quarters since Jan 1 of current year` (1 credit per quarter, capped at 4/year; simple `Math.floor((monthsSinceJan)/3) + 1` while eligible).
- `used = sum of days from approved requests in the current year`.
- `pending = sum of days from pending requests`.
- `available = max(0, earned - used - pending)`.

### Dashboard tile + request entry

File: `src/routes/_app.dashboard.tsx`
- Add an **Approved PTO** `MetricCard` in the metric grid showing count of approved requests this year, with hint `X days available`.
- Add a **Request PTO** button in the `PageHeader` actions that opens a new `PtoRequestModal`.

New component `src/components/app/pto-request-modal.tsx`:
- Fields: number of days (1..available, disabled/blocked if `available === 0` with inline "No PTO credits available" message), start date (shadcn datepicker), reason (textarea, required), file upload (proof of client agreement, multi-file, **10MB max per file**, same base64 pattern as EOD).
- Submit calls `store.addPtoRequest({ status: "pending", ... })`. Toast on success.

### Unify file-upload cap to 10MB

Bump the existing EOD attachment cap from 2MB to **10MB** in `src/components/app/eod-report-modal.tsx` (and its inline hint text) so all uploads share the same limit.

## Out of scope
- No admin PTO approval screen this pass (backend not wired). Requests persist in mock store and are visible via dashboard tile counts; approval UI can come next.
- No changes to backend spec doc.

## Technical notes
- Files touched: `src/routes/_app.admin.user-attendance.tsx`, `src/routes/_app.dashboard.tsx`, `src/lib/mock-store.ts`, `src/components/app/eod-report-modal.tsx`.
- Files added: `src/mock/pto.ts`, `src/lib/pto.ts`, `src/components/app/pto-request-modal.tsx`.
- Verification: `tsgo` typecheck + Playwright smoke — login as HB, confirm User Attendance list only shows their CBs and pay-period filter narrows rows; login as Cyberbacker, open dashboard, submit a PTO request, confirm tile updates.
