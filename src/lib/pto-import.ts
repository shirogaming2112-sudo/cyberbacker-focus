import { users } from "@/mock/data";

export interface PtoImportSucceeded {
  row: number;
  userEmail: string;
  userName: string;
  status: "eligible" | "ineligible";
  credits: number;
}
export interface PtoImportFailed {
  row: number;
  raw: Record<string, string>;
  error: string;
}
export interface PtoImportResult {
  processed: number;
  succeeded: PtoImportSucceeded[];
  failed: PtoImportFailed[];
}

/** Parse a small CSV (no embedded newlines in quoted fields). */
function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (!lines.length) return { headers: [], rows: [] };
  const split = (line: string) => {
    const out: string[] = [];
    let cur = "";
    let q = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (q && line[i + 1] === '"') { cur += '"'; i++; }
        else q = !q;
      } else if (c === "," && !q) { out.push(cur); cur = ""; }
      else cur += c;
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = split(lines[0]).map((h) => h.toLowerCase());
  const rows = lines.slice(1).map((l) => {
    const cells = split(l);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => (obj[h] = cells[i] ?? ""));
    return obj;
  });
  return { headers, rows };
}

/**
 * Mock parser mirroring the FastAPI response contract:
 * `POST /api/admin/pto/import` (multipart, field "file") →
 * { processed, succeeded[], failed[] }
 *
 * CSV columns (case-insensitive): email, status, credits
 * - email: must match a known user
 * - status: eligible | ineligible
 * - credits: 0..4 integer
 */
export function parsePtoCsvMock(text: string): PtoImportResult {
  const { headers, rows } = parseCsv(text);
  const required = ["email", "status", "credits"];
  const missing = required.filter((r) => !headers.includes(r));
  if (missing.length) {
    return {
      processed: 0,
      succeeded: [],
      failed: [{ row: 1, raw: {}, error: `Missing required column(s): ${missing.join(", ")}` }],
    };
  }
  const succeeded: PtoImportSucceeded[] = [];
  const failed: PtoImportFailed[] = [];
  rows.forEach((r, idx) => {
    const rowNum = idx + 2; // account for header row
    const email = (r.email || "").toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === email);
    if (!user) { failed.push({ row: rowNum, raw: r, error: "User not found" }); return; }
    const status = r.status?.toLowerCase();
    if (status !== "eligible" && status !== "ineligible") {
      failed.push({ row: rowNum, raw: r, error: `Invalid status "${r.status}"` });
      return;
    }
    const credits = Number(r.credits);
    if (!Number.isInteger(credits) || credits < 0 || credits > 4) {
      failed.push({ row: rowNum, raw: r, error: `Credits must be 0–4 (got "${r.credits}")` });
      return;
    }
    succeeded.push({ row: rowNum, userEmail: user.email, userName: user.name, status, credits });
  });
  return { processed: rows.length, succeeded, failed };
}

/** POST to backend when configured, otherwise run the mock parser. */
export async function submitPtoImport(file: File): Promise<PtoImportResult> {
  const base = (import.meta as { env?: Record<string, string> }).env?.VITE_API_BASE_URL;
  if (base) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`${base}/api/admin/pto/import`, { method: "POST", body: fd });
    if (!res.ok) throw new Error(`Import failed (${res.status})`);
    return (await res.json()) as PtoImportResult;
  }
  const text = await file.text();
  return parsePtoCsvMock(text);
}

export function failedRowsToCsv(failed: PtoImportFailed[]): string {
  const keys = Array.from(new Set(failed.flatMap((f) => Object.keys(f.raw))));
  const header = ["row", ...keys, "error"];
  const esc = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
  const lines = [header.join(",")];
  failed.forEach((f) => {
    lines.push([f.row, ...keys.map((k) => f.raw[k] ?? ""), f.error].map((v) => esc(String(v))).join(","));
  });
  return lines.join("\n");
}
