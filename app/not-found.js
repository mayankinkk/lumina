"use client";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="text-6xl font-bold text-muted-foreground/30 mb-4">404</h2>
      <h3 className="text-xl font-semibold mb-2">Page not found</h3>
      <p className="text-sm text-muted-foreground mb-4">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Button onClick={() => window.location.href = "/"}>Go Home</Button>
    </div>
  );
}
