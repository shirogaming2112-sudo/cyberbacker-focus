import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/status-badge";
import { users } from "@/mock/data";
import type { User } from "@/mock/types";
import { KeyRound, UserCog, UserSquare2 } from "lucide-react";

export const Route = createFileRoute("/_app/admin/users")({
  head: () => ({ meta: [{ title: "Users Management — Admin" }] }),
  component: UsersPage,
});

const cols: Column<User>[] = [
  {
    key: "name",
    header: "Name",
    cell: (r) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {r.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{r.name}</p>
          <p className="truncate text-xs text-muted-foreground">{r.title}</p>
        </div>
      </div>
    ),
  },
  { key: "email", header: "Email", cell: (r) => r.email },
  { key: "role", header: "Role", cell: (r) => <StatusBadge tone={r.role === "admin" ? "primary" : "muted"}>{r.role}</StatusBadge> },
  { key: "status", header: "Status", cell: (r) => <StatusBadge tone={r.status === "Active" ? "success" : "muted"}>{r.status}</StatusBadge> },
  { key: "hb", header: "Headbacker", cell: (r) => r.headbacker ?? "—" },
  {
    key: "actions",
    header: "",
    className: "text-right",
    cell: () => (
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="outline"><UserSquare2 className="size-3.5" />Impersonate</Button>
        <Button size="sm" variant="outline"><KeyRound className="size-3.5" />Password</Button>
        <Button size="sm"><UserCog className="size-3.5" />Update</Button>
      </div>
    ),
  },
];

function UsersPage() {
  return (
    <div className="space-y-5">
      <PageHeader
        title="Users Management"
        description="Manage roles, status, and assignments across your team."
        actions={<Button>Invite User</Button>}
      />
      <DataTable rows={users} columns={cols} searchKeys={["name", "email", "role"]} searchPlaceholder="Search name, email, role…" />
    </div>
  );
}
