import type { EodFile } from "./types";

export type PtoStatus = "eligible" | "ineligible";

export interface PtoRequest {
  id: string;
  userId: string;
  days: number;
  startDate: string; // ISO yyyy-mm-dd
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  files?: EodFile[];
  createdAt: string;
}

export const seedPtoStatus: PtoStatus = "eligible";

const today = new Date();
const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (base: Date, n: number) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
};

export const seedPtoRequests: PtoRequest[] = [
  {
    id: "pto_1",
    userId: "u_1",
    days: 1,
    startDate: iso(addDays(today, -45)),
    endDate: iso(addDays(today, -45)),
    reason: "Family appointment (client approved).",
    status: "approved",
    createdAt: iso(addDays(today, -50)),
  },
  {
    id: "pto_2",
    userId: "u_1",
    days: 2,
    startDate: iso(addDays(today, 14)),
    endDate: iso(addDays(today, 15)),
    reason: "Short break — client agreed via email.",
    status: "pending",
    createdAt: iso(addDays(today, -1)),
  },
];
