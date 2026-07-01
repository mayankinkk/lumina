"use client";

import { Bell } from "lucide-react";

export function Greeting() {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
          {greeting}, Reader
        </h1>
        <p className="mt-1 text-muted-foreground">
          Welcome back to your reading journey
        </p>
      </div>
      <button className="relative rounded-full p-2 hover:bg-accent transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
      </button>
    </div>
  );
}
