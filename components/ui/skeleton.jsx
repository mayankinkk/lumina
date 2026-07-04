"use client";

export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-muted ${className}`} />;
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-3 space-y-3">
      <Skeleton className="aspect-[3/4] w-full rounded-md" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function BookListItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-card p-3">
      <Skeleton className="h-16 w-12 shrink-0 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 flex items-center gap-3">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function VocabularyCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <Skeleton className="h-5 w-24" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
      <div className="flex gap-2">
        <Skeleton className="h-7 w-16 rounded-full" />
        <Skeleton className="h-7 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  );
}
