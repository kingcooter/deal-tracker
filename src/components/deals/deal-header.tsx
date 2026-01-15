"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Edit2, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Deal } from "@/lib/supabase/types";

interface DealHeaderProps {
  deal: Deal | null;
  isLoading?: boolean;
  onEdit?: () => void;
}

const statusColors: Record<string, { badge: "success" | "warning" | "secondary"; label: string }> = {
  active: { badge: "success", label: "Under Contract" },
  "on-hold": { badge: "warning", label: "On Hold" },
  closed: { badge: "secondary", label: "Closed Won" },
};

export function DealHeader({ deal, isLoading, onEdit }: DealHeaderProps) {
  if (isLoading) {
    return (
      <div className="border-b border-border bg-background px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 bg-surface-elevated animate-pulse rounded" />
          <div className="h-6 w-48 bg-surface-elevated animate-pulse rounded" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="border-b border-border bg-background px-4 md:px-6 lg:px-8 py-4">
        <Link
          href="/deals"
          className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Deals
        </Link>
      </div>
    );
  }

  const location = [deal.city, deal.state].filter(Boolean).join(", ");

  return (
    <div className="border-b border-border bg-background px-4 md:px-6 lg:px-8 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {/* Back link */}
          <Link
            href="/deals"
            className="inline-flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Deals
          </Link>

          {/* Deal name and status */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{deal.name}</h1>
            <Badge variant={statusColors[deal.status]?.badge || "secondary"}>
              {statusColors[deal.status]?.label || deal.status}
            </Badge>
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-1 text-sm text-foreground-muted">
              <MapPin className="h-3.5 w-3.5" />
              <span>{location}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
