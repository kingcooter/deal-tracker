"use client";

import * as React from "react";
import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { getDeals, updateDeal } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";
import { NewDealPanel } from "@/components/table-editor/new-deal-panel";
import { DealKanban } from "@/components/deal-pipeline/deal-kanban";
import type { Deal } from "@/lib/supabase/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DealCardGrid, DealFilters } from "@/components/deals";
import { useQueryState } from "nuqs";
import { Plus, LayoutGrid, Kanban } from "lucide-react";
import { Skeleton, SkeletonDealGrid } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ViewMode = "grid" | "kanban";

// Loading fallback
function DealsPageSkeleton() {
  return (
    <div className="flex flex-col h-full">
      {/* Header skeleton */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="space-y-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>

      {/* Filters skeleton */}
      <div className="px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-8 w-32 rounded-md" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="flex-1 overflow-y-auto p-6">
        <SkeletonDealGrid count={8} />
      </div>
    </div>
  );
}

function DealsPageContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToastActions();

  // URL State for filters and view mode
  const [statusFilter, setStatusFilter] = useQueryState("status", { defaultValue: "" });
  const [propertyTypeFilter, setPropertyTypeFilter] = useQueryState("type", { defaultValue: "" });
  const [viewMode, setViewMode] = useQueryState<ViewMode>("view", {
    defaultValue: "grid",
    parse: (value) => (value === "kanban" ? "kanban" : "grid"),
  });

  // React Query Fetching
  const { data: deals = [], isLoading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => getDeals(),
    staleTime: 60 * 1000,
  });

  const [showNewDealPanel, setShowNewDealPanel] = React.useState(false);

  // Filter deals based on active filters
  const filteredDeals = React.useMemo(() => {
    return deals.filter((deal) => {
      if (statusFilter && deal.status !== statusFilter) return false;
      if (propertyTypeFilter && deal.property_type !== propertyTypeFilter) return false;
      return true;
    });
  }, [deals, statusFilter, propertyTypeFilter]);

  // Handle deal created - just invalidate queries since NewDealPanel uses server action
  const handleDealCreated = () => {
    // Invalidate queries to refetch deals and tasks (auto-created by server action)
    queryClient.invalidateQueries({ queryKey: ["deals"] });
    queryClient.invalidateQueries({ queryKey: ["tasks"] });
    queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
    setShowNewDealPanel(false);
  };

  // Handle deal click - navigate to deal detail page
  const handleDealClick = (deal: Deal) => {
    router.push(`/deals/${deal.id}`);
  };

  // Handle quick status change from hover actions
  const handleStatusChange = async (dealId: string, newStatus: "active" | "closed" | "on-hold") => {
    try {
      await updateDeal(dealId, { status: newStatus });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
      const statusLabels = { active: "Active", closed: "Closed Won", "on-hold": "On Hold" };
      toast.success("Status updated", `Deal marked as ${statusLabels[newStatus]}`);
    } catch (error) {
      console.error("Error updating deal status:", error);
      toast.error("Update failed", "Could not change deal status");
    }
  };

  // Handle edit from hover actions - navigate to deal settings
  const handleEdit = (dealId: string) => {
    router.push(`/deals/${dealId}/settings`);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Deals</h1>
          <p className="text-sm text-foreground-muted">
            Manage your real estate pipeline
          </p>
        </div>
        <Button onClick={() => setShowNewDealPanel(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Deal
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center justify-between">
          <DealFilters
            statusFilter={statusFilter}
            propertyTypeFilter={propertyTypeFilter}
            onStatusChange={setStatusFilter}
            onPropertyTypeChange={setPropertyTypeFilter}
            totalCount={deals.length}
            filteredCount={filteredDeals.length}
          />

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-md p-0.5">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] rounded transition-colors",
                viewMode === "grid"
                  ? "bg-[#3E3E3E] text-[#EDEDED]"
                  : "text-[#6B6B6B] hover:text-[#A1A1A1]"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] rounded transition-colors",
                viewMode === "kanban"
                  ? "bg-[#3E3E3E] text-[#EDEDED]"
                  : "text-[#6B6B6B] hover:text-[#A1A1A1]"
              )}
            >
              <Kanban className="h-3.5 w-3.5" />
              Pipeline
            </button>
          </div>
        </div>
      </div>

      {/* Content - Grid or Kanban */}
      <div className="flex-1 overflow-y-auto p-6">
        {viewMode === "kanban" ? (
          <DealKanban onNewDeal={() => setShowNewDealPanel(true)} />
        ) : (
          <DealCardGrid
            deals={filteredDeals}
            onDealClick={handleDealClick}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
            isLoading={isLoading}
            onNewDeal={() => setShowNewDealPanel(true)}
          />
        )}
      </div>

      {/* New Deal Panel */}
      <NewDealPanel
        open={showNewDealPanel}
        onClose={() => setShowNewDealPanel(false)}
        onDealCreated={handleDealCreated}
      />
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsPageSkeleton />}>
      <DealsPageContent />
    </Suspense>
  );
}
