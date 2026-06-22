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
import { useState } from "react";

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

function UserAttendance() {
  const [userId, setUserId] = useState<string>("all");
  const rows = attendance
    .filter((a) => userId === "all" || a.userId === userId)
    .map((a) => ({
      ...a,
      clientName: clients.find((c) => c.id === a.clientId)?.name ?? "—",
      userName: users.find((u) => u.id === a.userId)?.name ?? "—",
    }));
  return (
    <div className="space-y-5">
      <PageHeader
        title="User Attendance"
        description="View attendance logs across your team."
        actions={
          <>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger className="h-9 w-48"><SelectValue placeholder="User" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All users</SelectItem>
                {users.map((u) => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
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
