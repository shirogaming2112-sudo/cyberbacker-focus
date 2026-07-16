import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, users, currentUser } from "@/mock/data";
import { Button } from "@/components/ui/button";
import { useStore, store } from "@/lib/mock-store";
import { ScheduleRequestModal } from "@/components/app/schedule-request-modal";
import type { Schedule } from "@/mock/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/user-schedules")({
  head: () => ({ meta: [{ title: "User Schedules — Admin" }] }),
  component: UserSchedules,
});

type Row = Schedule & { clientName: string; userName: string };

function UserSchedules() {
  const schedules = useStore((s) => s.schedules);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [open, setOpen] = useState(false);

  const rows: Row[] = schedules.map((s) => ({
    ...s,
    clientName: clients.find((c) => c.id === s.clientId)?.name ?? "—",
    userName: users.find((u) => u.id === s.userId)?.name ?? "—",
  }));

  const setStatus = (r: Schedule, status: Schedule["status"]) => {
    store.updateSchedule(r.id, { status }, currentUser.name);
    toast.success(`Schedule ${status}`);
  };

  const cols: Column<Row>[] = [
    { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
    { key: "name", header: "Schedule", cell: (r) => r.name },
    { key: "client", header: "Client", cell: (r) => r.clientName },
    { key: "tz", header: "Timezone", cell: (r) => r.timezone },
    { key: "updated", header: "Updated", cell: (r) => r.updatedAt },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={r.status !== "pending"}
            onClick={() => setStatus(r, "rejected")}
          >
            Disapprove
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={r.status !== "pending"}
            onClick={() => setStatus(r, "active")}
          >
            Approve
          </Button>
          <Button size="sm" onClick={() => { setEditing(r); setOpen(true); }}>Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="User Schedules" description="Active and historical schedules across your team." />
      <DataTable rows={rows} columns={cols} searchKeys={["userName", "clientName", "name", "status"]} />
      <ScheduleRequestModal open={open} onOpenChange={setOpen} initial={editing} />
    </div>
  );
}
