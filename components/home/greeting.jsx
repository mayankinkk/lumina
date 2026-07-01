"use client";

import { useMemo } from "react";

export function Greeting() {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
        {greeting}, Reader
      </h1>
      <p className="mt-1 text-muted-foreground">
        Welcome back to your reading journey
      </p>
    </div>
  );
}
