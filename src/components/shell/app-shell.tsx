"use client";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  ChevronDown,
  CirclePlus,
  FolderKanban,
  ListChecks,
  LogOut,
  Menu,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Mark, Wordmark } from "@/components/brand/mark";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { signOut } from "@/features/auth/actions";
import { cn } from "@/lib/utils/cn";
import { CommandPalette } from "./command-palette";

const nav = [
  { index: "01", label: "Today", href: "/dashboard", icon: Sun, badgeKey: null },
  { index: "02", label: "Practice", href: "/dsa", icon: ListChecks, badgeKey: null },
  { index: "03", label: "Revision", href: "/review", icon: RefreshCw, badgeKey: "due" },
  { index: "04", label: "Applications", href: "/jobs", icon: Briefcase, badgeKey: "jobs" },
  { index: "05", label: "Projects", href: "/projects", icon: FolderKanban, badgeKey: null },
  { index: "06", label: "Library", href: "/resources", icon: BookOpen, badgeKey: null },
  { index: "07", label: "Analytics", href: "/analytics", icon: BarChart3, badgeKey: null },
  { index: "08", label: "Settings", href: "/settings", icon: Settings, badgeKey: null },
] as const;

const sectionLabels: Record<string, string> = {
  dashboard: "Today",
  dsa: "Practice",
  review: "Revision",
  jobs: "Applications",
  projects: "Projects",
  resources: "Library",
  analytics: "Analytics",
  settings: "Settings",
  design: "Today",
};

export type ShellUser = {
  displayName: string;
  email: string;
};

