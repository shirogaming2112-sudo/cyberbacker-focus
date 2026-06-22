
## Goal

Rebuild the Cyberbacker Attendance & Workforce platform from scratch as a modern enterprise SaaS UI (Linear / Rippling / ClickUp tier). Keep all current functionality conceptually, but replace the entire UI, IA, navigation, and layout. Use mock data so the UX can be evaluated before wiring the backend.

## Design system

Theme tokens (defined in `src/styles.css`, no hardcoded colors in components):
- `--primary` Deep Navy `#1E3A8A`
- `--accent` Powder Blue `#8DB9FF`
- `--background` white, `--muted` `#F4F6FB` light-gray surface, `--card` white
- `--border` cool gray, `--ring` powder blue
- Status: success / warning / destructive / info tokens
- Soft shadows (`--shadow-sm/md`), 8–10px radii, dense spacing scale
- Typography: Inter Tight (display) + Inter (body) via `@fontsource`
- Full light + dark mode

Avoid: oversized containers, large empty spaces, heavy gradients, centered hero-style dashboard layouts.

## Application shell

`src/components/layout/AppShell.tsx` renders three regions:

```text
┌──────────┬─────────────────────────────────────────────┐
│ Sidebar  │ TopHeader (sticky)                          │
│ (logo)   ├─────────────────────────────────────────────┤
│ Nav      │ PageHeader + Main content                   │
│ ...      │ (optional right ContextPanel)               │
│ Profile  │                                             │
└──────────┴─────────────────────────────────────────────┘
```

Built with shadcn `Sidebar` (`collapsible="icon"`) so it shrinks to icons on desktop and becomes a `Sheet` drawer on mobile.

**Sidebar** (`AppSidebar.tsx`):
- Top: Cyberbacker logo (full when expanded, mark when collapsed)
- Nav: Dashboard, Time Tracking, Attendance History, Schedules, Schedule Requests, EOD Reports, Clients, Performance, Notifications, Settings
- Admin group (role-gated, shown for admin mock user): Schedule Approvals, User Attendance, User Schedules, Change Logs, Attendance Summary, Users Management
- Bottom: Profile card, Theme toggle, Logout
- Active route highlight via `useRouterState`

**TopHeader** (`TopHeader.tsx`, sticky):
- Sidebar trigger + breadcrumbs
- Global `Command`-style search (⌘K) over routes, users, clients, reports
- Quick-action button ("Clock In" / "Clock Out" contextual)
- Current time + timezone widget
- Notifications popover (badge + list)
- User profile dropdown (profile, settings, logout)

## Routes

File-based routes under `src/routes/`, all employee routes under an `_app` layout (sidebar shell), admin under `_app.admin.*`:

- `/login` → split-screen redesign
- `/dashboard` → "What do I need to do today?"
- `/time-tracking`
- `/time-history` (Attendance History)
- `/schedules`
- `/schedule-requests`
- `/eod-reports`
- `/clients`
- `/performance`
- `/notifications`
- `/settings`
- `/profile`
- `/admin` → overview
- `/admin/schedule-approvals`
- `/admin/user-attendance`
- `/admin/user-schedules`
- `/admin/change-logs`
- `/admin/attendance-summary`
- `/admin/users`

Each route has its own `head()` with title + description. 404 + error boundaries on root.

## Page designs

**Login** — Split screen. Left: deep navy panel with logo, mission tagline ("We've Got Your Back. World-Class Professional Support."), abstract powder-blue globe pattern, feature bullets (Track attendance, Manage schedules, Submit reports, Monitor performance). Right: glass card with "Sign in with Google" + footer fine print. Powder-blue accents.

**Dashboard** — Dense 12-col grid, NOT centered:
1. Welcome banner (greeting, current shift, client, today status badge)
2. Primary Clock In/Out card — large progress ring (shift % complete), big timer, working/break/total stats, Clock In/Out + Start Break + Upload EOD buttons. Spans 8 cols.
3. Quick stats column (4 cols): Present Days, Hours This Week, Hours This Month, Attendance %, Late Count, Overtime — compact KPI cards w/ trend chips
4. Today's Schedule strip (start/end/client/timezone/status)
5. Recent Activity feed (clock events, schedule changes, EOD submissions)
6. Announcements list
7. Performance Summary (Attendance / Consistency / Productivity scores w/ mini radial)

