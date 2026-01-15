"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Calendar, Square, CheckCircle2, Pause, Clock, Edit3 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

// Status display mapping
const statusConfig: Record<string, { variant: "warning" | "success" | "error"; label: string }> = {
  active: { variant: "warning", label: "Under Contract" },
  closed: { variant: "success", label: "Closed Won" },
  "on-hold": { variant: "error", label: "On Hold" },
};

// Property type colors
const propertyTypeConfig: Record<string, { bg: string; text: string }> = {
  office: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6" },
  retail: { bg: "rgba(236, 72, 153, 0.15)", text: "#ec4899" },
  industrial: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  multifamily: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981" },
  land: { bg: "rgba(120, 113, 108, 0.15)", text: "#78716c" },
  "mixed-use": { bg: "rgba(139, 92, 246, 0.15)", text: "#8b5cf6" },
};

interface DealCardProps {
  deal: Deal;
  onClick: () => void;
  onStatusChange?: (dealId: string, newStatus: "active" | "closed" | "on-hold") => void;
  onEdit?: (dealId: string) => void;
}

export function DealCard({ deal, onClick, onStatusChange, onEdit }: DealCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const status = statusConfig[deal.status] || statusConfig.active;
  const location = [deal.city, deal.state].filter(Boolean).join(", ");
  const propertyType = deal.property_type ? propertyTypeConfig[deal.property_type] : null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStatusClick = (e: React.MouseEvent, newStatus: "active" | "closed" | "on-hold") => {
    e.stopPropagation();
    onStatusChange?.(deal.id, newStatus);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(deal.id);
  };

  return (
    <Card
      variant="interactive"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="p-4 space-y-3">
        {/* Header: Name + Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Building2 className="h-4 w-4 text-info flex-shrink-0" />
            <h3 className="font-semibold text-foreground truncate text-sm">
              {deal.name}
            </h3>
          </div>
          <Badge variant={status.variant} size="sm" className="flex-shrink-0">
            {status.label}
          </Badge>
        </div>

        {/* Location */}
        {location && (
          <div className="flex items-center gap-1.5 text-sm text-foreground-muted">
            <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}

        {/* Address if available */}
        {deal.address && (
          <p className="text-xs text-foreground-subtle truncate pl-5">
            {deal.address}
          </p>
        )}

        {/* Property type badge */}
        {deal.property_type && propertyType && (
          <div className="pt-1">
            <span
              className="inline-flex px-2 py-0.5 text-[10px] font-medium rounded capitalize"
              style={{
                backgroundColor: propertyType.bg,
                color: propertyType.text,
              }}
            >
              {deal.property_type.replace("-", " ")}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Metrics row */}
        <div className="flex items-center gap-4 text-xs text-foreground-subtle">
          {deal.sf && (
            <div className="flex items-center gap-1">
              <Square className="h-3 w-3 flex-shrink-0" />
              <span>{deal.sf.toLocaleString()} SF</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <Calendar className="h-3 w-3 flex-shrink-0" />
            <span>{formatDate(deal.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Hover Quick Actions */}
      {(onStatusChange || onEdit) && isHovered && (
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 p-3 pt-6",
            "bg-gradient-to-t from-[#1C1C1C] via-[#1C1C1C]/95 to-transparent",
            "rounded-b-lg"
          )}
        >
          <div className="flex items-center gap-2">
            {/* Quick Status Buttons */}
            {onStatusChange && (
              <>
                <button
                  onClick={(e) => handleStatusClick(e, "active")}
                  title="Set Active"
                  className={cn(
                    "flex items-center justify-center h-7 w-7 rounded",
                    "transition-colors",
                    deal.status === "active"
                      ? "bg-warning/20 text-warning"
                      : "bg-[#2A2A2A] text-[#6B6B6B] hover:bg-warning/20 hover:text-warning"
                  )}
                >
                  <Clock className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleStatusClick(e, "closed")}
                  title="Set Closed"
                  className={cn(
                    "flex items-center justify-center h-7 w-7 rounded",
                    "transition-colors",
                    deal.status === "closed"
                      ? "bg-success/20 text-success"
                      : "bg-[#2A2A2A] text-[#6B6B6B] hover:bg-success/20 hover:text-success"
                  )}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={(e) => handleStatusClick(e, "on-hold")}
                  title="Set On Hold"
                  className={cn(
                    "flex items-center justify-center h-7 w-7 rounded",
                    "transition-colors",
                    deal.status === "on-hold"
                      ? "bg-error/20 text-error"
                      : "bg-[#2A2A2A] text-[#6B6B6B] hover:bg-error/20 hover:text-error"
                  )}
                >
                  <Pause className="h-3.5 w-3.5" />
                </button>
              </>
            )}

            {/* Spacer */}
            {onStatusChange && onEdit && <div className="flex-1" />}

            {/* Edit Button */}
            {onEdit && (
              <button
                onClick={handleEditClick}
                title="Edit Deal"
                className={cn(
                  "flex items-center gap-1.5 h-7 px-2.5 rounded text-[11px] font-medium",
                  "bg-[#2A2A2A] text-[#A1A1A1] hover:bg-[#3E3E3E] hover:text-[#EDEDED]",
                  "transition-colors"
                )}
              >
                <Edit3 className="h-3 w-3" />
                Edit
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
