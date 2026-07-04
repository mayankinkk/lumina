"use client";

import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Keyboard } from "lucide-react";

const shortcuts = [
  { category: "Navigation", items: [
    { keys: ["←"], desc: "Previous page" },
    { keys: ["→"], desc: "Next page" },
    { keys: ["Space"], desc: "Next page" },
    { keys: ["Shift", "Space"], desc: "Previous page" },
    { keys: ["Home"], desc: "First page" },
    { keys: ["End"], desc: "Last page" },
  ]},
  { category: "View", items: [
    { keys: ["+"], desc: "Zoom in" },
    { keys: ["-"], desc: "Zoom out" },
    { keys: ["0"], desc: "Reset zoom" },
    { keys: ["F"], desc: "Toggle fullscreen" },
    { keys: ["D"], desc: "Toggle dual page" },
  ]},
  { category: "Reader", items: [
    { keys: ["T"], desc: "Table of contents" },
    { keys: ["B"], desc: "Bookmark page" },
    { keys: ["S"], desc: "Search" },
    { keys: ["?"], desc: "Show this overlay" },
    { keys: ["Esc"], desc: "Close panel/dialog" },
  ]},
];

function KeyBadge({ children }) {
  return (
    <kbd className="inline-flex h-5 min-w-[20px] items-center justify-center rounded border bg-muted px-1 font-mono text-[10px] font-medium text-muted-foreground">
      {children}
    </kbd>
  );
}

export function KeyboardShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const tag = e.target.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;
      e.preventDefault();
      setOpen((prev) => !prev);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOpen(true)} aria-label="Keyboard shortcuts">
        <Keyboard className="h-4 w-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5" /> Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {shortcuts.map((group) => (
              <div key={group.category}>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase mb-2">{group.category}</h3>
                <div className="space-y-1.5">
                  {group.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span>{item.desc}</span>
                      <div className="flex gap-0.5">
                        {item.keys.map((k, j) => (
                          <span key={j} className="flex items-center gap-0.5">
                            {j > 0 && <span className="text-muted-foreground text-[10px]">+</span>}
                            <KeyBadge>{k}</KeyBadge>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
