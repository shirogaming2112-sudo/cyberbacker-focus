import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PageHeader } from "@/components/app/page-header";
import { DataTable, type Column } from "@/components/app/data-table";
import { StatusBadge } from "@/components/app/status-badge";
import { users as seedUsers } from "@/mock/data";
import type { User } from "@/mock/types";
import { KeyRound, UserCog, UserSquare2, Pencil } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { HeadbackerPickerDialog } from "@/components/app/headbacker-picker-dialog";

export const Route = createFileRoute("/_app/admin/users")({
  head: () => ({ meta: [{ title: "Users Management — Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  const { role } = useAuth();
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [pickerFor, setPickerFor] = useState<User | null>(null);

  const updateHeadbacker = (userId: string, name: string) => {
    setUsers((arr) => arr.map((u) => u.id === userId ? { ...u, headbacker: name } : u));
  };

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
    {
      key: "hb",
      header: "Headbacker",
      cell: (r) => (
        <Button
          size="sm"
          variant="outline"
          className="h-7 gap-1.5 font-normal"
          onClick={() => setPickerFor(r)}
          disabled={!role || !can.editUser(role)}
        >
          <Pencil className="size-3" aria-hidden />
          {r.headbacker ?? "Assign"}
        </Button>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: () => (
        <div className="flex justify-end gap-2">
          {role && can.impersonate(role) && (
            <Button size="sm" variant="outline"><UserSquare2 className="size-3.5" aria-hidden />Impersonate</Button>
          )}
          {role && can.resetPassword(role) && (
            <Button size="sm" variant="outline"><KeyRound className="size-3.5" aria-hidden />Password</Button>
          )}
          {role && can.editUser(role) && (
            <Button size="sm"><UserCog className="size-3.5" aria-hidden />Update</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Users Management"
        description="Manage roles, status, and assignments across your team."
        actions={role && can.editUser(role) ? <Button>Invite User</Button> : undefined}
      />
      <DataTable rows={users} columns={cols} searchKeys={["name", "email", "role"]} searchPlaceholder="Search name, email, role…" />
      <HeadbackerPickerDialog
        open={!!pickerFor}
        onOpenChange={(v) => !v && setPickerFor(null)}
        current={pickerFor?.headbacker}
        onSelect={(name) => pickerFor && updateHeadbacker(pickerFor.id, name)}
      />
    </div>
  );
}
