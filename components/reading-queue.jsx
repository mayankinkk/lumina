"use client";

import { useRouter } from "next/navigation";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { List, X, ChevronUp, ChevronDown, BookOpen } from "lucide-react";
import useStore from "@/lib/store";

export function ReadingQueue() {
  const router = useRouter();
  const queue = useStore((s) => s.readingQueue);
  const books = useStore((s) => s.books);
  const removeFromReadingQueue = useStore((s) => s.removeFromReadingQueue);
  const reorderReadingQueue = useStore((s) => s.reorderReadingQueue);

  const queuedBooks = queue
    .map((id) => books.find((b) => b.id === id))
    .filter(Boolean);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" aria-label="Reading Queue">
          <List className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reading Queue</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {queuedBooks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Your reading queue is empty
            </p>
          ) : (
            queuedBooks.map((book, index) => (
              <div
                key={book.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                <div className="flex flex-col gap-0.5">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === 0}
                    onClick={() => reorderReadingQueue(index, index - 1)}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    disabled={index === queuedBooks.length - 1}
                    onClick={() => reorderReadingQueue(index, index + 1)}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{book.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                </div>
                <div className="flex items-center gap-1">
                  {index === 0 && (
                    <Button
                      variant="default"
                      size="sm"
                      className="h-7 gap-1"
                      onClick={() => router.push(`/reader/${book.id}`)}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      Start Reading
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => removeFromReadingQueue(book.id)}
                    aria-label={`Remove ${book.title} from queue`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
