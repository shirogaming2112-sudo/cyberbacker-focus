import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { scheduleApprovals } from "@/mock/data";
import type { ScheduleApproval } from "@/mock/types";

export const Route = createFileRoute("/_app/admin/schedule-approvals")({
  head: () => ({ meta: [{ title: "Schedule Approvals — Admin" }] }),
  component: ApprovalsPage,
});

const cols: Column<ScheduleApproval>[] = [
  { key: "user", header: "User", cell: (r) => <div><p className="font-medium">{r.userName}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
  { key: "sched", header: "Schedule", cell: (r) => r.scheduleName },
  { key: "created", header: "Submitted", cell: (r) => r.createdAt },
  { key: "updated", header: "Updated", cell: (r) => r.updatedAt },
  { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
  {
    key: "actions",
    header: "",
    className: "text-right",
    cell: (r) => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline" disabled={r.status !== "pending"}>Reject</Button>
        <Button size="sm" disabled={r.status !== "pending"}>Approve</Button>
      </div>
    ),
  },
];

function ApprovalsPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Schedule Approvals"
        description="Review schedule requests submitted by your team."
        actions={<Button variant="outline" size="sm">Bulk Approve Selected</Button>}
      />
      <DataTable rows={scheduleApprovals} columns={cols} searchKeys={["userName", "scheduleName", "status"]} searchPlaceholder="Search user, schedule, status…" />
    </div>
  );
}
