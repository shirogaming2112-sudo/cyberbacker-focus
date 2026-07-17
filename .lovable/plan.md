## 1. Admin PTO — CSV import with success/failure rows

File: `src/routes/_app.admin.pto.tsx` (+ small helper `src/lib/pto-import.ts`).

- Replace the current "queue file" toast with a real POST to `/api/admin/pto/import` (FastAPI target). Since the backend isn't wired yet, gate the URL behind `import.meta.env.VITE_API_BASE_URL`; when unset, fall back to a local mock parser that reads the CSV client-side and produces the same result shape so the UI is fully testable offline.
- Expected response shape (documented in the PDF too):
  ```json
  { "processed": 12, "succeeded": [{"row":2,"userEmail":"...","status":"eligible","credits":3}],
    "failed": [{"row":5,"userEmail":"...","error":"User not found"}] }
  ```
- Add an `ImportResultDialog` (inline, not a new file) that opens after upload and shows two tabs: **Succeeded** (green check, row #, user, applied change) and **Failed** (red, row #, raw values, error). Include a "Download failed rows as CSV" button for retry.
- Apply the succeeded rows optimistically to the store (update `ptoStatus` per user once the store supports per-user status; for now log a `ChangeLog` entry per succeeded row via `store.logChange`).
- Show a loading state on the Import button while the request is in-flight; handle network errors with a toast + retry.

## 2. Admin User Attendance — keyboard + SR-friendly bulk actions

File: `src/routes/_app.admin.user-attendance.tsx` and the shared `NotesCell` / overtime popover components.

- **Select-all-pending checkbox**: give it `aria-label="Select all pending attendance rows"` and an `aria-checked` "mixed" state when a partial selection exists. Ensure it's a real `<Checkbox>` reachable via Tab, toggleable with Space.
- **Row checkboxes**: `aria-label={`Select ${userName} attendance for ${date}`}`. Keep them in tab order; Space toggles.
- **Per-row Approve / Disapprove buttons**: add `aria-label` including user + date + action, and `aria-disabled` (not just `disabled`) when already decided so screen readers announce state. Wrap the action pair in a `role="group"` with an `aria-label="Approval actions"`.
- **Notes popover trigger**: `aria-label` includes whether a note exists ("Edit note" vs "Add note"); popover content gets `role="dialog"` + `aria-labelledby`; textarea has a visible label associated via `htmlFor`. Cmd/Ctrl+Enter saves, Esc closes.
- **Overtime popover**: same dialog pattern; number input labelled "Overtime hours (0–8)"; `aria-describedby` points at a hint line. Enter saves, Esc cancels.
- **Bulk action bar**: appears when selection > 0 with `role="region"` + `aria-live="polite"` announcing "N rows selected"; Approve/Disapprove buttons have descriptive `aria-label`s.
- **Focus management**: after bulk action or per-row decision, return focus to the triggering control (or the next row's checkbox if the row is now decided). After closing a popover, focus returns to its trigger.
- **Keyboard shortcuts on the table**: `A` approves, `D` disapproves selected rows when the bulk bar has focus (documented via `aria-keyshortcuts`).
- No visual redesign — only a11y wiring and a small bulk-action bar that already exists in the header moves inline above the table when selection > 0 so it's discoverable by keyboard users.

## 3. Admin PTO — per-request Approve / Disapprove with change logs

File: `src/routes/_app.admin.pto.tsx`, uses existing `store.updatePtoRequest` + `store.logChange`.

- In the side-sheet request list, add **Approve** and **Disapprove** buttons on each pending request (disabled once decided, `aria-disabled` for SR clarity).
- On click: call `store.updatePtoRequest(id, { status })` and immediately `store.logChange({ userId, field: `PTO ${startDate}→${endDate} (${days}d)`, from: prev.status, to: newStatus, updatedBy: currentUserName })`.
- Show a confirmation toast; refresh the credits row automatically because `getPtoCredits` already reacts to store changes.
- Add a small "Approve all pending" secondary action at the top of the request list for that user (bulk within one user's sheet), logging one change entry per request.
- Keyboard/SR: buttons grouped with `role="group"` + `aria-label="Decision"`; announce result via `aria-live` region inside the sheet.

## 4. Backend endpoints PDF — polished, complete

File: `/mnt/documents/cyberbacker-backend-endpoints.pdf` (versioned `_v2` if regenerating).

- Generate with ReportLab Platypus, US Letter, DejaVu Sans registered (accents-safe), branded cover page (Cyberbacker mark from `src/assets`), TOC, and page numbers.
- Sections, in order:
  1. Overview & conventions (base URL, auth header, error envelope, pagination, timestamps).
  2. Auth — Google SSO exchange, session refresh, logout.
  3. Users & Roles — list (scoped), get, create/update, password, impersonate (Software only), headbacker assignment.
  4. Clients.
  5. Schedules & Schedule Approvals (bulk approve/disapprove, notes).
  6. Attendance — list (HB scope + pay-period filter), edit status/notes/overtime, bulk approve/disapprove, change-log emission rules.
  7. EOD Reports — multipart upload to Azure Blob, list, review (approve/flag), PDF export, attachment link listing.
  8. **PTO** — list credits per user, credit computation rules, request create, per-request approve/disapprove, **CSV import (multipart) with success/failure row response shape from §1**, CSV export.
  9. Tokens & Referrals — create/revoke, GHL webhook contract.
  10. Change Logs — list with filters; write rules (server also logs bulk actions).
  11. Notifications.
- Each endpoint entry includes: `METHOD /path`, purpose, role permissions matrix, request payload (JSON example matching `src/mock/types.ts`), success response, error responses, and "DB tables touched" cross-referencing `docs/backend-spec.md`.
- QA: render every page to JPEG at 150 DPI, inspect for overflow/clipping/font-box glyphs, iterate until clean; then emit `<presentation-artifact>`.

## Technical notes

Files touched: `src/routes/_app.admin.pto.tsx`, `src/routes/_app.admin.user-attendance.tsx`, small helper `src/lib/pto-import.ts`.
Files added: none beyond the helper and the PDF under `/mnt/documents/`.
No store-shape changes (still `cb.store.v4`). Verification: `tsgo`, plus Playwright — import a sample CSV and confirm the result dialog splits succeeded/failed; keyboard-drive attendance selection + bulk approve; approve a pending PTO request and confirm it appears in `/admin/change-logs`.
