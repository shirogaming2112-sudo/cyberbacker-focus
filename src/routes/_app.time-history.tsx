import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [time, setTime] = useState("");

  const rows = useMemo(() => {
    return attendance
      .map((a) => ({ ...a, clientName: clients.find((c) => c.id === a.clientId)?.name ?? "—" }))
      .filter((r) => {
        if (from && r.date < from) return false;
        if (to && r.date > to) return false;
        if (time) {
          const needle = time.toLowerCase();
          const inMatch = (r.clockIn ?? "").toLowerCase().includes(needle);
          const outMatch = (r.clockOut ?? "").toLowerCase().includes(needle);
          if (!inMatch && !outMatch) return false;
        }
        return true;
      });
  }, [from, to, time]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance History"
        description="Search, filter, and export your full attendance log."
        actions={<Button variant="outline" size="sm"><Download className="size-4" />Export CSV</Button>}
      />
      <div className="flex flex-wrap items-end gap-3 rounded-md border bg-card p-3">
        <div>
          <Label htmlFor="ah-from" className="text-xs">From</Label>
          <Input id="ah-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-9 w-[160px]" />
        </div>
        <div>
          <Label htmlFor="ah-to" className="text-xs">To</Label>
          <Input id="ah-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-9 w-[160px]" />
        </div>
        <div>
          <Label htmlFor="ah-time" className="text-xs">Time</Label>
          <Input id="ah-time" value={time} onChange={(e) => setTime(e.target.value)} placeholder="e.g. 09:00 AM" className="mt-1 h-9 w-[160px]" />
        </div>
        {(from || to || time) && (
          <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo(""); setTime(""); }}>Clear</Button>
        )}
      </div>
      <DataTable
        rows={rows}
        columns={cols}
        searchKeys={["clientName", "status", "date"]}
        searchPlaceholder="Search by client, status, date…"
      />
    </div>
  );
}
