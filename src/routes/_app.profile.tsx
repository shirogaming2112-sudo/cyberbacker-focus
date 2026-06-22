import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/app/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Globe2, Briefcase, ShieldCheck } from "lucide-react";
import { currentUser } from "@/mock/data";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({ meta: [{ title: "Profile — Cyberbacker" }] }),
  component: Profile,
});

function Profile() {
  const initials = currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("");
  return (
    <div className="space-y-5">
      <PageHeader title="Profile" description="Your public information and team membership." />
      <Card className="overflow-hidden shadow-soft">
        <div className="h-28 bg-gradient-to-r from-primary via-accent to-primary/60" />
        <CardContent className="-mt-12 p-6">
          <div className="flex flex-wrap items-end gap-4">
            <Avatar className="size-24 border-4 border-background shadow-card">
              <AvatarFallback className="bg-primary/10 text-2xl font-semibold text-primary">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h2 className="font-display text-xl font-semibold">{currentUser.name}</h2>
              <p className="text-sm text-muted-foreground">{currentUser.title}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="secondary"><ShieldCheck className="size-3" />{currentUser.role}</Badge>
                <Badge variant="outline">{currentUser.status}</Badge>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>
          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            <Info icon={Mail} label="Email" value={currentUser.email} />
            <Info icon={Globe2} label="Timezone" value={currentUser.timezone} />
            <Info icon={Briefcase} label="Headbacker" value={currentUser.headbacker ?? "—"} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </div>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
