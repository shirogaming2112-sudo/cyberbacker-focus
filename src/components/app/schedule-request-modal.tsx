import { useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";
import { clients } from "@/mock/data";
import { store } from "@/lib/mock-store";
import { toast } from "sonner";
import type { Schedule, ScheduleDay } from "@/mock/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: Schedule | null;
};

function emptyDays(): ScheduleDay[] {
  return DAYS.map((d) => ({ day: d, clockIn: null, clockOut: null, lunchMinutes: 0, breakMinutes: 0 }));
}

export function ScheduleRequestModal({ open, onOpenChange, initial }: Props) {
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState(clients[0]?.id ?? "");
  const [timezone, setTimezone] = useState("MST");
  const [days, setDays] = useState<ScheduleDay[]>(emptyDays());

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setClientId(initial?.clientId ?? clients[0]?.id ?? "");
      setTimezone(initial?.timezone ?? "MST");
      setDays(initial?.days ?? emptyDays());
    }
  }, [open, initial]);

  const setDay = (i: number, patch: Partial<ScheduleDay>) => {
    setDays((d) => d.map((x, j) => (i === j ? { ...x, ...patch } : x)));
  };

  const submit = () => {
    if (!name.trim()) { toast.error("Schedule name is required"); return; }
    const today = new Date().toISOString().slice(0, 10);
    const sched: Schedule = {
      id: `s_${Math.random().toString(36).slice(2, 8)}`,
      userId: "u_1",
      name: name.trim(),
      clientId,
      timezone,
      status: "pending",
      createdAt: today,
      updatedAt: today,
      days,
    };
    store.addScheduleRequest(sched);
    toast.success(initial ? "Schedule edit submitted for approval" : "Schedule request submitted");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Edit Schedule" : "New Schedule Request"}</DialogTitle>
          <DialogDescription>
            {initial
              ? "Editing creates a new pending request that supersedes the current schedule on approval."
              : "Define your weekly shift. Your headbacker reviews within 24 hours."}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-info/8 p-3 text-xs">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden />
            <p>Times are saved in <strong>{timezone}</strong>.</p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="sched-name">Schedule Name</Label>
            <Input id="sched-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Northwind Realty · Primary" className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="sched-client">Client</Label>
            <Select value={clientId} onValueChange={setClientId}>
              <SelectTrigger id="sched-client" className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
          {days.map((d, i) => (
            <div key={d.day} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{d.day}</p>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <div>
                  <Label className="text-xs">Clock In</Label>
                  <Input type="time" value={d.clockIn ?? ""} onChange={(e) => setDay(i, { clockIn: e.target.value || null })} className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Lunch (min)</Label>
                  <Input type="number" min={0} value={d.lunchMinutes} onChange={(e) => setDay(i, { lunchMinutes: +e.target.value || 0 })} className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Break (min)</Label>
                  <Input type="number" min={0} value={d.breakMinutes} onChange={(e) => setDay(i, { breakMinutes: +e.target.value || 0 })} className="mt-1 h-9" />
                </div>
                <div>
                  <Label className="text-xs">Clock Out</Label>
                  <Input type="time" value={d.clockOut ?? ""} onChange={(e) => setDay(i, { clockOut: e.target.value || null })} className="mt-1 h-9" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit}>{initial ? "Submit Edit" : "Submit Request"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
