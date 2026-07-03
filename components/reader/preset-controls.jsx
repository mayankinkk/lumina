"use client";

import { useState } from "react";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookmarkPlus, Trash2, Play } from "lucide-react";

export function PresetControls() {
  const { readerPresets, savePreset, loadPreset, deletePreset } = useStore(
    useShallow((s) => ({
      readerPresets: s.readerPresets,
      savePreset: s.savePreset,
      loadPreset: s.loadPreset,
      deletePreset: s.deletePreset,
    }))
  );
  const [saveOpen, setSaveOpen] = useState(false);
  const [presetName, setPresetName] = useState("");

  const handleSave = () => {
    const name = presetName.trim();
    if (!name) return;
    savePreset(name);
    setPresetName("");
    setSaveOpen(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Reader presets">
            <BookmarkPlus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Presets</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setSaveOpen(true)}>
            <BookmarkPlus className="h-3.5 w-3.5" />
            Save Current as Preset
          </DropdownMenuItem>
          {readerPresets.length > 0 && <DropdownMenuSeparator />}
          {readerPresets.map((p) => (
            <div key={p.name} className="flex items-center gap-0 px-1 py-0.5">
              <DropdownMenuItem
                className="flex-1"
                onSelect={() => loadPreset(p.name)}
              >
                <Play className="h-3.5 w-3.5" />
                {p.name}
              </DropdownMenuItem>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  deletePreset(p.name);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={saveOpen} onOpenChange={setSaveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Preset</DialogTitle>
            <DialogDescription>
              Give your current reader settings a name to save them as a preset.
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Preset name"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            autoFocus
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
