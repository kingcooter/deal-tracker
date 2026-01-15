"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DealTab {
  name: string;
  href: string;
}

const getTabs = (dealId: string): DealTab[] => [
  { name: "Overview", href: `/deals/${dealId}` },
  { name: "Project", href: `/deals/${dealId}/project` },
  { name: "People", href: `/deals/${dealId}/people` },
  { name: "Resources", href: `/deals/${dealId}/resources` },
  { name: "AI Agent", href: `/deals/${dealId}/agent` },
  { name: "Settings", href: `/deals/${dealId}/settings` },
];

interface DealNavigationTabsProps {
  dealId: string;
}

export function DealNavigationTabs({ dealId }: DealNavigationTabsProps) {
  const pathname = usePathname();
  const tabs = getTabs(dealId);

  const isActive = (tab: DealTab) => {
    // Exact match for Overview (base path)
    if (tab.href === `/deals/${dealId}`) {
      return pathname === `/deals/${dealId}`;
    }
    // Prefix match for other tabs
    return pathname.startsWith(tab.href);
  };

  return (
    <div className="border-b border-border bg-background">
      <div className="px-4">
        <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const active = isActive(tab);

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={cn(
                  "relative py-3 text-[13px] font-medium transition-colors whitespace-nowrap",
                  active
                    ? "text-foreground"
                    : "text-foreground-secondary hover:text-foreground"
                )}
              >
                {/* Active Line Indicator */}
                {active && (
                  <motion.div
                    layoutId="activeDealTab"
                    className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-foreground"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                {tab.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
