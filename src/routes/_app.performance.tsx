import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { performance } from "@/mock/data";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export const Route = createFileRoute("/_app/performance")({
  head: () => ({ meta: [{ title: "Performance — Cyberbacker" }] }),
  component: Performance,
});

const scores = [
  { label: "Attendance", value: performance.attendance, desc: "Days present vs. scheduled" },
  { label: "Consistency", value: performance.consistency, desc: "On-time clock-ins" },
  { label: "Productivity", value: performance.productivity, desc: "EOD review score" },
];

function Performance() {
  return (
    <div className="space-y-5">
      <PageHeader title="Performance" description="Your trailing 8-week performance across attendance, consistency, and productivity." />

      <div className="grid gap-4 md:grid-cols-3">
        {scores.map((s) => (
          <Card key={s.label} className="shadow-soft">
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{s.value}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary" style={{ width: `${s.value}%` }} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-soft">
        <CardContent className="p-4">
          <h3 className="font-display text-base font-semibold">Hours Trend</h3>
          <p className="text-xs text-muted-foreground">Worked hours over the last 8 weeks</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performance.weekly}>
                <defs>
                  <linearGradient id="hrs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="var(--primary)" fill="url(#hrs)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
