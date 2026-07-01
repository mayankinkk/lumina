"use client";

import ShellLayout from "@/components/layout/shell";
import { Greeting } from "@/components/home/greeting";
import { GoalWidget } from "@/components/home/goal-widget";
import { ContinueReading } from "@/components/home/continue-reading";
import { RecentActivity } from "@/components/home/recent-activity";

export default function HomePage() {
  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <Greeting />
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GoalWidget />
          <RecentActivity />
        </div>
        <ContinueReading />
      </div>
    </ShellLayout>
  );
}
