"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, HelpCircle, Settings, Command, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { ContextSwitcher } from "./context-switcher";
import { useCommand } from "@/components/providers/command-provider";

interface HeaderProps {
  className?: string;
  onSearchClick?: () => void;
}

export function Header({ className, onSearchClick }: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const { setOpen } = useCommand();

  const handleSearchClick = () => {
    setOpen(true);
    if (onSearchClick) onSearchClick();
  };

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
        "bg-[#0A0A0A] border-border",
        className
      )}
    >
      {/* Left side: Logo + Context Switcher */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Logo (Brand Anchor) */}
        <div
          className="flex items-center justify-center h-8 w-8 rounded-full bg-neutral-900 border border-neutral-800 flex-shrink-0 cursor-pointer hover:border-neutral-700 transition-colors"
          onClick={() => router.push('/dashboard')}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            className="text-foreground"
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

        {/* Divider */}
        <svg
          data-testid="geist-icon"
          fill="none"
          height="24"
          shapeRendering="geometricPrecision"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          viewBox="0 0 24 24"
          width="24"
          className="text-neutral-800 h-6 w-6 transform rotate-[25deg]"
        >
          <path d="M16.88 3.549L7.12 20.451" />
        </svg>

        {/* The New Switcher */}
        <ContextSwitcher />
      </div>

      {/* Right side: Search + Icons + Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Search pill */}
        <button
          onClick={handleSearchClick}
          className="flex items-center gap-2 h-8 px-3 text-[13px] rounded-md transition-colors bg-neutral-900 border border-border hover:border-neutral-700 hover:text-foreground text-neutral-500"
        >
          <Search className="h-4 w-4 flex-shrink-0" />
          <span className="hidden sm:inline">Search...</span>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 ml-2 px-1.5 py-0.5 text-[10px] font-medium bg-neutral-800 border border-neutral-700 rounded text-neutral-400">
            <Command className="h-2.5 w-2.5 flex-shrink-0" />
            <span>K</span>
          </kbd>
        </button>

        {/* Help icon */}
        <button className="flex items-center justify-center h-8 w-8 rounded text-neutral-500 hover:text-foreground hover:bg-neutral-900 transition-colors">
          <HelpCircle className="h-5 w-5" />
        </button>

        {/* Settings icon */}
        <button
          onClick={() => router.push("/settings")}
          className="flex items-center justify-center h-8 w-8 rounded text-neutral-500 hover:text-foreground hover:bg-neutral-900 transition-colors"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Avatar with dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center justify-center h-7 w-7 rounded-full border border-neutral-700 overflow-hidden hover:border-neutral-500 transition-colors"
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
              <div className="absolute right-0 top-full mt-2 w-48 py-1 rounded-lg bg-[#0A0A0A] border border-border shadow-xl z-50">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-[13px] text-neutral-400 hover:text-foreground hover:bg-neutral-900 transition-colors flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5" />
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
