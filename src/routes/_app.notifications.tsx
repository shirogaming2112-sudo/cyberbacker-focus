import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { notifications } from "@/mock/data";
import { CheckCheck } from "lucide-react";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Cyberbacker" }] }),
  component: Notifications,
});

function Notifications() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Everything that needs your attention, in one place."
        actions={<Button variant="outline" size="sm"><CheckCheck className="size-4" />Mark all read</Button>}
      />
      <Card className="shadow-soft">
        <CardContent className="p-0">
          <ul className="divide-y">
            {notifications.map((n) => (
              <li key={n.id} className="flex gap-3 p-4">
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-accent"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{n.title}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">{n.createdAt}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
