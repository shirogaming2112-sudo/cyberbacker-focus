import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Download, Upload, Plane } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { users } from "@/mock/data";
import { useStore } from "@/lib/mock-store";
import { getPtoCredits } from "@/lib/pto";
import type { PtoRequest, PtoStatus } from "@/mock/pto";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/admin/pto")({
  head: () => ({ meta: [{ title: "PTO Management — Admin" }] }),
  component: AdminPtoPage,
});

type Row = {
  id: string;
  userId: string;
  userName: string;
  email: string;
  role: string;
  status: PtoStatus;
  earned: number;
  used: number;
  pending: number;
  available: number;
  requests: PtoRequest[];
};

function AdminPtoPage() {
  const ptoStatus = useStore((s) => s.ptoStatus);
  const requests = useStore((s) => s.ptoRequests);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);

  const rows: Row[] = useMemo(() => users.map((u) => {
    const userReqs = requests.filter((r) => r.userId === u.id);
    // Fallback: assume every seeded user is eligible for demo purposes.
    const status: PtoStatus = u.id === "u_1" ? ptoStatus : "eligible";
    const credits = getPtoCredits(userReqs, status);
    return {
      id: u.id,
      userId: u.id,
      userName: u.name,
      email: u.email,
      role: u.title,
      status,
      earned: credits.earned,
      used: credits.usedApproved,
      pending: credits.pending,
      available: credits.available,
      requests: userReqs,
    };
  }), [requests, ptoStatus]);

  const cols: Column<Row>[] = [
    { key: "user", header: "User", cell: (r) => <div><p className="font-medium">{r.userName}</p><p className="text-xs text-muted-foreground">{r.email}</p></div> },
    { key: "role", header: "Role", cell: (r) => r.role },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={r.status === "eligible" ? "success" : "muted"}>{r.status}</StatusBadge> },
    { key: "earned", header: "Earned", cell: (r) => <span className="tabular-nums">{r.earned}</span> },
    { key: "used", header: "Used", cell: (r) => <span className="tabular-nums">{r.used}</span> },
    { key: "pending", header: "Pending", cell: (r) => <span className="tabular-nums">{r.pending}</span> },
    { key: "avail", header: "Available", cell: (r) => <span className="font-medium tabular-nums">{r.available}</span> },
    { key: "reqs", header: "Requests", cell: (r) => <Badge variant="secondary">{r.requests.length}</Badge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => <Button size="sm" variant="outline" onClick={() => setSelected(r)}>View</Button>,
    },
  ];

  const exportCsv = () => {
    const headers = ["User", "Email", "Role", "Status", "Earned", "Used", "Pending", "Available", "Requests"];
    const lines = [
      headers.join(","),
      ...rows.map((r) => [r.userName, r.email, r.role, r.status, r.earned, r.used, r.pending, r.available, r.requests.length]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pto-credits-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importCsv = async (list: FileList | null) => {
    const f = list?.[0];
    if (!f) return;
    // Placeholder: real implementation POSTs to the backend.
    // For now we just acknowledge the file.
    toast.success(`Queued ${f.name} (${(f.size / 1024).toFixed(0)} KB) for backend import`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="PTO Management"
        description="Credits by user, active requests, and bulk import/export."
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv,.xlsx" className="hidden" onChange={(e) => { importCsv(e.target.files); e.currentTarget.value = ""; }} />
            <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Upload className="size-4" />Import</Button>
            <Button size="sm" variant="outline" onClick={exportCsv}><Download className="size-4" />Export CSV</Button>
          </>
        }
      />
      <DataTable rows={rows} columns={cols} searchKeys={["userName", "email", "role", "status"]} searchPlaceholder="Search user, role, status…" />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2"><Plane className="size-4" />{selected.userName}</SheetTitle>
                <SheetDescription>{selected.role} · {selected.email}</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: "Earned", v: selected.earned },
                  { l: "Used", v: selected.used },
                  { l: "Pending", v: selected.pending },
                  { l: "Available", v: selected.available },
                ].map((s) => (
                  <div key={s.l} className="rounded-md border p-2">
                    <p className="text-lg font-semibold tabular-nums">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requests</h4>
                {selected.requests.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">No PTO requests yet.</p>
                ) : (
                  <ul className="mt-1 divide-y rounded-md border">
                    {selected.requests.map((r) => (
                      <li key={r.id} className="p-2.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-medium">{r.startDate} → {r.endDate} · {r.days}d</p>
                          <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
                        {r.files && r.files.length > 0 && (
                          <p className="mt-1 text-xs text-muted-foreground">{r.files.length} file(s) attached</p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
