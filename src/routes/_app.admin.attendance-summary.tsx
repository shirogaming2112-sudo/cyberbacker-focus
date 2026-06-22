import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/status-badge";
import { attendanceSummary } from "@/mock/data";
import type { AttendanceSummary } from "@/mock/types";

export const Route = createFileRoute("/_app/admin/attendance-summary")({
  head: () => ({ meta: [{ title: "Attendance Summary — Admin" }] }),
  component: AttendanceSummaryPage,
});

const cols: Column<AttendanceSummary>[] = [
  { key: "range", header: "Date Range", cell: (r) => r.range },
  { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
  { key: "client", header: "Client", cell: (r) => r.client },
  { key: "hours", header: "Total Hours", cell: (r) => <span className="tabular-nums">{r.totalHours.toFixed(1)}</span> },
  { key: "ot", header: "Overtime", cell: (r) => <span className="tabular-nums">{r.totalOvertime.toFixed(1)}</span> },
  { key: "abs", header: "Absences", cell: (r) => r.totalAbsences },
  { key: "upl", header: "Unpaid Leave", cell: (r) => r.unpaidLeave },
  { key: "pl", header: "Paid Leave", cell: (r) => r.paidLeave },
  { key: "checked", header: "Checked", cell: (r) => <StatusBadge tone={r.checked ? "success" : "muted"}>{r.checked ? "Checked" : "Pending"}</StatusBadge> },
];

function AttendanceSummaryPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Summary"
        description="Aggregate hours, overtime, and leave for any pay period."
        actions={<Button size="sm"><Download className="size-4" />Export CSV</Button>}
      />
      <DataTable rows={attendanceSummary} columns={cols} searchKeys={["userName", "client", "range"]} />
    </div>
  );
}
