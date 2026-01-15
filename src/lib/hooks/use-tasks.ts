"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllTasks, updateTask } from "@/lib/supabase/queries";
import type { TaskUpdate } from "@/lib/supabase/types";

// Task with deal info type (matches getAllTasks return)
export interface TaskWithDeal {
  id: string;
  task: string;
  status: string;
  priority: string;
  due_date: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  workflow_id: string;
  assignee: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
  workflow: {
    id: string;
    deal_id: string;
    name: string | null;
    deal: { id: string; name: string; status: string } | null;
  } | null;
}

export function useTasks() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => getAllTasks() as Promise<TaskWithDeal[]>,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TaskUpdate }) =>
      updateTask(id, updates),
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<TaskWithDeal[]>(["tasks"]);

      // Optimistically update the cache
      queryClient.setQueryData<TaskWithDeal[]>(["tasks"], (old) =>
        old?.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        )
      );

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      // Also invalidate sidebar counts
      queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
    },
  });
}

// Hook for batch status updates (e.g., mark multiple as complete)
export function useBatchUpdateTasks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: TaskUpdate }) => {
      // Update all tasks in parallel
      return Promise.all(ids.map((id) => updateTask(id, updates)));
    },
    onMutate: async ({ ids, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<TaskWithDeal[]>(["tasks"]);

      queryClient.setQueryData<TaskWithDeal[]>(["tasks"], (old) =>
        old?.map((task) =>
          ids.includes(task.id) ? { ...task, ...updates } : task
        )
      );

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
    },
  });
}
