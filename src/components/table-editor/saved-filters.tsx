"use client";

import * as React from "react";
import { Bookmark, Plus, Trash2, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FilterConfig } from "./filter-dropdown";

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterConfig[];
  createdAt: string;
}

interface SavedFiltersProps {
  storageKey: string;
  currentFilters: FilterConfig[];
  onApplyFilter: (filters: FilterConfig[]) => void;
}

export function SavedFilters({
  storageKey,
  currentFilters,
  onApplyFilter,
}: SavedFiltersProps) {
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [newFilterName, setNewFilterName] = React.useState("");
  const [activeFilterId, setActiveFilterId] = React.useState<string | null>(null);

  // Load saved filters from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem(`saved-filters-${storageKey}`);
    if (stored) {
      try {
        setSavedFilters(JSON.parse(stored));
      } catch {
        // Invalid JSON, ignore
      }
    }
  }, [storageKey]);

  // Save filters to localStorage
  const persistFilters = (filters: SavedFilter[]) => {
    localStorage.setItem(`saved-filters-${storageKey}`, JSON.stringify(filters));
    setSavedFilters(filters);
  };

  const handleSaveFilter = () => {
    if (!newFilterName.trim() || currentFilters.length === 0) return;

    const newFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name: newFilterName.trim(),
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    };

    persistFilters([newFilter, ...savedFilters]);
    setNewFilterName("");
    setShowSaveDialog(false);
  };

  const handleDeleteFilter = (id: string) => {
    persistFilters(savedFilters.filter((f) => f.id !== id));
    if (activeFilterId === id) {
      setActiveFilterId(null);
    }
  };

  const handleApplyFilter = (filter: SavedFilter) => {
    setActiveFilterId(filter.id);
    onApplyFilter(filter.filters);
  };

  const handleClearFilter = () => {
    setActiveFilterId(null);
    onApplyFilter([]);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Saved filter chips */}
      {savedFilters.length > 0 && (
        <div className="flex items-center gap-1.5">
          {savedFilters.slice(0, 3).map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleApplyFilter(filter)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[12px] rounded-md transition-colors",
                activeFilterId === filter.id
                  ? "bg-[#3ECF8E]/20 text-[#3ECF8E] border border-[#3ECF8E]/30"
                  : "bg-[#2A2A2A] text-[#A1A1A1] border border-[#3E3E3E] hover:border-[#4E4E4E]"
              )}
            >
              <Bookmark className="h-3 w-3" />
              <span className="max-w-[100px] truncate">{filter.name}</span>
              {activeFilterId === filter.id && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearFilter();
                  }}
                  className="p-0.5 rounded hover:bg-[#3ECF8E]/30"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </button>
          ))}
          {savedFilters.length > 3 && (
            <span className="text-[11px] text-[#6B6B6B]">
              +{savedFilters.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Save current filter button */}
      {currentFilters.length > 0 && !activeFilterId && (
        <div className="relative">
          {showSaveDialog ? (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2A2A2A] border border-[#3E3E3E] rounded-md">
              <input
                type="text"
                value={newFilterName}
                onChange={(e) => setNewFilterName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveFilter();
                  if (e.key === "Escape") setShowSaveDialog(false);
                }}
                placeholder="Filter name..."
                autoFocus
                className="w-24 text-[12px] bg-transparent text-[#EDEDED] placeholder-[#6B6B6B] focus:outline-none"
              />
              <button
                onClick={handleSaveFilter}
                disabled={!newFilterName.trim()}
                className="p-0.5 rounded text-[#3ECF8E] hover:bg-[#3ECF8E]/20 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setShowSaveDialog(false)}
                className="p-0.5 rounded text-[#6B6B6B] hover:bg-[#3E3E3E]"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#A1A1A1] bg-[#2A2A2A] border border-dashed border-[#3E3E3E] rounded-md hover:border-[#4E4E4E] hover:text-[#EDEDED] transition-colors"
            >
              <Plus className="h-3 w-3" />
              Save filter
            </button>
          )}
        </div>
      )}

      {/* Manage saved filters dropdown */}
      {savedFilters.length > 0 && (
        <SavedFiltersMenu
          filters={savedFilters}
          onApply={handleApplyFilter}
          onDelete={handleDeleteFilter}
          activeFilterId={activeFilterId}
        />
      )}
    </div>
  );
}

interface SavedFiltersMenuProps {
  filters: SavedFilter[];
  onApply: (filter: SavedFilter) => void;
  onDelete: (id: string) => void;
  activeFilterId: string | null;
}

function SavedFiltersMenu({
  filters,
  onApply,
  onDelete,
  activeFilterId,
}: SavedFiltersMenuProps) {
  const [open, setOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="p-1.5 text-[#6B6B6B] hover:text-[#EDEDED] hover:bg-[#2A2A2A] rounded transition-colors"
        title="Manage saved filters"
      >
        <Bookmark className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-1 z-50 w-56 bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-[#3E3E3E]">
            <span className="text-[12px] font-medium text-[#A1A1A1]">
              Saved Filters
            </span>
          </div>
          <div className="max-h-[200px] overflow-y-auto">
            {filters.map((filter) => (
              <div
                key={filter.id}
                className={cn(
                  "flex items-center justify-between px-3 py-2 hover:bg-[#323232] transition-colors group",
                  activeFilterId === filter.id && "bg-[#3ECF8E]/10"
                )}
              >
                <button
                  onClick={() => {
                    onApply(filter);
                    setOpen(false);
                  }}
                  className="flex-1 text-left"
                >
                  <span
                    className={cn(
                      "text-[13px]",
                      activeFilterId === filter.id
                        ? "text-[#3ECF8E]"
                        : "text-[#EDEDED]"
                    )}
                  >
                    {filter.name}
                  </span>
                  <span className="block text-[11px] text-[#6B6B6B]">
                    {filter.filters.length} condition
                    {filter.filters.length !== 1 ? "s" : ""}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(filter.id);
                  }}
                  className="p-1 text-[#6B6B6B] hover:text-[#F87171] opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
