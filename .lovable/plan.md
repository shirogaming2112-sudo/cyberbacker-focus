
## Goal

Produce a backend blueprint that mirrors the current mock-driven frontend: a FastAPI service with JWT auth, role-based access (`cyberbacker | hb | mb | software`), and a PostgreSQL schema covering users, clients, schedules, attendance, EOD reports, notifications, tokens/referrals, and audit logs.

## Deliverable

A single markdown doc at `docs/backend-spec.md` containing the sections below. No backend code is created; the frontend keeps using the mock store until wiring begins.

---

## 1. Stack & conventions

- **FastAPI** + **SQLAlchemy 2.x** (async) + **Alembic** migrations + **Pydantic v2** schemas.
- **Auth**: OAuth2 password flow → JWT access (15 min) + refresh (7 d). Google OAuth optional later.
- **RBAC**: `require_role("hb","mb","software")` dependency; row-level checks in service layer.
- **Pagination**: `?page=1&page_size=20`; responses wrap `{items, total, page, page_size}`.
- **IDs**: UUID v4 primary keys. **Timestamps**: `created_at`, `updated_at` (UTC).
- **Errors**: RFC7807 problem+json. **Filtering**: `?status=`, `?user_id=`, `?date_from=&date_to=`.

---

## 2. PostgreSQL schema

```text
users
  id uuid pk
  email citext unique not null
  password_hash text not null
  name text not null
  title text
  timezone text default 'UTC'
  avatar_url text
  status text check (status in ('Active','Inactive')) default 'Active'
  headbacker_id uuid null fk users(id)
  created_at, updated_at

roles                       -- enum-like lookup
  key text pk               -- 'cyberbacker'|'hb'|'mb'|'software'
  label text

user_roles                  -- many-to-many (a user can be HB and Software, etc.)
  user_id uuid fk users     pk part
  role_key text fk roles    pk part

clients
  id uuid pk
  name text not null
  industry text
  contact text
  schedule text
  color text
  hours_this_month numeric(6,2) default 0
  created_at, updated_at

user_clients                -- assignment
  user_id uuid fk users     pk part
  client_id uuid fk clients pk part
  assigned_at timestamptz

schedules
  id uuid pk
  user_id uuid fk users
  client_id uuid fk clients
  name text
  status text check (status in ('active','pending','rejected','ended')) default 'pending'
  timezone text
  effective_from date
  effective_to date null
  superseded_by uuid null fk schedules(id)
  created_at, updated_at

schedule_days
  id uuid pk
  schedule_id uuid fk schedules on delete cascade
  day text check (day in ('Mon','Tue','Wed','Thu','Fri','Sat','Sun'))
  clock_in time null
  clock_out time null
  lunch_minutes int default 0
  break_minutes int default 0
  unique (schedule_id, day)

schedule_approvals
  id uuid pk
  schedule_id uuid fk schedules
  reviewer_id uuid fk users
  status text check (status in ('pending','approved','rejected'))
  comment text
  decided_at timestamptz

attendance_records
  id uuid pk
  user_id uuid fk users
  client_id uuid fk clients
  date date not null
  clock_in timestamptz null
  clock_out timestamptz null
  lunch_hours numeric(4,2) default 0
  break_hours numeric(4,2) default 0
  hours_worked numeric(5,2) default 0
  overtime_hours numeric(5,2) default 0
  early_in_hours numeric(5,2) default 0
  status text check (status in ('present','late','absent','leave','pending')) default 'pending'
  unique (user_id, date, client_id)

attendance_events           -- raw clock in/out/break stream
  id uuid pk
  user_id uuid fk users
  client_id uuid fk clients
  kind text check (kind in ('clock-in','clock-out','break-start','break-end'))
  at timestamptz not null
  source text                -- 'web','mobile','manual'

eod_reports
  id uuid pk
  user_id uuid fk users
  client_id uuid fk clients
  date date not null
  summary text not null
  status text check (status in ('submitted','reviewed','flagged')) default 'submitted'
  reviewer_id uuid null fk users
  review_comment text
  reviewed_at timestamptz null
  created_at, updated_at

eod_items                   -- highlights + blockers in one table
  id uuid pk
  report_id uuid fk eod_reports on delete cascade
  kind text check (kind in ('highlight','blocker'))
  body text

eod_attachments
  id uuid pk
  report_id uuid fk eod_reports on delete cascade
  url text
  filename text
  size_bytes int

referral_tokens
  id uuid pk
  owner_id uuid fk users
  name text
  slug text unique             -- used in apply URL
  ghl_campaign_id text null
  created_at, deleted_at null

referrals                     -- synced from GHL
  id uuid pk
  token_id uuid fk referral_tokens
  external_id text unique      -- GHL contact/opportunity id
  name text
  stage text                   -- 'Applied','Interview','Hired',...
  created_at timestamptz

notifications
  id uuid pk
  user_id uuid fk users
  type text check (type in ('schedule','approval','system','mention','report'))
  title text
  body text
  read_at timestamptz null
  created_at

activity_log                  -- feed for dashboard
  id uuid pk
  user_id uuid fk users
  kind text
  text text
  at timestamptz

change_logs                   -- audit
  id uuid pk
  entity_type text             -- 'user','schedule','eod',...
  entity_id uuid
  field text
  from_value text
  to_value text
  updated_by uuid fk users
  updated_at timestamptz
```

