"use client";

import { useState } from "react";
import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";
import { User, Bell, Shield, Palette, Info, Trash2, Download, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import useStore from "@/lib/store";

export default function SettingsPage() {
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const books = useStore((s) => s.books);
  const vocabulary = useStore((s) => s.vocabulary);
  const notes = useStore((s) => s.notes);
  const highlights = useStore((s) => s.highlights);

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

  const handleExport = () => {
    const data = {
      books: books.map(({ fileData, ...b }) => b),
      vocabulary,
      notes,
      highlights,
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
        window.location.reload();
      } catch {
        alert("Invalid backup file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
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
