"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4">
        {error?.message || "An unexpected error occurred"}
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
