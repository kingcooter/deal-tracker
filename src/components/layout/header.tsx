"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, Settings, ChevronDown, Command } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  className?: string;
  onSearchClick?: () => void;
  mobileMenuButton?: React.ReactNode;
}

export function Header({ className, onSearchClick, mobileMenuButton }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <header
      className={cn(
        "flex h-12 items-center justify-between border-b px-4 gap-4",
        "bg-[#1C1C1C] border-[#2A2A2A]",
        className
      )}
    >
      {/* Left side: Mobile menu + Logo + Breadcrumb */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Mobile menu button */}
        {mobileMenuButton}

        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            className="text-[#3ECF8E]"
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
        </div>

        {/* Breadcrumb separator */}
        <span className="text-[#6B6B6B] text-sm">/</span>

        {/* App name with dropdown */}
        <button className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-[#2A2A2A] transition-colors">
          <span className="text-[14px] font-medium text-[#EDEDED]">Deal Tracker</span>
          <ChevronDown className="h-3 w-3 text-[#6B6B6B] flex-shrink-0" />
        </button>
      </div>

      {/* Right side: Search + Icons + Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search pill */}
        <button
          onClick={onSearchClick}
          className="flex items-center gap-2 h-8 px-3 text-[13px] rounded-md transition-colors bg-[#2A2A2A] border border-[#3E3E3E] hover:border-[#4E4E4E]"
        >
          <Search className="h-4 w-4 text-[#6B6B6B] flex-shrink-0" />
          <span className="text-[#6B6B6B] hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 text-[10px] font-medium text-[#6B6B6B] bg-[#1C1C1C] border border-[#3E3E3E] rounded">
            <Command className="h-2.5 w-2.5 flex-shrink-0" />
            <span>K</span>
          </kbd>
        </button>

        {/* Help icon */}
        <button className="flex items-center justify-center h-8 w-8 rounded hover:bg-[#2A2A2A] transition-colors">
          <HelpCircle className="h-5 w-5 text-[#A1A1A1] hover:text-[#EDEDED]" />
        </button>

        {/* Settings icon */}
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center justify-center h-8 w-8 rounded hover:bg-[#2A2A2A] transition-colors"
        >
          <Settings className="h-5 w-5 text-[#A1A1A1] hover:text-[#EDEDED]" />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center h-7 w-7 rounded-full border border-[#3E3E3E] overflow-hidden hover:border-[#4E4E4E] transition-colors"
          >
            <Avatar alt="User" size="sm" className="h-full w-full" />
          </button>

          {/* User dropdown menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-lg bg-[#2A2A2A] border border-[#3E3E3E] shadow-lg z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-[13px] text-[#EDEDED] hover:bg-[#323232] transition-colors"
                >
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
