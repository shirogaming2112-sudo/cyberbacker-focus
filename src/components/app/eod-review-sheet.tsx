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
import { clients, users } from "@/mock/data";
import { store } from "@/lib/mock-store";
import { toast } from "sonner";
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

  const decide = (status: "reviewed" | "flagged") => {
    store.reviewEod(report.id, status, comment.trim() || undefined);
    toast.success(status === "reviewed" ? "EOD approved" : "EOD disapproved");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>EOD Report · {report.date}</SheetTitle>
          <SheetDescription>
            {author?.name ?? "—"} · {client?.name ?? "—"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={statusToTone(report.status)}>{report.status}</StatusBadge>
          {report.attachments > 0 && <Badge variant="secondary">{report.attachments} file</Badge>}
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
