"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Clock, CheckCircle2, BookOpen, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCoverColor } from "@/lib/cover-colors";
import useStore from "@/lib/store";
import { TagInput } from "./tag-input";

export function BookCard({ book }) {
  const removeBook = useStore((s) => s.removeBook);
  const updateBook = useStore((s) => s.updateBook);
  const addTagToBook = useStore((s) => s.addTagToBook);
  const removeTagFromBook = useStore((s) => s.removeTagFromBook);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTitle, setEditTitle] = useState(book.title);
  const [editAuthor, setEditAuthor] = useState(book.author);

  const statusConfig = {
    reading: { label: "READING", icon: BookOpen, variant: "default" },
    finished: { label: "FINISHED", icon: CheckCircle2, variant: "secondary" },
    want_to_read: { label: "WANT TO READ", icon: null, variant: "outline" },
  };

  const status = statusConfig[book.status];
  const coverColor = getCoverColor(book.title);

  return (
    <>
      <div className="group relative">
        <Link href={`/reader/${book.id}`}>
          <Card className={cn(
            "overflow-hidden transition-all hover:shadow-md",
            book.status === "finished" && "opacity-75 hover:opacity-100"
          )}>
            <div className={cn("aspect-[3/4] flex items-center justify-center p-6 relative", coverColor)}>
              {book.status === "finished" && (
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
              )}
              <div className="text-center relative z-10">
                <p className="font-literata text-base font-semibold leading-tight">
                  {book.title}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {book.author}
                </p>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Badge variant={status.variant} className="text-[10px]">
                  {status.label}
                </Badge>
                <Badge variant="secondary" className="text-[10px] uppercase">
                  {book.format}
                </Badge>
              </div>
              {book.status === "reading" && book.totalPages > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{book.progress}% complete</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {book.currentPage}/{book.totalPages} pages
                    </span>
                  </div>
                  <Progress value={book.progress} className="h-1.5" />
                </div>
              )}
              {book.status === "finished" && (
                <p className="text-xs text-muted-foreground">Completed</p>
              )}
              {book.status === "want_to_read" && (
                <p className="text-xs text-muted-foreground">
                  {book.totalPages > 0 ? `${book.totalPages} pages` : "Ready to read"}
                </p>
              )}
              {(book.tags?.length > 0) && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {book.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[9px] px-1 py-0">{tag}</Badge>
                  ))}
                  {book.tags.length > 3 && (
                    <Badge variant="outline" className="text-[9px] px-1 py-0">+{book.tags.length - 3}</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 hover:bg-background" onClick={(e) => { e.preventDefault(); setEditTitle(book.title); setEditAuthor(book.author); setEditOpen(true); }} aria-label={`Edit ${book.title}`}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 bg-background/80 hover:bg-background" onClick={(e) => { e.preventDefault(); setConfirmOpen(true); }} aria-label={`Delete ${book.title}`}>
            <Trash2 className="h-3.5 w-3.5 text-destructive" />
          </Button>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Book Details</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium" htmlFor="ec-title">Title</label>
              <Input id="ec-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium" htmlFor="ec-author">Author</label>
              <Input id="ec-author" value={editAuthor} onChange={(e) => setEditAuthor(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium">Tags</label>
              <TagInput
                tags={book.tags || []}
                onAdd={(tag) => addTagToBook(book.id, tag)}
                onRemove={(tag) => removeTagFromBook(book.id, tag)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={() => { updateBook(book.id, { title: editTitle.trim() || book.title, author: editAuthor.trim() || "Unknown Author" }); setEditOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
