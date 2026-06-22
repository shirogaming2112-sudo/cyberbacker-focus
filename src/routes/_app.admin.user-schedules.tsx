import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, schedules, users } from "@/mock/data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin/user-schedules")({
  head: () => ({ meta: [{ title: "User Schedules — Admin" }] }),
  component: UserSchedules,
});

function UserSchedules() {
  const rows = schedules.map((s) => ({
    ...s,
    clientName: clients.find((c) => c.id === s.clientId)?.name ?? "—",
    userName: users.find((u) => u.id === s.userId)?.name ?? "—",
  }));
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
    { key: "name", header: "Schedule", cell: (r) => r.name },
    { key: "client", header: "Client", cell: (r) => r.clientName },
    { key: "tz", header: "Timezone", cell: (r) => r.timezone },
    { key: "updated", header: "Updated", cell: (r) => r.updatedAt },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
    { key: "actions", header: "", className: "text-right", cell: () => <Button size="sm" variant="outline">Edit</Button> },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="User Schedules" description="Active and historical schedules across your team." />
      <DataTable rows={rows} columns={cols} searchKeys={["userName", "clientName", "name", "status"]} />
    </div>
  );
}
