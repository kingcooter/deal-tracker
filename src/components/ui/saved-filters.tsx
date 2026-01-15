"use client";

import * as React from "react";
import {
  Filter,
  Save,
  Trash2,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { SavedFilter } from "@/lib/hooks/use-saved-filters";

interface SavedFiltersDropdownProps {
  filters: SavedFilter[];
  currentFilters: Record<string, string>;
  onApply: (filters: Record<string, string>) => void;
  onSave: (name: string, filters: Record<string, string>) => void;
  onDelete: (id: string) => void;
  hasActiveFilters: boolean;
  className?: string;
}

export function SavedFiltersDropdown({
  filters,
  currentFilters,
  onApply,
  onSave,
  onDelete,
  hasActiveFilters,
  className,
}: SavedFiltersDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [filterName, setFilterName] = React.useState("");
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSave = () => {
    if (filterName.trim()) {
      onSave(filterName.trim(), currentFilters);
      setFilterName("");
      setShowSaveDialog(false);
    }
  };

  return (
    <>
      <div className={cn("relative", className)} ref={dropdownRef}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(hasActiveFilters && "border-primary text-primary")}
        >
          <Filter className="h-4 w-4 flex-shrink-0" />
          <span className="whitespace-nowrap">Saved Filters</span>
          <ChevronDown className={cn("h-4 w-4 flex-shrink-0 transition-transform", isOpen && "rotate-180")} />
        </Button>

        {isOpen && (
          <div
            className={cn(
              "absolute top-full left-0 mt-2 w-64 rounded-lg border border-border bg-neutral-900 shadow-xl z-50",
              "animate-scale-in origin-top-left",
              "max-w-[calc(100vw-2rem)]"
            )}
          >
            <div className="p-2">
              {filters.length === 0 ? (
                <div className="py-6 text-center">
                  <Filter className="h-8 w-8 mx-auto text-foreground-subtle mb-2 flex-shrink-0" />
                  <p className="text-sm text-foreground-muted">No saved filters</p>
                  <p className="text-xs text-foreground-subtle mt-1">
                    Apply filters and save them for quick access
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filters.map((filter) => (
                    <div
                      key={filter.id}
                      className="group flex items-center gap-2 rounded-md p-2 hover:bg-surface-hover transition-colors"
                    >
                      <button
                        className="flex-1 text-left min-w-0"
                        onClick={() => {
                          onApply(filter.filters);
                          setIsOpen(false);
                        }}
                      >
                        <span className="text-sm font-medium text-foreground truncate block">
                          {filter.name}
                        </span>
                        <span className="text-xs text-foreground-muted block truncate">
                          {Object.entries(filter.filters)
                            .filter(([, v]) => v !== "all" && v !== "")
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ") || "No active filters"}
                        </span>
                      </button>
                      <button
                        className="p-1 rounded flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-error-muted hover:text-error transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(filter.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 flex-shrink-0" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <div className="border-t border-border p-2">
                <button
                  className="flex w-full items-center gap-2 rounded-md p-2 text-sm text-primary hover:bg-primary/10 transition-colors"
                  onClick={() => {
                    setShowSaveDialog(true);
                    setIsOpen(false);
                  }}
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span>Save current filters</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save Filter Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Save Filter</DialogTitle>
            <DialogDescription>
              Give this filter combination a name for quick access later
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="e.g., Active Office Deals"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
              autoFocus
            />
            <div className="mt-3 text-xs text-foreground-muted">
              <span className="font-medium">Current filters:</span>
              <div className="mt-1 space-y-1">
                {Object.entries(currentFilters)
                  .filter(([, v]) => v !== "all" && v !== "")
                  .map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Check className="h-3 w-3 flex-shrink-0 text-success" />
                      <span className="capitalize">{key}:</span>
                      <span className="text-foreground truncate">{value}</span>
                    </div>
                  ))}
                {Object.entries(currentFilters).filter(([, v]) => v !== "all" && v !== "").length === 0 && (
                  <span className="text-foreground-subtle">No filters applied</span>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!filterName.trim()}>
              <Save className="h-4 w-4 flex-shrink-0" />
              <span>Save Filter</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
