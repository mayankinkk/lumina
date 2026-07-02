"use client";

import { useBreakReminder } from "@/hooks/use-break-reminder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Eye } from "lucide-react";

export function BreakReminderModal() {
  const { prefs, updatePrefs, showReminder, dismissReminder } = useBreakReminder();

  return (
    <>
      <Dialog open={showReminder} onOpenChange={(open) => { if (!open) dismissReminder(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" /> Time for a Break
            </DialogTitle>
            <DialogDescription>
              You&apos;ve been reading for {prefs.interval} minutes. Give your eyes a rest.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Look at something 20 feet away for 20 seconds to reduce eye strain.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => updatePrefs({ enabled: false })}>
              Disable Reminders
            </Button>
            <Button onClick={dismissReminder}>Dismiss</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm font-medium">Break Reminder</Label>
          </div>
          <Switch checked={prefs.enabled} onCheckedChange={(v) => updatePrefs({ enabled: v })} />
        </div>
        {prefs.enabled && (
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Every {prefs.interval} min</span>
            </div>
            <Slider
              min={5}
              max={60}
              step={5}
              value={[prefs.interval]}
              onValueChange={([v]) => updatePrefs({ interval: v })}
            />
          </div>
        )}
      </div>
    </>
  );
}
