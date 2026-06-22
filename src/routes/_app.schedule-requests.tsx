import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients } from "@/mock/data";
import { useStore } from "@/lib/mock-store";
import { ScheduleRequestModal } from "@/components/app/schedule-request-modal";
import type { Schedule } from "@/mock/types";

export const Route = createFileRoute("/_app/schedule-requests")({
  head: () => ({ meta: [{ title: "Schedule Requests — Cyberbacker" }] }),
  component: ScheduleRequests,
});

function ScheduleRequests() {
  const schedules = useStore((s) => s.schedules);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);

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
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <Button size="sm" variant="outline" onClick={() => { setEditing(r); setOpen(true); }}>
          <Pencil className="size-3.5" aria-hidden /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Schedule Requests"
        description="Submit and edit schedule requests. Edits create a new pending request."
        actions={
          <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
            <Plus className="size-4" aria-hidden /> New Request
          </Button>
        }
      />
      <DataTable rows={rows} columns={cols} searchKeys={["name", "clientName", "status"]} searchPlaceholder="Search schedule, client, status…" />
      <ScheduleRequestModal open={open} onOpenChange={setOpen} initial={editing} />
    </div>
  );
}
