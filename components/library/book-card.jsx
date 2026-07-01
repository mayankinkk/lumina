"use client";

import Link from "next/link";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Clock, CheckCircle2, BookOpen, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCoverColor } from "@/lib/cover-colors";
import useStore from "@/lib/store";

export function BookCard({ book }) {
  const removeBook = useStore((s) => s.removeBook);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
            </CardContent>
          </Card>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 hover:bg-background"
          onClick={(e) => { e.preventDefault(); setConfirmOpen(true); }}
          aria-label={`Delete ${book.title}`}
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete book?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            &quot;{book.title}&quot; will be permanently removed from your library. This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => { removeBook(book.id); setConfirmOpen(false); }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
