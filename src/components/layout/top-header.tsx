import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Bell, Search, ChevronRight, Clock, Sparkles } from "lucide-react";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { currentUser, notifications } from "@/mock/data";
import { useAuth } from "@/lib/auth";
import { RoleSwitcher } from "@/components/app/role-switcher";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  "time-tracking": "Time Tracking",
  "time-history": "Attendance History",
  schedules: "Schedules",
  "schedule-requests": "Schedule Requests",
  "eod-reports": "EOD Reports",
  tokens: "Token Management",
  notifications: "Notifications",
  settings: "Settings",
  profile: "Profile",
  admin: "Admin",
  "schedule-approvals": "Schedule Approvals",
  "user-attendance": "User Attendance",
  "user-schedules": "User Schedules",
  "change-logs": "Change Logs",
  "attendance-summary": "Attendance Summary",
  users: "Users Management",
};

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

export function TopHeader() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const parts = pathname.split("/").filter(Boolean);
  const navigate = useNavigate();
  const now = useNow();
  const { logout } = useAuth();
  const [openSearch, setOpenSearch] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpenSearch((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b bg-background/80 px-3 backdrop-blur-md sm:px-4">
      <SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
      <Separator orientation="vertical" className="mr-1 h-5" />

      <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1 text-sm md:flex">
        <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
          Cyberbacker
        </Link>
        {parts.map((p, i) => (
          <span key={i} className="flex items-center gap-1">
            <ChevronRight className="size-3.5 text-muted-foreground" aria-hidden />
            <span className={i === parts.length - 1 ? "font-medium" : "text-muted-foreground"}>
              {ROUTE_LABELS[p] ?? p}
            </span>
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden h-9 w-64 justify-between text-muted-foreground md:flex"
          onClick={() => setOpenSearch(true)}
          aria-label="Open search"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4" aria-hidden />
            Search…
          </span>
          <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">⌘K</kbd>
        </Button>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Open search" onClick={() => setOpenSearch(true)}>
          <Search className="size-4" />
        </Button>

        <RoleSwitcher />

        <Button size="sm" className="hidden sm:inline-flex" asChild>
          <Link to="/time-tracking">
            <Sparkles className="size-4" aria-hidden />
            Clock In
          </Link>
        </Button>

        <div className="hidden items-center gap-1.5 rounded-md border bg-muted/40 px-2.5 py-1.5 text-xs font-medium lg:flex" aria-label="Current time">
          <Clock className="size-3.5 text-muted-foreground" aria-hidden />
          <span className="tabular-nums">
            {now ? now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
          </span>
          <span className="text-muted-foreground">MDT</span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
              <Bell className="size-4" aria-hidden />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 inline-flex h-2 w-2 rounded-full bg-destructive" aria-hidden />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b p-3">
              <p className="text-sm font-semibold">Notifications</p>
              <Badge variant="secondary">{unread} new</Badge>
            </div>
            <ul className="max-h-80 divide-y overflow-y-auto">
              {notifications.map((n) => (
                <li key={n.id} className="flex gap-3 p-3 hover:bg-muted/60 focus-within:bg-muted/60">
                  <span
                    className={`mt-1.5 size-2 shrink-0 rounded-full ${n.read ? "bg-muted-foreground/30" : "bg-accent"}`}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {n.title}
                      {!n.read && <span className="sr-only"> (unread)</span>}
                    </p>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t p-2">
              <Button asChild variant="ghost" size="sm" className="w-full">
                <Link to="/notifications">View all</Link>
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Account menu" className="rounded-full">
              <Avatar className="size-8">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {currentUser.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/profile" })}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/settings" })}>Settings</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate({ to: "/notifications" })}>Notifications</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <CommandDialog open={openSearch} onOpenChange={setOpenSearch}>
        <CommandInput placeholder="Search routes…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {Object.entries(ROUTE_LABELS).map(([slug, label]) => {
              const adminSlugs = ["schedule-approvals", "user-attendance", "user-schedules", "change-logs", "attendance-summary", "users"];
              const path =
                slug === "admin"
                  ? "/admin"
                  : adminSlugs.includes(slug)
                    ? `/admin/${slug}`
                    : `/${slug}`;
              return (
                <CommandItem
                  key={slug}
                  value={label}
                  onSelect={() => {
                    setOpenSearch(false);
                    navigate({ to: path });
                  }}
                >
                  {label}
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
}
