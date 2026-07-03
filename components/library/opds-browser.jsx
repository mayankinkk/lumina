"use client";

import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, BookOpen, LibraryBig, Plus, X, ChevronLeft, Globe } from "lucide-react";
import { useOpds } from "@/hooks/use-opds";
import useStore from "@/lib/store";
import { cn } from "@/lib/utils";

export function OpdsBrowser() {
  const addBook = useStore((s) => s.addBook);
  const { catalogs, feed, loading, error, breadcrumbs, addCatalog, removeCatalog, fetchFeed, navigateBack, resetFeed } = useOpds();
  const [open, setOpen] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [downloading, setDownloading] = useState(null);

  const handleAddCatalog = () => {
    if (newName && newUrl) {
      addCatalog(newName, newUrl);
      setNewName("");
      setNewUrl("");
      setShowAdd(false);
    }
  };

  const handleSelectFeed = (catalog) => {
    fetchFeed(catalog.url, catalog.name);
  };

  const handleDownload = async (entry) => {
    const epubLink = entry.links.find((l) => l.type === "application/epub+zip" || (l.type && l.type.includes("epub")));
    const anyLink = epubLink || entry.links[0];
    if (!anyLink?.href) return;

    setDownloading(entry.id);
    try {
      const url = anyLink.href.startsWith("http") ? anyLink.href : new URL(anyLink.href, breadcrumbs[breadcrumbs.length - 1]?.url).href;
      const res = await fetch(url);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();

      addBook({
        id: crypto.randomUUID(),
        title: entry.title,
        author: entry.author || "Unknown Author",
        format: "epub",
        status: "reading",
        totalPages: 0,
        currentPage: 0,
        progress: 0,
        lastOpened: new Date().toISOString(),
        dateAdded: new Date().toISOString(),
        fileName: `${entry.title}.epub`,
        fileSize: blob.size,
        fileData: arrayBuffer,
      });
    } catch (err) {
      console.error("Download failed:", err);
    }
    setDownloading(null);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetFeed(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Globe className="h-4 w-4" /> OPDS Catalogs
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {feed ? (
              <>
                <button onClick={navigateBack} className="hover:text-foreground">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="truncate">{feed.title}</span>
              </>
            ) : (
              <>
                <Globe className="h-5 w-5" /> OPDS Catalogs
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-2">
          {!feed && !loading && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Your Catalogs</p>
                <Button variant="outline" size="sm" onClick={() => setShowAdd(!showAdd)}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> Add
                </Button>
              </div>

              {showAdd && (
                <div className="rounded-lg border p-3 space-y-2">
                  <Input placeholder="Catalog Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
                  <Input placeholder="OPDS Feed URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} />
                  <Button size="sm" onClick={handleAddCatalog}>Add Catalog</Button>
                </div>
              )}

              {catalogs.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 cursor-pointer" onClick={() => handleSelectFeed(cat)}>
                  <div className="flex items-center gap-3">
                    <LibraryBig className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{cat.name}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[300px]">{cat.url}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={(e) => { e.stopPropagation(); removeCatalog(cat.id); }}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </>
          )}

          {feed && !loading && (
            <div className="grid gap-2">
              {feed.entries.map((entry) => {
                if (entry.isNav) {
                  return (
                    <div key={entry.id} className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 cursor-pointer" onClick={() => {
                      const link = entry.links.find((l) => l.type === "application/atom+xml;profile=opds-catalog" || l.rel === "subsection");
                      if (link?.href) fetchFeed(link.href, entry.title);
                    }}>
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 text-muted-foreground" />
                        <p className="text-sm font-medium">{entry.title}</p>
                      </div>
                      <ChevronLeft className="h-4 w-4 rotate-180 text-muted-foreground" />
                    </div>
                  );
                }

                const hasEpub = entry.links.some((l) => l.type === "application/epub+zip");
                return (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{entry.title}</p>
                          <p className="text-xs text-muted-foreground">{entry.author}</p>
                          {entry.summary && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{entry.summary}</p>}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {hasEpub && (
                            <Button
                              variant="default"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleDownload(entry)}
                              disabled={downloading === entry.id}
                            >
                              {downloading === entry.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Download"}
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive">Error: {error}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}