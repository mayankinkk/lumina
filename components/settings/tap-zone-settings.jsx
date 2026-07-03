"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw } from "lucide-react";
import useStore from "@/lib/store";

const ZONE_LABELS = {
  left: "Left Third",
  center: "Center",
  right: "Right Third",
};

const ACTION_OPTIONS = [
  { value: "prevPage", label: "Previous Page" },
  { value: "nextPage", label: "Next Page" },
  { value: "bookmark", label: "Bookmark" },
  { value: "toc", label: "Table of Contents" },
  { value: "search", label: "Search" },
  { value: "none", label: "None" },
];

const getActionLabel = (action) =>
  ACTION_OPTIONS.find((o) => o.value === action)?.label || "None";

const DEFAULT_ZONES = [
  { id: "l", position: "left", action: "prevPage" },
  { id: "c", position: "center", action: "none" },
  { id: "r", position: "right", action: "nextPage" },
];

export function TapZoneSettings({ open, onOpenChange }) {
  const tapZones = useStore((s) => s.tapZones);
  const setTapZones = useStore((s) => s.setTapZones);
  const [localZones, setLocalZones] = useState(() =>
    tapZones.length > 0
      ? tapZones.map((z) => ({ ...z }))
      : DEFAULT_ZONES.map((z) => ({ ...z }))
  );

  const updateZone = (position, action) => {
    setLocalZones((prev) =>
      prev.map((z) => (z.position === position ? { ...z, action } : z))
    );
  };

  const resetDefaults = () => {
    setLocalZones(DEFAULT_ZONES.map((z) => ({ ...z })));
  };

  const handleSave = () => {
    setTapZones(localZones);
    onOpenChange(false);
  };

  const zonePositions = [
    { position: "left", color: "bg-blue-500/10 border-blue-500/30" },
    { position: "center", color: "bg-muted border-border" },
    { position: "right", color: "bg-blue-500/10 border-blue-500/30" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tap Zones</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Assign actions to each tap zone on the reader screen.
          </p>

          <div className="flex h-32 w-full overflow-hidden rounded-lg border">
            {zonePositions.map(({ position, color }) => {
              const zone = localZones.find((z) => z.position === position);
              return (
                <div
                  key={position}
                  className={`flex flex-1 items-center justify-center border-r last:border-r-0 ${color}`}
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {ZONE_LABELS[position]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            {zonePositions.map(({ position }) => {
              const zone = localZones.find((z) => z.position === position);
              return (
                <div
                  key={position}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm font-medium min-w-[90px]">
                    {ZONE_LABELS[position]}
                  </span>
                  <Select
                    value={zone?.action || "none"}
                    onValueChange={(v) => updateZone(position, v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <Button variant="outline" size="sm" onClick={resetDefaults}>
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { getActionLabel };