**Time Tracking** — Dedicated page. Big live clock + Clock In/Out, daily timeline (segments for work/lunch/break), break controls, weekly + monthly summary charts (recharts), shift goal progress.

**Attendance History** — Modern `DataTable`: search, multi-filter (status, client, date range presets), CSV export, pagination, status badges. Mobile: collapses to stacked cards.

**Schedules** — Tabs: Calendar (week/month view), Upcoming shifts, Schedule history. "Request Schedule" opens a redesigned multi-step modal (schedule name → per-day clock in/lunch/break/clock out, timezone-aware with a clear "displayed in your local time / saved as MST" note instead of the current alarming red banner).

**Schedule Requests** — list of own requests w/ status badges, filters.

**EOD Reports** — list + composer (rich textarea, attachments, client tag), status timeline.

**Clients** — grid of client cards (name, schedule, hours this month, primary contact).

**Performance** — 3 score cards + trend charts + history table.

**Notifications** — full inbox view.

**Settings / Profile** — tabbed pages (Profile, Preferences, Notifications, Security, Theme, Timezone).

**Admin overview** (`/admin`) — KPI strip (active users, pending approvals, late today, hours this period, payroll cutoff status with inline "Set Pay Period"), pending-approvals queue, recent change logs feed, quick links to sub-pages.

**Admin sub-pages** — same `DataTable` pattern (Schedule Approvals w/ filters + bulk approve/disapprove; User Attendance w/ user picker + logs + bulk actions; User Schedules; Change Logs; Attendance Summary w/ Export CSV; Users Management w/ Impersonate / Edit Password / Update User row actions). Tabs at the top of `/admin` for parity with the current tab UX, but each tab is its own route for shareable URLs.

## Reusable components

`src/components/ui-app/`:
- `MetricCard`, `StatusBadge`, `ClockWidget` (with progress ring), `ScheduleCard`, `ActivityFeed`, `NotificationPanel`, `DataTable` (TanStack Table wrapper with search/filter/pagination/empty/loading), `PageHeader`, `EmptyState`, `LoadingSkeleton`, `ContextPanel`, `CommandPalette`.

## Mock data

`src/mock/` modules export typed fixtures for: current user (with admin role), 5 users, 3 clients, schedules, 30 days of attendance, EOD reports, notifications, change logs, announcements, performance scores. All page reads route through `src/lib/data/*.ts` adapters so swapping to real `createServerFn` later is a one-file change.

## Logo + assets

Uploaded logos saved to `src/assets/` and bundled with the build (offline-ready):
- `cyberbacker-full.png` (Black tagline version) — used on light login left panel & footer
- `cyberbacker-white.png` (White version) — used on dark sidebar / dark login
- `cyberbacker-mark.png` (no tagline) — sidebar collapsed state + favicon

Imported as ES modules so Vite fingerprints them; no runtime CDN dependency.

## Responsive + a11y

- Desktop-first 1440 baseline, fluid down to 360
- Sidebar → mobile `Sheet` drawer triggered from header
- All `DataTable`s collapse to card lists < md
- All icon-only buttons have `aria-label`; status colors paired with text/icon, not color alone
- Focus-visible rings using `--ring`; keyboard support on Command palette and menus

## Technical

- Stack: existing TanStack Start + shadcn/ui + Tailwind v4. Add `@tanstack/react-table`, `recharts`, `@fontsource/inter`, `@fontsource/inter-tight`, `cmdk` (already via shadcn `command`).
- Route files use `createFileRoute` under `_app` layout; layout component renders `<AppShell><Outlet /></AppShell>`.
- Theme toggle via `next-themes`-style class on `<html>`, persisted in `localStorage` inside `useEffect`.
- No backend wiring this pass; data layer is mock-only, designed to be replaced by `createServerFn` calls later.

## Out of scope (this pass)

- Real Google OAuth / Supabase wiring
- Server functions, migrations, RLS
- Payments, emails, integrations

## Deliverable

A fully navigable, themeable mock app you can click through end-to-end (employee + admin) to evaluate UX before we attach the real backend.
