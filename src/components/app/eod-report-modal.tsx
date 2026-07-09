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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Paperclip, FileText } from "lucide-react";
import { clients } from "@/mock/data";
import { store, useStore } from "@/lib/mock-store";
import { toast } from "sonner";
import type { EodReport, EodFile } from "@/mock/types";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function EodReportModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const allSchedules = useStore((s) => s.schedules);
  const schedules = useMemo(() => allSchedules.filter((x) => x.userId === "u_1"), [allSchedules]);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [scheduleId, setScheduleId] = useState<string>(schedules[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [summary, setSummary] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [blockers, setBlockers] = useState<string[]>([]);
  const [files, setFiles] = useState<EodFile[]>([]);

  const scheduleOptions = useMemo(
    () => schedules.filter((s) => !clientId || s.clientId === clientId),
    [schedules, clientId],
  );

  const onFilesPicked = async (list: FileList | null) => {
    if (!list) return;
    const next: EodFile[] = [];
    for (const f of Array.from(list)) {
      if (f.size > MAX_FILE_BYTES) { toast.error(`${f.name} exceeds 2 MB`); continue; }
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
    if (!summary.trim()) { toast.error("Summary is required"); return; }
    const r: EodReport = {
      id: `e_${Math.random().toString(36).slice(2, 8)}`,
      userId: "u_1",
      clientId,
      scheduleId: scheduleId || undefined,
      date,
      summary: summary.trim(),
      highlights: highlights.map((h) => h.trim()).filter(Boolean),
      blockers: blockers.map((b) => b.trim()).filter(Boolean),
      attachments: files.length,
      files,
      status: "submitted",
    };
    store.addEod(r);
    toast.success("EOD report submitted");
    onOpenChange(false);
    setSummary(""); setHighlights([""]); setBlockers([]); setFiles([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New EOD Report</DialogTitle>
          <DialogDescription>Share what shipped, what's next, and what's blocked.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="eod-client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="eod-client" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="eod-date">Date</Label>
            <Input id="eod-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="eod-schedule">Schedule</Label>
            <Select value={scheduleId} onValueChange={setScheduleId}>
              <SelectTrigger id="eod-schedule" className="mt-1.5">
                <SelectValue placeholder={scheduleOptions.length ? "Choose a schedule" : "No schedules for this client"} />
              </SelectTrigger>
              <SelectContent>
                {scheduleOptions.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="eod-summary">Summary</Label>
          <Textarea id="eod-summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What did you ship today?" className="mt-1.5" />
        </div>

        <ListEditor label="Highlights" items={highlights} setItems={setHighlights} placeholder="e.g. Closed 4 buyer leads" />
        <ListEditor label="Blockers" items={blockers} setItems={setBlockers} placeholder="e.g. Waiting on copy approval" />

        <div>
          <Label>Attachments</Label>
          <div className="mt-1.5">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted">
              <Paperclip className="size-4" aria-hidden />
              <span>Add files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => { onFilesPicked(e.target.files); e.currentTarget.value = ""; }}
              />
            </label>
            <p className="mt-1 text-xs text-muted-foreground">Max 2 MB per file.</p>
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
          <Button onClick={submit}>Submit Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ListEditor({ label, items, setItems, placeholder }: { label: string; items: string[]; setItems: (v: string[]) => void; placeholder: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <Input value={it} onChange={(e) => setItems(items.map((x, j) => (i === j ? e.target.value : x)))} placeholder={placeholder} />
            <Button size="icon" variant="outline" aria-label={`Remove ${label} ${i + 1}`} onClick={() => setItems(items.filter((_, j) => j !== i))}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
        <Button size="sm" variant="outline" onClick={() => setItems([...items, ""])}>
          <Plus className="size-3.5" /> Add {label.toLowerCase().replace(/s$/, "")}
        </Button>
      </div>
    </div>
  );
}
