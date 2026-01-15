"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

interface NavigationTab {
    name: string;
    href: string;
    countKey?: "deals" | "tasks" | "contacts";
    showPending?: boolean;
}

const tabs: NavigationTab[] = [
    { name: "Overview", href: "/dashboard" },
    { name: "Deals", href: "/deals", countKey: "deals", showPending: true },
    { name: "Tasks", href: "/tasks", countKey: "tasks", showPending: true },
    { name: "Contacts", href: "/contacts", countKey: "contacts" },
    { name: "Settings", href: "/settings" },
];

export function NavigationTabs() {
    const pathname = usePathname();

    // Re-implementing the counts fetch logic here for now
    // In a larger app, this would be in a hook
    const { data: counts } = useQuery({
        queryKey: ["navigation-counts"],
        queryFn: async () => {
            const supabase = createClient();

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

            return {
                deals: { total: dealsResult.count ?? 0, active: activeDealsResult.count ?? 0 },
                tasks: { total: tasksResult.count ?? 0, pending: pendingTasksResult.count ?? 0 },
                contacts: contactsResult.count ?? 0,
            };
        },
        staleTime: 30 * 1000,
    });

    const getCount = (item: NavigationTab) => {
        if (!counts || !item.countKey) return null;

        if (item.countKey === "deals") {
            return item.showPending ? counts.deals.active : counts.deals.total;
        }
        if (item.countKey === "tasks") {
            return item.showPending ? counts.tasks.pending : counts.tasks.total;
        }
        if (item.countKey === "contacts") {
            return counts.contacts;
        }
        return null;
    };

    return (
        <div className="border-b border-border bg-background">
            <div className="px-4">
                <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar mask-gradient-right">
                    {tabs.map((tab) => {
                        const isActive = tab.href === "/dashboard"
                            ? pathname === "/dashboard"
                            : pathname.startsWith(tab.href);

                        const count = getCount(tab);

                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={cn(
                                    "relative flex items-center gap-2 py-3 text-[13px] font-medium transition-colors whitespace-nowrap",
                                    isActive
                                        ? "text-foreground"
                                        : "text-foreground-secondary hover:text-foreground"
                                )}
                            >
                                {/* Active Line Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-foreground"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {tab.name}

                                {/* Count Badge */}
                                {count !== null && count > 0 && (
                                    <span
                                        className={cn(
                                            "flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] tabular-nums leading-none",
                                            isActive
                                                ? "bg-foreground text-background"
                                                : "bg-surface-elevated text-foreground-subtle"
                                        )}
                                    >
                                        {count}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
