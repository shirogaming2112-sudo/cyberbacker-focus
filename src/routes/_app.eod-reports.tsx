import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Paperclip, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { clients, eodReports } from "@/mock/data";

export const Route = createFileRoute("/_app/eod-reports")({
  head: () => ({ meta: [{ title: "EOD Reports — Cyberbacker" }] }),
  component: EodPage,
});

function EodPage() {
  const [selected, setSelected] = useState(eodReports[0].id);
  const current = eodReports.find((r) => r.id === selected) ?? eodReports[0];
  return (
    <div className="space-y-5">
      <PageHeader title="EOD Reports" description="Wrap up your day. Share what shipped, what's next, and what's blocked." />

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b p-3">
              <h3 className="font-display text-sm font-semibold">Recent</h3>
              <Button size="sm" variant="outline"><Plus className="size-3.5" />New</Button>
            </div>
            <ul className="divide-y">
              {eodReports.map((r) => {
                const client = clients.find((c) => c.id === r.clientId);
                return (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelected(r.id)}
                      className={`block w-full px-3 py-2.5 text-left text-sm hover:bg-muted/60 ${
                        selected === r.id ? "bg-muted" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                        <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge>
                      </div>
                      <p className="mt-0.5 truncate font-medium">{client?.name}</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">{r.summary}</p>
                    </button>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label>Client</Label>
                <Select defaultValue={current.clientId}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input type="date" defaultValue={current.date} className="mt-1.5" />
              </div>
            </div>

            <div className="mt-4">
              <Label>Summary</Label>
              <Textarea
                rows={4}
                defaultValue={current.summary}
                className="mt-1.5"
                placeholder="What did you ship today?"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Highlights</Label>
                <ul className="mt-2 space-y-1.5">
                  {current.highlights.map((h, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-md border bg-muted/40 px-2.5 py-1.5 text-sm">
                      <span className="size-1.5 rounded-full bg-success" />{h}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <Label>Blockers</Label>
                {current.blockers.length === 0 ? (
                  <p className="mt-2 rounded-md border border-dashed bg-card p-3 text-xs text-muted-foreground">No blockers reported.</p>
                ) : (
                  <ul className="mt-2 space-y-1.5">
                    {current.blockers.map((b, i) => (
                      <li key={i} className="flex items-center gap-2 rounded-md border bg-warning/10 px-2.5 py-1.5 text-sm">
                        <span className="size-1.5 rounded-full bg-warning" />{b}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Button variant="ghost" size="sm"><Paperclip className="size-3.5" />Attach</Button>
                {current.attachments > 0 && <Badge variant="secondary">{current.attachments} file</Badge>}
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Save Draft</Button>
                <Button><Send className="size-4" />Submit</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