Indexes: `attendance_records(user_id,date)`, `eod_reports(user_id,date)`, `schedules(user_id,status)`, `notifications(user_id,read_at)`, `referrals(token_id,created_at)`.

---

## 3. FastAPI endpoints

### Auth (`/auth`)
- `POST /auth/login` — email+password → tokens
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/google` — OAuth callback (phase 2)
- `GET  /auth/me` — current user + roles + permissions

### Users (`/users`) — admin gated
- `GET    /users` — list, filter by role/status/headbacker, search
- `POST   /users` — create (software)
- `GET    /users/{id}`
- `PATCH  /users/{id}` — edit name/title/status/headbacker (hb/mb/software)
- `DELETE /users/{id}` — software
- `POST   /users/{id}/impersonate` — software → short-lived token
- `POST   /users/{id}/reset-password` — software
- `PATCH  /users/{id}/headbacker` — assign headbacker
- `GET    /users/headbackers` — list HB-role users (picker source)

### Clients (`/clients`) — admin gated (kept even though UI tab removed)
- `GET/POST/PATCH/DELETE /clients`, `/clients/{id}`
- `POST /clients/{id}/assign` `{user_id}` · `DELETE /clients/{id}/assign/{user_id}`

### Schedules (`/schedules`)
- `GET  /schedules?user_id=&status=` — self by default; admin sees all
- `GET  /schedules/{id}`
- `POST /schedules` — create pending request (any role for self)
- `PATCH /schedules/{id}` — request edit → creates new pending, sets `superseded_by` on approval
- `POST /schedules/{id}/approve` — hb/mb/software
- `POST /schedules/{id}/reject`  — hb/mb/software `{comment}`
- `GET  /schedule-approvals?status=pending` — admin queue

### Attendance (`/attendance`)
- `POST /attendance/clock-in` `{client_id}`
- `POST /attendance/clock-out`
- `POST /attendance/break/start` · `POST /attendance/break/end`
- `GET  /attendance/today` — current session
- `GET  /attendance/history?user_id=&date_from=&date_to=`
- `GET  /attendance/summary?range=&user_id=&client_id=` — mb/software only (aggregates)
- `PATCH /attendance/{id}` — manual correction (hb/mb/software)

### EOD Reports (`/eod`)
- `GET  /eod?user_id=&client_id=&status=&date_from=&date_to=`
- `POST /eod` — create (self) with highlights[]/blockers[]/attachments
- `GET  /eod/{id}`
- `PATCH /eod/{id}` — author edit while `submitted`
- `POST /eod/{id}/approve` `{comment?}` — hb/mb/software → status `reviewed`
- `POST /eod/{id}/disapprove` `{comment?}` — status `flagged`
- `POST /eod/{id}/attachments` — multipart upload

### Tokens & referrals (`/tokens`)
- `GET    /tokens` — current user's tokens
- `POST   /tokens` `{name}` — slugified; returns apply URL
- `DELETE /tokens/{id}`
- `GET    /tokens/{id}/referrals` — proxied/cached from GHL, `{items,total,stages_count}`
- `POST   /webhooks/ghl/referrals` — GHL → upsert `referrals` (HMAC verify)

### Notifications (`/notifications`)
- `GET   /notifications?unread=true`
- `POST  /notifications/{id}/read` · `POST /notifications/read-all`
- `GET   /notifications/stream` — SSE (phase 2)

### Activity & audit
- `GET /activity?user_id=&limit=` — dashboard feed
- `GET /change-logs?entity_type=&entity_id=` — admin

### Profile & settings
- `GET/PATCH /me/profile` · `POST /me/password` · `GET/PATCH /me/settings`

### Meta
- `GET /health` · `GET /roles` · `GET /permissions`

---

## 4. Permission matrix (server-enforced)

| Endpoint group | CB | HB | MB | SW |
|---|---|---|---|---|
| Own schedules / attendance / EOD | ✓ | ✓ | ✓ | ✓ |
| Tokens (own) | ✓ | ✓ | ✓ | ✓ |
| Users list/edit | — | ✓ | ✓ | ✓ |
| Users impersonate / reset password | — | — | — | ✓ |
| EOD approve/disapprove | — | ✓ | ✓ | ✓ |
| Schedule approve/reject | — | ✓ | ✓ | ✓ |
| Attendance summary | — | — | ✓ | ✓ |
| Change logs | — | ✓ | ✓ | ✓ |

---

## 5. Out of scope for this doc

- Actual FastAPI code, migrations, Docker/deploy config.
- Frontend swap from mock store to real API (separate task).
- GHL contract details beyond a webhook + polling stub.
