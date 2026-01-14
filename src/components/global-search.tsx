"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  User,
  Plus,
  UserPlus,
  LayoutDashboard,
  Users,
  Settings,
  ArrowRight,
  Command,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGlobalSearch, SearchResult } from "@/lib/hooks/use-global-search";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeal?: () => void;
  onCreateContact?: () => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  building: Building2,
  user: User,
  plus: Plus,
  "user-plus": UserPlus,
  "layout-dashboard": LayoutDashboard,
  users: Users,
  settings: Settings,
};

const typeLabels: Record<string, string> = {
  deal: "Deal",
  contact: "Contact",
  action: "Action",
};

export function GlobalSearch({
  open,
  onOpenChange,
  onCreateDeal,
  onCreateContact,
}: GlobalSearchProps) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const { query, setQuery, results, loading, loadData, dataLoaded } = useGlobalSearch();

  // Load data when opened
  React.useEffect(() => {
    if (open && !dataLoaded) {
      loadData();
    }
  }, [open, dataLoaded, loadData]);

  // Focus input when opened
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery("");
    }
  }, [open, setQuery]);

  // Reset selection when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        onOpenChange(false);
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);

    if (result.href) {
      router.push(result.href);
    } else if (result.id === "action-new-deal" && onCreateDeal) {
      onCreateDeal();
    } else if (result.id === "action-new-contact" && onCreateContact) {
      onCreateContact();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => onOpenChange(false)}
      />

      {/* Modal */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-full max-w-xl animate-scale-in">
        <div className="mx-4 overflow-hidden rounded-xl border border-border bg-surface shadow-2xl">
          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4">
            {loading ? (
              <Loader2 className="h-5 w-5 text-foreground-muted animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-foreground-muted" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search deals, contacts, or type a command..."
              className="flex-1 bg-transparent py-4 text-foreground placeholder:text-foreground-subtle outline-none"
            />
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-surface-hover text-xs text-foreground-muted">
              <Command className="h-3 w-3" />K
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {results.length === 0 && query && !loading && (
              <div className="py-12 text-center">
                <Search className="h-8 w-8 mx-auto text-foreground-subtle mb-3" />
                <p className="text-foreground-muted">No results found</p>
                <p className="text-sm text-foreground-subtle mt-1">
                  Try searching for something else
                </p>
              </div>
            )}

            {results.length > 0 && (
              <div className="py-2">
                {/* Group results by type */}
                {["deal", "contact", "action"].map((type) => {
                  const typeResults = results.filter((r) => r.type === type);
                  if (typeResults.length === 0) return null;

                  return (
                    <div key={type}>
                      <div className="px-4 py-2">
                        <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
                          {typeLabels[type]}s
                        </span>
                      </div>
                      {typeResults.map((result) => {
                        const Icon = iconMap[result.icon || "building"] || Building2;
                        const index = results.indexOf(result);
                        const isSelected = index === selectedIndex;

                        return (
                          <button
                            key={result.id}
                            className={cn(
                              "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                              isSelected
                                ? "bg-primary/10 text-foreground"
                                : "hover:bg-surface-hover text-foreground"
                            )}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(index)}
                          >
                            <div
                              className={cn(
                                "p-2 rounded-md",
                                result.type === "deal" && "bg-info/10 text-info",
                                result.type === "contact" && "bg-success/10 text-success",
                                result.type === "action" && "bg-primary/10 text-primary"
                              )}
                            >
                              <Icon className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{result.title}</p>
                              {result.subtitle && (
                                <p className="text-sm text-foreground-muted truncate">
                                  {result.subtitle}
                                </p>
                              )}
                            </div>
                            {isSelected && (
                              <ArrowRight className="h-4 w-4 text-foreground-muted" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-foreground-muted">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-hover">↑↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-hover">↵</kbd>
                select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-hover">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook to manage global search state
export function useGlobalSearchModal() {
  const [isOpen, setIsOpen] = React.useState(false);

  // Register Cmd+K shortcut
  useKeyboardShortcuts([
    {
      key: "k",
      meta: true,
      action: () => setIsOpen(true),
      description: "Open search",
    },
  ]);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
  };
}
