"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle2, BookOpen, Trash2, Pencil, List, Check, BarChart3, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCoverColor } from "@/lib/cover-colors";
import useStore from "@/lib/store";
import { BookStatsDialog } from "./book-stats-dialog";
import { useMetadata } from "@/hooks/use-metadata";

export function BookListItem({ book, onToggleSelect, isSelected }) {
  const removeBook = useStore((s) => s.removeBook);
  const updateBook = useStore((s) => s.updateBook);
  const addToReadingQueue = useStore((s) => s.addToReadingQueue);
  const readingQueue = useStore((s) => s.readingQueue);
  const { lookupByTitle } = useMetadata();
  const [metaLoadingId, setMetaLoadingId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);

  const handleAutoMetadata = async () => {
    setMetaLoadingId(book.id);
    const result = await lookupByTitle(book.title);
    if (result) {
      const updates = {};
      if (result.author) updates.author = result.author;
      if (result.description) updates.description = result.description;
      if (result.coverUrl) updates.coverUrl = result.coverUrl;
      if (Object.keys(updates).length > 0) {
        updateBook(book.id, updates);
      }
    }
    setMetaLoadingId(null);
  };

  const statusConfig = {
    reading: { label: "READING", icon: BookOpen, className: "text-green-600 dark:text-green-400" },
    finished: { label: "FINISHED", icon: CheckCircle2, className: "text-muted-foreground" },
    want_to_read: { label: "WANT TO READ", icon: null, className: "text-muted-foreground" },
  };

  const status = statusConfig[book.status];
  const coverColor = getCoverColor(book.title);

  return (
    <>
      <div className="group relative">
        <Link href={`/reader/${book.id}`}>
          <div className={cn(
            "flex items-center gap-4 rounded-lg border p-3 transition-colors hover:bg-accent",
            book.status === "finished" && "opacity-70"
          )}>
            <div
              className={cn(
                "flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded border transition-colors",
                isSelected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"
              )}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSelect(book.id); }}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onToggleSelect(book.id); } }}
            >
              {isSelected && <Check className="h-3 w-3" />}
            </div>
            <div className={cn("h-16 w-12 shrink-0 rounded flex items-center justify-center p-1", coverColor)}>
              <p className="font-literata text-[8px] font-semibold text-center leading-tight">
                {book.title}
              </p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground">{book.author}</p>
                </div>
                <Badge variant="secondary" className="text-[10px] shrink-0 uppercase">
                  {book.format}
                </Badge>
              </div>
              {book.status === "reading" && book.totalPages > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{book.progress}%</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {book.currentPage}/{book.totalPages}
                    </span>
                  </div>
                  <Progress value={book.progress} className="h-1" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {status.icon && <status.icon className={cn("h-3.5 w-3.5", status.className)} />}
              <span className={cn("text-xs", status.className)}>{status.label}</span>
              {(!book.author || book.author === "Unknown Author") && (
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); handleAutoMetadata(); }} aria-label={`Auto-fetch metadata for ${book.title}`}>
                  <RefreshCw className={cn("h-3.5 w-3.5", metaLoadingId === book.id && "animate-spin")} />
                </Button>
              )}
              {!readingQueue.includes(book.id) && (
                <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); addToReadingQueue(book.id); }} aria-label={`Add ${book.title} to queue`}>
                  <List className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); setStatsOpen(true); }} aria-label={`Stats for ${book.title}`}>
                <BarChart3 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); setEditTitle(book.title); setEditAuthor(book.author); setEditOpen(true); }} aria-label={`Edit ${book.title}`}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.preventDefault(); setConfirmOpen(true); }} aria-label={`Delete ${book.title}`}>
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        </Link>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Book Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="el-title">Title</label>
              <Input id="el-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="el-author">Author</label>
              <Input id="el-author" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => { updateBook(book.id, { title: editTitle.trim() || book.title, author: editAuthor.trim() || "Unknown Author" }); setEditOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BookStatsDialog bookId={book.id} open={statsOpen} onOpenChange={setStatsOpen} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete book?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">&quot;{book.title}&quot; will be permanently removed. This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { removeBook(book.id); setConfirmOpen(false); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
