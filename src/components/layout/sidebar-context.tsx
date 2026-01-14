"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

interface SidebarCounts {
  deals: { total: number; active: number };
  tasks: { total: number; pending: number };
  contacts: number;
}

interface SidebarContextType {
  counts: SidebarCounts;
  loading: boolean;
  refresh: () => Promise<void>;
}

const defaultCounts: SidebarCounts = {
  deals: { total: 0, active: 0 },
  tasks: { total: 0, pending: 0 },
  contacts: 0,
};

const SidebarContext = React.createContext<SidebarContextType>({
  counts: defaultCounts,
  loading: true,
  refresh: async () => {},
});

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [counts, setCounts] = React.useState<SidebarCounts>(defaultCounts);
  const [loading, setLoading] = React.useState(true);

  const fetchCounts = React.useCallback(async () => {
    try {
      const supabase = createClient();

      // Fetch counts in parallel
      const [dealsResult, activeDealsResult, tasksResult, pendingTasksResult, contactsResult] =
        await Promise.all([
          supabase.from("deals").select("id", { count: "exact", head: true }),
          supabase
            .from("deals")
            .select("id", { count: "exact", head: true })
            .eq("status", "active"),
          supabase.from("tasks").select("id", { count: "exact", head: true }),
          supabase
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .in("status", ["not_started", "in_progress"]),
          supabase.from("contacts").select("id", { count: "exact", head: true }),
        ]);

      setCounts({
        deals: {
          total: dealsResult.count ?? 0,
          active: activeDealsResult.count ?? 0,
        },
        tasks: {
          total: tasksResult.count ?? 0,
          pending: pendingTasksResult.count ?? 0,
        },
        contacts: contactsResult.count ?? 0,
      });
    } catch (error) {
      console.error("Error fetching sidebar counts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchCounts();

    // Subscribe to changes
    const supabase = createClient();

    const dealsChannel = supabase
      .channel("sidebar-deals")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "deals" },
        () => fetchCounts()
      )
      .subscribe();

    const tasksChannel = supabase
      .channel("sidebar-tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        () => fetchCounts()
      )
      .subscribe();

    const contactsChannel = supabase
      .channel("sidebar-contacts")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        () => fetchCounts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(dealsChannel);
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(contactsChannel);
    };
  }, [fetchCounts]);

  return (
    <SidebarContext.Provider value={{ counts, loading, refresh: fetchCounts }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarCounts() {
  return React.useContext(SidebarContext);
}