export type ShellStats = {
  dailyGoal: number;
  todayProgress: number;
  dueCount: number;
  activeJobCount: number;
};

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavList({
  pathname,
  stats,
  onNavigate,
  variant = "rail",
}: {
  pathname: string;
  stats: ShellStats;
  onNavigate?: () => void;
  variant?: "rail" | "mobile";
}) {
  const counts = {
    due: stats.dueCount,
    jobs: stats.activeJobCount,
  };

  return (
    <nav className={cn("flex flex-col gap-0.5", variant === "mobile" && "gap-1")}>
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        const count = item.badgeKey ? counts[item.badgeKey] : 0;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg py-2 text-sm transition-colors",
              variant === "rail" ? "px-3" : "px-3 py-2.5",
              active
                ? "text-bone bg-white/[0.045]"
                : "text-ash hover:text-bone hover:bg-white/[0.03]",
            )}
          >
            <span
              className={cn(
                "bg-copper absolute top-1/2 -left-[13px] h-4 w-px -translate-y-1/2 transition-opacity",
                active ? "opacity-100" : "opacity-0",
              )}
            />
            <span
              className={cn(
                "w-4 font-mono text-[9px] tracking-[0.08em] transition-colors",
                active ? "text-copper" : "text-faint/70 group-hover:text-faint",
              )}
            >
              {item.index}
            </span>
            <item.icon
              className={cn("size-4", active ? "text-copper" : "text-faint")}
              strokeWidth={1.5}
            />
            <span className="flex-1 truncate">{item.label}</span>
            {count > 0 ? (
              <span className="border-copper/20 bg-copper/[0.07] text-copper rounded-full border px-1.5 py-0.5 font-mono text-[10px]">
                {count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

function DailyTarget({ stats }: { stats: ShellStats }) {
  const target = Math.max(1, stats.dailyGoal);
  return (
    <div className="border-line rounded-lg border bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <span className="kicker">Daily target</span>
        <span className="text-ash tabular font-mono text-[10px]">
          {Math.min(stats.todayProgress, target)} / {target}
        </span>
      </div>
      <Progress value={stats.todayProgress} max={target} className="mt-2.5" label="Daily target" />
      <p className="text-faint mt-2 text-[11px] leading-relaxed">
        {stats.todayProgress >= target
          ? "Target met. Close the register."
          : "Reviews and solves count."}
      </p>
    </div>
  );
}

function UserMenu({ user }: { user: ShellUser }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left transition-colors hover:bg-white/[0.04]">
          <Avatar name={user.displayName} />
          <span className="min-w-0 flex-1">
            <span className="text-bone block truncate text-xs font-medium">{user.displayName}</span>
            <span className="text-faint block truncate text-[10px]">{user.email}</span>
          </span>
          <ChevronDown className="text-faint size-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOut}>
          <button
            type="submit"
            className="text-ash hover:text-bone flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors outline-none hover:bg-white/[0.06]"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  children,
  user,
  stats,
  todayLabel,
}: {
  children: ReactNode;
  user: ShellUser;
  stats: ShellStats;
  todayLabel: string;
}) {
  const pathname = usePathname();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const segment = pathname.split("/")[1] ?? "dashboard";
  const sectionLabel = sectionLabels[segment] ?? "Register";

  return (
    <div className="min-h-dvh">
      <aside className="border-line bg-ink fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r lg:flex">
        <div className="flex items-center justify-between px-5 pt-6 pb-6">
          <Link href="/dashboard" className="rounded-md">
            <Wordmark />
          </Link>
          <span className="text-faint font-mono text-[9px] tracking-[0.16em]">
            {new Date().getFullYear()}
          </span>
        </div>

        <div className="px-3">
          <div className="mb-2 flex items-center gap-2 px-3">
            <span className="kicker">Register</span>
            <span className="bg-line h-px flex-1" />
          </div>
          <NavList pathname={pathname} stats={stats} />
        </div>

        <div className="mt-auto space-y-3 p-3">
          <DailyTarget stats={stats} />
          <UserMenu user={user} />
          <div className="flex items-center justify-between px-1.5 pb-1">
            <span className="text-faint font-mono text-[9px] tracking-[0.12em] uppercase">
              Command
            </span>
            <button
              onClick={() => setPaletteOpen(true)}
              className="text-faint hover:text-ash flex items-center gap-1 transition-colors"
              aria-label="Open command palette"
            >
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="border-line bg-ink sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="lg:hidden" aria-label="Open menu">
                  <Menu className="size-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[86%] max-w-[19rem] p-0">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex items-center justify-between px-5 pt-5 pb-4">
                  <Wordmark />
                  <Mark className="text-faint size-4" />
                </div>
                <div className="px-3">
                  <NavList
                    pathname={pathname}
                    stats={stats}
                    variant="mobile"
                    onNavigate={() => setMobileOpen(false)}
                  />
                </div>
                <div className="border-line mt-auto space-y-3 border-t p-3">
                  <DailyTarget stats={stats} />
                  <UserMenu user={user} />
                </div>
              </SheetContent>
            </Sheet>

            <div className="hidden items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase sm:flex">
              <span className="text-faint">Docket</span>
              <span className="text-faint/50">/</span>
              <span className="text-ash">{sectionLabel}</span>
            </div>
            <div className="flex items-center gap-2 sm:hidden">
              <Mark className="text-bone size-4" />
              <span className="text-bone truncate font-serif text-lg">{sectionLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-faint hidden font-mono text-[10px] tracking-[0.1em] uppercase md:inline">
              {todayLabel}
            </span>
            <button
              onClick={() => setPaletteOpen(true)}
              className="border-line text-faint hover:border-line-strong hover:text-ash hidden h-8 w-52 items-center gap-2 rounded-lg border bg-white/[0.02] px-2.5 text-left text-xs transition-colors sm:flex"
            >
              <Search className="size-3.5" />
              <span className="flex-1">Search or jump</span>
              <Kbd className="h-4 border-0 bg-transparent px-0">⌘K</Kbd>
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="border-line text-faint grid size-8 place-items-center rounded-lg border sm:hidden"
              aria-label="Search"
            >
              <Search className="size-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" className="gap-1.5">
                  <CirclePlus className="size-3.5" />
                  <span className="hidden sm:inline">Add</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel>New record</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                  <Link href="/dsa?new=1">
                    <ListChecks />
                    Problem
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/jobs?new=1">
                    <Briefcase />
                    Application
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/projects?new=1">
                    <FolderKanban />
                    Project
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/resources?new=1">
                    <BookOpen />
                    Resource
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1440px] px-4 pt-6 pb-24 sm:px-6 lg:px-8 lg:pt-8 lg:pb-12">
          <div key={pathname} className="animate-fade">
            {children}
          </div>
        </main>
      </div>

      <nav className="border-line-strong bg-ink fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_32px_-20px_rgba(0,0,0,0.85)] lg:hidden">
        {nav.slice(0, 4).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-14 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] transition-colors",
                active ? "text-copper" : "text-faint",
              )}
            >
              <item.icon className="size-4" strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
        <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
          <SheetTrigger asChild>
            <button className="text-faint flex min-w-14 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px]">
              <MoreHorizontal className="size-4" strokeWidth={1.5} />
              More
            </button>
          </SheetTrigger>
          <SheetContent side="bottom">
            <SheetTitle className="sr-only">More navigation</SheetTitle>
            <div className="px-3 pt-5 pb-3">
              <div className="mb-2 px-3">
                <span className="kicker">All sections</span>
              </div>
              <NavList
                pathname={pathname}
                stats={stats}
                onNavigate={() => setMoreOpen(false)}
                variant="mobile"
              />
            </div>
            <div className="border-line space-y-3 border-t p-3">
              <DailyTarget stats={stats} />
              <UserMenu user={user} />
            </div>
          </SheetContent>
        </Sheet>
      </nav>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}
