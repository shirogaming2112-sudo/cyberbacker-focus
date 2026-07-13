import type { PtoRequest, PtoStatus } from "@/mock/pto";

export interface PtoCredits {
  earned: number;
  usedApproved: number;
  pending: number;
  available: number;
}

/**
 * PTO accrual: 1 credit per quarter while the user's status is "eligible".
 * Cap at 4 credits per calendar year. `used` and `pending` are counted from
 * requests that fall within the current calendar year.
 */
export function getPtoCredits(
  requests: PtoRequest[],
  status: PtoStatus,
): PtoCredits {
  const now = new Date();
  const year = now.getFullYear();

  const monthsIn = now.getMonth(); // 0..11
  const quartersCompletedOrCurrent = Math.min(4, Math.floor(monthsIn / 3) + 1);
  const earned = status === "eligible" ? quartersCompletedOrCurrent : 0;

  const inYear = (iso: string) => iso.startsWith(String(year));
  const usedApproved = requests
    .filter((r) => r.status === "approved" && inYear(r.startDate))
    .reduce((sum, r) => sum + r.days, 0);
  const pending = requests
    .filter((r) => r.status === "pending" && inYear(r.startDate))
    .reduce((sum, r) => sum + r.days, 0);

  const available = Math.max(0, earned - usedApproved - pending);
  return { earned, usedApproved, pending, available };
}
