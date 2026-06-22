import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";
import { TopHeader } from "./top-header";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-dvh w-full bg-muted/30">
        <AppSidebar />
        <SidebarInset className="flex min-w-0 flex-1 flex-col">
          <TopHeader />
          <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
