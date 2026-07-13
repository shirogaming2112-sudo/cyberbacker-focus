import { useSyncExternalStore } from "react";
import {
  eodReports as seedEod,
  schedules as seedSchedules,
  scheduleApprovals as seedApprovals,
  attendanceSummary as seedSummary,
} from "@/mock/data";
import { seedTokens, seedReferrals } from "@/mock/tokens";
import { seedPtoRequests, seedPtoStatus, type PtoRequest, type PtoStatus } from "@/mock/pto";
import type { EodReport, Schedule, ScheduleApproval, AttendanceSummary } from "@/mock/types";
import type { Token, Referral } from "@/mock/tokens";

type State = {
  eod: (EodReport & { reviewComment?: string })[];
  schedules: Schedule[];
  approvals: ScheduleApproval[];
  summary: AttendanceSummary[];
  tokens: Token[];
  referrals: Referral[];
  ptoStatus: PtoStatus;
  ptoRequests: PtoRequest[];
};

const KEY = "cb.store.v3";

function load(): State {
  const base: State = {
    eod: seedEod,
    schedules: seedSchedules,
    approvals: seedApprovals,
    summary: seedSummary,
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
  updateSchedule: (id: string, patch: Partial<Schedule>) => {
    state = { ...state, schedules: state.schedules.map((s) => s.id === id ? { ...s, ...patch } : s) };
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
