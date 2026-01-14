"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  Settings,
  Plus,
  LayoutDashboard,
  X,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Deals", href: "/deals", icon: Building2 },
  { name: "Contacts", href: "/contacts", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface MobileSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileSidebar({ open, onOpenChange }: MobileSidebarProps) {
  const pathname = usePathname();

  // Close on route change
  React.useEffect(() => {
    onOpenChange(false);
  }, [pathname, onOpenChange]);

  // Close on escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Sidebar */}
      <div className="absolute inset-y-0 left-0 w-72 bg-background-secondary border-r border-border animate-slide-in-left">
        {/* Header */}
        <div className="flex h-14 items-center justify-between border-b border-border px-4">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <LayoutDashboard className="h-4 w-4 text-black" />
            </div>
            <span className="font-semibold text-foreground">DealTracker</span>
          </Link>
          <button
            onClick={() => onOpenChange(false)}
            className="p-2 rounded-md hover:bg-surface-hover transition-colors text-foreground-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Deal Button */}
        <div className="p-4">
          <Link href="/deals">
            <Button className="w-full justify-start gap-2">
              <Plus className="h-4 w-4" />
              New Deal
            </Button>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium",
                  "transition-all duration-150",
                  isActive
                    ? "bg-surface-active text-foreground shadow-sm"
                    : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Hamburger menu button for mobile
interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({ onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "md:hidden p-2 rounded-md hover:bg-surface-hover transition-colors text-foreground-muted",
        className
      )}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
