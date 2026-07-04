"use client";

import ShellLayout from "@/components/layout/shell";
import useStore from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend } from "recharts";
import { BookOpen, Clock, FileText, Flame, TrendingUp, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const COLORS = ["hsl(var(--primary))", "#f59e0b", "#10b981", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover p-2 shadow-lg text-xs">
      <p className="font-medium">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color }}>
          {entry.name}: {entry.value}{entry.name.includes("min") ? " min" : ""}
        </p>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const { readingSessions, books, currentPage } = useStore(
    useShallow((s) => ({
      readingSessions: s.readingSessions,
      books: s.books,
      currentPage: s.currentPage,
    }))
  );
  const [range, setRange] = useState("30d");

  const stats = useMemo(() => {
    const now = new Date();
    const daysAgo = range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - daysAgo);

    const filtered = readingSessions.filter((s) => {
      const d = new Date(s.date);
      return d >= cutoff;
    });

    const totalMinutes = filtered.reduce((sum, s) => sum + (s.minutes || 0), 0);
    const totalPages = filtered.reduce((sum, s) => sum + (s.pagesRead || 0), 0);
    const totalSessions = filtered.length;
    const avgMinutes = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;

    // Streak
    let streak = 0;
    const d = new Date();
    while (true) {
      const key = d.toISOString().slice(0, 10);
      if (readingSessions.some((s) => s.date?.startsWith(key))) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }

    // Daily data for bar chart
    const dailyMap = {};
    for (let i = daysAgo - 1; i >= 0; i--) {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - i);
      const key = dt.toISOString().slice(0, 10);
      dailyMap[key] = { date: key, minutes: 0, pages: 0, sessions: 0 };
    }
    filtered.forEach((s) => {
      if (dailyMap[s.date]) {
        dailyMap[s.date].minutes += s.minutes || 0;
        dailyMap[s.date].pages += s.pagesRead || 0;
        dailyMap[s.date].sessions += 1;
      }
    });
    const dailyData = Object.values(dailyMap).map((d) => ({
      ...d,
      label: d.date.slice(5),
    }));

    // Per-book pie chart
    const bookMap = {};
    filtered.forEach((s) => {
      if (!bookMap[s.bookId]) bookMap[s.bookId] = 0;
      bookMap[s.bookId] += s.minutes || 0;
    });
    const pieData = Object.entries(bookMap)
      .map(([id, min]) => {
        const book = books.find((b) => b.id === id);
        return { name: book?.title || "Unknown", value: min };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 7);

    // Weekly trend (last 12 weeks)
    const weeklyMap = {};
    for (let w = 11; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay() - w * 7);
      const key = weekStart.toISOString().slice(0, 10);
      weeklyMap[key] = { week: key, minutes: 0, pages: 0 };
    }
    filtered.forEach((s) => {
      const sd = new Date(s.date);
      const weekStart = new Date(sd);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (weeklyMap[key]) {
        weeklyMap[key].minutes += s.minutes || 0;
        weeklyMap[key].pages += s.pagesRead || 0;
      }
    });
    const weeklyData = Object.values(weeklyMap).map((d) => ({
      ...d,
      label: `W/O ${d.week.slice(5)}`,
    }));

    return { totalMinutes, totalPages, totalSessions, avgMinutes, streak, dailyData, pieData, weeklyData };
  }, [readingSessions, books, range]);

  const hours = Math.floor(stats.totalMinutes / 60);
  const mins = Math.round(stats.totalMinutes % 60);

  return (
    <ShellLayout>
      <div className="p-4 lg:p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Reading Analytics</h1>
          <div className="flex gap-1">
            {["7d", "30d", "90d", "1y"].map((r) => (
              <Button
                key={r}
                variant={range === r ? "default" : "ghost"}
                size="sm"
                className="h-7 text-xs"
                onClick={() => setRange(r)}
              >
                {r === "7d" ? "7D" : r === "30d" ? "30D" : r === "90d" ? "90D" : "1Y"}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
          <StatCard icon={Flame} label="Streak" value={`${stats.streak} days`} />
          <StatCard icon={Clock} label="Reading Time" value={hours > 0 ? `${hours}h ${mins}m` : `${mins}m`} sub={`${stats.avgMinutes} min avg`} />
          <StatCard icon={FileText} label="Pages Read" value={stats.totalPages.toLocaleString()} />
          <StatCard icon={BookOpen} label="Sessions" value={stats.totalSessions} />
          <StatCard icon={TrendingUp} label="Avg Session" value={`${stats.avgMinutes} min`} />
        </div>

        {stats.dailyData.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Daily Reading Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]" aria-label="Daily reading activity chart">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.dailyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="minutes" name="Minutes" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {stats.weeklyData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px]" aria-label="Weekly trend chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="minutes" name="Minutes" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 2 }} />
                      <Line type="monotone" dataKey="pages" name="Pages" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {stats.pieData.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time Per Book</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[220px] flex items-center" aria-label="Time per book pie chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name.slice(0, 12)}${name.length > 12 ? "…" : ""} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                        style={{ fontSize: 10 }}
                      >
                        {stats.pieData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `${v} min`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {stats.totalSessions === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reading data yet. Start reading to see your analytics!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </ShellLayout>
  );
}
