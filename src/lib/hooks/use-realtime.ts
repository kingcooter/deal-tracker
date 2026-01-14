"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type TableName = "deals" | "contacts" | "tasks" | "deal_workflows";

interface UseRealtimeOptions<T> {
  table: TableName;
  onInsert?: (record: T) => void;
  onUpdate?: (record: T) => void;
  onDelete?: (oldRecord: T) => void;
  filter?: string;
}

/**
 * Hook to subscribe to real-time changes from Supabase
 *
 * @example
 * useRealtime({
 *   table: "deals",
 *   onInsert: (deal) => setDeals(prev => [...prev, deal]),
 *   onUpdate: (deal) => setDeals(prev => prev.map(d => d.id === deal.id ? deal : d)),
 *   onDelete: (deal) => setDeals(prev => prev.filter(d => d.id !== deal.id)),
 * });
 */
export function useRealtime<T extends { id: string }>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter,
}: UseRealtimeOptions<T>) {
  const channelRef = React.useRef<RealtimeChannel | null>(null);

  React.useEffect(() => {
    const supabase = createClient();

    // Create a unique channel name
    const channelName = `realtime-${table}-${Date.now()}`;

    const channel = supabase
      .channel(channelName)
      .on<T>(
        "postgres_changes" as const,
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: RealtimePostgresChangesPayload<T>) => {
          if (payload.eventType === "INSERT" && onInsert && payload.new) {
            onInsert(payload.new as T);
          } else if (payload.eventType === "UPDATE" && onUpdate && payload.new) {
            onUpdate(payload.new as T);
          } else if (payload.eventType === "DELETE" && onDelete && payload.old) {
            onDelete(payload.old as T);
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);
}

/**
 * Hook to manage a list of items with real-time updates
 * Returns the items and a setter, and automatically subscribes to changes
 */
export function useRealtimeList<T extends { id: string }>(
  table: TableName,
  initialData: T[],
  filter?: string
) {
  const [items, setItems] = React.useState<T[]>(initialData);

  // Update items when initialData changes (e.g., after initial fetch)
  React.useEffect(() => {
    setItems(initialData);
  }, [initialData]);

  const handleInsert = React.useCallback((record: T) => {
    setItems((prev) => {
      // Avoid duplicates
      if (prev.some((item) => item.id === record.id)) {
        return prev;
      }
      return [...prev, record];
    });
  }, []);

  const handleUpdate = React.useCallback((record: T) => {
    setItems((prev) =>
      prev.map((item) => (item.id === record.id ? record : item))
    );
  }, []);

  const handleDelete = React.useCallback((record: T) => {
    setItems((prev) => prev.filter((item) => item.id !== record.id));
  }, []);

  useRealtime({
    table,
    onInsert: handleInsert,
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    filter,
  });

  return [items, setItems] as const;
}
