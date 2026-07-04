"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { GlobalSearch } from "@/components/layout/global-search";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getDueWordsCount } from "@/lib/sm2";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/library", label: "Library" },
  { href: "/vocabulary", label: "Vocabulary" },
  { href: "/notes", label: "Notes" },
  { href: "/settings", label: "Settings" },
];

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar } = useStore(
    useShallow((s) => ({ toggleSidebar: s.toggleSidebar }))
  );
  const dueCount = useStore((s) => getDueWordsCount(s.vocabulary));
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header role="banner" className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
                {item.label === "Vocabulary" && dueCount > 0 && (
                  <Badge variant="default" className="ml-1.5 h-5 px-1 text-[10px]">
                    {dueCount}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search className="h-4 w-4" />
          </Button>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
