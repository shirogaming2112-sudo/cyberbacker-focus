import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Clock, FileText, Sparkles, TrendingUp, Users, ArrowRight, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { MetricCard } from "@/components/app/metric-card";
import { ClockWidget } from "@/components/app/clock-widget";
import { StatusBadge } from "@/components/app/status-badge";
import { PtoRequestModal } from "@/components/app/pto-request-modal";
import { activity, clients, currentUser, performance, schedules } from "@/mock/data";
import { useStore } from "@/lib/mock-store";
import { getPtoCredits } from "@/lib/pto";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Cyberbacker" }, { name: "description", content: "Your daily attendance and performance summary." }] }),
  component: Dashboard,
});

function computeGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  // Avoid SSR/client mismatch: render a stable string at first, then update client-side.
  const [greeting, setGreeting] = useState("Welcome");
  useEffect(() => { setGreeting(computeGreeting()); }, []);
  const [ptoOpen, setPtoOpen] = useState(false);

  const activeSchedule = schedules.find((s) => s.status === "active");
  const client = clients.find((c) => c.id === activeSchedule?.clientId);

  const ptoStatus = useStore((s) => s.ptoStatus);
  const ptoRequests = useStore((s) => s.ptoRequests);
  const myPto = useMemo(() => ptoRequests.filter((r) => r.userId === "u_1"), [ptoRequests]);
  const credits = useMemo(() => getPtoCredits(myPto, ptoStatus), [myPto, ptoStatus]);
  const approvedThisYear = useMemo(() => {
    const y = String(new Date().getFullYear());
    return myPto.filter((r) => r.status === "approved" && r.startDate.startsWith(y)).length;
  }, [myPto]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`${greeting}, ${currentUser.name.split(" ")[0]}`}
        description="Here's what needs your attention today."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setPtoOpen(true)}>
              <Plane className="size-4" aria-hidden />Request PTO
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/eod-reports"><FileText className="size-4" aria-hidden />New EOD</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/time-tracking"><Sparkles className="size-4" aria-hidden />Open Time Tracking</Link>
            </Button>
          </>
        }
      />

      <Card className="overflow-hidden border-primary/15 bg-gradient-to-br from-primary/5 via-accent/8 to-background shadow-soft">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Today's focus
            </p>
            <h2 className="mt-1 font-display text-lg font-semibold">
              {client?.name ?? "No active client"} · {activeSchedule?.timezone ?? "MST"}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Scheduled 9:00 AM – 5:00 PM · 8h shift · 1h lunch
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="success">On track</StatusBadge>
            <Badge variant="secondary" className="font-medium">Pay period 06/15 – 06/29</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-12">
        <ClockWidget className="lg:col-span-8" />
        <div className="grid grid-cols-2 gap-3 lg:col-span-4">
          <MetricCard label="Present Days" value="18" hint="of 20 working days" icon={Calendar} trend={{ value: "+2", direction: "up" }} />
          <MetricCard label="Hours This Week" value="32.5" hint="goal 40h" icon={Clock} trend={{ value: "+4h", direction: "up" }} />
          <MetricCard label="Hours This Month" value="142" hint="of 160 target" icon={TrendingUp} trend={{ value: "+12%", direction: "up" }} />
          <MetricCard label="Attendance %" value="96%" hint="last 30 days" icon={Users} trend={{ value: "+1.2", direction: "up" }} />
          <MetricCard label="Late Count" value="2" hint="this period" icon={Clock} trend={{ value: "-1", direction: "down" }} />
          <MetricCard label="Overtime Hours" value="3.5" hint="this month" icon={Sparkles} trend={{ value: "+0.5", direction: "up" }} />
          <MetricCard
            label="Approved PTO"
            value={String(approvedThisYear)}
            hint={`${credits.available} of ${credits.earned} credits available`}
            icon={Plane}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="shadow-soft lg:col-span-7">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-display text-base font-semibold">Recent Activity</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/time-history">History <ArrowRight className="size-3.5" aria-hidden /></Link>
              </Button>
            </div>
            <ul className="divide-y">
              {activity.map((a) => (
                <li key={a.id} className="flex items-start gap-3 p-3 text-sm">
                  <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate">{a.text}</p>
                    <p className="text-xs text-muted-foreground">{a.at}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-soft lg:col-span-5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-semibold">Performance Summary</h3>
              <Badge variant="outline" className="text-xs">last 30 days</Badge>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              {[
                { label: "Attendance", value: performance.attendance },
                { label: "Consistency", value: performance.consistency },
                { label: "Productivity", value: performance.productivity },
              ].map((s) => (
                <div key={s.label} className="rounded-lg border p-3">
                  <ScoreRing value={s.value} />
                  <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative mx-auto size-16">
      <svg viewBox="0 0 60 60" className="size-16 -rotate-90" aria-hidden>
        <circle cx="30" cy="30" r={r} className="fill-none stroke-muted" strokeWidth="6" />
        <circle cx="30" cy="30" r={r} className="fill-none stroke-primary" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-sm font-semibold">{value}</span>
      <span className="sr-only">{value} percent</span>
    </div>
  );
}
