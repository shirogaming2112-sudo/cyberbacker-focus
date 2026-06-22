export type ReferralStage =
  | "Applied"
  | "Screening"
  | "Interview"
  | "Offer"
  | "Hired"
  | "Rejected";

export interface Token {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  tokenSlug: string;
  name: string;
  stage: ReferralStage;
  createdAt: string;
}

export const seedTokens: Token[] = [
  { id: "tk_1", name: "Summer Drive", slug: "summer-drive", ownerId: "u_1", createdAt: "2026-05-10" },
  { id: "tk_2", name: "LinkedIn", slug: "linkedin", ownerId: "u_1", createdAt: "2026-04-02" },
  { id: "tk_3", name: "Personal", slug: "personal", ownerId: "u_1", createdAt: "2026-02-14" },
];

export const seedReferrals: Referral[] = [
  { id: "rf_1", tokenSlug: "summer-drive", name: "Maria Cruz", stage: "Interview", createdAt: "2026-06-12" },
  { id: "rf_2", tokenSlug: "summer-drive", name: "Daniel Ortiz", stage: "Screening", createdAt: "2026-06-15" },
  { id: "rf_3", tokenSlug: "summer-drive", name: "Faye Mendoza", stage: "Applied", createdAt: "2026-06-18" },
  { id: "rf_4", tokenSlug: "linkedin", name: "Liam O'Brien", stage: "Hired", createdAt: "2026-05-22" },
  { id: "rf_5", tokenSlug: "linkedin", name: "Aiko Tanaka", stage: "Offer", createdAt: "2026-06-01" },
  { id: "rf_6", tokenSlug: "linkedin", name: "Carlos Reyes", stage: "Rejected", createdAt: "2026-05-30" },
  { id: "rf_7", tokenSlug: "personal", name: "Sam Patel", stage: "Interview", createdAt: "2026-06-10" },
  { id: "rf_8", tokenSlug: "personal", name: "Joana Lim", stage: "Applied", createdAt: "2026-06-19" },
];

export const REFERRAL_BASE_URL = "https://apply.cyberbackercareers.com/?ref=";

// TODO: swap with real GHL endpoint when available.
export async function fetchReferrals(slug: string): Promise<Referral[]> {
  return seedReferrals.filter((r) => r.tokenSlug === slug);
}
