import { useState } from "react";
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
import { Plus, X } from "lucide-react";
import { clients } from "@/mock/data";
import { store } from "@/lib/mock-store";
import { toast } from "sonner";
import type { EodReport } from "@/mock/types";

export function EodReportModal({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const today = new Date().toISOString().slice(0, 10);
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [date, setDate] = useState(today);
  const [summary, setSummary] = useState("");
  const [highlights, setHighlights] = useState<string[]>([""]);
  const [blockers, setBlockers] = useState<string[]>([]);

  const submit = () => {
    if (!summary.trim()) { toast.error("Summary is required"); return; }
    const r: EodReport = {
      id: `e_${Math.random().toString(36).slice(2, 8)}`,
      userId: "u_1",
      clientId,
      date,
      summary: summary.trim(),
      highlights: highlights.map((h) => h.trim()).filter(Boolean),
      blockers: blockers.map((b) => b.trim()).filter(Boolean),
      attachments: 0,
      status: "submitted",
    };
    store.addEod(r);
    toast.success("EOD report submitted");
    onOpenChange(false);
    setSummary(""); setHighlights([""]); setBlockers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
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
        </div>

        <div>
          <Label htmlFor="eod-summary">Summary</Label>
          <Textarea id="eod-summary" rows={4} value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What did you ship today?" className="mt-1.5" />
        </div>

        <ListEditor label="Highlights" items={highlights} setItems={setHighlights} placeholder="e.g. Closed 4 buyer leads" />
        <ListEditor label="Blockers" items={blockers} setItems={setBlockers} placeholder="e.g. Waiting on copy approval" />

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
