"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import useStore from "@/lib/store";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";
import { useMetadata } from "@/hooks/use-metadata";

async function loadPdfWorker() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
  return pdfjsLib;
}

export function UploadZone() {
  const addBook = useStore((s) => s.addBook);
  const updateBook = useStore((s) => s.updateBook);
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const { lookupByTitle } = useMetadata();

  const processFile = useCallback(
    async (file) => {
      const ext = file.name.split(".").pop().toLowerCase();

      if (!["pdf", "txt", "epub", "cbz", "cbr", "docx", "odt", "rtf", "htm", "html", "md"].includes(ext)) {
        toast("Unsupported file format. Please upload PDF, EPUB, CBZ, DOCX, ODT, RTF, HTML, MD, or TXT files.", "warning");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        toast("File too large. Maximum size is 100MB.", "warning");
        return;
      }

      const maybeFetchMetadata = (book) => {
        if (book.author === "Unknown Author" || !book.author) {
          lookupByTitle(book.title).then((result) => {
            if (result) {
              const updates = {};
              if (result.author) updates.author = result.author;
              if (result.description) updates.description = result.description;
              if (result.coverUrl) updates.coverUrl = result.coverUrl;
              if (Object.keys(updates).length > 0) {
                updateBook(book.id, updates);
              }
            }
          });
        }
      };

      if (ext === "pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdfjsLib = await loadPdfWorker();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer.slice(0) }).promise;
        const totalPages = pdf.numPages;

        let title = file.name.replace(/\.pdf$/i, "");
        let author = "Unknown Author";

        try {
          const metadata = await pdf.getMetadata();
          if (metadata?.info?.Title) title = metadata.info.Title;
          if (metadata?.info?.Author) author = metadata.info.Author;
        } catch {}

        const book = {
          id: crypto.randomUUID(),
          title,
          author,
          format: "pdf",
          status: "reading",
          totalPages,
          currentPage: 0,
          progress: 0,
          lastOpened: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          fileData: arrayBuffer,
        };

        addBook(book);
        maybeFetchMetadata(book);
        return book;
      }

      if (ext === "cbz" || ext === "cbr") {
        if (ext === "cbr") {
          toast("CBR format is not yet supported. Please convert to CBZ.", "warning");
          return;
        }
        const arrayBuffer = await file.arrayBuffer();
        const book = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.cbz$/i, ""),
          author: "Unknown Author",
          format: "cbz",
          status: "reading",
          totalPages: 0,
          currentPage: 0,
          progress: 0,
          lastOpened: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          fileData: arrayBuffer,
        };
        addBook(book);
        maybeFetchMetadata(book);
        return book;
      }

      if (ext === "epub") {
        const arrayBuffer = await file.arrayBuffer();
        const book = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.epub$/i, ""),
          author: "Unknown Author",
          format: "epub",
          status: "reading",
          totalPages: 0,
          currentPage: 0,
          progress: 0,
          lastOpened: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          fileData: arrayBuffer,
        };
        addBook(book);
        maybeFetchMetadata(book);
        return book;
      }

      if (ext === "txt") {
        const text = await file.text();
        const book = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.txt$/i, ""),
          author: "Unknown Author",
          format: "txt",
          status: "reading",
          totalPages: 1,
          currentPage: 0,
          progress: 0,
          lastOpened: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          textContent: text,
        };

        addBook(book);
        maybeFetchMetadata(book);
        return book;
      }

      if (ext === "docx") {
        const arrayBuffer = await file.arrayBuffer();
        let text = "";
        try {
          const mammoth = await import("mammoth");
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } catch {
          text = "[Could not extract text from DOCX file]";
        }
        const book = {
          id: crypto.randomUUID(),
          title: file.name.replace(/\.docx$/i, ""),
          author: "Unknown Author",
          format: "txt",
          status: "reading",
          totalPages: 1,
          currentPage: 0,
          progress: 0,
          lastOpened: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          textContent: text,
        };
        addBook(book);
        maybeFetchMetadata(book);
        return book;
      }

      if (ext === "odt" || ext === "rtf" || ext === "htm" || ext === "html" || ext === "md") {
        const text = await file.text();
        // Strip HTML tags for HTML files
        const cleaned = ["htm", "html"].includes(ext)
          ? text.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").replace(/\n{3,}/g, "\n\n").trim()
          : text;
        const book = {
          id: crypto.randomUUID(),
          title: file.name.replace(new RegExp(`\\.(${ext})$`, "i"), ""),
          author: "Unknown Author",
          format: "txt",
          status: "reading",
          totalPages: 1,
          currentPage: 0,
          progress: 0,
          lastOpened: new Date().toISOString(),
          dateAdded: new Date().toISOString(),
          fileName: file.name,
          fileSize: file.size,
          textContent: cleaned,
        };
        addBook(book);
        maybeFetchMetadata(book);
        return book;
      }
    },
    [addBook, updateBook, toast, lookupByTitle]
  );

  const handleFiles = useCallback(
    async (files) => {
      if (files.length === 0) return;
      setUploading(true);
      for (const file of files) {
        try {
          await processFile(file);
        } catch {
        }
      }
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFile]
  );

  const handleFileUpload = useCallback(
    (e) => handleFiles(Array.from(e.target.files || [])),
    [handleFiles]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      handleFiles(Array.from(e.dataTransfer.files || []));
    },
    [handleFiles]
  );

  return (
    <Card
      className={cn("border-dashed transition-colors", dragging && "border-primary bg-primary/5")}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <CardContent className="flex flex-col items-center justify-center py-8">
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 cursor-pointer transition-colors hover:bg-primary/20"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <p className="mt-3 text-sm font-medium">
          {uploading ? "Processing files..." : "Drop files here or click to upload"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">Supports PDF, EPUB, CBZ, DOCX, ODT, RTF, HTML, MD, and TXT files up to 100MB</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt,.epub,.cbz,.cbr,.docx,.odt,.rtf,.htm,.html,.md"
          multiple
          onChange={handleFileUpload}
        />
      </CardContent>
    </Card>
  );
}
