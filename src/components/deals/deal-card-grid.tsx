"use client";

import * as React from "react";
import { DealCard } from "./deal-card";
import { Building2 } from "lucide-react";
import { SkeletonDealGrid } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import type { Deal } from "@/lib/supabase/types";

interface DealCardGridProps {
  deals: Deal[];
  onDealClick: (deal: Deal) => void;
  onStatusChange?: (dealId: string, newStatus: "active" | "closed" | "on-hold") => void;
  onEdit?: (dealId: string) => void;
  isLoading?: boolean;
  onNewDeal?: () => void;
}

export function DealCardGrid({ deals, onDealClick, onStatusChange, onEdit, isLoading, onNewDeal }: DealCardGridProps) {
  if (isLoading) {
    return <SkeletonDealGrid count={8} />;
  }

  if (deals.length === 0) {
    return (
      <EmptyState
        icon={Building2}
        title="No deals found"
        description="Create your first deal to start tracking your pipeline."
        action={onNewDeal ? { label: "New Deal", onClick: onNewDeal } : undefined}
        size="lg"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {deals.map((deal) => (
        <DealCard
          key={deal.id}
          deal={deal}
          onClick={() => onDealClick(deal)}
          onStatusChange={onStatusChange}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
