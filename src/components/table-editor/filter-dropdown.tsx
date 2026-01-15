"use client";

import * as React from "react";
import { X, Plus } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  column: string;
  operator: "equals" | "contains" | "not_equals";
  value: string;
}

export interface FilterColumn {
  id: string;
  label: string;
  type: "select" | "text";
  options?: FilterOption[];
}

interface FilterDropdownProps {
  columns: FilterColumn[];
  filters: FilterConfig[];
  onFiltersChange: (filters: FilterConfig[]) => void;
  onClose: () => void;
}

export function FilterDropdown({
  columns,
  filters,
  onFiltersChange,
  onClose,
}: FilterDropdownProps) {
  const [localFilters, setLocalFilters] = React.useState<FilterConfig[]>(
    filters.length > 0 ? filters : []
  );

  const addFilter = () => {
    const firstColumn = columns[0];
    const newFilter: FilterConfig = {
      id: crypto.randomUUID(),
      column: firstColumn.id,
      operator: "equals",
      value: firstColumn.options?.[0]?.value || "",
    };
    setLocalFilters([...localFilters, newFilter]);
  };

  const updateFilter = (id: string, updates: Partial<FilterConfig>) => {
    setLocalFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const removeFilter = (id: string) => {
    setLocalFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const clearAll = () => {
    setLocalFilters([]);
    onFiltersChange([]);
    onClose();
  };

  return (
    <div className="absolute top-full left-0 mt-1 z-50 min-w-[400px] bg-[#2A2A2A] border border-[#3E3E3E] rounded-lg shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3E3E3E]">
        <span className="text-[13px] font-medium text-[#EDEDED]">Filters</span>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-[#3E3E3E] transition-colors"
        >
          <X className="h-4 w-4 text-[#6B6B6B]" />
        </button>
      </div>

      {/* Filter rows */}
      <div className="p-3 space-y-2 max-h-[300px] overflow-y-auto">
        {localFilters.length === 0 ? (
          <p className="text-[13px] text-[#6B6B6B] text-center py-4">
            No filters applied. Add a filter to narrow results.
          </p>
        ) : (
          localFilters.map((filter) => {
            const column = columns.find((c) => c.id === filter.column);
            return (
              <div
                key={filter.id}
                className="flex items-center gap-2 p-2 bg-[#1C1C1C] rounded-md"
              >
                {/* Column select */}
                <select
                  value={filter.column}
                  onChange={(e) => {
                    const newCol = columns.find((c) => c.id === e.target.value);
                    updateFilter(filter.id, {
                      column: e.target.value,
                      value: newCol?.options?.[0]?.value || "",
                    });
                  }}
                  className="flex-1 h-8 px-2 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded cursor-pointer"
                >
                  {columns.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.label}
                    </option>
                  ))}
                </select>

                {/* Operator select */}
                <select
                  value={filter.operator}
                  onChange={(e) =>
                    updateFilter(filter.id, {
                      operator: e.target.value as FilterConfig["operator"],
                    })
                  }
                  className="w-24 h-8 px-2 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded cursor-pointer"
                >
                  <option value="equals">is</option>
                  <option value="not_equals">is not</option>
                  {column?.type === "text" && (
                    <option value="contains">contains</option>
                  )}
                </select>

                {/* Value select/input */}
                {column?.type === "select" ? (
                  <select
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(filter.id, { value: e.target.value })
                    }
                    className="flex-1 h-8 px-2 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded cursor-pointer"
                  >
                    {column.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={filter.value}
                    onChange={(e) =>
                      updateFilter(filter.id, { value: e.target.value })
                    }
                    placeholder="Value..."
                    className="flex-1 h-8 px-2 text-[13px] text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded placeholder-[#6B6B6B]"
                  />
                )}

                {/* Remove button */}
                <button
                  onClick={() => removeFilter(filter.id)}
                  className="p-1.5 rounded hover:bg-[#3E3E3E] transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-[#6B6B6B]" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[#3E3E3E]">
        <button
          onClick={addFilter}
          className="flex items-center gap-1.5 px-2 py-1 text-[13px] text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add filter
        </button>
        <div className="flex items-center gap-2">
          {localFilters.length > 0 && (
            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-[13px] text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
            >
              Clear all
            </button>
          )}
          <button
            onClick={applyFilters}
            className="px-3 py-1.5 text-[13px] font-medium text-[#1C1C1C] bg-[#3ECF8E] rounded hover:bg-[#4AE39A] transition-colors"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

// Utility to apply filters to data
export function applyFilters<T extends Record<string, unknown>>(
  data: T[],
  filters: FilterConfig[]
): T[] {
  if (filters.length === 0) return data;

  return data.filter((item) => {
    return filters.every((filter) => {
      const value = item[filter.column];
      const filterValue = filter.value.toLowerCase();
      const itemValue = String(value ?? "").toLowerCase();

      switch (filter.operator) {
        case "equals":
          return itemValue === filterValue;
        case "not_equals":
          return itemValue !== filterValue;
        case "contains":
          return itemValue.includes(filterValue);
        default:
          return true;
      }
    });
  });
}
