import { useEffect, useMemo, useState } from "react";
import { Play, Square, Coffee, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/mock-store";
import { clients } from "@/mock/data";
import { toast } from "sonner";

type Mode = "idle" | "working" | "break";

function fmt(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function ClockWidget({
  shiftHours = 8,
  className,
  compact = false,
}: {
  shiftHours?: number;
  className?: string;
  compact?: boolean;
}) {
  const allSchedules = useStore((s) => s.schedules);
  const schedules = useMemo(
    () => allSchedules.filter((x) => x.userId === "u_1" && x.status === "active"),
    [allSchedules],
  );
  const [mode, setMode] = useState<Mode>("idle");
  const [worked, setWorked] = useState(0);
  const [breakSec, setBreakSec] = useState(0);
  const [scheduleId, setScheduleId] = useState<string>(schedules[0]?.id ?? "");

  useEffect(() => {
    if (mode === "idle") return;
    const id = setInterval(() => {
      if (mode === "working") setWorked((v) => v + 1);
      else setBreakSec((v) => v + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [mode]);

  const startClock = () => {
    if (!scheduleId) { toast.error("Select a schedule to clock in with"); return; }
    const sched = schedules.find((s) => s.id === scheduleId);
    const client = clients.find((c) => c.id === sched?.clientId);
    setMode("working");
    toast.success(`Clocked in · ${client?.name ?? sched?.name ?? "Schedule"}`);
  };


  const total = shiftHours * 3600;
  const pct = Math.min(100, (worked / total) * 100);
  const r = 64;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;

  return (
    <Card className={cn("relative overflow-hidden p-5 shadow-card", className)}>
      <div className="pointer-events-none absolute -right-12 -top-12 size-48 rounded-full bg-accent/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 size-48 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Today</p>
          <h2 className="font-display text-xl font-semibold">Time Tracking</h2>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            mode === "working" && "border-success/30 bg-success/10 text-success",
            mode === "break" && "border-warning/30 bg-warning/15 text-warning-foreground",
            mode === "idle" && "border-border bg-muted text-muted-foreground",
          )}
        >
          <span className={cn("size-1.5 rounded-full bg-current", mode !== "idle" && "animate-pulse")} />
          {mode === "working" ? "On the clock" : mode === "break" ? "On break" : "Not clocked in"}
        </span>
      </div>

      <div className={cn("relative mt-5 grid items-center gap-6", compact ? "grid-cols-1" : "sm:grid-cols-[auto_1fr]")}>
        <div className="relative mx-auto size-40">
          <svg viewBox="0 0 160 160" className="size-40 -rotate-90">
            <circle cx="80" cy="80" r={r} className="fill-none stroke-muted" strokeWidth="10" />
            <circle
              cx="80"
              cy="80"
              r={r}
              className="fill-none stroke-primary transition-all"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="font-display text-2xl font-semibold tabular-nums">{fmt(worked)}</p>
              <p className="text-xs text-muted-foreground">of {shiftHours}h shift</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-md border bg-card p-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Worked</p>
              <p className="mt-0.5 font-display text-sm font-semibold tabular-nums">{fmt(worked)}</p>
            </div>
            <div className="rounded-md border bg-card p-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Break</p>
              <p className="mt-0.5 font-display text-sm font-semibold tabular-nums">{fmt(breakSec)}</p>
            </div>
            <div className="rounded-md border bg-card p-2">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Progress</p>
              <p className="mt-0.5 font-display text-sm font-semibold tabular-nums">{pct.toFixed(0)}%</p>
            </div>
          </div>

          {mode === "idle" && (
            <div>
              <Label htmlFor="clock-schedule" className="text-xs">Schedule</Label>
              <Select value={scheduleId} onValueChange={setScheduleId}>
                <SelectTrigger id="clock-schedule" className="mt-1 h-9">
                  <SelectValue placeholder={schedules.length ? "Choose a schedule" : "No active schedules"} />
                </SelectTrigger>
                <SelectContent>
                  {schedules.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {mode === "working" ? (
              <Button variant="destructive" onClick={() => setMode("idle")}>
                <Square className="size-4" /> Clock Out
              </Button>
            ) : mode === "break" ? (
              <Button onClick={() => setMode("working")}>
                <Play className="size-4" /> Resume
              </Button>
            ) : (
              <Button onClick={startClock} disabled={!scheduleId}>
                <Play className="size-4" /> Clock In
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setMode(mode === "break" ? "working" : "break")}
              disabled={mode === "idle"}
            >
              <Coffee className="size-4" /> {mode === "break" ? "End Break" : "Start Break"}
            </Button>
            <Button variant="outline">
              <FileUp className="size-4" /> Upload EOD
            </Button>
          </div>

        </div>
      </div>
    </Card>
  );
}
