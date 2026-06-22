import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/page-header";
import { MetricCard } from "@/components/app/metric-card";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { changeLogs, scheduleApprovals, users } from "@/mock/data";
import { ArrowRight, CalendarClock, Clock, ShieldCheck, Users } from "lucide-react";

export const Route = createFileRoute("/_app/admin/")({
  head: () => ({ meta: [{ title: "Admin — Cyberbacker" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const pending = scheduleApprovals.filter((s) => s.status === "pending");
  return (
    <div className="space-y-5">
      <PageHeader
        title="Admin Dashboard"
        description="Manage schedules, attendance, and your team."
        actions={
          <>
            <Badge variant="outline" className="hidden sm:inline-flex">Pay period · Not set</Badge>
            <Button size="sm"><Clock className="size-4" />Set Pay Period</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Active Users" value={users.length} icon={Users} hint="across all clients" />
        <MetricCard label="Pending Approvals" value={pending.length} icon={CalendarClock} hint="schedule requests" trend={{ value: "+1", direction: "up" }} />
        <MetricCard label="Late Today" value={1} icon={Clock} hint="clock-ins" trend={{ value: "-1", direction: "down" }} />
        <MetricCard label="Hours This Period" value={"232.5h"} icon={ShieldCheck} hint="all users" trend={{ value: "+12h", direction: "up" }} />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="shadow-soft lg:col-span-7">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-display text-base font-semibold">Pending Schedule Approvals</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/schedule-approvals">View all <ArrowRight className="size-3.5" /></Link>
              </Button>
            </div>
            {pending.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted-foreground">All caught up.</p>
            ) : (
              <ul className="divide-y">
                {pending.map((p) => (
                  <li key={p.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{p.userName}</p>
                      <p className="truncate text-xs text-muted-foreground">{p.scheduleName} · submitted {p.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">Reject</Button>
                      <Button size="sm">Approve</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-soft lg:col-span-5">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-4">
              <h3 className="font-display text-base font-semibold">Recent Change Logs</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/admin/change-logs">All logs <ArrowRight className="size-3.5" /></Link>
              </Button>
            </div>
            <ul className="divide-y">
              {changeLogs.slice(0, 5).map((c) => (
                <li key={c.id} className="p-3 text-sm">
                  <p className="truncate">
                    <span className="font-medium">{c.field}</span> updated{" "}
                    <span className="text-muted-foreground">{c.from} → {c.to}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{c.updatedBy} · {c.updatedAt}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-0">
          <div className="border-b p-4">
            <h3 className="font-display text-base font-semibold">Latest Approvals</h3>
          </div>
          <ul className="divide-y">
            {scheduleApprovals.map((s) => (
              <li key={s.id} className="grid grid-cols-[1fr_auto] items-center gap-3 p-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.userName}</p>
                  <p className="truncate text-xs text-muted-foreground">{s.scheduleName}</p>
                </div>
                <StatusBadge tone={statusToTone(s.status)}>{s.status}</StatusBadge>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
