import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, FileText, X } from "lucide-react";
import { store, useStore } from "@/lib/mock-store";
import { getPtoCredits } from "@/lib/pto";
import { toast } from "sonner";
import type { EodFile } from "@/mock/types";
import type { PtoRequest } from "@/mock/pto";

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function addDaysIso(iso: string, days: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function PtoRequestModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const ptoStatus = useStore((s) => s.ptoStatus);
  const requests = useStore((s) => s.ptoRequests);
  const credits = useMemo(() => getPtoCredits(requests, ptoStatus), [requests, ptoStatus]);

  const today = new Date().toISOString().slice(0, 10);
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState(today);
  const [reason, setReason] = useState("");
  const [files, setFiles] = useState<EodFile[]>([]);

  const canRequest = credits.available > 0;
  const maxDays = credits.available;
  const endDate = useMemo(() => addDaysIso(startDate, Math.max(0, days - 1)), [startDate, days]);

  const onFilesPicked = async (list: FileList | null) => {
    if (!list) return;
    const next: EodFile[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_BYTES) { toast.error(`${f.name} exceeds 10 MB`); continue; }
      try {
        const dataUrl = await fileToDataUrl(f);
        next.push({ name: f.name, size: f.size, type: f.type || "application/octet-stream", dataUrl });
      } catch {
        toast.error(`Couldn't read ${f.name}`);
      }
    }
    if (next.length) setFiles((prev) => [...prev, ...next]);
  };

  const submit = () => {
    if (!canRequest) { toast.error("No PTO credits available"); return; }
    if (days < 1 || days > maxDays) { toast.error(`Days must be between 1 and ${maxDays}`); return; }
    if (!reason.trim()) { toast.error("Reason is required"); return; }
    const r: PtoRequest = {
      id: `pto_${Math.random().toString(36).slice(2, 8)}`,
      userId: "u_1",
      days,
      startDate,
      endDate,
      reason: reason.trim(),
      status: "pending",
      files,
      createdAt: today,
    };
    store.addPtoRequest(r);
    toast.success("PTO request submitted");
    onOpenChange(false);
    setDays(1); setReason(""); setFiles([]); setStartDate(today);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Request PTO</DialogTitle>
          <DialogDescription>
            {ptoStatus === "eligible"
              ? `You have ${credits.available} of ${credits.earned} credit${credits.earned === 1 ? "" : "s"} available this year.`
              : "Your account is not currently eligible to accrue PTO."}
          </DialogDescription>
        </DialogHeader>

        {!canRequest && (
          <div className="rounded-md border border-amber-300/60 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
            No PTO credits available. You accrue 1 credit per quarter while eligible.
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="pto-days">Days</Label>
            <Input
              id="pto-days"
              type="number"
              min={1}
              max={Math.max(1, maxDays)}
              value={days}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (Number.isFinite(v)) setDays(Math.max(1, Math.min(maxDays || 1, Math.floor(v))));
              }}
              disabled={!canRequest}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">Max {maxDays} available.</p>
          </div>
          <div>
            <Label htmlFor="pto-start">Start date</Label>
            <Input
              id="pto-start"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              disabled={!canRequest}
              className="mt-1.5"
            />
            <p className="mt-1 text-xs text-muted-foreground">Ends {endDate}</p>
          </div>
        </div>

        <div>
          <Label htmlFor="pto-reason">Reason</Label>
          <Textarea
            id="pto-reason"
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why do you need this time off?"
            disabled={!canRequest}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Proof of client agreement</Label>
          <div className="mt-1.5">
            <label className={`inline-flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm ${canRequest ? "cursor-pointer hover:bg-muted" : "cursor-not-allowed opacity-60"}`}>
              <Paperclip className="size-4" aria-hidden />
              <span>Add files</span>
              <input
                type="file"
                multiple
                className="hidden"
                disabled={!canRequest}
                onChange={(e) => { onFilesPicked(e.target.files); e.currentTarget.value = ""; }}
              />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Max 10 MB per file.</p>
          </div>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-sm">
                  <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{f.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{(f.size / 1024).toFixed(0)} KB</span>
                  <Button size="icon" variant="ghost" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}>
                    <X className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={!canRequest}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
