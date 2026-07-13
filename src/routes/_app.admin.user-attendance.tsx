import { createFileRoute } from "@tanstack/react-router";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { attendance, clients, users } from "@/mock/data";
import type { AttendanceRecord } from "@/mock/types";
import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/admin/user-attendance")({
  head: () => ({ meta: [{ title: "User Attendance — Admin" }] }),
  component: UserAttendance,
});

const cols: Column<AttendanceRecord & { clientName: string; userName: string }>[] = [
  { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
  { key: "date", header: "Date", cell: (r) => r.date },
  { key: "client", header: "Client", cell: (r) => r.clientName },
  { key: "in", header: "In", cell: (r) => r.clockIn ?? "—" },
  { key: "out", header: "Out", cell: (r) => r.clockOut ?? "—" },
  { key: "hours", header: "Hours", cell: (r) => r.hoursWorked.toFixed(1) },
  { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
];

type Period = "all" | "cur-1" | "cur-2" | "prev-1" | "prev-2";

function periodRange(p: Period): { start: string; end: string } | null {
  if (p === "all") return null;
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const target = p.startsWith("cur") ? { y, m } : m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
  const half = p.endsWith("1") ? 1 : 2;
  const pad = (n: number) => String(n).padStart(2, "0");
  const monthStr = `${target.y}-${pad(target.m + 1)}`;
  if (half === 1) return { start: `${monthStr}-01`, end: `${monthStr}-15` };
  const lastDay = new Date(target.y, target.m + 1, 0).getDate();
  return { start: `${monthStr}-16`, end: `${monthStr}-${pad(lastDay)}` };
}

function UserAttendance() {
  const { role } = useAuth();
  const [userId, setUserId] = useState<string>("all");
  const [period, setPeriod] = useState<Period>("all");

  // HB scoping: an HB only sees CBs they head.
  const hbSelf = role === "hb" ? users.find((u) => u.appRole === "hb") : null;
  const scopedUsers = useMemo(() => {
    if (role !== "hb" || !hbSelf) return users;
    return users.filter((u) => u.headbacker === hbSelf.name);
  }, [role, hbSelf]);
  const scopedIds = useMemo(() => new Set(scopedUsers.map((u) => u.id)), [scopedUsers]);

  const range = periodRange(period);

  const rows = useMemo(() => {
    return attendance
      .filter((a) => (role !== "hb" ? true : scopedIds.has(a.userId)))
      .filter((a) => userId === "all" || a.userId === userId)
      .filter((a) => !range || (a.date >= range.start && a.date <= range.end))
      .map((a) => ({
        ...a,
        clientName: clients.find((c) => c.id === a.clientId)?.name ?? "—",
        userName: users.find((u) => u.id === a.userId)?.name ?? "—",
      }));
  }, [role, scopedIds, userId, range]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Attendance"
        description={role === "hb" ? "Attendance for cyberbackers you head." : "View attendance logs across your team."}
        actions={
          <>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-9 w-48"><SelectValue placeholder="User" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {scopedUsers.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
              <SelectTrigger className="h-9 w-56"><SelectValue placeholder="Pay period" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All dates</SelectItem>
                <SelectItem value="cur-1">1–15 (this month)</SelectItem>
                <SelectItem value="cur-2">16–end (this month)</SelectItem>
                <SelectItem value="prev-1">1–15 (last month)</SelectItem>
                <SelectItem value="prev-2">16–end (last month)</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" variant="outline"><Download className="size-4" />Export</Button>
          </>
        }
      />
      <DataTable rows={rows} columns={cols} searchKeys={["userName", "clientName", "status", "date"]} searchPlaceholder="Search user, client, status, date…" />
    </div>
  );
}
