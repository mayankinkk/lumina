"use client";

import { useState } from "react";
import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Bell, Shield, Palette, Info, Trash2, Download, Upload, Cloud, RefreshCw, Lock, Moon, Timer } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useStore from "@/lib/store";
import { TapZoneSettings, getActionLabel } from "@/components/settings/tap-zone-settings";
import { useWebdav } from "@/hooks/use-webdav";
import { useAppLock } from "@/hooks/use-app-lock";
import { useNightModeScheduler, getSchedule } from "@/hooks/use-night-mode-scheduler";

export default function SettingsPage() {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const books = useStore((s) => s.books);
  const vocabulary = useStore((s) => s.vocabulary);
  const notes = useStore((s) => s.notes);
  const highlights = useStore((s) => s.highlights);
  const readingSessions = useStore((s) => s.readingSessions);

  const appLock = useAppLock();
  const nightMode = useNightModeScheduler();
  const [lockPassword, setLockPassword] = useState("");
  const [lockConfirm, setLockConfirm] = useState("");
  const [nightStart, setNightStart] = useState("20:00");
  const [nightEnd, setNightEnd] = useState("07:00");
  const [tapZoneOpen, setTapZoneOpen] = useState(false);
  const tapZones = useStore((s) => s.tapZones);
  const swipeThreshold = useStore((s) => s.swipeThreshold);
  const setSwipeThreshold = useStore((s) => s.setSwipeThreshold);
  const readingTimer = useStore((s) => s.readingTimer);
  const setReadingTimer = useStore((s) => s.setReadingTimer);

  const handleLockEnable = () => {
    if (lockPassword.length >= 4 && lockPassword === lockConfirm) {
      appLock.enable(lockPassword);
      setLockPassword("");
      setLockConfirm("");
    }
  };

  const handleClearAll = async () => {
    const bookIds = books.map((b) => b.id);
    localStorage.removeItem("lumina_books");
    localStorage.removeItem("lumina_vocabulary");
    localStorage.removeItem("lumina_notes");
    localStorage.removeItem("lumina_highlights");
    localStorage.removeItem("lumina_sessions");
    localStorage.removeItem("lumina_daily_goal");
    for (const id of bookIds) {
      try { await import("idb-keyval").then((m) => m.del(`lumina_file_${id}`)); } catch {}
    }
    window.location.reload();
  };

  const {
    config: webdavConfig,
    setConfig: setWebdavConfig,
    clearConfig: clearWebdavConfig,
    syncing,
    lastSync,
    backupToWebdav,
    restoreFromWebdav,
    listBackups,
    isConfigured,
  } = useWebdav();
  const [webdavUrl, setWebdavUrl] = useState(webdavConfig.url);
  const [webdavUser, setWebdavUser] = useState(webdavConfig.username);
  const [webdavPass, setWebdavPass] = useState(webdavConfig.password);
  const [syncStatus, setSyncStatus] = useState("");

  const handleWebdavSave = () => {
    setWebdavConfig({ url: webdavUrl, username: webdavUser, password: webdavPass });
    setSyncStatus("WebDAV configuration saved");
  };

  const handleBackup = async () => {
    try {
      setSyncStatus("Backing up...");
      await backupToWebdav();
      setSyncStatus("Backup uploaded successfully!");
    } catch (err) {
      setSyncStatus(`Backup failed: ${err.message}`);
    }
  };

  const handleRestore = async () => {
    try {
      setSyncStatus("Fetching backup list...");
      const backups = await listBackups();
      if (backups.length === 0) {
        setSyncStatus("No backups found");
        return;
      }
      const latest = backups[backups.length - 1];
      setSyncStatus(`Restoring from ${latest.displayName}...`);
      const data = await restoreFromWebdav(latest.displayName);
      if (data.books) {
        const store = useStore.getState();
        data.books.forEach((b) => store.addBook(b));
      }
      if (data.vocabulary) {
        const store = useStore.getState();
        data.vocabulary.forEach((w) => store.addVocabularyWord(w));
      }
      if (data.notes) {
        const store = useStore.getState();
        data.notes.forEach((n) => store.addNote(n));
      }
      if (data.highlights) {
        const store = useStore.getState();
        data.highlights.forEach((h) => store.addHighlight(h));
      }
      setSyncStatus(`Restored from ${latest.displayName}`);
      window.location.reload();
    } catch (err) {
      setSyncStatus(`Restore failed: ${err.message}`);
    }
  };

  const handleExport = () => {
    const s = useStore.getState();
    const data = {
      books: books.map(({ fileData, ...b }) => b),
      vocabulary,
      notes,
      highlights,
      bookmarks: s.bookmarks,
      readingSessions: s.readingSessions,
      settings: {
        dailyGoal: s.dailyGoal,
        weeklyGoal: s.weeklyGoal,
        goalMode: s.goalMode,
        readerTheme: s.readerTheme,
        readerBackground: s.readerBackground,
        readerFontFamily: s.readerFontFamily,
        readerFontSize: s.readerFontSize,
        readerLineHeight: s.readerLineHeight,
        readerJustify: s.readerJustify,
        zoom: s.zoom,
        blueLightFilter: s.blueLightFilter,
        customThemeColors: s.customThemeColors,
      },
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumina-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.books) {
          const existing = useStore.getState().books;
          const existingIds = new Set(existing.map((b) => b.id));
          const newBooks = data.books.filter((b) => !existingIds.has(b.id));
          if (newBooks.length > 0) {
            const store = useStore.getState();
            newBooks.forEach((b) => store.addBook(b));
          }
        }
        if (data.vocabulary) {
          const store = useStore.getState();
          data.vocabulary.forEach((w) => store.addVocabularyWord(w));
        }
        if (data.notes) {
          const store = useStore.getState();
          data.notes.forEach((n) => store.addNote(n));
        }
        if (data.highlights) {
          const store = useStore.getState();
          data.highlights.forEach((h) => store.addHighlight(h));
        }
        if (data.bookmarks) {
          const store = useStore.getState();
          data.bookmarks.forEach((b) => store.addBookmark(b));
        }
        if (data.settings) {
          const store = useStore.getState();
          if (data.settings.dailyGoal !== undefined) store.setDailyGoal(data.settings.dailyGoal);
          if (data.settings.weeklyGoal !== undefined) store.setWeeklyGoal(data.settings.weeklyGoal);
          if (data.settings.goalMode) store.setGoalMode(data.settings.goalMode);
          if (data.settings.readerTheme) store.setReaderTheme(data.settings.readerTheme);
          if (data.settings.readerBackground) store.setReaderBackground(data.settings.readerBackground);
          if (data.settings.readerFontFamily) store.setReaderFontFamily(data.settings.readerFontFamily);
          if (data.settings.readerFontSize) store.setReaderFontSize(data.settings.readerFontSize);
          if (data.settings.readerLineHeight) store.setReaderLineHeight(data.settings.readerLineHeight);
          if (data.settings.readerJustify !== undefined) store.setReaderJustify(data.settings.readerJustify);
          if (data.settings.zoom) store.setZoom(data.settings.zoom);
          if (data.settings.blueLightFilter !== undefined) store.setBlueLightFilter(data.settings.blueLightFilter);
          if (data.settings.customThemeColors) store.setCustomThemeColors(data.settings.customThemeColors);
        }
        window.location.reload();
      } catch {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleExportStats = () => {
    const totalSessions = readingSessions.length;
    const totalPages = readingSessions.reduce((s, r) => s + (r.pagesRead || 0), 0);
    const totalMinutes = readingSessions.reduce((s, r) => s + (r.duration || 0), 0);
    const streak = (() => {
      let count = 0;
      const d = new Date();
      while (true) {
        const key = d.toISOString().slice(0, 10);
        const hit = readingSessions.some((r) => r.date?.startsWith(key));
        if (!hit) break;
        count++;
        d.setDate(d.getDate() - 1);
      }
      return count;
    })();

    const stats = {
      exportedAt: new Date().toISOString(),
      totalSessions,
      totalPagesRead: totalPages,
      totalReadingMinutes: totalMinutes,
      averageMinutesPerSession: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      currentStreakDays: streak,
      sessions: readingSessions.map((r) => ({
        date: r.date,
        durationMinutes: r.duration,
        pagesRead: r.pagesRead,
        bookId: r.bookId,
      })),
    };

    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumina-reading-stats-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your preferences</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className="w-full justify-start h-auto p-1">
            <TabsTrigger value="general" aria-label="General settings">General</TabsTrigger>
            <TabsTrigger value="appearance" aria-label="Appearance settings">Appearance</TabsTrigger>
            <TabsTrigger value="sync" aria-label="Cloud sync">Sync</TabsTrigger>
            <TabsTrigger value="data" aria-label="Data management">Data</TabsTrigger>
            <TabsTrigger value="about" aria-label="About Lumina">About</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" /> Profile
                </CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Reader</p>
                    <p className="text-xs text-muted-foreground">
                      Local storage only — no account required
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Local Storage Only</p>
                    <p className="text-xs text-muted-foreground">
                      All data stays on your device
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">API Key Storage</p>
                    <p className="text-xs text-muted-foreground">
                      API keys stored server-side only
                    </p>
                  </div>
                  <Switch defaultChecked disabled />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Timer className="h-4 w-4" /> Reading Timer
                </CardTitle>
                <CardDescription>Pomodoro-style timed reading sessions with breaks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Enable timer</p>
                  <Switch
                    checked={readingTimer.enabled}
                    onCheckedChange={(checked) => setReadingTimer({ enabled: checked })}
                  />
                </div>
                {readingTimer.enabled && (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Session duration: {readingTimer.duration} min</label>
                      <div className="flex gap-2">
                        {[25, 30, 45, 60].map((d) => (
                          <Button
                            key={d}
                            variant={readingTimer.duration === d ? "default" : "outline"}
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setReadingTimer({ duration: d })}
                          >
                            {d} min
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Break duration: {readingTimer.breakDuration} min</label>
                      <div className="flex gap-2">
                        {[5, 10, 15].map((d) => (
                          <Button
                            key={d}
                            variant={readingTimer.breakDuration === d ? "default" : "outline"}
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={() => setReadingTimer({ breakDuration: d })}
                          >
                            {d} min
                          </Button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="h-4 w-4" /> App Lock
                </CardTitle>
                <CardDescription>Password-protect the app on startup</CardDescription>
              </CardHeader>
              <CardContent>
                {appLock.enabled ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Lock enabled</p>
                      <Button variant="destructive" size="sm" onClick={appLock.disable}>
                        Disable
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Input
                      type="password"
                      placeholder="New password (min 4 chars)"
                      value={lockPassword}
                      onChange={(e) => setLockPassword(e.target.value)}
                    />
                    <Input
                      type="password"
                      placeholder="Confirm password"
                      value={lockConfirm}
                      onChange={(e) => setLockConfirm(e.target.value)}
                    />
                    {lockConfirm && lockPassword !== lockConfirm && (
                      <p className="text-xs text-destructive">Passwords do not match</p>
                    )}
                    <Button
                      onClick={handleLockEnable}
                      disabled={lockPassword.length < 4 || lockPassword !== lockConfirm}
                    >
                      Enable App Lock
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" /> Theme
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">
                      Toggle between light and dark theme
                    </p>
                  </div>
                  <ThemeToggle />
                </div>
</CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-lg">👆</span> Gestures
                </CardTitle>
                <CardDescription>Configure swipe sensitivity for page turning</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Swipe threshold: {swipeThreshold}px</label>
                  <Slider min={10} max={100} step={5} value={[swipeThreshold]} onValueChange={([v]) => setSwipeThreshold(v)} />
                  <p className="text-xs text-muted-foreground">Lower = more sensitive, Higher = requires longer swipe</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-lg">📱</span> Tap Zones
                </CardTitle>
                <CardDescription>Configure tap actions for left, center, and right zones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm space-y-1">
                    {tapZones.length > 0 ? (
                      tapZones.map((z) => (
                        <div key={z.id} className="flex gap-2">
                          <span className="font-medium capitalize min-w-[60px]">{z.position}:</span>
                          <span className="text-muted-foreground">{getActionLabel(z.action)}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">Not configured</span>
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setTapZoneOpen(true)}>
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Moon className="h-4 w-4" /> Night Mode Scheduler
                </CardTitle>
                <CardDescription>Automatically switch to dark theme and blue light filter at night</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Enable scheduler</p>
                  <Switch
                    checked={nightMode.isActive}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        nightMode.set(nightStart, nightEnd);
                      } else {
                        nightMode.disable();
                      }
                    }}
                  />
                </div>
                {nightMode.isActive && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium" htmlFor="night-start">Start time</label>
                      <Input id="night-start" type="time" value={nightStart} onChange={(e) => { setNightStart(e.target.value); nightMode.set(e.target.value, nightEnd); }} />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="night-end">End time</label>
                      <Input id="night-end" type="time" value={nightEnd} onChange={(e) => { setNightEnd(e.target.value); nightMode.set(nightStart, e.target.value); }} />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Cloud className="h-4 w-4" /> Cloud Sync
                </CardTitle>
                <CardDescription>Sync your data to a WebDAV server</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium" htmlFor="webdav-url">WebDAV URL</label>
                    <Input id="webdav-url" placeholder="https://example.com/remote.php/dav/files/user/" value={webdavUrl} onChange={(e) => setWebdavUrl(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium" htmlFor="webdav-user">Username</label>
                      <Input id="webdav-user" value={webdavUser} onChange={(e) => setWebdavUser(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium" htmlFor="webdav-pass">Password</label>
                      <Input id="webdav-pass" type="password" value={webdavPass} onChange={(e) => setWebdavPass(e.target.value)} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleWebdavSave} disabled={!webdavUrl}>
                      <RefreshCw className="h-4 w-4 mr-2" /> Save Config
                    </Button>
                    {isConfigured && (
                      <Button variant="outline" onClick={clearWebdavConfig}>
                        Clear
                      </Button>
                    )}
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Backup & Restore</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBackup} disabled={!isConfigured || syncing}>
                      <Upload className="h-4 w-4 mr-2" /> {syncing ? "Syncing..." : "Backup"}
                    </Button>
                    <Button variant="outline" onClick={handleRestore} disabled={!isConfigured || syncing}>
                      <Download className="h-4 w-4 mr-2" /> Restore
                    </Button>
                  </div>
                  {syncStatus && <p className="text-xs text-muted-foreground">{syncStatus}</p>}
                  {lastSync && <p className="text-xs text-muted-foreground">Last sync: {new Date(lastSync).toLocaleString()}</p>}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Your Data</CardTitle>
                <CardDescription>
                  {books.length} books, {vocabulary.length} words, {notes.length} notes,{" "}
                  {highlights.length} highlights
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-xs text-muted-foreground">
                      Download a JSON backup of your data
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4 mr-2" /> Export
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Import Data</p>
                    <p className="text-xs text-muted-foreground">
                      Restore from a previously exported backup
                    </p>
                  </div>
                  <label>
                    <Button variant="outline" size="sm" asChild>
                      <span><Upload className="h-4 w-4 mr-2" /> Import</span>
                    </Button>
                    <input type="file" accept=".json" className="hidden" onChange={handleImport} />
                  </label>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Export Reading Stats</p>
                    <p className="text-xs text-muted-foreground">
                      Download your reading statistics as JSON
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportStats}>
                    <Download className="h-4 w-4 mr-2" /> Stats
                  </Button>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-destructive">Clear All Data</p>
                    <p className="text-xs text-muted-foreground">
                      Remove all books, notes, vocabulary, and reading history
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setClearDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm text-muted-foreground">
                    To enable AI features (definitions, explanations, translations), add your
                    API key to <code className="text-xs bg-background px-1 rounded">.env.local</code>:
                  </p>
                  <code className="mt-2 block text-xs text-muted-foreground">
                    AI_API_KEY=your_key_here
                  </code>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" /> About Lumina
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="text-sm">0.1.0</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Framework</p>
                  <p className="text-sm">Next.js 15 + React 19</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">UI</p>
                  <p className="text-sm">shadcn/ui + Tailwind CSS</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Storage</p>
                  <p className="text-sm">localStorage (client-side)</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">PDF Engine</p>
                  <p className="text-sm">pdf.js</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Spaced Repetition</p>
                  <p className="text-sm">SM-2 Algorithm</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <TapZoneSettings open={tapZoneOpen} onOpenChange={setTapZoneOpen} />

        <Dialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Data?</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">
              This will permanently delete all your books, notes, vocabulary, and reading
              history. This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setClearDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearAll}>
                Clear Everything
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShellLayout>
  );
}
