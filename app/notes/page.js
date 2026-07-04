"use client";

import { useState, useMemo } from "react";
import ShellLayout from "@/components/layout/shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Highlighter, StickyNote, Download, Upload } from "lucide-react";
import useStore from "@/lib/store";
import { HighlightCard, NoteCard } from "@/components/notes/note-cards";

const highlightColors = [
  { label: "Yellow", value: "#fde047" },
  { label: "Blue", value: "#93c5fd" },
  { label: "Green", value: "#86efac" },
  { label: "Pink", value: "#f9a8d4" },
  { label: "Orange", value: "#fdba74" },
];

export default function NotesPage() {
  const highlights = useStore((s) => s.highlights);
  const notes = useStore((s) => s.notes);
  const books = useStore((s) => s.books);
  const addHighlight = useStore((s) => s.addHighlight);
  const removeHighlight = useStore((s) => s.removeHighlight);
  const updateHighlight = useStore((s) => s.updateHighlight);
  const addNote = useStore((s) => s.addNote);
  const updateNote = useStore((s) => s.updateNote);
  const deleteNote = useStore((s) => s.deleteNote);

  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [noteHighlight, setNoteHighlight] = useState("#fde047");
  const [activeTab, setActiveTab] = useState("highlights");

  const filteredHighlights = useMemo(() => highlights.filter((h) => !searchQuery || h.text.toLowerCase().includes(searchQuery.toLowerCase())), [highlights, searchQuery]);
  const filteredNotes = useMemo(() => notes.filter((n) => !searchQuery || n.text.toLowerCase().includes(searchQuery.toLowerCase()) || (n.bookTitle && n.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()))), [notes, searchQuery]);
  const getBookTitle = (bookId) => books.find((b) => b.id === bookId)?.title || "Unknown Book";

  const openNew = () => { setEditingItem(null); setNoteText(""); setNoteHighlight("#fde047"); setDialogOpen(true); };
  const openEdit = (item) => { setEditingItem(item); setNoteText(item.text); setNoteHighlight(item.color || "#fde047"); setDialogOpen(true); };

  const handleExport = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      highlights,
      notes,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lumina-notes-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (data.highlights) {
            const existingIds = new Set(highlights.map((h) => h.id));
            data.highlights.forEach((h) => {
              if (!existingIds.has(h.id)) addHighlight(h);
            });
          }
          if (data.notes) {
            const existingIds = new Set(notes.map((n) => n.id));
            data.notes.forEach((n) => {
              if (!existingIds.has(n.id)) addNote(n);
            });
          }
        } catch {
          alert("Invalid backup file");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleSave = () => {
    if (!noteText.trim()) return;
    if (editingItem?.isHighlight) {
      updateHighlight(editingItem.id, { text: noteText, color: noteHighlight });
    } else if (editingItem?.isNote) {
      updateNote(editingItem.id, { text: noteText, color: noteHighlight });
    } else {
      addNote({ id: crypto.randomUUID(), bookId: "", bookTitle: "", text: noteText, page: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), color: noteHighlight });
    }
    setDialogOpen(false);
  };

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Notes</h1>
            <p className="mt-1 text-sm text-muted-foreground">{highlights.length + notes.length} item{highlights.length + notes.length !== 1 ? "s" : ""} saved</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Add Note</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" /> Export</Button>
            <Button variant="outline" size="sm" onClick={handleImport}><Upload className="h-4 w-4 mr-1" /> Import</Button>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search notes and highlights..." className="pl-9" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="highlights" className="gap-1.5" aria-label={`${highlights.length} highlights`}><Highlighter className="h-3.5 w-3.5" /> Highlights ({highlights.length})</TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5" aria-label={`${notes.length} notes`}><StickyNote className="h-3.5 w-3.5" /> Notes ({notes.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="mt-4">
            {filteredHighlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Highlighter className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">{highlights.length === 0 ? "No highlights yet" : "No highlights match your search"}</p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredHighlights.map((h) => <HighlightCard key={h.id} highlight={h} bookTitle={getBookTitle(h.bookId)} onEdit={(item) => openEdit({ ...item, isHighlight: true })} onDelete={removeHighlight} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StickyNote className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">{notes.length === 0 ? "No notes yet" : "No notes match your search"}</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((n) => <NoteCard key={n.id} note={n} onEdit={(item) => openEdit({ ...item, isNote: true })} onDelete={deleteNote} />)}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{editingItem ? "Edit" : "New"} Note</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Textarea placeholder="Write your note..." value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={4} />
              <div>
                <p className="text-sm font-medium mb-2">Color</p>
                <div className="flex gap-2">
                  {highlightColors.map((c) => (
                    <button key={c.value} className={`h-8 w-8 rounded-full border-2 transition-transform ${noteHighlight === c.value ? "border-foreground scale-110" : "border-transparent hover:scale-105"}`} style={{ backgroundColor: c.value }} onClick={() => setNoteHighlight(c.value)} aria-label={c.label} />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingItem ? "Save" : "Add"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShellLayout>
  );
}
