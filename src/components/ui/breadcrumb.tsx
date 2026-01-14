"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: LucideIcon;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
    >
      <ol className="flex items-center gap-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight
                  className="h-4 w-4 flex-shrink-0 text-foreground-subtle"
                  aria-hidden="true"
                />
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium transition-colors",
                    "text-foreground-muted hover:text-foreground",
                    "max-w-[200px] truncate"
                  )}
                >
                  {Icon && (
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1.5 text-sm font-medium",
                    isLast ? "text-foreground" : "text-foreground-muted",
                    "max-w-[200px]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && (
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Compact breadcrumb variant for tight spaces
interface CompactBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function CompactBreadcrumb({ items, className }: CompactBreadcrumbProps) {
  if (items.length === 0) return null;

  // Show only first and last items with ellipsis in between
  const showEllipsis = items.length > 2;
  const visibleItems = showEllipsis
    ? [items[0], items[items.length - 1]]
    : items;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", className)}
    >
      <ol className="flex items-center gap-1">
        {visibleItems.map((item, index) => {
          const isLast = index === visibleItems.length - 1;
          const Icon = item.icon;

          return (
            <li key={index} className="flex items-center gap-1">
              {index > 0 && (
                <>
                  {showEllipsis && index === 1 && (
                    <>
                      <ChevronRight
                        className="h-3.5 w-3.5 flex-shrink-0 text-foreground-subtle"
                        aria-hidden="true"
                      />
                      <span className="text-xs text-foreground-subtle">...</span>
                    </>
                  )}
                  <ChevronRight
                    className="h-3.5 w-3.5 flex-shrink-0 text-foreground-subtle"
                    aria-hidden="true"
                  />
                </>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium transition-colors",
                    "text-foreground-muted hover:text-foreground",
                    "max-w-[120px] truncate"
                  )}
                >
                  {Icon && (
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </Link>
              ) : (
                <span
                  className={cn(
                    "flex items-center gap-1 text-xs font-medium",
                    isLast ? "text-foreground" : "text-foreground-muted",
                    "max-w-[120px]"
                  )}
                  aria-current={isLast ? "page" : undefined}
                >
                  {Icon && (
                    <Icon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
