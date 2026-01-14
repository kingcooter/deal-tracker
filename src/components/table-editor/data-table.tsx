"use client";

import * as React from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;

export interface SortConfig {
  column: string | null;
  direction: SortDirection;
}

interface Column<T> {
  id: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sortKey?: keyof T | ((row: T) => string | number | Date | null);
  editable?: boolean;
  render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectedIds?: Set<string>;
  onSelectAll?: () => void;
  onSelectRow?: (id: string) => void;
  onRowClick?: (row: T) => void;
  onRowDoubleClick?: (row: T, columnId: string) => void;
  isAllSelected?: boolean;
  isSomeSelected?: boolean;
  getRowId: (row: T) => string;
  emptyMessage?: string;
  sortConfig?: SortConfig;
  onSort?: (columnId: string) => void;
}

export function DataTable<T>({
  data,
  columns,
  selectedIds = new Set(),
  onSelectAll,
  onSelectRow,
  onRowClick,
  onRowDoubleClick,
  isAllSelected = false,
  isSomeSelected = false,
  getRowId,
  emptyMessage = "No data",
  sortConfig,
  onSort,
}: DataTableProps<T>) {
  const handleHeaderClick = (col: Column<T>) => {
    if (col.sortable && onSort) {
      onSort(col.id);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full">
        {/* Table Header */}
        <thead className="sticky top-0 z-10">
          <tr className="h-10 bg-[#1C1C1C] border-b border-[#3E3E3E]">
            {/* Checkbox column */}
            {onSelectRow && (
              <th className="w-10 px-3">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                  }}
                  onChange={onSelectAll}
                  className="h-4 w-4 rounded border-[#3E3E3E] bg-[#2A2A2A] text-[#3ECF8E] focus:ring-[#3ECF8E] focus:ring-offset-0 cursor-pointer"
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sortConfig?.column === col.id;
              const sortDirection = isSorted ? sortConfig?.direction : null;

              return (
                <th
                  key={col.id}
                  className={cn(
                    "px-3 text-[12px] font-medium text-[#A1A1A1] uppercase tracking-[0.05em]",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.sortable && "cursor-pointer select-none"
                  )}
                  style={{ width: col.width }}
                  onClick={() => handleHeaderClick(col)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5 transition-colors",
                      col.sortable && "hover:text-[#EDEDED]",
                      isSorted && "text-[#EDEDED]"
                    )}
                  >
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span className="flex-shrink-0">
                        {sortDirection === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5 text-[#3ECF8E]" />
                        ) : sortDirection === "desc" ? (
                          <ChevronDown className="h-3.5 w-3.5 text-[#3ECF8E]" />
                        ) : (
                          <ChevronsUpDown className="h-3.5 w-3.5 text-[#6B6B6B] opacity-0 group-hover:opacity-100" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (onSelectRow ? 1 : 0)}
                className="h-32 text-center text-[13px] text-[#6B6B6B]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selectedIds.has(rowId);

              return (
                <tr
                  key={rowId}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "h-11 border-b border-[#2A2A2A] cursor-pointer transition-colors",
                    isSelected
                      ? "bg-[rgba(62,207,142,0.1)]"
                      : "hover:bg-[#2A2A2A]"
                  )}
                >
                  {/* Checkbox */}
                  {onSelectRow && (
                    <td className="w-10 px-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onSelectRow(rowId);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="h-4 w-4 rounded border-[#3E3E3E] bg-[#2A2A2A] text-[#3ECF8E] focus:ring-[#3ECF8E] focus:ring-offset-0 cursor-pointer"
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.id}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        onRowDoubleClick?.(row, col.id);
                      }}
                      className={cn(
                        "px-3 group/cell",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.editable && "cursor-text hover:bg-[#2A2A2A]/50"
                      )}
                      style={{ width: col.width }}
                      title={col.editable ? "Double-click to edit" : undefined}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

// Status Badge Component
interface StatusBadgeProps {
  status: string;
  statusMap: Record<string, { bg: string; text: string; label: string }>;
}

export function StatusBadge({ status, statusMap }: StatusBadgeProps) {
  const style = statusMap[status] || {
    bg: "rgba(107, 107, 107, 0.15)",
    text: "#6B6B6B",
    label: status,
  };

  return (
    <span
      className="inline-flex px-2 py-0.5 text-[11px] font-medium rounded"
      style={{ backgroundColor: style.bg, color: style.text }}
    >
      {style.label}
    </span>
  );
}

// Priority Badge Component
interface PriorityBadgeProps {
  priority: string;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const priorityStyles: Record<string, { color: string; label: string }> = {
    high: { color: "#F87171", label: "High" },
    medium: { color: "#FBBF24", label: "Medium" },
    low: { color: "#3ECF8E", label: "Low" },
  };

  const style = priorityStyles[priority] || { color: "#6B6B6B", label: priority };

  return (
    <div className="flex items-center gap-1.5">
      <span
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: style.color }}
      />
      <span className="text-[13px] text-[#A1A1A1]">{style.label}</span>
    </div>
  );
}
