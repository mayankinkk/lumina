"use client";

import { Button } from "@/components/ui/button";

export default function ReaderError({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Failed to load document</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || "The document could not be opened"}
      </p>
      <div className="flex gap-2">
        <Button variant="outline" onClick={() => window.location.href = "/library"}>
          Back to Library
        </Button>
        <Button onClick={reset}>Retry</Button>
      </div>
    </div>
  );
}
