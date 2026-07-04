"use client";

import { useBreakReminder } from "@/hooks/use-break-reminder";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

export function BreakReminderModal() {
  const { prefs, updatePrefs, showReminder, dismissReminder } = useBreakReminder();

  return (
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
  );
}
