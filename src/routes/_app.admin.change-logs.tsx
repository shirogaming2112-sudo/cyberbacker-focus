import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { changeLogs, users } from "@/mock/data";
import type { ChangeLog } from "@/mock/types";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";

export const Route = createFileRoute("/_app/admin/change-logs")({
  head: () => ({ meta: [{ title: "Change Logs — Admin" }] }),
  component: ChangeLogsPage,
});

function ChangeLogsPage() {
  const { role, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && role && !can.viewChangeLogs(role)) navigate({ to: "/admin", replace: true });
  }, [ready, role, navigate]);
  if (!role || !can.viewChangeLogs(role)) return null;

  const rows = changeLogs.map((c) => ({ ...c, userName: users.find((u) => u.id === c.userId)?.name ?? "—" }));
  const cols: Column<(typeof rows)[number]>[] = [
    { key: "user", header: "User", cell: (r) => <span className="font-medium">{r.userName}</span> },
    { key: "field", header: "Field", cell: (r) => r.field },
    { key: "from", header: "From", cell: (r) => <span className="text-muted-foreground">{r.from}</span> },
    { key: "to", header: "To", cell: (r) => <span className="font-medium">{r.to}</span> },
    { key: "by", header: "Updated By", cell: (r) => r.updatedBy },
    { key: "at", header: "When", cell: (r) => r.updatedAt },
  ];
  return (
    <div className="space-y-5">
      <PageHeader title="Change Logs" description="Audit trail of admin edits across users and schedules." />
      <DataTable rows={rows as unknown as (ChangeLog & { userName: string })[]} columns={cols} searchKeys={["userName", "field"]} />
    </div>
  );
}
