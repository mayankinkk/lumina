"use client";

import { useState } from "react";
import useStore from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bookmark, BookmarkCheck, Trash2, X } from "lucide-react";

export function BookmarkPanel({ bookId, currentPage, onClose, onJumpToPage }) {
  const [label, setLabel] = useState("");
  const bookmarks = useStore((s) => s.bookmarks).filter((b) => b.bookId === bookId);
  const addBookmark = useStore((s) => s.addBookmark);
  const removeBookmark = useStore((s) => s.removeBookmark);

  const isPageBookmarked = bookmarks.some((b) => b.page === currentPage);

  const handleAdd = () => {
    addBookmark({
      id: crypto.randomUUID(),
      bookId,
      page: currentPage,
      label: label.trim() || `Page ${currentPage}`,
      createdAt: new Date().toISOString(),
    });
    setLabel("");
  };

  const handleRemove = (id) => {
    removeBookmark(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm lg:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl border bg-background p-4 shadow-xl lg:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2">
            <Bookmark className="h-4 w-4" /> Bookmarks
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Bookmark name..."
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          />
          <Button size="sm" onClick={handleAdd} disabled={isPageBookmarked}>
            <BookmarkCheck className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>

        {bookmarks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No bookmarks yet</p>
        )}

        <div className="space-y-1 max-h-60 overflow-y-auto">
          {bookmarks.sort((a, b) => a.page - b.page).map((bm) => (
            <div key={bm.id} className="flex items-center justify-between rounded-lg border p-2.5 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => { onJumpToPage?.(bm.page); onClose(); }}>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-12">p.{bm.page}</span>
                <span className="text-sm">{bm.label}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleRemove(bm.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}