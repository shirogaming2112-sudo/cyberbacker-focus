import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { Badge } from "@/components/ui/badge";
import { clients } from "@/mock/data";
import { Clock, Mail } from "lucide-react";

export const Route = createFileRoute("/_app/clients")({
  head: () => ({ meta: [{ title: "Clients — Cyberbacker" }] }),
  component: Clients,
});

function Clients() {
  return (
    <div className="space-y-5">
      <PageHeader title="Clients" description="The accounts you support and your time on each." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {clients.map((c) => (
          <Card key={c.id} className="overflow-hidden shadow-soft">
            <div className="h-2" style={{ background: c.color }} />
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{c.industry}</p>
                  <h3 className="mt-0.5 font-display text-lg font-semibold">{c.name}</h3>
                </div>
                <Badge variant="outline">{c.hoursThisMonth}h this month</Badge>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-3.5" /> {c.schedule}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="size-3.5" /> {c.contact}
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
