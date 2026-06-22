import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { schedules, clients } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/_app/schedule-requests")({
  head: () => ({ meta: [{ title: "Schedule Requests — Cyberbacker" }] }),
  component: ScheduleRequests,
});

function ScheduleRequests() {
  const rows = schedules.map((s) => ({
    ...s,
    clientName: clients.find((c) => c.id === s.clientId)?.name ?? "—",
  }));
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "name", header: "Schedule", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "client", header: "Client", cell: (r) => r.clientName },
    { key: "tz", header: "Timezone", cell: (r) => r.timezone },
    { key: "created", header: "Submitted", cell: (r) => r.createdAt },
    { key: "updated", header: "Updated", cell: (r) => r.updatedAt },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
    { key: "actions", header: "", cell: () => <Button size="sm" variant="ghost"><Eye className="size-4" /></Button>, className: "text-right" },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Schedule Requests" description="Track every schedule you've submitted and its approval status." />
      <DataTable rows={rows} columns={cols} searchKeys={["name", "clientName", "status"]} searchPlaceholder="Search schedule, client, status…" />
    </div>
  );
}
