"use client";

import * as React from "react";

export interface SavedFilter {
  id: string;
  name: string;
  filters: Record<string, string>;
  createdAt: Date;
}

const STORAGE_KEY = "deal-tracker-saved-filters";

function getStoredFilters(): SavedFilter[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((filter: SavedFilter) => ({
      ...filter,
      createdAt: new Date(filter.createdAt),
    }));
  } catch {
    return [];
  }
}

function storeFilters(filters: SavedFilter[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Storage full or unavailable
  }
}

export function useSavedFilters(scope: string = "deals") {
  const [filters, setFilters] = React.useState<SavedFilter[]>([]);

  // Load from localStorage on mount
  React.useEffect(() => {
    const allFilters = getStoredFilters();
    setFilters(allFilters.filter((f) => f.id.startsWith(scope)));
  }, [scope]);

  const saveFilter = React.useCallback(
    (name: string, filterValues: Record<string, string>) => {
      const newFilter: SavedFilter = {
        id: `${scope}-${crypto.randomUUID()}`,
        name,
        filters: filterValues,
        createdAt: new Date(),
      };

      setFilters((prev) => {
        const allFilters = getStoredFilters();
        const updated = [...allFilters, newFilter];
        storeFilters(updated);
        return [...prev, newFilter];
      });

      return newFilter;
    },
    [scope]
  );

  const deleteFilter = React.useCallback((id: string) => {
    setFilters((prev) => {
      const allFilters = getStoredFilters();
      const updated = allFilters.filter((f) => f.id !== id);
      storeFilters(updated);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const updateFilter = React.useCallback(
    (id: string, updates: Partial<Pick<SavedFilter, "name" | "filters">>) => {
      setFilters((prev) => {
        const allFilters = getStoredFilters();
        const updated = allFilters.map((f) =>
          f.id === id ? { ...f, ...updates } : f
        );
        storeFilters(updated);
        return prev.map((f) => (f.id === id ? { ...f, ...updates } : f));
      });
    },
    []
  );

  return {
    filters,
    saveFilter,
    deleteFilter,
    updateFilter,
  };
}
