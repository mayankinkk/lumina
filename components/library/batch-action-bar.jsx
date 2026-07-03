"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Trash2, Tag, BookMarked, BookCheck, BookOpen, X } from "lucide-react";
import useStore from "@/lib/store";

export function BatchActionBar({ selectedIds, onClearSelection }) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const removeBook = useStore((s) => s.removeBook);
  const updateBook = useStore((s) => s.updateBook);

  const count = selectedIds.length;

  const handleDelete = () => {
    selectedIds.forEach((id) => removeBook(id));
    setDeleteConfirmOpen(false);
    onClearSelection();
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    const books = useStore.getState().books;
    selectedIds.forEach((id) => {
      const book = books.find((b) => b.id === id);
      if (book && !(book.tags || []).includes(tag)) {
        updateBook(id, { tags: [...(book.tags || []), tag] });
      }
    });
    setTagInput("");
    setTagDialogOpen(false);
  };

  const handleSetStatus = (status) => {
    selectedIds.forEach((id) => updateBook(id, { status }));
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background p-3 shadow-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2">
          <Badge variant="secondary" className="shrink-0 text-sm px-3 py-1">
            {count} book{count !== 1 ? "s" : ""} selected
          </Badge>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => handleSetStatus("reading")}>
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Reading
            </Button>
            <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => handleSetStatus("finished")}>
              <BookCheck className="h-3.5 w-3.5 mr-1" /> Finished
            </Button>
            <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => handleSetStatus("want_to_read")}>
              <BookMarked className="h-3.5 w-3.5 mr-1" /> Want to Read
            </Button>
            <Button variant="outline" size="sm" className="shrink-0 text-xs" onClick={() => setTagDialogOpen(true)}>
              <Tag className="h-3.5 w-3.5 mr-1" /> Tag
            </Button>
            <Button variant="destructive" size="sm" className="shrink-0 text-xs" onClick={() => setDeleteConfirmOpen(true)}>
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onClearSelection} aria-label="Clear selection">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete {count} book{count !== 1 ? "s" : ""}?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            {count} book{count !== 1 ? "s" : ""} will be permanently removed. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tagDialogOpen} onOpenChange={setTagDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Tag to {count} book{count !== 1 ? "s" : ""}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="batch-tag">Tag name</label>
            <Input
              id="batch-tag"
              placeholder="Enter tag name..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTagDialogOpen(false); setTagInput(""); }}>Cancel</Button>
            <Button onClick={handleAddTag} disabled={!tagInput.trim()}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
