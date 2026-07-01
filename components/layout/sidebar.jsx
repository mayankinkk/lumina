"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  BookMarked,
  StickyNote,
  BarChart3,
  Settings,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import useStore from "@/lib/store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/vocabulary", label: "Vocabulary", icon: BookMarked },
  { href: "/notes", label: "Notes", icon: StickyNote },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, closeSidebar } = useStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 border-r bg-card transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b px-6 py-4">
            <Link href="/" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                L
              </div>
              <span className="text-lg font-semibold">Lumina</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden h-8 w-8"
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t px-3 py-4">
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
