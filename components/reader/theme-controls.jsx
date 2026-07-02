"use client";

import { useState } from "react";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

const themes = [
  { value: "default", label: "Default", bg: "" },
  { value: "sepia", label: "Sepia", bg: "bg-amber-50 dark:bg-amber-950" },
  { value: "cream", label: "Cream", bg: "bg-yellow-50 dark:bg-yellow-950/60" },
  { value: "gray", label: "Gray", bg: "bg-gray-100 dark:bg-gray-900" },
  { value: "dark", label: "Dark", bg: "bg-neutral-900 dark:bg-black" },
  { value: "forest", label: "Forest", bg: "bg-emerald-950/20 dark:bg-emerald-950/60" },
];

const backgrounds = [
  { value: "default", label: "None" },
  { value: "paper", label: "Paper" },
  { value: "noise", label: "Noise" },
];

export function ThemeControls() {
  const { readerTheme, readerBackground, setReaderTheme, setReaderBackground } = useStore(
    useShallow((s) => ({
      readerTheme: s.readerTheme,
      readerBackground: s.readerBackground,
      setReaderTheme: s.setReaderTheme,
      setReaderBackground: s.setReaderBackground,
    }))
  );
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant={readerTheme !== "default" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(!open)}
        aria-label="Reader theme"
      >
        <Palette className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            <Label className="text-xs font-medium">Reader Theme</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.value}
                  className={`flex items-center justify-center h-10 rounded-lg border text-[10px] font-medium transition-all ${t.bg} ${readerTheme === t.value ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted-foreground/30"}`}
                  onClick={() => setReaderTheme(t.value)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <Label className="text-xs font-medium">Texture</Label>
            <div className="flex gap-1">
              {backgrounds.map((b) => (
                <Button
                  key={b.value}
                  variant={readerBackground === b.value ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => setReaderBackground(b.value)}
                >
                  {b.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
