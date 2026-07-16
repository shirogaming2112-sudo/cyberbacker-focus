import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Clock,
  History,
  CalendarDays,
  FileClock,
  FileText,
  Bell,
  Settings,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Users as UsersIcon,
  ClipboardList,
  BarChart3,
  CalendarCheck,
  Ticket,
} from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { currentUser } from "@/mock/data";
import { useAuth } from "@/lib/auth";
import { can, ROLE_LABEL } from "@/lib/permissions";
import logoFull from "@/assets/cyberbacker-full.png";
import logoMark from "@/assets/cyberbacker-mark.png";
import logoWhite from "@/assets/cyberbacker-white.png";

const mainNav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/time-tracking", label: "Time Tracking", icon: Clock },
  { to: "/time-history", label: "Attendance History", icon: History },
  { to: "/schedules", label: "Schedules", icon: CalendarDays },
  { to: "/schedule-requests", label: "Schedule Requests", icon: FileClock },
  { to: "/eod-reports", label: "EOD Reports", icon: FileText },
  { to: "/tokens", label: "Token Management", icon: Ticket },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

type AdminItem = { to: string; label: string; icon: typeof ShieldCheck; requireSummary?: boolean; requireChangeLogs?: boolean };
const adminNav: AdminItem[] = [
  { to: "/admin", label: "Admin Overview", icon: ShieldCheck },
  { to: "/admin/schedule-approvals", label: "Schedule Approvals", icon: CalendarCheck },
  { to: "/admin/eod-reports", label: "EOD Reviews", icon: FileText },
  { to: "/admin/user-attendance", label: "User Attendance", icon: ClipboardList },
  { to: "/admin/user-schedules", label: "User Schedules", icon: CalendarDays },
  { to: "/admin/change-logs", label: "Change Logs", icon: FileClock, requireChangeLogs: true },
  { to: "/admin/attendance-summary", label: "Attendance Summary", icon: BarChart3, requireSummary: true },
  { to: "/admin/users", label: "Users Management", icon: UsersIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { role, logout } = useAuth();
  const navigate = useNavigate();
  const isActive = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname === to || pathname.startsWith(to + "/");

  const showAdmin = role && can.viewAdmin(role);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/dashboard" className="flex items-center gap-2 px-2 py-1.5" aria-label="Cyberbacker home">
          {collapsed ? (
            <img src={logoMark} alt="" className="size-7 object-contain" />
          ) : (
            <>
              <img
                src={resolvedTheme === "dark" ? logoWhite : logoFull}
                alt=""
                className="h-7 w-auto object-contain dark:hidden"
              />
              <img src={logoWhite} alt="" className="hidden h-7 w-auto object-contain dark:block" />
            </>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                    <Link to={item.to} aria-current={isActive(item.to) ? "page" : undefined}>
                      <item.icon aria-hidden />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav
                  .filter((item) => !item.requireSummary || can.viewAttendanceSummary(role!))
                  .filter((item) => !item.requireChangeLogs || can.viewChangeLogs(role!))
                  .map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild isActive={isActive(item.to)} tooltip={item.label}>
                        <Link to={item.to} aria-current={isActive(item.to) ? "page" : undefined}>
                          <item.icon aria-hidden />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="border-t">
        <div className="flex items-center gap-2 px-1 py-1">
          <Link to="/profile" className="flex min-w-0 flex-1 items-center gap-2 rounded-md p-1.5 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Avatar className="size-8">
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{currentUser.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {role ? ROLE_LABEL[role] : currentUser.title}
                </p>
              </div>
            )}
          </Link>
          {!collapsed && (
            <>
              <Button
                size="icon"
                variant="ghost"
                aria-label={resolvedTheme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {resolvedTheme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Log out"
                onClick={() => { logout(); navigate({ to: "/login" }); }}
              >
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
