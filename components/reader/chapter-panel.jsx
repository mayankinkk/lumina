"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import useStore from "@/lib/store";

export function ChapterPanel({ open, onOpenChange }) {
  const toc = useStore((s) => s.epubToc);
  const rendition = useStore((s) => s.epubRendition);

  const handleChapterClick = (href) => {
    if (rendition && href) {
      rendition.display(href);
    }
    onOpenChange(false);
  };

  const renderTocItems = (items, depth = 0) => {
    if (!items || items.length === 0) return null;
    return items.map((item) => (
      <div key={item.id || item.href}>
        <button
          className={`w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground rounded-sm transition-colors ${
            depth > 0 ? "pl-8" : ""
          }`}
          onClick={() => handleChapterClick(item.href)}
        >
          {item.label}
        </button>
        {item.subitems && renderTocItems(item.subitems, depth + 1)}
      </div>
    ));
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-72 sm:max-w-sm flex flex-col">
        <SheetHeader>
          <SheetTitle>Contents</SheetTitle>
        </SheetHeader>
        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-0.5 py-2">
            {toc && toc.length > 0 ? (
              renderTocItems(toc)
            ) : (
              <p className="px-4 py-2 text-sm text-muted-foreground">
                No table of contents available.
              </p>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
