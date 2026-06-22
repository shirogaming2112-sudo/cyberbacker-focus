import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, schedules } from "@/mock/data";

export const Route = createFileRoute("/_app/schedules")({
  head: () => ({ meta: [{ title: "Schedules — Cyberbacker" }] }),
  component: Schedules,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function Schedules() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-5">
      <PageHeader
        title="Schedules"
        description="Manage your weekly schedules across clients."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" />Request Schedule
          </Button>
        }
      />

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 grid gap-4 md:grid-cols-2">
          {schedules.map((s) => {
            const client = clients.find((c) => c.id === s.clientId);
            return (
              <Card key={s.id} className="shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">{client?.name}</p>
                      <h3 className="truncate font-display text-base font-semibold">{s.name}</h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">Timezone · {s.timezone}</p>
                    </div>
                    <StatusBadge tone={statusToTone(s.status)}>{s.status}</StatusBadge>
                  </div>
                  <div className="mt-4 grid grid-cols-7 gap-1.5">
                    {s.days.map((d) => (
                      <div key={d.day} className="rounded-md border bg-muted/40 p-1.5 text-center">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{d.day}</p>
                        <p className="mt-1 text-[11px] font-medium tabular-nums">
                          {d.clockIn ? `${d.clockIn}–${d.clockOut}` : "Off"}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="p-4">
              <div className="grid grid-cols-7 gap-2">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium uppercase text-muted-foreground">{d}</div>
                ))}
                {Array.from({ length: 35 }).map((_, i) => {
                  const dayN = i - 2;
                  const isShift = dayN > 0 && dayN <= 28 && i % 7 < 5;
                  return (
                    <div key={i} className="min-h-20 rounded-md border bg-card p-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium tabular-nums">{dayN > 0 && dayN <= 28 ? dayN : ""}</span>
                      </div>
                      {isShift && (
                        <span className="mt-2 block rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          9–5 MST
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card className="shadow-soft">
            <CardContent className="p-4 text-sm text-muted-foreground">
              View past schedule revisions in <Link to="/schedule-requests" className="text-primary underline-offset-2 hover:underline">Schedule Requests</Link>.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <RequestScheduleDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function RequestScheduleDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Request Schedule Change</DialogTitle>
          <DialogDescription>Define your weekly shift. Times entered in your local timezone are stored in MST.</DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-info/8 p-3 text-xs">
          <div className="flex items-start gap-2">
            <Info className="mt-0.5 size-4 shrink-0 text-info" />
            <p>
              Your first schedule is auto-activated. Subsequent requests are reviewed by your headbacker within 24 hours.
              Times are saved in <strong>MST</strong>.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="sname">Schedule Name</Label>
            <Input id="sname" placeholder="e.g. Northwind Realty · Primary" className="mt-1.5" />
          </div>
          <div className="max-h-[40vh] space-y-2 overflow-y-auto pr-1">
            {DAYS.map((day) => (
              <div key={day} className="rounded-lg border p-3">
                <p className="text-sm font-medium">{day}</p>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <FieldTime label="Clock In" />
                  <FieldNum label="Lunch (min)" />
                  <FieldNum label="Break (min)" />
                  <FieldTime label="Clock Out" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onOpenChange(false)}>Submit Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldTime({ label }: { label: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="time" className="mt-1 h-9" />
    </div>
  );
}
function FieldNum({ label }: { label: string }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      <Input type="number" min={0} className="mt-1 h-9" placeholder="0" />
    </div>
  );
}
