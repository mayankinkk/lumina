"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import useStore from "@/lib/store";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/notes", label: "Notes" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useStore();

  return (
    <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">
              L
            </div>
            <span className="font-semibold">Lumina</span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
          </Button>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
