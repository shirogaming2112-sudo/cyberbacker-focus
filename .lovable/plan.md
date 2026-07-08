## Scope

Multiple UX and permission refinements across workspace and admin. All changes stay in frontend/mock-store code (no backend wiring).

---

## 1. Clock-in schedule selector

**File:** `src/components/app/clock-widget.tsx`

- Before clocking in, show a `Select` listing the user's active schedules (from `mock/data`).
- Persist chosen `scheduleId` on the attendance record in mock store.
- Disable Clock-in until a schedule is selected.

## 2. EOD report enhancements

**File:** `src/components/app/eod-report-modal.tsx`

- Add a **Schedule** `Select` next to Client/Date.
- Add a **File upload** field (multi-file, stored as `{name,size,dataUrl}` array in mock store — base64 in localStorage; cap ~2MB/file to avoid quota issues).
- Extend `EodReport` type in `src/mock/types.ts` with `scheduleId?: string` and `files?: {name,size,dataUrl}[]`.
- User-side viewer (`_app.eod-reports.tsx`) lists attached files with a download link.

## 3. Admin EOD — download attachments as PDF

**File:** `src/components/app/eod-review-sheet.tsx`

- List uploaded files with individual download buttons (native download of the stored dataUrl).
- Add an "Export report as PDF" button that renders the report (summary/highlights/blockers/attachment list) to a PDF via `jspdf` (already lightweight) — image attachments embedded, non-image attachments listed by name.

## 4. Attendance Summary page

**File:** `src/routes/_app.admin.attendance-summary.tsx`

- Add a **date-range picker** (two date inputs) filtering the rows.
- Make **Checked** column a toggle (Switch) that updates mock-store state.
- Add a **Notes** column with inline editable text (popover with Textarea, saved to store).
- Wire the **Export CSV** button to actually download the filtered rows (incl. notes + checked).
- Extend `AttendanceSummary` type with `notes?: string`; add store actions `setChecked` / `setNote`.

## 5. Schedule Approvals — notes + bulk actions

**File:** `src/routes/_app.admin.schedule-approvals.tsx`

- Add a leading **checkbox** column with a header select-all.
- Add a **Notes** column (popover Textarea, saved to store).
- Header actions: **Bulk Approve** and **Bulk Disapprove** operating on selected pending rows.
- Extend `ScheduleApproval` type with `notes?: string`; add store actions.

## 6. User Management — role-scoped visibility

**File:** `src/routes/_app.admin.users.tsx`

- Filter the users list based on current auth role:
  - `software` → all users
  - `mb` → users with role `hb`, `mb`, `cyberbacker`
  - `hb` → users with role `cyberbacker` only
  - `cyberbacker` → no access (already gated by admin layout)
- Uses `useAuth().role` and each user's role from mock data.

## 7. Settings — remove Security tab

**File:** `src/routes/_app.settings.tsx`

- Delete the Security tab trigger + content; keep remaining tabs.

## 8. Attendance History — date range + time search

**File:** `src/routes/_app.time-history.tsx`

- Add two date inputs (from / to) and a time search input (matches clock-in/clock-out time string).
- Filter rows client-side using existing mock data.

## 9. Change Logs — hide from HB

**Files:** `src/components/layout/app-sidebar.tsx`, `src/routes/_app.admin.change-logs.tsx`

- Hide the sidebar link when role is `hb`.
- Add a guard in the route component redirecting `hb` to `/admin`.
- Extend `src/lib/permissions.ts` with `can.viewChangeLogs = (r) => r !== "cyberbacker" && r !== "hb"`.

10. add the images to the assets folder so that it can be accessed even if online

---

## Technical notes

- New dep: `jspdf` (~50KB gz) via `bun add jspdf` for PDF export.
- File uploads persist as base64 dataURLs in the existing `cb.store.v1` localStorage entry — acceptable for mock demo; noted that this is not production-safe.
- All new store fields are optional so existing seed data keeps working.
- No route topology changes; no backend changes.

## Out of scope

- Wiring uploads/notes/toggles to a real API.
- Server-side PDF generation.
- Google Drive or S3 for attachments.