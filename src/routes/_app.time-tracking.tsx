import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { ClockWidget } from "@/components/app/clock-widget";
import { MetricCard } from "@/components/app/metric-card";
import { Clock, Coffee, Timer, Calendar } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { performance } from "@/mock/data";

export const Route = createFileRoute("/_app/time-tracking")({
  head: () => ({ meta: [{ title: "Time Tracking — Cyberbacker" }] }),
  component: TimeTracking,
});

const timeline = [
  { label: "Clock in", time: "08:58 AM", tone: "bg-success" },
  { label: "Work", time: "08:58 – 10:45", tone: "bg-primary" },
  { label: "Short break", time: "10:45 – 11:00", tone: "bg-warning" },
  { label: "Work", time: "11:00 – 12:30", tone: "bg-primary" },
  { label: "Lunch", time: "12:30 – 01:30", tone: "bg-accent" },
  { label: "Work", time: "01:30 – now", tone: "bg-primary" },
];

function TimeTracking() {
  return (
    <div className="space-y-5">
      <PageHeader title="Time Tracking" description="Clock in, manage breaks, and review your daily timeline." />

      <div className="grid gap-5 lg:grid-cols-12">
        <ClockWidget className="lg:col-span-7" />
        <div className="grid grid-cols-2 gap-3 lg:col-span-5">
          <MetricCard label="Worked Today" value="5h 42m" icon={Clock} />
          <MetricCard label="Break Today" value="1h 15m" icon={Coffee} />
          <MetricCard label="Avg Daily" value="7.8h" icon={Timer} hint="last 14 days" />
          <MetricCard label="Sessions" value="4" icon={Calendar} hint="this week" />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="shadow-soft lg:col-span-5">
          <CardContent className="p-4">
            <h3 className="font-display text-base font-semibold">Daily Timeline</h3>
            <ol className="mt-4 space-y-3 border-l pl-4">
              {timeline.map((t, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[21px] top-1.5 size-2.5 rounded-full ${t.tone}`} />
                  <p className="text-sm font-medium">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.time}</p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card className="shadow-soft lg:col-span-7">
          <CardContent className="p-4">
            <h3 className="font-display text-base font-semibold">Weekly Hours</h3>
            <p className="text-xs text-muted-foreground">Last 8 weeks of worked + overtime hours</p>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance.weekly}>
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
                  <Bar dataKey="hours" stackId="a" fill="var(--primary)" radius={[0,0,0,0]} />
                  <Bar dataKey="overtime" stackId="a" fill="var(--accent)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
