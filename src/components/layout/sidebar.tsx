"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  Settings,
  LayoutDashboard,
  CheckSquare,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarCounts } from "./sidebar-context";

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  countKey?: "deals" | "tasks" | "contacts";
  showPending?: boolean;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Deals",
    href: "/deals",
    icon: Building2,
    countKey: "deals",
    showPending: true,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    countKey: "tasks",
    showPending: true,
  },
  {
    name: "Contacts",
    href: "/contacts",
    icon: Users,
    countKey: "contacts",
  },
];

const bottomNavigation: NavItem[] = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname();
  const { counts, loading } = useSidebarCounts();

  const getCount = (item: NavItem) => {
    if (!item.countKey || loading) return null;

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
    <aside
      className={cn(
        "flex h-full flex-col bg-[#1C1C1C] border-r border-[#2A2A2A]",
        "transition-[width] duration-200 ease-out",
        collapsed ? "w-12" : "w-60"
      )}
    >
      {/* Header with collapse toggle */}
      <div
        className={cn(
          "flex h-12 items-center border-b border-[#2A2A2A]",
          collapsed ? "justify-center px-0" : "justify-between px-3"
        )}
      >
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              className="text-[#3ECF8E] flex-shrink-0"
            >
              <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill="currentColor"
                opacity="0.8"
              />
              <path
                d="M2 17L12 22L22 17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M2 12L12 17L22 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="font-semibold text-[13px] text-[#EDEDED] whitespace-nowrap">
              DealTracker
            </span>
          </Link>
        )}

        {onCollapsedChange && (
          <button
            onClick={() => onCollapsedChange(!collapsed)}
            className={cn(
              "p-1.5 rounded hover:bg-[#2A2A2A] transition-colors",
              collapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeft className="h-4 w-4 text-[#6B6B6B] hover:text-[#EDEDED]" />
            ) : (
              <PanelLeftClose className="h-4 w-4 text-[#6B6B6B] hover:text-[#EDEDED]" />
            )}
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-2">
        <ul className="space-y-0.5">
          {navigation.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center h-11 mx-1 rounded transition-colors",
                    isActive
                      ? "bg-[#2A2A2A]"
                      : "hover:bg-[#2A2A2A]",
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  )}
                >
                  {/* Active indicator - 2px left border */}
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#3ECF8E]"
                      aria-hidden="true"
                    />
                  )}

                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-[#EDEDED]" : "text-[#6B6B6B] group-hover:text-[#EDEDED]"
                    )}
                  />

                  {!collapsed && (
                    <>
                      <span
                        className={cn(
                          "text-[13px] truncate transition-colors flex-1",
                          isActive ? "text-[#EDEDED]" : "text-[#A1A1A1] group-hover:text-[#EDEDED]"
                        )}
                      >
                        {item.name}
                      </span>
                      {(() => {
                        const count = getCount(item);
                        if (count === null || count === 0) return null;
                        return (
                          <span
                            className={cn(
                              "text-[11px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                              item.showPending
                                ? "bg-[#3ECF8E]/15 text-[#3ECF8E]"
                                : "bg-[#3E3E3E] text-[#A1A1A1]"
                            )}
                          >
                            {count}
                          </span>
                        );
                      })()}
                    </>
                  )}

                  {/* Tooltip for collapsed state */}
                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 text-[11px] font-medium text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity">
                      {item.name}
                      {(() => {
                        const count = getCount(item);
                        if (count === null || count === 0) return null;
                        return ` (${count})`;
                      })()}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Section divider */}
      <div className="mx-3 my-2 h-px bg-[#2A2A2A]" />

      {/* Bottom Navigation - pinned with margin-top auto */}
      <div className="py-2">
        <ul className="space-y-0.5">
          {bottomNavigation.map((item) => {
            const isActive = pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group relative flex items-center h-11 mx-1 rounded transition-colors",
                    isActive
                      ? "bg-[#2A2A2A]"
                      : "hover:bg-[#2A2A2A]",
                    collapsed ? "justify-center px-0" : "gap-3 px-3"
                  )}
                >
                  {isActive && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full bg-[#3ECF8E]"
                      aria-hidden="true"
                    />
                  )}

                  <item.icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-[#EDEDED]" : "text-[#6B6B6B] group-hover:text-[#EDEDED]"
                    )}
                  />

                  {!collapsed && (
                    <span
                      className={cn(
                        "text-[13px] truncate transition-colors",
                        isActive ? "text-[#EDEDED]" : "text-[#A1A1A1] group-hover:text-[#EDEDED]"
                      )}
                    >
                      {item.name}
                    </span>
                  )}

                  {collapsed && (
                    <span className="absolute left-full ml-2 px-2 py-1 text-[11px] font-medium text-[#EDEDED] bg-[#2A2A2A] border border-[#3E3E3E] rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg transition-opacity">
                      {item.name}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
