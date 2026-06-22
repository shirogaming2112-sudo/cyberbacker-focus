## Goal

Restructure navigation around a mock login with 4 roles, add the missing CRUD modals and Token Management, and pass an a11y + responsive sweep across the app.

## 1. Auth + Roles (mock)

- Roles: `cyberbacker | hb | mb | software` with labels **Cyberbacker, HB, MB, Software**.
- `src/lib/auth.tsx` — `AuthProvider` + `useAuth()` storing `{ role, user }` in `localStorage` (key `cb.role`). Default after login = Cyberbacker.
- `/login` (existing): replace Google button with a **role picker** (4 cards) + single **Login** button → navigates to `/dashboard`. Google block kept as disabled "Coming soon".
- `_app` route: `beforeLoad` redirects to `/login` if no role in storage.
- Header gets a small **Role switcher** dropdown (dev convenience) so you can preview each role without logging out.
- Permission matrix (used by sidebar + page guards + buttons):

  | Capability | CB | HB | MB | SW |
  |---|---|---|---|---|
  | Workspace nav | ✓ | ✓ | ✓ | ✓ |
  | Admin nav | — | ✓ | ✓ | ✓ |
  | Admin → Attendance Summary | — | — | ✓ | ✓ |
  | Users: Impersonate | — | — | — | ✓ |
  | Users: Reset password | — | — | — | ✓ |
  | Users: Edit (incl. Headbacker) | — | ✓ | ✓ | ✓ |
  | EOD Approve/Disapprove | — | ✓ | ✓ | ✓ |
  | Schedule Approvals | — | ✓ | ✓ | ✓ |

## 2. Navigation cleanup

- **Remove routes/files**: `_app.performance.tsx`, `_app.clients.tsx`. Drop from sidebar.
- **Add**: `_app.tokens.tsx` (Token Management), `_app.admin.eod-reports.tsx` (admin EOD review).
- Sidebar groups filtered by role via the matrix above.

## 3. Dashboard

- Remove **Announcements** and **Today's Schedule** cards.
- Reflow grid: Clock-in widget (8 cols) + Quick Stats (4 cols), Recent Activity full-width, Performance Summary card stays (it's a small KPI strip, not the removed Performance page — confirm by reusing existing metrics).

## 4. Schedule Requests (editable)

- Add `+ New Request` button (top-right) and row-level **Edit** action.
- Shared multi-step `ScheduleRequestModal` (Details → Days → Review). Edit pre-fills from row; Save creates a new `pending` request and marks any prior active as "to-be-superseded" on approval (mock only — just append to `schedules` array and toast).
- Remove the in-app schedule editor on `_app.schedules.tsx` calendar page — that page becomes read-only with a "Request a change" button that opens the same modal.

## 5. EOD Reports

- Employee `_app.eod-reports.tsx`: add `+ New Report` button → `EodReportModal` (client, date, summary, highlights[], blockers[], attachments count). Appends to mock store via a tiny zustand-free `useMockStore` (in-memory + localStorage).
- Admin `_app.admin.eod-reports.tsx` (new): DataTable of all reports w/ status, filter by user/client/status. Row → side `Sheet` showing full report + **Approve** / **Disapprove** buttons + optional comment textarea. Updates status + comment in mock store.

## 6. Users Management

- **Headbacker cell**: button shows current HB → opens `HeadbackerPickerDialog` with searchable `Command` list of users where role = HB. Selecting updates row.
- Hide **Impersonate** + **Reset Password** buttons unless role = Software.
- HB/MB still see **Update** (edit name/title/status/headbacker).

## 7. Token Management (`/tokens`)

- Card list of tokens the user owns; `+ Create Token` modal (name only, slugified).
- Each token card shows:
  - Generated URL `https://apply.cyberbackercareers.com/?ref={slug}` with copy button.
  - **View Referrals** button → opens `Sheet` with DataTable: Referral Name, Stage (badge), Created At; plus a **Total** count chip.
- Data: `src/mock/tokens.ts` with 3 sample tokens + 8 sample referrals. A thin `fetchReferrals(token)` function with TODO comment to swap for GHL endpoint later.

## 8. Accessibility pass

- **Sidebar**: ensure all icon-only triggers have `aria-label`; active item gets `aria-current="page"`; mobile uses shadcn `Sheet` (already wired by `SidebarProvider`) — verify trigger visible at <md.
- **DataTable**: add `<caption className="sr-only">`, `scope="col"` on headers, row focus ring, `aria-sort` on sortable cols, and a true card-list fallback below `md` (currently table just scrolls).
- **Dialogs/Sheets**: every shadcn `Dialog` gets `DialogTitle` + `DialogDescription` (some are missing). Close buttons get `aria-label="Close"`.
- **Notifications**: bell button `aria-label`, popover items as `<button>` with focus ring, unread dot announced via `<span className="sr-only">unread</span>`.
- **Color contrast**: audit `text-muted-foreground` on `bg-muted/30` (fails AA in light mode at small sizes) — bump foreground token slightly or switch to `text-foreground/70` on small text.
- **Focus visible**: add global `:focus-visible` outline in `styles.css` for keyboard users.

## 9. Responsive sweep

- Verify at 360 / 768 / 1024:
  - Sidebar collapses to Sheet drawer with visible hamburger in `TopHeader`.
  - All `DataTable`s switch to stacked card list <md.
  - `PageHeader` actions wrap below title <sm (grid pattern from `responsive-layout-patterns`).
  - Dashboard grid collapses to single column <md; ClockWidget keeps min-height.
- Playwright script captures screenshots at 3 widths × key pages → saved to `/tmp/browser/screens/` and summarized in chat.

## 10. UX review report

After build, run Playwright across every route logged in as each role; produce a markdown report (in chat) listing issues found with screenshot refs + repro steps. No code changes from this report unless they're trivial (we'll triage together).

## Technical notes

- New files:
  - `src/lib/auth.tsx`, `src/lib/permissions.ts`, `src/lib/mock-store.ts`
  - `src/components/app/schedule-request-modal.tsx`
  - `src/components/app/eod-report-modal.tsx`
  - `src/components/app/eod-review-sheet.tsx`
  - `src/components/app/headbacker-picker-dialog.tsx`
  - `src/components/app/role-switcher.tsx`
  - `src/routes/_app.tokens.tsx`
  - `src/routes/_app.admin.eod-reports.tsx`
  - `src/mock/tokens.ts`
- Deleted: `_app.performance.tsx`, `_app.clients.tsx` (+ sidebar entries).
- Mock writes go through `mock-store.ts` (in-memory + `localStorage` persistence, no backend) — designed to be swapped for `createServerFn` later.
- Hydration warning on dashboard greeting (`Good morning/afternoon`): switch greeting to a `useEffect`-set state so SSR renders a stable string.

## Out of scope

- Real Google OAuth, real GHL fetch, server functions, DB migrations.
