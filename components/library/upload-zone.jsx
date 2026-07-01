"use client";

import { useCallback, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import useStore from "@/lib/store";

async function loadPdfWorker() {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  return pdfjsLib;
}

export function UploadZone() {
  const addBook = useStore((s) => s.addBook);
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const processFile = useCallback(
    async (file) => {
      const ext = file.name.split(".").pop().toLowerCase();

      if (!["pdf", "txt"].includes(ext)) {
        toast("Unsupported file format. Please upload PDF or TXT files.", "warning");
        return;
      }

      if (file.size > 100 * 1024 * 1024) {
        toast("File too large. Maximum size is 100MB.", "warning");
        return;
      }

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
        return book;
      }

      const book = {
        id: crypto.randomUUID(),
        title: file.name.replace(/\.[^/.]+$/, ""),
        author: "Unknown Author",
        format: ext,
        status: "want_to_read",
        totalPages: 0,
        currentPage: 0,
        progress: 0,
        lastOpened: null,
        dateAdded: new Date().toISOString(),
        fileName: file.name,
        fileSize: file.size,
      };

      addBook(book);
      return book;
    },
    [addBook]
  );

  const handleFileUpload = useCallback(
    async (e) => {
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;

      setUploading(true);
      for (const file of files) {
        try {
          await processFile(file);
        } catch (err) {
          console.error("Failed to process file:", file.name, err);
        }
      }
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [processFile]
  );

  return (
    <Card className="border-dashed">
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
        <p className="mt-1 text-xs text-muted-foreground">Supports PDF and TXT files</p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.txt"
          multiple
          onChange={handleFileUpload}
        />
      </CardContent>
    </Card>
  );
}
