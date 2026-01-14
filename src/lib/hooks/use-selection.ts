"use client";

import * as React from "react";

interface UseSelectionOptions<T extends { id: string }> {
  items: T[];
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

interface UseSelectionReturn<T extends { id: string }> {
  selectedIds: Set<string>;
  selectedItems: T[];
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  toggle: (id: string) => void;
  select: (id: string) => void;
  deselect: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  toggleAll: () => void;
  selectMultiple: (ids: string[]) => void;
}

/**
 * Hook for managing selection state in lists/tables
 *
 * @example
 * const {
 *   selectedIds,
 *   isSelected,
 *   toggle,
 *   selectAll,
 *   deselectAll,
 *   isAllSelected,
 * } = useSelection({ items: deals });
 */
export function useSelection<T extends { id: string }>({
  items,
  onSelectionChange,
}: UseSelectionOptions<T>): UseSelectionReturn<T> {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  // Clean up selection when items change (remove selected IDs that no longer exist)
  React.useEffect(() => {
    const validIds = new Set(items.map((item) => item.id));
    setSelectedIds((prev) => {
      const newSelection = new Set<string>();
      prev.forEach((id) => {
        if (validIds.has(id)) {
          newSelection.add(id);
        }
      });
      return newSelection;
    });
  }, [items]);

  // Notify parent of selection changes
  React.useEffect(() => {
    onSelectionChange?.(selectedIds);
  }, [selectedIds, onSelectionChange]);

  const isSelected = React.useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const select = React.useCallback((id: string) => {
    setSelectedIds((prev) => new Set(prev).add(id));
  }, []);

  const deselect = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const selectAll = React.useCallback(() => {
    setSelectedIds(new Set(items.map((item) => item.id)));
  }, [items]);

  const deselectAll = React.useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const toggleAll = React.useCallback(() => {
    if (selectedIds.size === items.length) {
      deselectAll();
    } else {
      selectAll();
    }
  }, [items.length, selectedIds.size, selectAll, deselectAll]);

  const selectMultiple = React.useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const selectedItems = React.useMemo(
    () => items.filter((item) => selectedIds.has(item.id)),
    [items, selectedIds]
  );

  const isAllSelected = items.length > 0 && selectedIds.size === items.length;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < items.length;

  return {
    selectedIds,
    selectedItems,
    isSelected,
    isAllSelected,
    isSomeSelected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    toggleAll,
    selectMultiple,
  };
}
