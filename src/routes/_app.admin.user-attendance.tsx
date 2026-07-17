import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Download, StickyNote } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, users, currentUser } from "@/mock/data";
import type { AttendanceRecord } from "@/mock/types";
import { useAuth } from "@/lib/auth";
import { store, useStore } from "@/lib/mock-store";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/user-attendance")({
  head: () => ({ meta: [{ title: "User Attendance — Admin" }] }),
  component: UserAttendance,
});

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

type Row = AttendanceRecord & { clientName: string; userName: string };

function UserAttendance() {
  const { role } = useAuth();
  const attendance = useStore((s) => s.attendance);
  const [userId, setUserId] = useState<string>("all");
  const [period, setPeriod] = useState<Period>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const hbSelf = role === "hb" ? users.find((u) => u.appRole === "hb") : null;
  const scopedUsers = useMemo(() => {
    if (role !== "hb" || !hbSelf) return users;
    return users.filter((u) => u.headbacker === hbSelf.name);
  }, [role, hbSelf]);
  const scopedIds = useMemo(() => new Set(scopedUsers.map((u) => u.id)), [scopedUsers]);

  const range = periodRange(period);

  const rows: Row[] = useMemo(() => {
    return attendance
      .filter((a) => (role !== "hb" ? true : scopedIds.has(a.userId)))
      .filter((a) => userId === "all" || a.userId === userId)
      .filter((a) => !range || (a.date >= range.start && a.date <= range.end))
      .map((a) => ({
        ...a,
        clientName: clients.find((c) => c.id === a.clientId)?.name ?? "—",
        userName: users.find((u) => u.id === a.userId)?.name ?? "—",
      }));
  }, [attendance, role, scopedIds, userId, range]);

  const pendingIds = useMemo(
    () => rows.filter((r) => (r.approvalStatus ?? "pending") === "pending").map((r) => r.id),
    [rows],
  );
  const allSelected = pendingIds.length > 0 && pendingIds.every((id) => selected.has(id));

  const toggle = (id: string, on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id); else next.delete(id);
      return next;
    });
  };
  const toggleAll = (on: boolean) => setSelected(on ? new Set(pendingIds) : new Set());

  const actor = currentUser.name;

  const bulk = (status: "approved" | "rejected") => {
    const ids = Array.from(selected).filter((id) => {
      const r = rows.find((x) => x.id === id);
      return r && (r.approvalStatus ?? "pending") === "pending";
    });
    if (!ids.length) { toast.error("Select at least one pending record"); return; }
    store.bulkAttendanceApproval(ids, status, actor);
    toast.success(`${ids.length} record${ids.length === 1 ? "" : "s"} ${status}`);
    setSelected(new Set());
  };

  const exportCsv = () => {
    const headers = ["User", "Date", "Client", "Clock In", "Clock Out", "Hours", "Overtime", "Status", "Approval", "Notes"];
    const lines = [
      headers.join(","),
      ...rows.map((r) => [
        r.userName, r.date, r.clientName, r.clockIn ?? "", r.clockOut ?? "",
        r.hoursWorked.toFixed(2), r.overtimeHours.toFixed(2), r.status,
        r.approvalStatus ?? "pending", (r.notes ?? "").replace(/[\r\n,]/g, " "),
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `user-attendance-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const cols: Column<Row>[] = [
    {
      key: "sel",
      header: (
        <Checkbox
          checked={pendingIds.length > 0 && allSelected ? true : selected.size > 0 ? "indeterminate" : false}
          onCheckedChange={(v) => toggleAll(!!v)}
          aria-label="Select all pending attendance rows"
          disabled={pendingIds.length === 0}
        />
      ) as unknown as string,
      cell: (r) => {
        const pending = (r.approvalStatus ?? "pending") === "pending";
        return (
          <Checkbox
            checked={selected.has(r.id)}
            onCheckedChange={(v) => toggle(r.id, !!v)}
            disabled={!pending}
            aria-label={`Select ${r.userName} attendance for ${r.date}`}
          />
        );
      },
    },
    { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
    { key: "date", header: "Date", cell: (r) => r.date },
    { key: "client", header: "Client", cell: (r) => r.clientName },
    { key: "in", header: "In", cell: (r) => r.clockIn ?? "—" },
    { key: "out", header: "Out", cell: (r) => r.clockOut ?? "—" },
    { key: "hours", header: "Hours", cell: (r) => r.hoursWorked.toFixed(1) },
    {
      key: "ot",
      header: "Overtime",
      cell: (r) => <OvertimeCell row={r} actor={actor} />,
    },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
    {
      key: "approval",
      header: "Approval",
      cell: (r) => {
        const a = r.approvalStatus ?? "pending";
        const tone = a === "approved" ? "success" : a === "rejected" ? "destructive" : "warning";
        return <StatusBadge tone={tone}>{a}</StatusBadge>;
      },
    },
    {
      key: "notes",
      header: "Notes",
      cell: (r) => <NotesCell row={r} actor={actor} />,
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => {
        const pending = (r.approvalStatus ?? "pending") === "pending";
        return (
          <div role="group" aria-label={`Approval actions for ${r.userName} on ${r.date}`} className="flex justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={!pending}
              aria-disabled={!pending}
              aria-label={`Disapprove ${r.userName} attendance for ${r.date}`}
              onClick={() => {
                store.updateAttendance(r.id, { approvalStatus: "rejected" }, actor);
                store.logChange({ userId: r.userId, field: `Attendance ${r.date} · approval`, from: r.approvalStatus ?? "pending", to: "rejected", updatedBy: actor });
                toast.success("Disapproved");
              }}
            >
              Disapprove
            </Button>
            <Button
              size="sm"
              disabled={!pending}
              aria-disabled={!pending}
              aria-label={`Approve ${r.userName} attendance for ${r.date}`}
              onClick={() => {
                store.updateAttendance(r.id, { approvalStatus: "approved" }, actor);
                store.logChange({ userId: r.userId, field: `Attendance ${r.date} · approval`, from: r.approvalStatus ?? "pending", to: "approved", updatedBy: actor });
                toast.success("Approved");
              }}
            >
              Approve
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="User Attendance"
        description={role === "hb" ? "Attendance for cyberbackers you head." : "Review, approve, and edit attendance across your team."}
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
            <Button size="sm" variant="outline" onClick={exportCsv}><Download className="size-4" />Export CSV</Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card px-3 py-2 text-xs">
        <label className="flex items-center gap-1.5 text-muted-foreground">
          <Checkbox checked={allSelected} onCheckedChange={(v) => toggleAll(!!v)} aria-label="Select all pending" />
          Select all pending
        </label>
        <Badge variant="secondary">{selected.size} selected</Badge>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" disabled={!selected.size} onClick={() => bulk("rejected")}>Bulk Disapprove</Button>
          <Button size="sm" disabled={!selected.size} onClick={() => bulk("approved")}>Bulk Approve</Button>
        </div>
      </div>

      <DataTable rows={rows} columns={cols} searchKeys={["userName", "clientName", "status", "date"]} searchPlaceholder="Search user, client, status, date…" />
    </div>
  );
}

function OvertimeCell({ row, actor }: { row: Row; actor: string }) {
  const [v, setV] = useState(String(row.overtimeHours));
  const commit = () => {
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) { setV(String(row.overtimeHours)); return; }
    if (n === row.overtimeHours) return;
    store.updateAttendance(row.id, { overtimeHours: n }, actor);
    toast.success("Overtime updated");
  };
  return (
    <div className="flex items-center gap-1.5">
      <Input
        type="number"
        step="0.25"
        min={0}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        aria-label={`Overtime hours for ${row.userName} on ${row.date}`}
        className="h-8 w-20 tabular-nums"
      />
      {row.overtimeHours > 0 && <Badge variant="secondary" className="text-[10px]">OT</Badge>}
    </div>
  );
}

function NotesCell({ row, actor }: { row: Row; actor: string }) {
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
        <Label className="text-xs">Notes</Label>
        <Textarea
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note for this attendance record…"
          className="mt-1.5"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={() => { store.updateAttendance(row.id, { notes: value.trim() || undefined }, actor); toast.success("Note saved"); }}>Save</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
