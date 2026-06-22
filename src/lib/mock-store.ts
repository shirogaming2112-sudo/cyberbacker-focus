import { useSyncExternalStore } from "react";
import { eodReports as seedEod, schedules as seedSchedules } from "@/mock/data";
import { seedTokens, seedReferrals } from "@/mock/tokens";
import type { EodReport, Schedule } from "@/mock/types";
import type { Token, Referral } from "@/mock/tokens";

type State = {
  eod: (EodReport & { reviewComment?: string })[];
  schedules: Schedule[];
  tokens: Token[];
  referrals: Referral[];
};

const KEY = "cb.store.v1";

function load(): State {
  if (typeof window === "undefined") {
    return { eod: seedEod, schedules: seedSchedules, tokens: seedTokens, referrals: seedReferrals };
  }
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { eod: seedEod, schedules: seedSchedules, tokens: seedTokens, referrals: seedReferrals };
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
  // Tokens
  addToken: (t: Token) => { state = { ...state, tokens: [t, ...state.tokens] }; emit(); },
  deleteToken: (id: string) => { state = { ...state, tokens: state.tokens.filter((t) => t.id !== id) }; emit(); },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(state),
    () => selector(state),
  );
}
