"use client";

import { Button } from "@/components/ui/button";

export default function LibraryError({ error, reset }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Failed to load library</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || "Something went wrong loading your library"}
      </p>
      <Button onClick={reset}>Retry</Button>
    </div>
  );
}
