"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDealAction, updateDealAction, deleteDealAction } from "@/lib/supabase/actions";
import type { Deal, DealInsert, DealUpdate } from "@/lib/supabase/types";
// Actually current codebase uses: import { useToastActions } from "@/components/ui/toast";
// But for hooks, we might need a different approach or pass toast in.
// Let's stick to standard patterns. We can't use hooks inside hooks easily if conditional?
// Actually simpler: just return the mutation and let the component handle toasts, OR handle toasts here.

export function useCreateDeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newDeal: Partial<DealInsert>) => createDealAction(newDeal),
        onMutate: async (newDeal) => {
            // Cancel refetches
            await queryClient.cancelQueries({ queryKey: ["deals"] });

            // Snapshot previous value
            const previousDeals = queryClient.getQueryData<Deal[]>(["deals"]);

            // Optimistic update
            queryClient.setQueryData<Deal[]>(["deals"], (old) => {
                const tempDeal: Deal = {
                    id: `temp-${Date.now()}`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    user_id: "me",
                    status: "active",
                    name: newDeal.name || "New Deal",
                    ...newDeal, // Override with partials
                } as Deal;
                return [tempDeal, ...(old || [])];
            });

            return { previousDeals };
        },
        onError: (err, newDeal, context) => {
            if (context?.previousDeals) {
                queryClient.setQueryData(["deals"], context.previousDeals);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
            // Also invalidate sidebar counts
            queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
        },
    });
}

export function useUpdateDeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }: { id: string; updates: DealUpdate }) =>
            updateDealAction(id, updates),
        onMutate: async ({ id, updates }) => {
            await queryClient.cancelQueries({ queryKey: ["deals"] });
            const previousDeals = queryClient.getQueryData<Deal[]>(["deals"]);

            queryClient.setQueryData<Deal[]>(["deals"], (old) =>
                old?.map((deal) => (deal.id === id ? { ...deal, ...updates } : deal))
            );

            return { previousDeals };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousDeals) {
                queryClient.setQueryData(["deals"], context.previousDeals);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
            queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
        },
    });
}

export function useDeleteDeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => deleteDealAction(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ["deals"] });
            const previousDeals = queryClient.getQueryData<Deal[]>(["deals"]);

            queryClient.setQueryData<Deal[]>(["deals"], (old) =>
                old?.filter((d) => d.id !== id)
            );

            return { previousDeals };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousDeals) {
                queryClient.setQueryData(["deals"], context.previousDeals);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["deals"] });
            queryClient.invalidateQueries({ queryKey: ["sidebar-counts"] });
        },
    });
}
