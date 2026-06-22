import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { attendance, clients } from "@/mock/data";
import type { AttendanceRecord } from "@/mock/types";

export const Route = createFileRoute("/_app/time-history")({
  head: () => ({ meta: [{ title: "Attendance History — Cyberbacker" }] }),
  component: TimeHistory,
});

const cols: Column<AttendanceRecord & { clientName: string }>[] = [
  { key: "date", header: "Date", cell: (r) => <span className="font-medium">{r.date}</span> },
  { key: "client", header: "Client", cell: (r) => r.clientName },
  { key: "in", header: "Clock In", cell: (r) => r.clockIn ?? "—" },
  { key: "out", header: "Clock Out", cell: (r) => r.clockOut ?? "—" },
  { key: "hours", header: "Hours", cell: (r) => <span className="tabular-nums">{r.hoursWorked.toFixed(1)}</span> },
  { key: "ot", header: "Overtime", cell: (r) => <span className="tabular-nums">{r.overtimeHours.toFixed(1)}</span> },
  { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
];

function TimeHistory() {
  const rows = attendance.map((a) => ({
    ...a,
    clientName: clients.find((c) => c.id === a.clientId)?.name ?? "—",
  }));
  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance History"
        description="Search, filter, and export your full attendance log."
        actions={<Button variant="outline" size="sm"><Download className="size-4" />Export CSV</Button>}
      />
      <DataTable
        rows={rows}
        columns={cols}
        searchKeys={["clientName", "status", "date"]}
        searchPlaceholder="Search by client, status, date…"
      />
    </div>
  );
}
