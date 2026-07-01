"use client";

import { useState, useMemo } from "react";
import ShellLayout from "@/components/layout/shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Edit3, Trash2, Highlighter, StickyNote } from "lucide-react";
import useStore from "@/lib/store";

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

  const filteredHighlights = useMemo(() => {
    return highlights.filter(
      (h) =>
        !searchQuery ||
        h.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [highlights, searchQuery]);

  const filteredNotes = useMemo(() => {
    return notes.filter(
      (n) =>
        !searchQuery ||
        n.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.bookTitle && n.bookTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [notes, searchQuery]);

  const getBookTitle = (bookId) => {
    return books.find((b) => b.id === bookId)?.title || "Unknown Book";
  };

  const openNewNote = () => {
    setEditingItem(null);
    setNoteText("");
    setNoteHighlight("#fde047");
    setDialogOpen(true);
  };

  const openEditNote = (note) => {
    setEditingItem(note);
    setNoteText(note.text);
    setNoteHighlight(note.color || "#fde047");
    setDialogOpen(true);
  };

  const openEditHighlight = (highlight) => {
    setEditingItem({ ...highlight, isHighlight: true });
    setNoteText(highlight.text);
    setNoteHighlight(highlight.color || "#fde047");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!noteText.trim()) return;

    if (editingItem?.isHighlight) {
      updateHighlight(editingItem.id, {
        text: noteText,
        color: noteHighlight,
      });
    } else if (editingItem) {
      updateNote(editingItem.id, { text: noteText, color: noteHighlight });
    } else {
      addNote({
        id: Date.now().toString(),
        bookId: "",
        bookTitle: "",
        text: noteText,
        page: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        color: noteHighlight,
      });
    }
    setDialogOpen(false);
  };

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">Notes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {highlights.length + notes.length} item
              {highlights.length + notes.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          <Button onClick={openNewNote}>
            <Plus className="h-4 w-4 mr-2" /> Add Note
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search notes and highlights..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="highlights" className="gap-1.5">
              <Highlighter className="h-3.5 w-3.5" />
              Highlights ({highlights.length})
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1.5">
              <StickyNote className="h-3.5 w-3.5" />
              Notes ({notes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="mt-4">
            {filteredHighlights.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Highlighter className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {highlights.length === 0
                    ? "No highlights yet"
                    : "No highlights match your search"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select text in the reader and click the highlight icon
                </p>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredHighlights.map((h) => (
                  <Card key={h.id} className="relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: h.color }}
                    />
                    <CardContent className="pl-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-literata italic text-muted-foreground">
                            &ldquo;{h.text}&rdquo;
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {getBookTitle(h.bookId)}
                            {h.page ? ` · Page ${h.page}` : ""}
                          </p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditHighlight(h)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => removeHighlight(h.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {filteredNotes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <StickyNote className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-sm text-muted-foreground">
                  {notes.length === 0 ? "No notes yet" : "No notes match your search"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredNotes.map((note) => (
                  <Card key={note.id} className="relative overflow-hidden">
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: note.color }}
                    />
                    <CardHeader className="pb-2 pl-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-medium">
                            {note.bookTitle || "Note"}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {note.page ? `Page ${note.page} · ` : ""}
                            {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => openEditNote(note)}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteNote(note.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pl-5">
                      <p className="text-sm font-literata">{note.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit" : "New"} {editingItem?.isHighlight ? "Highlight" : "Note"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                placeholder="Write your note..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={4}
              />
              <div>
                <p className="text-sm font-medium mb-2">Color</p>
                <div className="flex gap-2">
                  {highlightColors.map((c) => (
                    <button
                      key={c.value}
                      className={`h-8 w-8 rounded-full border-2 transition-transform ${
                        noteHighlight === c.value
                          ? "border-foreground scale-110"
                          : "border-transparent hover:scale-105"
                      }`}
                      style={{ backgroundColor: c.value }}
                      onClick={() => setNoteHighlight(c.value)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? "Save" : "Add"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </ShellLayout>
  );
}
