"use client";

import { useCallback, useRef } from "react";
import { Upload, FileText, FileType, Globe, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import useStore from "@/lib/store";

const importSources = [
  { label: "Device", icon: Upload, description: "Upload from device" },
  { label: "Google Drive", icon: Cloud, description: "Import from Drive" },
  { label: "Dropbox", icon: Cloud, description: "Import from Dropbox" },
  { label: "OneDrive", icon: Cloud, description: "Import from OneDrive" },
  { label: "URL (PDF)", icon: Globe, description: "Import from URL" },
];

export function UploadZone() {
  const addBook = useStore((s) => s.addBook);
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback(
    (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach((file) => {
        const format = file.name.split(".").pop().toLowerCase();
        const newBook = {
          id: Date.now().toString(),
          title: file.name.replace(/\.[^/.]+$/, ""),
          author: "Unknown Author",
          coverColor: "bg-indigo-100 dark:bg-indigo-900/30",
          progress: 0,
          totalPages: 0,
          currentPage: 0,
          status: "reading",
          lastOpened: new Date().toISOString(),
          format,
          estimatedTimeLeft: "N/A",
        };
        addBook(newBook);
      });
    },
    [addBook]
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
        <p className="mt-3 text-sm font-medium">Drop files here or click to upload</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports PDF, EPUB, MOBI, TXT, DOCX
        </p>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.epub,.mobi,.txt,.docx"
          multiple
          onChange={handleFileUpload}
        />

        <div className="mt-6 grid grid-cols-5 gap-3 w-full max-w-lg">
          {importSources.map((source) => (
            <button
              key={source.label}
              className="flex flex-col items-center gap-1.5 rounded-lg border p-2.5 transition-colors hover:bg-accent"
            >
              <source.icon className="h-4 w-4 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {source.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
