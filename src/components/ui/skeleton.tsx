"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

function Skeleton({
  className,
  variant = "rectangular",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "skeleton",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className
      )}
      {...props}
    />
  );
}

// Page header skeleton
function SkeletonPageHeader() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <Skeleton className="h-9 w-28 rounded-md" />
    </div>
  );
}

// Deal card skeleton - matches DealCard component
function SkeletonDealCard() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <Skeleton variant="circular" className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      {/* Location */}
      <div className="flex items-center gap-1.5">
        <Skeleton variant="circular" className="h-3.5 w-3.5" />
        <Skeleton className="h-3 w-24" />
      </div>
      {/* Property type */}
      <Skeleton className="h-5 w-16 rounded" />
      {/* Divider */}
      <div className="border-t border-border" />
      {/* Metrics */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

// Grid of deal card skeletons
function SkeletonDealGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonDealCard key={i} />
      ))}
    </div>
  );
}

// Task row skeleton
function SkeletonTaskRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0">
      <Skeleton variant="circular" className="h-4 w-4" />
      <Skeleton className="h-4 w-48 flex-shrink-0" />
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-5 w-16 rounded-full" />
      <div className="flex items-center gap-2 ml-auto">
        <Skeleton variant="circular" className="h-6 w-6" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

// Stats card skeleton
function SkeletonStatsCard() {
  return (
    <div className="border border-border rounded-lg p-4 space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-12" />
      <Skeleton className="h-3 w-24" />
    </div>
  );
}

// Dashboard skeleton
function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>
      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonTaskRow key={i} />
          ))}
        </div>
        <div className="border border-border rounded-lg p-4 space-y-4">
          <Skeleton className="h-5 w-28" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton variant="circular" className="h-8 w-8" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <Skeleton className="h-32 rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-4 py-3 border-b border-border bg-surface">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 px-4 py-3 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" className="h-8 w-8" />
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function SkeletonDealDetail() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Skeleton className="h-4 w-24" />

      {/* Header section */}
      <div className="flex gap-6">
        <Skeleton className="h-40 w-64 rounded-lg" />
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-64" />
          <div className="flex gap-4">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>
      </div>

      {/* Workflows section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-9 w-32 rounded" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="h-3 w-3" />
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  SkeletonDealDetail,
  SkeletonPageHeader,
  SkeletonDealCard,
  SkeletonDealGrid,
  SkeletonTaskRow,
  SkeletonStatsCard,
  SkeletonDashboard,
};
