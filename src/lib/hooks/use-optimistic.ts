"use client";

import * as React from "react";

type OptimisticAction<T> = {
  type: "add" | "update" | "delete";
  item: T;
  optimisticId?: string;
};

type OptimisticState<T> = {
  items: T[];
  pending: Map<string, OptimisticAction<T>>;
};

/**
 * Hook for optimistic updates with automatic rollback on error
 *
 * @example
 * const { items, addOptimistic, updateOptimistic, deleteOptimistic, confirmAction, rollbackAction } = useOptimistic<Deal>(deals);
 *
 * // Optimistically add
 * const optimisticId = addOptimistic(newDeal);
 * try {
 *   const created = await createDeal(newDeal);
 *   confirmAction(optimisticId, created);
 * } catch {
 *   rollbackAction(optimisticId);
 * }
 */
export function useOptimistic<T extends { id: string }>(
  initialItems: T[]
): {
  items: T[];
  addOptimistic: (item: Omit<T, "id"> & { id?: string }) => string;
  updateOptimistic: (id: string, updates: Partial<T>) => void;
  deleteOptimistic: (id: string) => void;
  confirmAction: (optimisticId: string, confirmedItem?: T) => void;
  rollbackAction: (optimisticId: string) => void;
  isPending: (id: string) => boolean;
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
} {
  const [state, setState] = React.useState<OptimisticState<T>>({
    items: initialItems,
    pending: new Map(),
  });

  // Update items when initialItems changes
  React.useEffect(() => {
    setState((prev) => ({
      ...prev,
      items: initialItems,
    }));
  }, [initialItems]);

  const generateOptimisticId = () => `optimistic-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addOptimistic = React.useCallback(
    (item: Omit<T, "id"> & { id?: string }): string => {
      const optimisticId = generateOptimisticId();
      const tempId = item.id || `temp-${optimisticId}`;
      const optimisticItem = { ...item, id: tempId } as T;

      setState((prev) => ({
        items: [optimisticItem, ...prev.items],
        pending: new Map(prev.pending).set(optimisticId, {
          type: "add",
          item: optimisticItem,
          optimisticId,
        }),
      }));

      return optimisticId;
    },
    []
  );

  const updateOptimistic = React.useCallback(
    (id: string, updates: Partial<T>): void => {
      const optimisticId = generateOptimisticId();

      setState((prev) => {
        const originalItem = prev.items.find((item) => item.id === id);
        if (!originalItem) return prev;

        const updatedItem = { ...originalItem, ...updates };

        return {
          items: prev.items.map((item) =>
            item.id === id ? updatedItem : item
          ),
          pending: new Map(prev.pending).set(optimisticId, {
            type: "update",
            item: originalItem,
            optimisticId,
          }),
        };
      });
    },
    []
  );

  const deleteOptimistic = React.useCallback((id: string): void => {
    const optimisticId = generateOptimisticId();

    setState((prev) => {
      const deletedItem = prev.items.find((item) => item.id === id);
      if (!deletedItem) return prev;

      return {
        items: prev.items.filter((item) => item.id !== id),
        pending: new Map(prev.pending).set(optimisticId, {
          type: "delete",
          item: deletedItem,
          optimisticId,
        }),
      };
    });
  }, []);

  const confirmAction = React.useCallback(
    (optimisticId: string, confirmedItem?: T): void => {
      setState((prev) => {
        const action = prev.pending.get(optimisticId);
        const newPending = new Map(prev.pending);
        newPending.delete(optimisticId);

        if (!action) {
          return { ...prev, pending: newPending };
        }

        let newItems = prev.items;

        // If we have a confirmed item (e.g., from server with real ID), replace the optimistic one
        if (action.type === "add" && confirmedItem) {
          newItems = prev.items.map((item) =>
            item.id === action.item.id ? confirmedItem : item
          );
        }

        return {
          items: newItems,
          pending: newPending,
        };
      });
    },
    []
  );

  const rollbackAction = React.useCallback((optimisticId: string): void => {
    setState((prev) => {
      const action = prev.pending.get(optimisticId);
      const newPending = new Map(prev.pending);
      newPending.delete(optimisticId);

      if (!action) {
        return { ...prev, pending: newPending };
      }

      let newItems = prev.items;

      switch (action.type) {
        case "add":
          // Remove the optimistically added item
          newItems = prev.items.filter((item) => item.id !== action.item.id);
          break;
        case "update":
          // Restore the original item
          newItems = prev.items.map((item) =>
            item.id === action.item.id ? action.item : item
          );
          break;
        case "delete":
          // Add back the deleted item
          newItems = [action.item, ...prev.items];
          break;
      }

      return {
        items: newItems,
        pending: newPending,
      };
    });
  }, []);

  const isPending = React.useCallback(
    (id: string): boolean => {
      for (const action of state.pending.values()) {
        if (action.item.id === id) {
          return true;
        }
      }
      return false;
    },
    [state.pending]
  );

  const setItems = React.useCallback((updater: React.SetStateAction<T[]>) => {
    setState((prev) => ({
      ...prev,
      items: typeof updater === "function" ? updater(prev.items) : updater,
    }));
  }, []);

  return {
    items: state.items,
    addOptimistic,
    updateOptimistic,
    deleteOptimistic,
    confirmAction,
    rollbackAction,
    isPending,
    setItems,
  };
}
