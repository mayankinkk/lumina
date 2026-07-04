"use client";

import { BookOpen, BookMarked, StickyNote, FileText, Inbox } from "lucide-react";

const illustrations = {
  library: { icon: BookOpen, title: "Your library is empty", desc: "Upload PDFs, EPUBs, or comics to get started." },
  vocabulary: { icon: BookMarked, title: "No vocabulary words yet", desc: "Save words while reading to build your vocabulary." },
  notes: { icon: StickyNote, title: "No notes yet", desc: "Highlight text or add notes while reading." },
  search: { icon: FileText, title: "No results found", desc: "Try a different search term." },
  default: { icon: Inbox, title: "Nothing here yet", desc: "Start by exploring the app." },
};

export function EmptyState({ type = "default", action }) {
  const { icon: Icon, title, desc } = illustrations[type] || illustrations.default;
  return (
    <div role="status" className="flex flex-col items-center justify-center py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{desc}</p>
      {action}
    </div>
  );
}
