import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge, statusToTone } from "@/components/app/status-badge";
import { useStore } from "@/lib/mock-store";
import { clients, users } from "@/mock/data";
import { EodReviewSheet } from "@/components/app/eod-review-sheet";
import type { EodReport } from "@/mock/types";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_app/admin/eod-reports")({
  head: () => ({ meta: [{ title: "EOD Reviews — Admin" }] }),
  component: AdminEodPage,
});

function AdminEodPage() {
  const { role } = useAuth();
  const reports = useStore((s) => s.eod);
  const [openId, setOpenId] = useState<string | null>(null);
  const current = reports.find((r) => r.id === openId) ?? null;

  const rows = reports.map((r) => ({
    ...r,
    userName: users.find((u) => u.id === r.userId)?.name ?? "—",
    clientName: clients.find((c) => c.id === r.clientId)?.name ?? "—",
  }));

  const cols: Column<(typeof rows)[number]>[] = [
    { key: "date", header: "Date", cell: (r) => r.date },
    { key: "user", header: "Cyberbacker", cell: (r) => <span className="font-medium">{r.userName}</span> },
    { key: "client", header: "Client", cell: (r) => r.clientName },
    { key: "summary", header: "Summary", cell: (r) => <span className="line-clamp-1 text-muted-foreground">{r.summary}</span> },
    { key: "status", header: "Status", cell: (r) => <StatusBadge tone={statusToTone(r.status)}>{r.status}</StatusBadge> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (r) => (
        <Button
          size="sm"
          disabled={!role || !can.approveEod(role)}
          onClick={() => setOpenId(r.id)}
        >
          Review
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="EOD Reviews"
        description="Review, approve, or disapprove daily reports submitted by your team."
      />
      <DataTable
        rows={rows as (EodReport & { id: string; userName: string; clientName: string })[]}
        columns={cols as Column<EodReport & { userName: string; clientName: string }>[]}
        searchKeys={["userName", "clientName", "status"]}
        searchPlaceholder="Search user, client, status…"
      />
      <EodReviewSheet
        report={current}
        open={!!current}
        onOpenChange={(v) => !v && setOpenId(null)}
      />
    </div>
  );
}
