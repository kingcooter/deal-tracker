"use client";

import * as React from "react";
import Link from "next/link";
import { Building2, MapPin, MoreHorizontal, Plus, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeals, updateDeal } from "@/lib/supabase/queries";
import { useToastActions } from "@/components/ui/toast";
import type { Deal } from "@/lib/supabase/types";

interface Column {
  id: string;
  title: string;
  color: string;
  bgColor: string;
}

const columns: Column[] = [
  {
    id: "active",
    title: "Under Contract",
    color: "#FBBF24",
    bgColor: "rgba(251, 191, 36, 0.1)",
  },
  {
    id: "on-hold",
    title: "On Hold",
    color: "#F87171",
    bgColor: "rgba(248, 113, 113, 0.1)",
  },
  {
    id: "closed",
    title: "Closed Won",
    color: "#3ECF8E",
    bgColor: "rgba(62, 207, 142, 0.1)",
  },
];

interface DealKanbanProps {
  onNewDeal?: () => void;
}

export function DealKanban({ onNewDeal }: DealKanbanProps) {
  const toast = useToastActions();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draggingDeal, setDraggingDeal] = React.useState<Deal | null>(null);
  const [dragOverColumn, setDragOverColumn] = React.useState<string | null>(null);

  React.useEffect(() => {
    getDeals()
      .then(setDeals)
      .catch((error) => {
        console.error("Error fetching deals:", error);
        toast.error("Failed to load deals", "Please refresh the page");
      })
      .finally(() => setLoading(false));
  }, [toast]);

  const getDealsByStatus = (status: string) => {
    return deals.filter((deal) => deal.status === status);
  };

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggingDeal(deal);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggingDeal || draggingDeal.status === columnId) {
      setDraggingDeal(null);
      return;
    }

    const oldStatus = draggingDeal.status;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) =>
        d.id === draggingDeal.id ? { ...d, status: columnId as Deal["status"] } : d
      )
    );

    try {
      await updateDeal(draggingDeal.id, { status: columnId as Deal["status"] });
      const column = columns.find((c) => c.id === columnId);
      toast.success("Deal moved", `${draggingDeal.name} → ${column?.title}`);
    } catch (error) {
      // Rollback
      setDeals((prev) =>
        prev.map((d) =>
          d.id === draggingDeal.id ? { ...d, status: oldStatus } : d
        )
      );
      toast.error("Failed to move deal", "Please try again");
    }

    setDraggingDeal(null);
  };

  const handleDragEnd = () => {
    setDraggingDeal(null);
    setDragOverColumn(null);
  };

  if (loading) {
    return (
      <div className="flex gap-4 h-full">
        {columns.map((col) => (
          <div key={col.id} className="flex-1 min-w-[280px]">
            <div className="skeleton h-10 rounded-md mb-3" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-full overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnDeals = getDealsByStatus(column.id);
        const isOver = dragOverColumn === column.id;

        return (
          <div
            key={column.id}
            className="flex-shrink-0 w-[320px] flex flex-col"
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: column.color }}
                />
                <h3 className="text-[14px] font-medium text-[#EDEDED]">
                  {column.title}
                </h3>
                <span className="text-[12px] text-[#6B6B6B] bg-[#2A2A2A] px-1.5 py-0.5 rounded">
                  {columnDeals.length}
                </span>
              </div>
              {column.id === "active" && onNewDeal && (
                <button
                  onClick={onNewDeal}
                  className="p-1 text-[#6B6B6B] hover:text-[#EDEDED] hover:bg-[#2A2A2A] rounded transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Column Content */}
            <div
              className={cn(
                "flex-1 p-2 rounded-lg transition-colors min-h-[200px]",
                isOver
                  ? "bg-[#3ECF8E]/10 border-2 border-dashed border-[#3ECF8E]/30"
                  : "bg-[#1C1C1C]/50"
              )}
            >
              <div className="space-y-2">
                {columnDeals.map((deal) => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    column={column}
                    isDragging={draggingDeal?.id === deal.id}
                    onDragStart={(e) => handleDragStart(e, deal)}
                    onDragEnd={handleDragEnd}
                  />
                ))}
                {columnDeals.length === 0 && !isOver && (
                  <div className="py-8 text-center">
                    <p className="text-[13px] text-[#6B6B6B]">No deals</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface DealCardProps {
  deal: Deal;
  column: Column;
  isDragging: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
}

function DealCard({
  deal,
  column,
  isDragging,
  onDragStart,
  onDragEnd,
}: DealCardProps) {
  return (
    <Link
      href={`/deals/${deal.id}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "block p-3 rounded-lg bg-[#2A2A2A] border border-[#3E3E3E] hover:border-[#4E4E4E] transition-all cursor-grab active:cursor-grabbing group",
        isDragging && "opacity-50 scale-95"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <Building2 className="h-4 w-4 text-[#60A5FA] flex-shrink-0" />
          <span className="text-[13px] font-medium text-[#EDEDED] truncate">
            {deal.name}
          </span>
        </div>
        <GripVertical className="h-4 w-4 text-[#6B6B6B] opacity-0 group-hover:opacity-100 flex-shrink-0" />
      </div>

      {/* Location */}
      {(deal.city || deal.state) && (
        <div className="flex items-center gap-1.5 text-[12px] text-[#A1A1A1] mb-2">
          <MapPin className="h-3 w-3" />
          <span className="truncate">
            {[deal.city, deal.state].filter(Boolean).join(", ")}
          </span>
        </div>
      )}

      {/* Property Type */}
      {deal.property_type && (
        <span className="inline-block px-2 py-0.5 text-[11px] text-[#A1A1A1] bg-[#1C1C1C] rounded capitalize">
          {deal.property_type.replace("-", " ")}
        </span>
      )}

      {/* Status indicator bar */}
      <div
        className="mt-3 h-1 rounded-full"
        style={{ backgroundColor: column.bgColor }}
      >
        <div
          className="h-full rounded-full"
          style={{
            backgroundColor: column.color,
            width: "100%",
          }}
        />
      </div>
    </Link>
  );
}
