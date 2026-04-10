"use client";

export function HeroSkeleton() {
  return (
    <div className="h-[75vh] min-h-[500px] bg-slate-200 animate-pulse rounded-none" />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden border border-slate-100 shadow-md">
      <div className="h-48 bg-slate-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-1/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-5 w-3/4 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-slate-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-slate-200 rounded animate-pulse mx-auto" />
      <div className="h-1 w-16 bg-slate-200 rounded animate-pulse mx-auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
