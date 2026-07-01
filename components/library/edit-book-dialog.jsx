"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import useStore from "@/lib/store";

export function EditBookDialog({ book, open, onOpenChange }) {
  const updateBook = useStore((s) => s.updateBook);
  const [title, setTitle] = useState(book?.title || "");
  const [author, setAuthor] = useState(book?.author || "");

  const handleSave = () => {
    if (!title.trim()) return;
    updateBook(book.id, { title: title.trim(), author: author.trim() || "Unknown Author" });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Book Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium" htmlFor="book-title">Title</label>
            <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" />
          </div>
          <div>
            <label className="text-sm font-medium" htmlFor="book-author">Author</label>
            <Input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
