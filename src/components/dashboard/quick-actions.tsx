"use client";

import * as React from "react";
import { Plus, Building2, CheckSquare, Users, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  onNewDeal: () => void;
  onNewTask: () => void;
  onNewContact: () => void;
  onSearch: () => void;
}

export function QuickActions({
  onNewDeal,
  onNewTask,
  onNewContact,
  onSearch,
}: QuickActionsProps) {
  const actions = [
    {
      icon: Building2,
      label: "New Deal",
      shortcut: "N",
      onClick: onNewDeal,
      color: "text-[#3ECF8E]",
      bgColor: "bg-[#3ECF8E]/10 hover:bg-[#3ECF8E]/20",
    },
    {
      icon: CheckSquare,
      label: "Add Task",
      shortcut: "T",
      onClick: onNewTask,
      color: "text-[#60A5FA]",
      bgColor: "bg-[#60A5FA]/10 hover:bg-[#60A5FA]/20",
    },
    {
      icon: Users,
      label: "Add Contact",
      shortcut: "C",
      onClick: onNewContact,
      color: "text-[#A78BFA]",
      bgColor: "bg-[#A78BFA]/10 hover:bg-[#A78BFA]/20",
    },
    {
      icon: Search,
      label: "Search",
      shortcut: "⌘K",
      onClick: onSearch,
      color: "text-[#FBBF24]",
      bgColor: "bg-[#FBBF24]/10 hover:bg-[#FBBF24]/20",
    },
  ];

  return (
    <div className="p-5 rounded-lg bg-[#1C1C1C] border border-[#2A2A2A]">
      <h3 className="text-[16px] font-medium text-[#EDEDED] mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg transition-colors",
              action.bgColor
            )}
          >
            <action.icon className={cn("h-5 w-5", action.color)} />
            <div className="flex-1 text-left">
              <p className="text-[13px] font-medium text-[#EDEDED]">{action.label}</p>
            </div>
            <kbd className="text-[10px] text-[#6B6B6B] bg-[#1C1C1C] px-1.5 py-0.5 rounded">
              {action.shortcut}
            </kbd>
          </button>
        ))}
      </div>
    </div>
  );
}
