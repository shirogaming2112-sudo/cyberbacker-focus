## 1. Admin → User Attendance: bulk actions, per-row approve, overtime edit, change logs

File: `src/routes/_app.admin.user-attendance.tsx` and `src/mock/types.ts`, `src/lib/mock-store.ts`, `src/mock/data.ts`.

- Extend `AttendanceRecord` with `approvalStatus: "pending" | "approved" | "disapproved"` and `notes?: string`. Seed some rows as `pending`.
- Add per-row checkbox column plus "Select all pending" and **Bulk Approve / Bulk Disapprove** buttons in `PageHeader` actions, matching the pattern already used on Schedule Approvals.
- Add per-row **Approve** / **Disapprove** buttons (disabled once decided) and a **Notes** popover (same style as `NotesCell` on Schedule Approvals).
- Show an **Overtime** column (`overtimeHours` from the record) with a badge when > 0 and make it editable via a small popover (number input, 0–8h).
- Make the **Status** column editable via a Select (`present / late / absent / leave / pending`).
- Every edit (status, overtime, approval, notes) writes a `ChangeLog` row via a new `store.logAttendanceChange(record, field, from, to, updatedByName)` action. Existing `/admin/change-logs` page already renders `ChangeLog[]` — extend the store's `changeLogs` slice (currently seeded from `src/mock/data.ts`) so admin edits appear at the top with original → edited value and the current user's name (from `useAuth()`).
- Bulk actions also emit one change-log row per affected record.

## 2. Admin → User Schedules: working Edit + inline Approve/Disapprove

File: `src/routes/_app.admin.user-schedules.tsx`.

- Replace the placeholder Edit button with an `EditScheduleSheet` (new component under `src/components/app/`) reusing the day-grid pattern from `ScheduleRequestModal`. On save it calls `store.updateSchedule(id, patch)` and logs the change to change logs.
- Add inline **Approve** / **Disapprove** buttons in the Actions column that flip `status` between `active` and `rejected`, disabled once decided, and emit change-log rows.
- No new routes.

## 3. Admin → PTO Management (new page)

New route: `src/routes/_app.admin.pto.tsx`, plus sidebar entry in `src/components/layout/app-sidebar.tsx` (admin section, gated to HB/MB/Software, HB scoped to their CBs like User Attendance).

- Table: one row per user (scoped by role) with columns User · Status (`eligible/ineligible`, editable via Select for MB/Software) · Earned · Used · Pending · Available · Pending Requests count · Actions.
- Uses `getPtoCredits` from `src/lib/pto.ts` per user (extend it to accept any user id).
- Click a row → side sheet lists that user's `PtoRequest`s with per-request **Approve** / **Disapprove** buttons wired to `store.updatePtoRequest`. Approvals reduce Available automatically because `getPtoCredits` sums approved days.
- **Export CSV** button downloads the list (user, status, earned, used, pending, available, request counts).
- **Import** button opens a file picker that accepts `.csv` / `.xlsx` and, for now, stores the selected filename + a toast "Sent to backend (mock)" — the real POST target will be documented in the endpoint PDF (see §6). No parsing.

## 4. EOD Review: show Azure-hosted files

Files: `src/mock/types.ts`, `src/mock/data.ts`, `src/components/app/eod-review-sheet.tsx`, `src/components/app/eod-report-modal.tsx`.

- Extend `EodFile` with optional `url?: string` (Azure blob URL) so backend-returned files can be represented as `{ name, size, type, url }` without a `dataUrl`. Locally uploaded files keep `dataUrl`.
- In `EodReviewSheet` attachments list, if the file has `url`, the Download button opens the Azure link in a new tab; images with a `url` render an `<img>` preview inline; JSON/text files render a "View" link.
- Seed one existing EOD with a couple of Azure-style URL files so the review UI can be verified end-to-end offline.
- PDF export continues to work: for `url`-only files it lists the URL under Attachments instead of embedding.

## 5. Assets: real PNGs for offline testing

Files: `src/assets/*.asset.json` (3 files), any importers.

- Download the three CDN-hosted logos (`cyberbacker-full.png`, `cyberbacker-mark.png`, `cyberbacker-white.png`) from their `.asset.json` URLs into `src/assets/` as real PNG files.
- Keep the `.asset.json` pointers **and** the PNGs so production still uses CDN; update the small number of import sites (login page, sidebar, top header) to import the `.png` directly so the images render when the CDN is unreachable (offline testing).
- No behaviour change online.

## 6. Backend endpoint PDF

- Generate `/mnt/documents/cyberbacker-backend-endpoints.pdf` using ReportLab (Platypus, DejaVu Sans registered for accents, US Letter, TOC-style headings).
- Structure: Intro → Auth (Google SSO + session) → Users & Roles → Clients → Schedules & Schedule Approvals → Attendance (incl. bulk approve, overtime edits, change logs) → EOD Reports (multipart upload → Azure Blob, list, review, PDF export) → PTO (list, credits, request, approve, import/export) → Tokens & Referrals (GHL webhook) → Change Logs → Notifications.
- Each endpoint entry: method + path, purpose, role permissions, request payload shape (JSON example matching current mock shapes in `src/mock/types.ts`), response payload, and error cases.
- Include a short "DB tables touched" note per endpoint referencing the schema in `docs/backend-spec.md`.
- Emit a `<presentation-artifact>` link when done.
- QA pass: convert every page to JPEG at 150 DPI, inspect for overflow / clipped tables / font-box glyphs; iterate until clean.

## Technical notes

Files touched: `src/routes/_app.admin.user-attendance.tsx`, `src/routes/_app.admin.user-schedules.tsx`, `src/mock/types.ts`, `src/mock/data.ts`, `src/lib/mock-store.ts`, `src/lib/pto.ts`, `src/components/app/eod-review-sheet.tsx`, `src/components/app/eod-report-modal.tsx`, `src/components/layout/app-sidebar.tsx`, plus login/topbar image imports.

Files added: `src/routes/_app.admin.pto.tsx`, `src/components/app/edit-schedule-sheet.tsx`, `src/components/app/attendance-notes-cell.tsx` (small helper), three real PNGs under `src/assets/`, and the generated PDF under `/mnt/documents/`.

Mock-store bump: `cb.store.v4` (keeps `{...base, ...parsed}` merge). New action: `logAttendanceChange`, plus attendance approval/notes/overtime setters.

Verification: `tsgo` typecheck, Playwright smoke — sign in as MB, bulk-approve 3 attendance rows, edit overtime on one, confirm change-logs page lists all four entries with before/after; open Admin → PTO, export CSV, import a dummy file; open an EOD with an Azure URL file and confirm the link opens. Screenshot each.
