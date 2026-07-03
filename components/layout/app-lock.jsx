"use client";

import { useState } from "react";
import { useAppLock } from "@/hooks/use-app-lock";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock, Shield } from "lucide-react";

export function AppLockProvider({ children }) {
  const { enabled, locked, unlock, lock, enable, disable } = useAppLock();
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState(false);
  const [setupOpen, setSetupOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupMode, setSetupMode] = useState(false);

  const handleUnlock = () => {
    if (unlock(passwordInput)) {
      setPasswordInput("");
      setError(false);
    } else {
      setError(true);
      setPasswordInput("");
    }
  };

  const handleSetup = () => {
    if (newPassword.length < 4) return;
    if (newPassword !== confirmPassword) return;
    enable(newPassword);
    setSetupOpen(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <>
      <Dialog open={locked} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-sm" hideClose>
          <DialogHeader>
            <div className="flex justify-center mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Lock className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">Lumina Locked</DialogTitle>
            <DialogDescription className="text-center">
              Enter your password to unlock the app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Enter password"
              value={passwordInput}
              onChange={(e) => { setPasswordInput(e.target.value); setError(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleUnlock(); }}
              autoFocus
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-xs text-destructive">Incorrect password</p>}
            <Button className="w-full" onClick={handleUnlock}>Unlock</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={setupOpen} onOpenChange={setSetupOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Set App Password
            </DialogTitle>
            <DialogDescription>
              Password must be at least 4 characters.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              type="password"
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setSetupOpen(false)}>Cancel</Button>
              <Button className="flex-1" onClick={handleSetup} disabled={newPassword.length < 4 || newPassword !== confirmPassword}>Set Password</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {children}
    </>
  );
}

export { useAppLock };