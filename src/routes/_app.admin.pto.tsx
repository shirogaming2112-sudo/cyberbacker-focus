import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Check, CheckCircle2, Download, Upload, Plane, X, XCircle } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { users, currentUser } from "@/mock/data";
import { store, useStore } from "@/lib/mock-store";
import { getPtoCredits } from "@/lib/pto";
import type { PtoRequest, PtoStatus } from "@/mock/pto";
import { failedRowsToCsv, submitPtoImport, type PtoImportResult } from "@/lib/pto-import";
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
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<PtoImportResult | null>(null);

  const rows: Row[] = useMemo(() => users.map((u) => {
    const userReqs = requests.filter((r) => r.userId === u.id);
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

  // Keep the open sheet in sync with the latest store data
  const selectedLive = selected ? rows.find((r) => r.id === selected.id) ?? null : null;

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
      cell: (r) => <Button size="sm" variant="outline" onClick={() => setSelected(r)} aria-label={`View PTO details for ${r.userName}`}>View</Button>,
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
    setImporting(true);
    try {
      const result = await submitPtoImport(f);
      // Log each succeeded row so the audit trail reflects the import.
      result.succeeded.forEach((s) => {
        store.logChange({
          userId: users.find((u) => u.email.toLowerCase() === s.userEmail.toLowerCase())?.id ?? "unknown",
          field: `PTO import · status`,
          from: "—",
          to: `${s.status} (${s.credits} credits)`,
          updatedBy: currentUser.name,
        });
      });
      setImportResult(result);
      if (result.failed.length === 0) toast.success(`Imported ${result.succeeded.length} row(s)`);
      else toast.warning(`${result.succeeded.length} succeeded, ${result.failed.length} failed`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const downloadFailed = () => {
    if (!importResult?.failed.length) return;
    const csv = failedRowsToCsv(importResult.failed);
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `pto-import-failed-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const decide = (req: PtoRequest, next: "approved" | "rejected") => {
    const prev = req.status;
    if (prev === next) return;
    store.updatePtoRequest(req.id, { status: next });
    store.logChange({
      userId: req.userId,
      field: `PTO ${req.startDate}→${req.endDate} (${req.days}d)`,
      from: prev,
      to: next,
      updatedBy: currentUser.name,
    });
    toast.success(next === "approved" ? "PTO approved" : "PTO disapproved");
  };

  const approveAllPending = (row: Row) => {
    const pending = row.requests.filter((r) => r.status === "pending");
    if (!pending.length) return;
    pending.forEach((r) => decide(r, "approved"));
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="PTO Management"
        description="Credits by user, active requests, and bulk import/export."
        actions={
          <>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => { importCsv(e.target.files); e.currentTarget.value = ""; }}
              aria-label="Upload PTO CSV"
            />
            <Button size="sm" variant="outline" disabled={importing} onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" />{importing ? "Importing…" : "Import"}
            </Button>
            <Button size="sm" variant="outline" onClick={exportCsv}><Download className="size-4" />Export CSV</Button>
          </>
        }
      />
      <DataTable rows={rows} columns={cols} searchKeys={["userName", "email", "role", "status"]} searchPlaceholder="Search user, role, status…" />

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
          {selectedLive && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2"><Plane className="size-4" aria-hidden />{selectedLive.userName}</SheetTitle>
                <SheetDescription>{selectedLive.role} · {selectedLive.email}</SheetDescription>
              </SheetHeader>
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { l: "Earned", v: selectedLive.earned },
                  { l: "Used", v: selectedLive.used },
                  { l: "Pending", v: selectedLive.pending },
                  { l: "Available", v: selectedLive.available },
                ].map((s) => (
                  <div key={s.l} className="rounded-md border p-2">
                    <p className="text-lg font-semibold tabular-nums">{s.v}</p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Requests</h4>
                  {selectedLive.requests.some((r) => r.status === "pending") && (
                    <Button size="sm" variant="outline" onClick={() => approveAllPending(selectedLive)} aria-label={`Approve all pending PTO requests for ${selectedLive.userName}`}>
                      Approve all pending
                    </Button>
                  )}
                </div>
                {selectedLive.requests.length === 0 ? (
                  <p className="mt-1 text-sm text-muted-foreground">No PTO requests yet.</p>
                ) : (
                  <ul className="mt-1 divide-y rounded-md border" aria-live="polite">
                    {selectedLive.requests.map((r) => {
                      const decided = r.status !== "pending";
                      return (
                        <li key={r.id} className="p-2.5 text-sm">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">{r.startDate} → {r.endDate} · {r.days}d</p>
                            <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">{r.reason}</p>
                          {r.files && r.files.length > 0 && (
                            <p className="mt-1 text-xs text-muted-foreground">{r.files.length} file(s) attached</p>
                          )}
                          <div role="group" aria-label="Decision" className="mt-2 flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={decided}
                              aria-disabled={decided}
                              aria-label={`Disapprove PTO ${r.startDate} to ${r.endDate} for ${selectedLive.userName}`}
                              onClick={() => decide(r, "rejected")}
                            >
                              <X className="size-3.5" aria-hidden />Disapprove
                            </Button>
                            <Button
                              size="sm"
                              disabled={decided}
                              aria-disabled={decided}
                              aria-label={`Approve PTO ${r.startDate} to ${r.endDate} for ${selectedLive.userName}`}
                              onClick={() => decide(r, "approved")}
                            >
                              <Check className="size-3.5" aria-hidden />Approve
                            </Button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!importResult} onOpenChange={(o) => !o && setImportResult(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>PTO import results</DialogTitle>
            <DialogDescription>
              Processed {importResult?.processed ?? 0} row(s): {importResult?.succeeded.length ?? 0} succeeded, {importResult?.failed.length ?? 0} failed.
            </DialogDescription>
          </DialogHeader>
          {importResult && (
            <Tabs defaultValue={importResult.failed.length ? "failed" : "succeeded"}>
              <TabsList>
                <TabsTrigger value="succeeded">
                  <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden />
                  Succeeded ({importResult.succeeded.length})
                </TabsTrigger>
                <TabsTrigger value="failed">
                  <XCircle className="size-3.5 text-destructive" aria-hidden />
                  Failed ({importResult.failed.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="succeeded" className="mt-3">
                {importResult.succeeded.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No successful rows.</p>
                ) : (
                  <div className="max-h-72 overflow-y-auto rounded-md border">
                    <table className="w-full text-sm">
                      <caption className="sr-only">Successfully imported PTO rows</caption>
                      <thead className="bg-muted/40 text-left text-xs">
                        <tr>
                          <th scope="col" className="px-2 py-1.5">Row</th>
                          <th scope="col" className="px-2 py-1.5">User</th>
                          <th scope="col" className="px-2 py-1.5">Status</th>
                          <th scope="col" className="px-2 py-1.5">Credits</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importResult.succeeded.map((s) => (
                          <tr key={`${s.row}-${s.userEmail}`} className="border-t">
                            <td className="px-2 py-1.5 tabular-nums">{s.row}</td>
                            <td className="px-2 py-1.5">{s.userName} <span className="text-muted-foreground">· {s.userEmail}</span></td>
                            <td className="px-2 py-1.5">{s.status}</td>
                            <td className="px-2 py-1.5 tabular-nums">{s.credits}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="failed" className="mt-3">
                {importResult.failed.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No failed rows.</p>
                ) : (
                  <>
                    <div className="max-h-72 overflow-y-auto rounded-md border">
                      <table className="w-full text-sm">
                        <caption className="sr-only">Failed PTO import rows</caption>
                        <thead className="bg-muted/40 text-left text-xs">
                          <tr>
                            <th scope="col" className="px-2 py-1.5">Row</th>
                            <th scope="col" className="px-2 py-1.5">Values</th>
                            <th scope="col" className="px-2 py-1.5">Error</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.failed.map((f, i) => (
                            <tr key={`${f.row}-${i}`} className="border-t align-top">
                              <td className="px-2 py-1.5 tabular-nums">{f.row}</td>
                              <td className="px-2 py-1.5 text-xs text-muted-foreground">
                                {Object.entries(f.raw).map(([k, v]) => <div key={k}><span className="font-mono">{k}</span>: {v || <em>empty</em>}</div>)}
                              </td>
                              <td className="px-2 py-1.5 text-destructive">{f.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" variant="outline" onClick={downloadFailed}>
                        <Download className="size-4" />Download failed rows
                      </Button>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
