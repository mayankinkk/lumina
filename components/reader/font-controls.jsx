"use client";

import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Type, AlignLeft, AlignJustify } from "lucide-react";
import { useState } from "react";

const fonts = [
  { value: "literata", label: "Literata" },
  { value: "sans", label: "Sans" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Mono" },
];

export function FontControls() {
  const { readerFontFamily, readerFontSize, readerLineHeight, readerLetterSpacing, readerFontWeight, readerHyphenation, readerJustify, setReaderFontFamily, setReaderFontSize, setReaderLineHeight, setReaderLetterSpacing, setReaderFontWeight, setReaderHyphenation, setReaderJustify } = useStore(
    useShallow((s) => ({
      readerFontFamily: s.readerFontFamily,
      readerFontSize: s.readerFontSize,
      readerLineHeight: s.readerLineHeight,
      readerLetterSpacing: s.readerLetterSpacing,
      readerFontWeight: s.readerFontWeight,
      readerHyphenation: s.readerHyphenation,
      readerJustify: s.readerJustify,
      setReaderFontFamily: s.setReaderFontFamily,
      setReaderFontSize: s.setReaderFontSize,
      setReaderLineHeight: s.setReaderLineHeight,
      setReaderLetterSpacing: s.setReaderLetterSpacing,
      setReaderFontWeight: s.setReaderFontWeight,
      setReaderHyphenation: s.setReaderHyphenation,
      setReaderJustify: s.setReaderJustify,
    }))
  );
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant={readerFontSize !== 18 || readerFontFamily !== "literata" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8"
        onClick={() => setOpen(!open)}
        aria-label="Font settings"
      >
        <Type className="h-4 w-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-30 w-64 rounded-lg border bg-popover p-3 shadow-lg">
          <div className="space-y-3">
            <Label className="text-xs font-medium">Font Settings</Label>

            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Family</Label>
              <div className="flex gap-1 flex-wrap">
                {fonts.map((f) => (
                  <Button
                    key={f.value}
                    variant={readerFontFamily === f.value ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setReaderFontFamily(f.value)}
                  >
                    {f.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Size</Label>
                <span className="text-[10px] text-muted-foreground">{readerFontSize}px</span>
              </div>
              <Slider min={12} max={36} step={1} value={[readerFontSize]} onValueChange={([v]) => setReaderFontSize(v)} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Line Height</Label>
                <span className="text-[10px] text-muted-foreground">{readerLineHeight}</span>
              </div>
              <Slider min={1} max={3} step={0.1} value={[readerLineHeight]} onValueChange={([v]) => setReaderLineHeight(v)} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Letter Spacing</Label>
                <span className="text-[10px] text-muted-foreground">{readerLetterSpacing}px</span>
              </div>
              <Slider min={0} max={4} step={0.5} value={[readerLetterSpacing]} onValueChange={([v]) => setReaderLetterSpacing(v)} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Weight</Label>
                <span className="text-[10px] text-muted-foreground">{readerFontWeight}</span>
              </div>
              <Slider min={300} max={700} step={100} value={[readerFontWeight]} onValueChange={([v]) => setReaderFontWeight(v)} />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1"><AlignLeft className="h-3 w-3" /> Justify</Label>
              <Switch checked={readerJustify} onCheckedChange={setReaderJustify} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-[10px] text-muted-foreground flex items-center gap-1"><AlignJustify className="h-3 w-3" /> Hyphenation</Label>
              <Switch checked={readerHyphenation} onCheckedChange={setReaderHyphenation} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
