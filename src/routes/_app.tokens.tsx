import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Copy, Eye, Trash2, Users as UsersIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/status-badge";
import { useStore, store } from "@/lib/mock-store";
import { REFERRAL_BASE_URL, type Referral, type Token } from "@/mock/tokens";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/tokens")({
  head: () => ({ meta: [{ title: "Token Management — Cyberbacker" }] }),
  component: TokensPage,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function TokensPage() {
  const tokens = useStore((s) => s.tokens);
  const referrals = useStore((s) => s.referrals);
  const [open, setOpen] = useState(false);
  const [viewing, setViewing] = useState<Token | null>(null);
  const [name, setName] = useState("");

  const create = () => {
    const slug = slugify(name);
    if (!slug) { toast.error("Token name is required"); return; }
    if (tokens.some((t) => t.slug === slug)) { toast.error("A token with this slug already exists"); return; }
    store.addToken({
      id: `tk_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      slug,
      ownerId: "u_1",
      createdAt: new Date().toISOString().slice(0, 10),
    });
    toast.success("Token created");
    setName("");
    setOpen(false);
  };

  const copy = (slug: string) => {
    const url = `${REFERRAL_BASE_URL}${slug}`;
    navigator.clipboard?.writeText(url).then(
      () => toast.success("Link copied"),
      () => toast.error("Copy failed"),
    );
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Token Management"
        description="Create referral tokens and track applicants you've referred."
        actions={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="size-4" aria-hidden /> Create Token
          </Button>
        }
      />

      {tokens.length === 0 ? (
        <Card className="shadow-soft">
          <CardContent className="grid place-items-center gap-2 p-10 text-center">
            <UsersIcon className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm font-medium">No tokens yet</p>
            <p className="text-xs text-muted-foreground">Create your first referral token to start tracking applicants.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tokens.map((t) => {
            const count = referrals.filter((r) => r.tokenSlug === t.slug).length;
            const url = `${REFERRAL_BASE_URL}${t.slug}`;
            return (
              <Card key={t.id} className="shadow-soft">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-base font-semibold">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">Created {t.createdAt}</p>
                    </div>
                    <Badge variant="secondary">{count} referrals</Badge>
                  </div>
                  <div className="rounded-md border bg-muted/40 p-2.5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Referral link</p>
                    <p className="mt-1 truncate font-mono text-xs">{url}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => copy(t.slug)}>
                      <Copy className="size-3.5" aria-hidden /> Copy
                    </Button>
                    <Button size="sm" onClick={() => setViewing(t)}>
                      <Eye className="size-3.5" aria-hidden /> View Referrals
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      aria-label={`Delete token ${t.name}`}
                      onClick={() => { store.deleteToken(t.id); toast.success("Token deleted"); }}
                      className="ml-auto h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Token</DialogTitle>
            <DialogDescription>Tokens generate a shareable referral link.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="tk-name">Token Name</Label>
            <Input id="tk-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Summer Drive" className="mt-1.5" />
            {name && (
              <p className="mt-2 text-xs text-muted-foreground">
                Preview: <span className="font-mono">{REFERRAL_BASE_URL}{slugify(name)}</span>
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={create}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReferralsSheet token={viewing} onOpenChange={(v) => !v && setViewing(null)} />
    </div>
  );
}

function ReferralsSheet({ token, onOpenChange }: { token: Token | null; onOpenChange: (v: boolean) => void }) {
  const referrals = useStore((s) => s.referrals);
  const rows = token ? referrals.filter((r) => r.tokenSlug === token.slug) : [];
  const cols: Column<Referral>[] = [
    { key: "name", header: "Referral Name", cell: (r) => <span className="font-medium">{r.name}</span> },
    { key: "stage", header: "Stage", cell: (r) => <StatusBadge tone={stageTone(r.stage)}>{r.stage}</StatusBadge> },
    { key: "created", header: "Created", cell: (r) => r.createdAt },
  ];
  return (
    <Sheet open={!!token} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{token?.name} — Referrals</SheetTitle>
          <SheetDescription>
            Total: <strong>{rows.length}</strong>. Data refreshes from GHL when the endpoint is connected.
          </SheetDescription>
        </SheetHeader>
        <DataTable
          rows={rows}
          columns={cols}
          searchKeys={["name", "stage"]}
          searchPlaceholder="Search referral, stage…"
          pageSize={20}
        />
      </SheetContent>
    </Sheet>
  );
}

function stageTone(stage: string): "success" | "warning" | "muted" | "primary" | "destructive" | "info" {
  switch (stage) {
    case "Hired": return "success";
    case "Offer": return "info";
    case "Interview": return "primary";
    case "Screening": return "warning";
    case "Rejected": return "destructive";
    default: return "muted";
  }
}
