import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app")({
  component: AppGuard,
});

function AppGuard() {
  const { role, ready } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && !role) navigate({ to: "/login", replace: true });
  }, [ready, role, navigate]);
  if (!ready || !role) return null;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
