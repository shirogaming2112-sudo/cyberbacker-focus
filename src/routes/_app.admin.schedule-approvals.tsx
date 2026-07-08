import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StickyNote } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { useStore, store } from "@/lib/mock-store";
import type { ScheduleApproval } from "@/mock/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/schedule-approvals")({
  head: () => ({ meta: [{ title: "Schedule Approvals — Admin" }] }),
  component: ApprovalsPage,
});

function ApprovalsPage() {
  const rows = useStore((s) => s.approvals);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pendingIds = useMemo(() => rows.filter((r) => r.status === "pending").map((r) => r.id), [rows]);
  const allSelected = pendingIds.length > 0 && pendingIds.every((id) => selected.has(id));

  const toggle = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  };
  const toggleAll = (on: boolean) => setSelected(on ? new Set(pendingIds) : new Set());

  const bulk = (status: "approved" | "rejected") => {
    const ids = Array.from(selected).filter((id) => rows.find((r) => r.id === id)?.status === "pending");
    if (!ids.length) { toast.error("Select at least one pending request"); return; }
    store.bulkApproval(ids, status);
    toast.success(`${ids.length} request${ids.length === 1 ? "" : "s"} ${status}`);
    setSelected(new Set());
  };

  const cols: Column<ScheduleApproval>[] = [
    {
      key: "select",
      header: "",
      cell: (r) => (
        <Checkbox
          checked={selected.has(r.id)}
          onCheckedChange={(v) => toggle(r.id, !!v)}
          disabled={r.status !== "pending"}
          aria-label={`Select ${r.userName}`}
        />
      ),
    },
    { key: "user", header: "User", cell: (r) => <div><p className="font-medium">{r.userName}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
    { key: "sched", header: "Schedule", cell: (r) => r.scheduleName },
    { key: "created", header: "Submitted", cell: (r) => r.createdAt },
    { key: "updated", header: "Updated", cell: (r) => r.updatedAt },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
    { key: "notes", header: "Notes", cell: (r) => <NotesCell row={r} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <div className="flex justify-end gap-2">
          <Button size="sm" variant="outline" disabled={r.status !== "pending"} onClick={() => { store.updateApproval(r.id, { status: "rejected" }); toast.success("Rejected"); }}>Reject</Button>
          <Button size="sm" disabled={r.status !== "pending"} onClick={() => { store.updateApproval(r.id, { status: "approved" }); toast.success("Approved"); }}>Approve</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Schedule Approvals"
        description="Review schedule requests submitted by your team."
        actions={
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(!!v)} aria-label="Select all pending" />
              Select all pending
            </label>
            <Button variant="outline" size="sm" disabled={!selected.size} onClick={() => bulk("rejected")}>Bulk Disapprove</Button>
            <Button size="sm" disabled={!selected.size} onClick={() => bulk("approved")}>Bulk Approve</Button>
          </div>
        }
      />
      <DataTable rows={rows} columns={cols} searchKeys={["userName", "scheduleName", "status"]} searchPlaceholder="Search user, schedule, status…" />
    </div>
  );
}

function NotesCell({ row }: { row: ScheduleApproval }) {
  const [value, setValue] = useState(row.notes ?? "");
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button size="sm" variant="outline" className="h-7 gap-1.5 font-normal">
          <StickyNote className="size-3" aria-hidden />
          {row.notes ? "Edit" : "Add note"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72">
        <Label htmlFor={`notes-${row.id}`} className="text-xs">Notes</Label>
        <Textarea
          id={`notes-${row.id}`}
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note for this request…"
          className="mt-1.5"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={() => { store.updateApproval(row.id, { notes: value.trim() || undefined }); toast.success("Notes saved"); }}>Save</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
