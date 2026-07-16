import { useSyncExternalStore } from "react";
import {
  eodReports as seedEod,
  schedules as seedSchedules,
  scheduleApprovals as seedApprovals,
  attendanceSummary as seedSummary,
  attendance as seedAttendance,
  changeLogs as seedChangeLogs,
} from "@/mock/data";
import { seedTokens, seedReferrals } from "@/mock/tokens";
import { seedPtoRequests, seedPtoStatus, type PtoRequest, type PtoStatus } from "@/mock/pto";
import type {
  EodReport,
  Schedule,
  ScheduleApproval,
  AttendanceSummary,
  AttendanceRecord,
  ChangeLog,
} from "@/mock/types";
import type { Token, Referral } from "@/mock/tokens";

type State = {
  eod: (EodReport & { reviewComment?: string })[];
  schedules: Schedule[];
  approvals: ScheduleApproval[];
  summary: AttendanceSummary[];
  attendance: AttendanceRecord[];
  changeLogs: ChangeLog[];
  tokens: Token[];
  referrals: Referral[];
  ptoStatus: PtoStatus;
  ptoRequests: PtoRequest[];
};

const KEY = "cb.store.v4";

function load(): State {
  const base: State = {
    eod: seedEod,
    schedules: seedSchedules,
    approvals: seedApprovals,
    summary: seedSummary,
    attendance: seedAttendance,
    changeLogs: seedChangeLogs,
    tokens: seedTokens,
    referrals: seedReferrals,
    ptoStatus: seedPtoStatus,
    ptoRequests: seedPtoRequests,
  };
  if (typeof window === "undefined") return base;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return { ...base, ...parsed };
    }
  } catch {}
  return base;
}

let state: State = load();
const listeners = new Set<() => void>();

function emit() {
  if (typeof window !== "undefined") {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {}
  }
  listeners.forEach((l) => l());
}

function nowIso() { return new Date().toISOString().slice(0, 10); }

function logChangeInternal(entry: Omit<ChangeLog, "id" | "updatedAt">) {
  const log: ChangeLog = {
    id: `cl_${Math.random().toString(36).slice(2, 8)}`,
    updatedAt: nowIso(),
    ...entry,
  };
  state = { ...state, changeLogs: [log, ...state.changeLogs] };
}

export const store = {
  get: () => state,
  subscribe: (fn: () => void) => { listeners.add(fn); return () => listeners.delete(fn); },
  // EOD
  addEod: (r: EodReport) => { state = { ...state, eod: [r, ...state.eod] }; emit(); },
  reviewEod: (id: string, status: "reviewed" | "flagged", comment?: string) => {
    state = { ...state, eod: state.eod.map((e) => e.id === id ? { ...e, status, reviewComment: comment } : e) };
    emit();
  },
  // Schedules
  addScheduleRequest: (s: Schedule) => { state = { ...state, schedules: [s, ...state.schedules] }; emit(); },
  updateSchedule: (id: string, patch: Partial<Schedule>, actor?: string) => {
    const prev = state.schedules.find((s) => s.id === id);
    state = { ...state, schedules: state.schedules.map((s) => s.id === id ? { ...s, ...patch, updatedAt: nowIso() } : s) };
    if (prev && patch.status && patch.status !== prev.status) {
      logChangeInternal({ userId: prev.userId, field: `Schedule · ${prev.name}`, from: prev.status, to: patch.status, updatedBy: actor ?? "System" });
    }
    emit();
  },
  // Approvals
  updateApproval: (id: string, patch: Partial<ScheduleApproval>) => {
    state = { ...state, approvals: state.approvals.map((a) => a.id === id ? { ...a, ...patch } : a) };
    emit();
  },
  bulkApproval: (ids: string[], status: "approved" | "rejected") => {
    state = { ...state, approvals: state.approvals.map((a) => ids.includes(a.id) ? { ...a, status } : a) };
    emit();
  },
  // Attendance summary
  updateSummary: (id: string, patch: Partial<AttendanceSummary>) => {
    state = { ...state, summary: state.summary.map((s) => s.id === id ? { ...s, ...patch } : s) };
    emit();
  },
  // Attendance records
  updateAttendance: (id: string, patch: Partial<AttendanceRecord>, actor: string) => {
    const prev = state.attendance.find((a) => a.id === id);
    if (!prev) return;
    state = { ...state, attendance: state.attendance.map((a) => a.id === id ? { ...a, ...patch } : a) };
    (Object.keys(patch) as (keyof AttendanceRecord)[]).forEach((k) => {
      const from = prev[k];
      const to = (patch as AttendanceRecord)[k];
      if (String(from ?? "") !== String(to ?? "")) {
        logChangeInternal({
          userId: prev.userId,
          field: `Attendance ${prev.date} · ${String(k)}`,
          from: String(from ?? "—"),
          to: String(to ?? "—"),
          updatedBy: actor,
        });
      }
    });
    emit();
  },
  bulkAttendanceApproval: (ids: string[], status: "approved" | "rejected", actor: string) => {
    const affected = state.attendance.filter((a) => ids.includes(a.id));
    state = { ...state, attendance: state.attendance.map((a) => ids.includes(a.id) ? { ...a, approvalStatus: status } : a) };
    affected.forEach((prev) => {
      const from = prev.approvalStatus ?? "pending";
      if (from !== status) {
        logChangeInternal({
          userId: prev.userId,
          field: `Attendance ${prev.date} · approval`,
          from,
          to: status,
          updatedBy: actor,
        });
      }
    });
    emit();
  },
  logChange: (entry: Omit<ChangeLog, "id" | "updatedAt">) => { logChangeInternal(entry); emit(); },
  // Tokens
  addToken: (t: Token) => { state = { ...state, tokens: [t, ...state.tokens] }; emit(); },
  deleteToken: (id: string) => { state = { ...state, tokens: state.tokens.filter((t) => t.id !== id) }; emit(); },
  // PTO
  addPtoRequest: (r: PtoRequest) => { state = { ...state, ptoRequests: [r, ...state.ptoRequests] }; emit(); },
  updatePtoRequest: (id: string, patch: Partial<PtoRequest>) => {
    state = { ...state, ptoRequests: state.ptoRequests.map((r) => r.id === id ? { ...r, ...patch } : r) };
    emit();
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
