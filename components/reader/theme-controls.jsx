"use client";

import { useState } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Palette } from "lucide-react";

const themes = [
  { value: "default", label: "Default", bg: "" },
  { value: "sepia", label: "Sepia", bg: "bg-amber-50 dark:bg-amber-950" },
  { value: "cream", label: "Cream", bg: "bg-yellow-50 dark:bg-yellow-950/60" },
  { value: "gray", label: "Gray", bg: "bg-gray-100 dark:bg-gray-900" },
  { value: "dark", label: "Dark", bg: "bg-neutral-900 dark:bg-black" },
  { value: "custom", label: "Custom", bg: "" },
];

const backgrounds = [
  { value: "default", label: "None" },
  { value: "paper", label: "Paper" },
  { value: "noise", label: "Noise" },
];

export function ThemeControls() {
  const { readerTheme, readerBackground, setReaderTheme, setReaderBackground, customThemeColors, setCustomThemeColors } = useStore(
    useShallow((s) => ({
      readerTheme: s.readerTheme,
      readerBackground: s.readerBackground,
      setReaderTheme: s.setReaderTheme,
      setReaderBackground: s.setReaderBackground,
      customThemeColors: s.customThemeColors,
      setCustomThemeColors: s.setCustomThemeColors,
    }))
  );
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const panelRef = useClickOutside(open, () => setOpen(false));
  const [localBg, setLocalBg] = useState(customThemeColors?.background || "#ffffff");
  const [localText, setLocalText] = useState(customThemeColors?.text || "#000000");
  const [localAccent, setLocalAccent] = useState(customThemeColors?.accent || "#3b82f6");

  const applyCustom = () => {
    const colors = { background: localBg, text: localText, accent: localAccent };
    setCustomThemeColors(colors);
    setReaderTheme("custom");
    setShowCustom(false);
  };

  const clearCustom = () => {
    setCustomThemeColors(null);
    setReaderTheme("default");
    setShowCustom(false);
  };

  return (
    <div className="relative">
      <Button
        variant={readerTheme === "custom" ? "default" : readerTheme !== "default" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(!open)}
        aria-label="Reader theme"
      >
        <Palette className="h-4 w-4" />
      </Button>
      {open && (
        <div ref={panelRef} className="absolute right-0 top-full mt-1 z-30 w-72 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            <Label className="text-xs font-medium">Reader Theme</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {themes.map((t) => (
                <button
                  key={t.value}
                  className={`flex items-center justify-center h-10 rounded-lg border text-[10px] font-medium transition-all ${t.bg} ${readerTheme === t.value ? "border-primary ring-1 ring-primary" : "border-border hover:border-muted-foreground/30"}`}
                  onClick={() => {
                    if (t.value === "custom") {
                      setShowCustom(true);
                    } else {
                      setReaderTheme(t.value);
                    }
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {showCustom && (
              <div className="space-y-2 rounded-lg border p-3">
                <Label className="text-xs font-medium">Custom Colors</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Background</label>
                    <Input type="color" value={localBg} onChange={(e) => setLocalBg(e.target.value)} className="h-8 p-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Text</label>
                    <Input type="color" value={localText} onChange={(e) => setLocalText(e.target.value)} className="h-8 p-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Accent</label>
                    <Input type="color" value={localAccent} onChange={(e) => setLocalAccent(e.target.value)} className="h-8 p-1" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="default" size="sm" className="flex-1 h-7 text-xs" onClick={applyCustom}>Apply</Button>
                  <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={clearCustom}>Reset</Button>
                </div>
              </div>
            )}

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
