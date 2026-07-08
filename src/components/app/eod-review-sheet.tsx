import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, users, schedules as allSchedules } from "@/mock/data";
import { store } from "@/lib/mock-store";
import { toast } from "sonner";
import { Download, FileText, FileDown } from "lucide-react";
import { jsPDF } from "jspdf";
import type { EodReport } from "@/mock/types";

export function EodReviewSheet({
  report,
  open,
  onOpenChange,
}: {
  report: (EodReport & { reviewComment?: string }) | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [comment, setComment] = useState("");
  useEffect(() => { setComment(report?.reviewComment ?? ""); }, [report]);
  if (!report) return null;
  const client = clients.find((c) => c.id === report.clientId);
  const author = users.find((u) => u.id === report.userId);
  const schedule = report.scheduleId ? allSchedules.find((s) => s.id === report.scheduleId) : undefined;
  const files = report.files ?? [];

  const decide = (status: "reviewed" | "flagged") => {
    store.reviewEod(report.id, status, comment.trim() || undefined);
    toast.success(status === "reviewed" ? "EOD approved" : "EOD disapproved");
    onOpenChange(false);
  };

  const downloadFile = (name: string, dataUrl: string) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = name;
    a.click();
  };

  const exportPdf = async () => {
    const doc = new jsPDF({ unit: "pt", format: "letter" });
    const margin = 48;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const wrap = (text: string, size = 11) => {
      doc.setFontSize(size);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      for (const line of lines) {
        if (y > pageHeight - margin) { doc.addPage(); y = margin; }
        doc.text(line, margin, y);
        y += size + 4;
      }
    };

    doc.setFont("helvetica", "bold");
    wrap(`EOD Report · ${report.date}`, 18);
    y += 4;
    doc.setFont("helvetica", "normal");
    wrap(`Cyberbacker: ${author?.name ?? "—"}`);
    wrap(`Client: ${client?.name ?? "—"}`);
    if (schedule) wrap(`Schedule: ${schedule.name}`);
    wrap(`Status: ${report.status}`);
    y += 6;
    doc.setFont("helvetica", "bold"); wrap("Summary", 13);
    doc.setFont("helvetica", "normal"); wrap(report.summary);
    y += 4;
    doc.setFont("helvetica", "bold"); wrap("Highlights", 13);
    doc.setFont("helvetica", "normal");
    if (report.highlights.length === 0) wrap("None");
    else report.highlights.forEach((h) => wrap(`• ${h}`));
    y += 4;
    doc.setFont("helvetica", "bold"); wrap("Blockers", 13);
    doc.setFont("helvetica", "normal");
    if (report.blockers.length === 0) wrap("None");
    else report.blockers.forEach((b) => wrap(`• ${b}`));

    if (report.reviewComment) {
      y += 4;
      doc.setFont("helvetica", "bold"); wrap("Reviewer comment", 13);
      doc.setFont("helvetica", "normal"); wrap(report.reviewComment);
    }

    if (files.length) {
      y += 6;
      doc.setFont("helvetica", "bold"); wrap("Attachments", 13);
      doc.setFont("helvetica", "normal");
      for (const f of files) {
        wrap(`• ${f.name} (${(f.size / 1024).toFixed(0)} KB)`);
        if (f.type.startsWith("image/")) {
          try {
            const maxW = pageWidth - margin * 2;
            const maxH = 260;
            if (y + maxH > pageHeight - margin) { doc.addPage(); y = margin; }
            doc.addImage(f.dataUrl, "PNG", margin, y, maxW, maxH, undefined, "FAST");
            y += maxH + 8;
          } catch { /* ignore image errors */ }
        }
      }
    }

    doc.save(`eod-${author?.name?.replace(/\s+/g, "-") ?? "report"}-${report.date}.pdf`);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>EOD Report · {report.date}</SheetTitle>
          <SheetDescription>
            {author?.name ?? "—"} · {client?.name ?? "—"}
            {schedule && <> · {schedule.name}</>}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusToTone(report.status)}>{report.status}</StatusBadge>
          {files.length > 0 && <Badge variant="secondary">{files.length} file{files.length === 1 ? "" : "s"}</Badge>}
          <Button size="sm" variant="outline" className="ml-auto" onClick={exportPdf}>
            <FileDown className="size-3.5" aria-hidden /> Export PDF
          </Button>
        </div>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Summary</h3>
          <p className="mt-1 text-sm">{report.summary}</p>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Highlights</h3>
          <ul className="mt-1 space-y-1">
            {report.highlights.length === 0 && <li className="text-sm text-muted-foreground">None</li>}
            {report.highlights.map((h, i) => (
              <li key={i} className="rounded-md border bg-muted/40 px-2.5 py-1.5 text-sm">{h}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Blockers</h3>
          <ul className="mt-1 space-y-1">
            {report.blockers.length === 0 && <li className="text-sm text-muted-foreground">None</li>}
            {report.blockers.map((b, i) => (
              <li key={i} className="rounded-md border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-sm">{b}</li>
            ))}
          </ul>
        </section>

        {files.length > 0 && (
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Attachments</h3>
            <ul className="mt-1 space-y-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 rounded-md border bg-card px-2.5 py-1.5 text-sm">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{(f.size / 1024).toFixed(0)} KB</span>
                  <Button size="icon" variant="ghost" aria-label={`Download ${f.name}`} onClick={() => downloadFile(f.name, f.dataUrl)}>
                    <Download className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div>
          <Label htmlFor="eod-comment">Review comment (optional)</Label>
          <Textarea id="eod-comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="mt-1.5" placeholder="Leave context for the cyberbacker…" />
        </div>

        <div className="mt-auto flex gap-2 pt-2">
          <Button variant="outline" className="flex-1" onClick={() => decide("flagged")}>Disapprove</Button>
          <Button className="flex-1" onClick={() => decide("reviewed")}>Approve</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
