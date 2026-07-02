"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import useStore from "@/lib/store";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export function ComicViewer({ bookId, book }) {
  const loadFileData = useStore((s) => s.loadFileData);
  const updateBook = useStore((s) => s.updateBook);
  const currentPage = useStore((s) => s.currentPage);
  const setCurrentPage = useStore((s) => s.setCurrentPage);
  const setTotalPages = useStore((s) => s.setTotalPages);
  const containerRef = useRef(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!book || !bookId) return;
    let cancelled = false;

    async function loadComic() {
      setLoading(true);
      setError(null);
      const fileData = loadFileData(bookId);
      if (!fileData) {
        setError("File data not available.");
        setLoading(false);
        return;
      }

      try {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(fileData);
        const fileNames = Object.keys(zip.files)
          .filter((name) => /\.(png|jpg|jpeg|webp|gif|avif)$/i.test(name))
          .sort((a, b) => {
            const na = parseInt(a.match(/\d+/)?.[0] || 0, 10);
            const nb = parseInt(b.match(/\d+/)?.[0] || 0, 10);
            return na - nb;
          });

        if (cancelled) return;

        if (fileNames.length === 0) {
          setError("No images found in this archive.");
          setLoading(false);
          return;
        }

        const imageBlobs = await Promise.all(
          fileNames.map(async (name) => {
            const file = zip.files[name];
            const blob = await file.async("blob");
            return URL.createObjectURL(blob);
          })
        );

        if (cancelled) {
          imageBlobs.forEach((u) => URL.revokeObjectURL(u));
          return;
        }

        setImages(imageBlobs);
        setTotalPages(imageBlobs.length);
        const target = Math.min((book.currentPage || 1) - 1, imageBlobs.length - 1);
        setCurrentPage(target + 1);
        setLoading(false);

        updateBook(bookId, {
          status: book.status === "want_to_read" ? "reading" : book.status,
          lastOpened: new Date().toISOString(),
          totalPages: imageBlobs.length,
        });
      } catch (err) {
        console.error("Comic load error:", err);
        if (!cancelled) {
          setError(`Failed to load comic: ${err?.message || "unknown error"}`);
          setLoading(false);
        }
      }
    }

    loadComic();
    return () => { cancelled = true; };
  }, [bookId, book]);

  const handleClick = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.35 && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    } else if (x > rect.width * 0.65 && currentPage < images.length) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, images.length, setCurrentPage]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-auto bg-gray-900"
      onClick={handleClick}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}
      {!loading && images.length > 0 && (
        <div className="flex items-center justify-center min-h-full p-4">
          <div
            className="relative select-none"
            style={{ maxWidth: "100%", maxHeight: "calc(100vh - 4rem)" }}
          >
            <img
              src={images[currentPage - 1]}
              alt={`Page ${currentPage}`}
              className="max-w-full max-h-[calc(100vh-4rem)] object-contain shadow-xl"
              draggable={false}
            />
            {/* Navigation zones */}
            <div className="absolute inset-y-0 left-0 w-[35%] cursor-w-resp" />
            <div className="absolute inset-y-0 right-0 w-[35%] cursor-e-resp" />
          </div>
        </div>
      )}
      {!loading && images.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 rounded-full px-4 py-2 text-white text-sm z-50">
          <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1} className="disabled:opacity-30">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span>{currentPage} / {images.length}</span>
          <button onClick={() => setCurrentPage(Math.min(images.length, currentPage + 1))} disabled={currentPage >= images.length} className="disabled:opacity-30">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
