import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Download, StickyNote } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { useStore, store } from "@/lib/mock-store";
import type { AttendanceSummary } from "@/mock/types";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/attendance-summary")({
  head: () => ({ meta: [{ title: "Attendance Summary — Admin" }] }),
  component: AttendanceSummaryPage,
});

function AttendanceSummaryPage() {
  const rows = useStore((s) => s.summary);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (from && r.endDate && r.endDate < from) return false;
      if (to && r.startDate && r.startDate > to) return false;
      return true;
    });
  }, [rows, from, to]);

  const exportCsv = () => {
    const header = ["Date Range", "User", "Client", "Total Hours", "Overtime", "Absences", "Unpaid Leave", "Paid Leave", "Checked", "Notes"];
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const body = filtered.map((r) => [r.range, r.userName, r.client, r.totalHours, r.totalOvertime, r.totalAbsences, r.unpaidLeave, r.paidLeave, r.checked ? "Yes" : "No", r.notes ?? ""].map(esc).join(","));
    const csv = [header.map(esc).join(","), ...body].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-summary-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exported");
  };

  const cols: Column<AttendanceSummary>[] = [
    { key: "range", header: "Date Range", cell: (r) => r.range },
    { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
    { key: "client", header: "Client", cell: (r) => r.client },
    { key: "hours", header: "Total Hours", cell: (r) => <span className="tabular-nums">{r.totalHours.toFixed(1)}</span> },
    { key: "ot", header: "Overtime", cell: (r) => <span className="tabular-nums">{r.totalOvertime.toFixed(1)}</span> },
    { key: "abs", header: "Absences", cell: (r) => r.totalAbsences },
    { key: "upl", header: "Unpaid Leave", cell: (r) => r.unpaidLeave },
    { key: "pl", header: "Paid Leave", cell: (r) => r.paidLeave },
    {
      key: "checked",
      header: "Checked",
      cell: (r) => (
        <Switch
          checked={r.checked}
          onCheckedChange={(v) => store.updateSummary(r.id, { checked: v })}
          aria-label={`Mark ${r.userName} as checked`}
        />
      ),
    },
    {
      key: "notes",
      header: "Notes",
      cell: (r) => <NotesCell row={r} />,
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance Summary"
        description="Aggregate hours, overtime, and leave for any pay period."
        actions={<Button size="sm" onClick={exportCsv}><Download className="size-4" />Export CSV</Button>}
      />

      <div className="flex flex-wrap items-end gap-3 rounded-md border bg-card p-3">
        <div>
          <Label htmlFor="from" className="text-xs">From</Label>
          <Input id="from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 h-9 w-[160px]" />
        </div>
        <div>
          <Label htmlFor="to" className="text-xs">To</Label>
          <Input id="to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 h-9 w-[160px]" />
        </div>
        {(from || to) && (
          <Button variant="ghost" size="sm" onClick={() => { setFrom(""); setTo(""); }}>Clear</Button>
        )}
      </div>

      <DataTable rows={filtered} columns={cols} searchKeys={["userName", "client", "range"]} />
    </div>
  );
}

function NotesCell({ row }: { row: AttendanceSummary }) {
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
          placeholder="Add context for this pay period…"
          className="mt-1.5"
        />
        <div className="mt-2 flex justify-end">
          <Button size="sm" onClick={() => { store.updateSummary(row.id, { notes: value.trim() || undefined }); toast.success("Notes saved"); }}>
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
