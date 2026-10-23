"use client";

import {
  BarChart3,
  BookOpen,
  Briefcase,
  CirclePlus,
  FolderKanban,
  ListChecks,
  RefreshCw,
  Settings,
  Sun,
  Target,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { Kbd } from "@/components/ui/kbd";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const navigation = [
  { label: "Today", href: "/dashboard", icon: Sun },
  { label: "Practice", href: "/dsa", icon: ListChecks },
  { label: "Revision queue", href: "/review", icon: RefreshCw },
  { label: "Applications", href: "/jobs", icon: Briefcase },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Library", href: "/resources", icon: BookOpen },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

const actions = [
  { label: "Add a problem", href: "/dsa?new=1", icon: CirclePlus },
  { label: "Add an application", href: "/jobs?new=1", icon: CirclePlus },
  { label: "Add a project", href: "/projects?new=1", icon: CirclePlus },
  { label: "Set a daily target", href: "/settings#target", icon: Target },
];

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();

  function run(href: string) {
    onOpenChange(false);
    router.push(href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="top-[22%] max-w-xl p-0">
        <DialogTitle className="sr-only">Command menu</DialogTitle>
        <Command
          loop
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-faint [&_[cmdk-group-heading]]:uppercase"
        >
          <div className="flex items-center gap-3 border-b border-line px-4">
            <Command.Input
              autoFocus
              placeholder="Jump to a page or add something…"
              className="h-12 w-full bg-transparent text-sm text-bone outline-none placeholder:text-faint"
            />
            <Kbd>esc</Kbd>
          </div>
          <Command.List className="max-h-[22rem] overflow-y-auto p-2">
            <Command.Empty className="px-3 py-8 text-center text-sm text-faint">
              Nothing matches that.
            </Command.Empty>

            <Command.Group heading="Go to">
              {navigation.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${item.label} ${item.href}`}
                  onSelect={() => run(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-ash data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-bone"
                >
                  <item.icon className="size-4 text-faint" strokeWidth={1.5} />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>

            <Command.Separator className="my-2 h-px bg-line" />

            <Command.Group heading="Create">
              {actions.map((item) => (
                <Command.Item
                  key={item.href}
                  value={`${item.label} ${item.href}`}
                  onSelect={() => run(item.href)}
                  className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-ash data-[selected=true]:bg-white/[0.06] data-[selected=true]:text-bone"
                >
                  <item.icon className="size-4 text-copper/80" strokeWidth={1.5} />
                  {item.label}
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
          <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
            <span className="font-mono text-[10px] tracking-[0.12em] text-faint uppercase">
              Docket · Command
            </span>
            <div className="flex items-center gap-3 text-[10px] text-faint">
              <span className="flex items-center gap-1">
                <Kbd>↑</Kbd>
                <Kbd>↓</Kbd> move
              </span>
              <span className="flex items-center gap-1">
                <Kbd>↵</Kbd> open
              </span>
            </div>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
