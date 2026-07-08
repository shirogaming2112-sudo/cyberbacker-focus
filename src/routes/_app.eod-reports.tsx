import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Download, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, schedules as allSchedules } from "@/mock/data";
import { useStore } from "@/lib/mock-store";
import { EodReportModal } from "@/components/app/eod-report-modal";

export const Route = createFileRoute("/_app/eod-reports")({
  head: () => ({ meta: [{ title: "EOD Reports — Cyberbacker" }] }),
  component: EodPage,
});

function EodPage() {
  const reports = useStore((s) => s.eod);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const current = reports.find((r) => r.id === selectedId) ?? reports[0];

  return (
    <div className="space-y-5">
      <PageHeader
        title="EOD Reports"
        description="Wrap up your day. Share what shipped, what's next, and what's blocked."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" aria-hidden /> New Report
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <div className="border-b p-3">
              <h3 className="font-display text-sm font-semibold">Recent</h3>
            </div>
            <ul className="divide-y">
              {reports.map((r) => {
                const client = clients.find((c) => c.id === r.clientId);
                const active = (current?.id ?? null) === r.id;
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelectedId(r.id)}
                      className={`block w-full px-3 py-2.5 text-left text-sm hover:bg-muted/60 focus-visible:outline-none focus-visible:bg-muted ${active ? "bg-muted" : ""}`}
                      aria-current={active ? "true" : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                        <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge>
                      </div>
                      <p className="mt-0.5 truncate font-medium">{client?.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{r.summary}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-5">
            {!current ? (
              <p className="text-sm text-muted-foreground">No reports yet. Click "New Report" to create one.</p>
            ) : (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{current.date}</p>
                    <h2 className="font-display text-lg font-semibold">
                      {clients.find((c) => c.id === current.clientId)?.name ?? "—"}
                    </h2>
                    {current.scheduleId && (
                      <p className="text-xs text-muted-foreground">
                        {allSchedules.find((s) => s.id === current.scheduleId)?.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={statusToTone(current.status)}>{current.status}</StatusBadge>
                    {(current.files?.length ?? current.attachments) > 0 && (
                      <Badge variant="secondary">{current.files?.length ?? current.attachments} file{(current.files?.length ?? current.attachments) === 1 ? "" : "s"}</Badge>
                    )}
                  </div>
                </div>

                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</h3>
                  <p className="mt-1 text-sm">{current.summary}</p>
                </section>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highlights</h3>
                    {current.highlights.length === 0 ? (
                      <p className="mt-1 text-sm text-muted-foreground">None</p>
                    ) : (
                      <ul className="mt-1 space-y-1.5">
                        {current.highlights.map((h, i) => (
                          <li key={i} className="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-sm">
                            <span className="size-1.5 rounded-full bg-success" aria-hidden />{h}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blockers</h3>
                    {current.blockers.length === 0 ? (
                      <p className="mt-1 rounded-md border border-dashed bg-card p-3 text-xs text-muted-foreground">No blockers reported.</p>
                    ) : (
                      <ul className="mt-1 space-y-1.5">
                        {current.blockers.map((b, i) => (
                          <li key={i} className="flex items-center gap-2 rounded-md border bg-warning/10 px-2.5 py-1.5 text-sm">
                            <span className="size-1.5 rounded-full bg-warning" aria-hidden />{b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                </div>

                {current.files && current.files.length > 0 && (
                  <section className="mt-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments</h3>
                    <ul className="mt-1 space-y-1.5">
                      {current.files.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm">
                          <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                          <span className="min-w-0 flex-1 truncate">{f.name}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{(f.size / 1024).toFixed(0)} KB</span>
                          <a href={f.dataUrl} download={f.name} aria-label={`Download ${f.name}`} className="rounded p-1 hover:bg-muted">
                            <Download className="size-4" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {"reviewComment" in current && current.reviewComment && (
                  <section className="mt-4 rounded-md border bg-info/8 p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reviewer comment</h3>
                    <p className="mt-1 text-sm">{current.reviewComment}</p>
                  </section>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <EodReportModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
