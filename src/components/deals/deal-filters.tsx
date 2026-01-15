"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, X } from "lucide-react";

// Status filter options
const statusOptions = [
  { value: "", label: "All Statuses" },
  { value: "active", label: "Under Contract" },
  { value: "closed", label: "Closed Won" },
  { value: "on-hold", label: "On Hold" },
];

// Property type filter options
const propertyTypeOptions = [
  { value: "", label: "All Types" },
  { value: "office", label: "Office" },
  { value: "retail", label: "Retail" },
  { value: "industrial", label: "Industrial" },
  { value: "multifamily", label: "Multifamily" },
  { value: "land", label: "Land" },
  { value: "mixed-use", label: "Mixed Use" },
];

interface FilterPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function FilterPill({ label, isActive, onClick }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-medium rounded-full transition-all",
        "border border-border",
        isActive
          ? "bg-primary/15 text-primary border-primary/30"
          : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
      )}
    >
      {label}
    </button>
  );
}

interface FilterDropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  placeholder: string;
}

function FilterDropdown({ value, options, onChange, placeholder }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg",
          "border border-border transition-all",
          value
            ? "bg-primary/15 text-primary border-primary/30"
            : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
        )}
      >
        <span className="whitespace-nowrap">{displayLabel}</span>
        <ChevronDown className={cn(
          "h-3.5 w-3.5 flex-shrink-0 transition-transform",
          isOpen && "rotate-180"
        )} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-1 min-w-[160px] bg-surface border border-border rounded-lg shadow-lg overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-xs transition-colors",
                option.value === value
                  ? "bg-primary/10 text-primary"
                  : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface DealFiltersProps {
  statusFilter: string;
  propertyTypeFilter: string;
  onStatusChange: (value: string) => void;
  onPropertyTypeChange: (value: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function DealFilters({
  statusFilter,
  propertyTypeFilter,
  onStatusChange,
  onPropertyTypeChange,
  totalCount,
  filteredCount,
}: DealFiltersProps) {
  const hasFilters = statusFilter || propertyTypeFilter;

  const clearFilters = () => {
    onStatusChange("");
    onPropertyTypeChange("");
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status pills */}
      <div className="flex items-center gap-1.5">
        {statusOptions.slice(0, 4).map((option) => (
          <FilterPill
            key={option.value}
            label={option.label}
            isActive={statusFilter === option.value}
            onClick={() => onStatusChange(option.value)}
          />
        ))}
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-border" />

      {/* Property type dropdown */}
      <FilterDropdown
        value={propertyTypeFilter}
        options={propertyTypeOptions}
        onChange={onPropertyTypeChange}
        placeholder="Property Type"
      />

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center gap-1 px-2 py-1 text-xs text-foreground-subtle hover:text-foreground transition-colors"
        >
          <X className="h-3 w-3 flex-shrink-0" />
          Clear
        </button>
      )}

      {/* Count indicator */}
      <div className="ml-auto text-xs text-foreground-subtle">
        {filteredCount === totalCount ? (
          <span>{totalCount} {totalCount === 1 ? "deal" : "deals"}</span>
        ) : (
          <span>{filteredCount} of {totalCount} deals</span>
        )}
      </div>
    </div>
  );
}
