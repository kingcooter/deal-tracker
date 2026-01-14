"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CheckSquare,
  Users,
  Plus,
  MoreHorizontal,
  ChevronRight,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Breadcrumb, type BreadcrumbItem } from "@/components/ui/breadcrumb";

interface TableLayoutProps {
  children: React.ReactNode;
  activeTable: "deals" | "tasks" | "contacts";
  breadcrumbs?: BreadcrumbItem[];
}

const tableConfig = {
  deals: { name: "Deals", href: "/deals", icon: Building2 },
  tasks: { name: "Tasks", href: "/tasks", icon: CheckSquare },
  contacts: { name: "Contacts", href: "/contacts", icon: Users },
} as const;

export function TableLayout({ children, activeTable, breadcrumbs }: TableLayoutProps) {
  const table = tableConfig[activeTable];
  const Icon = table.icon;

  // Default breadcrumbs if none provided
  const defaultBreadcrumbs: BreadcrumbItem[] = [
    { label: table.name, icon: Icon },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-48px)] -m-4 md:-m-6 bg-[#1C1C1C]">
      {/* Header with Breadcrumb */}
      <div className="flex items-center justify-between h-12 px-4 md:px-6 border-b border-[#2A2A2A] bg-[#1C1C1C]">
        <Breadcrumb items={breadcrumbs || defaultBreadcrumbs} />
      </div>

      {/* Main Content Area - Full Width */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

interface ToolbarProps {
  onNewClick: () => void;
  newButtonLabel: string;
  filterCount?: number;
  onFilterClick?: () => void;
  filterOpen?: boolean;
  filterContent?: React.ReactNode;
  sortLabel?: string;
  selectedCount?: number;
  onDeleteSelected?: () => void;
  children?: React.ReactNode;
}

export function Toolbar({
  onNewClick,
  newButtonLabel,
  filterCount,
  onFilterClick,
  filterOpen,
  filterContent,
  sortLabel,
  selectedCount = 0,
  onDeleteSelected,
  children,
}: ToolbarProps) {
  return (
    <div className="flex items-center justify-between h-12 px-4 md:px-6 border-b border-[#2A2A2A] bg-[#1C1C1C]">
      <div className="flex items-center gap-2 flex-wrap">
        {/* Bulk actions when rows selected */}
        {selectedCount > 0 ? (
          <>
            <span className="text-[13px] text-[#EDEDED] mr-2 whitespace-nowrap">
              {selectedCount} selected
            </span>
            {onDeleteSelected && (
              <button
                onClick={onDeleteSelected}
                className="flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#F87171] border border-[#F87171]/30 rounded-md hover:bg-[#F87171]/10 transition-colors whitespace-nowrap"
              >
                Delete
              </button>
            )}
          </>
        ) : (
          <>
            {/* Filter button */}
            <div className="relative">
              <button
                onClick={onFilterClick}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 text-[13px] text-[#EDEDED] border rounded-md transition-colors whitespace-nowrap",
                  filterOpen || (filterCount && filterCount > 0)
                    ? "border-[#3ECF8E] bg-[#3ECF8E]/10"
                    : "border-[#3E3E3E] hover:bg-[#2A2A2A]"
                )}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={cn("flex-shrink-0", filterCount && filterCount > 0 ? "text-[#3ECF8E]" : "text-[#6B6B6B]")}
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>Filter</span>
                {filterCount && filterCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] bg-[#3ECF8E] text-[#1C1C1C] rounded font-medium">
                    {filterCount}
                  </span>
                )}
              </button>
              {filterContent}
            </div>

            {/* Sort indicator */}
            {sortLabel && (
              <span className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#A1A1A1] bg-[#2A2A2A] rounded whitespace-nowrap">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-[#6B6B6B] flex-shrink-0"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
                <span>{sortLabel}</span>
              </span>
            )}

            {/* Additional toolbar items */}
            {children}
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* New button */}
        <button
          onClick={onNewClick}
          className="flex items-center gap-2 px-3 py-1.5 text-[13px] font-medium text-[#1C1C1C] bg-[#3ECF8E] rounded-md hover:bg-[#4AE39A] transition-colors whitespace-nowrap"
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">{newButtonLabel}</span>
        </button>

        {/* More options */}
        <button className="p-2 rounded hover:bg-[#2A2A2A] transition-colors">
          <MoreHorizontal className="h-4 w-4 text-[#6B6B6B] flex-shrink-0" />
        </button>
      </div>
    </div>
  );
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalRecords,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center justify-between h-11 px-4 md:px-6 border-t border-[#2A2A2A] bg-[#1C1C1C]">
      {/* Page controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-2 py-1 text-[13px] text-[#EDEDED] disabled:text-[#6B6B6B] disabled:cursor-not-allowed hover:bg-[#2A2A2A] rounded transition-colors"
        >
          &lt;
        </button>
        <span className="text-[13px] text-[#A1A1A1] whitespace-nowrap">
          Page{" "}
          <span className="px-2 py-0.5 bg-[#2A2A2A] border border-[#3E3E3E] rounded text-[#EDEDED]">
            {currentPage}
          </span>{" "}
          of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-2 py-1 text-[13px] text-[#EDEDED] disabled:text-[#6B6B6B] disabled:cursor-not-allowed hover:bg-[#2A2A2A] rounded transition-colors"
        >
          &gt;
        </button>
      </div>

      {/* Rows per page */}
      <div className="flex items-center gap-4">
        <select
          value={rowsPerPage}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
          className="px-2 py-1 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded cursor-pointer hover:border-[#4E4E4E] transition-colors"
        >
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </select>

        {/* Record count */}
        <span className="text-[13px] text-[#6B6B6B] whitespace-nowrap hidden sm:inline">
          {totalRecords} record{totalRecords !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
  );
}

// Export TabBar as a simpler component without tab functionality
interface TabBarProps {
  activeTable: string;
  icon: React.ReactNode;
}

export function TabBar({ activeTable, icon }: TabBarProps) {
  return null; // TabBar is no longer needed - breadcrumbs replace this
}
