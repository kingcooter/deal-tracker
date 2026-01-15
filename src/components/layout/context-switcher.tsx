"use client";

import * as React from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import { Check, ChevronsUpDown, Search, Building2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { getDeals } from "@/lib/supabase/queries";
import { fuzzySearch } from "@/lib/fuzzy-search";
import { createClient } from "@/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function ContextSwitcher() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [currentUser, setCurrentUser] = React.useState<{ email?: string } | null>(null);

  // Get current deal ID from URL
  const currentDealId = params?.id as string | undefined;

  // Fetch deals with React Query
  const { data: deals = [] } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => getDeals(),
    staleTime: 60 * 1000, // 1 minute
  });

  // Find current deal object
  const currentDeal = deals.find((d) => d.id === currentDealId);

  // Fetch user info on mount (could also be a query, but low priority)
  React.useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setCurrentUser({ email: data.user.email });
      }
    });
  }, []);

  // Focus input on open
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Click outside to close
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const filteredDeals = React.useMemo(() => {
    if (!query) return deals.slice(0, 5); // Show recent 5 by default
    const results = fuzzySearch(deals, query, (deal) => [
      deal.name,
      deal.address || "",
      deal.city || ""
    ]);
    return results.map((r) => r.item).slice(0, 8);
  }, [deals, query]);

  const handleSelectDeal = (dealId: string) => {
    setOpen(false);
    router.push(`/deals/${dealId}`);
  };

  const isDealsPage = pathname.startsWith("/deals");

  // Render Scope (User)
  const renderScope = () => (
    <div className="flex items-center gap-2">
      <div className="relative h-5 w-5 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center">
        <span className="text-[10px] font-bold text-white uppercase">
          {currentUser?.email?.[0] || "U"}
        </span>
      </div>
      <span className="font-medium text-sm text-foreground">
        {currentUser?.email?.split('@')[0] || "Personal"}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2" ref={containerRef}>
      {/* Scope (User) */}
      <div className="hidden sm:flex items-center gap-2 px-2 py-1 rounded-md hover:bg-surface-hover transition-colors cursor-default">
        {renderScope()}
      </div>

      <span className="text-foreground-subtle mx-1 hidden sm:inline-block">/</span>

      {/* Context (Deal Switcher) */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md transition-all duration-200 group",
            "hover:bg-surface-hover",
            open && "bg-surface-hover ring-1 ring-border"
          )}
        >
          {currentDeal ? (
            <>
              <span className="font-medium text-sm text-foreground">{currentDeal.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-elevated text-foreground-muted border border-border group-hover:border-foreground-muted transition-colors">
                {currentDeal.status.replace('_', ' ')}
              </span>
            </>
          ) : (
            <span className="font-medium text-sm text-foreground">
              {isDealsPage ? "All Deals" : "Deal Tracker"}
            </span>
          )}

          <ChevronsUpDown className="h-3 w-3 text-foreground-subtle group-hover:text-foreground transition-colors ml-1" />
        </button>

        {/* Dropdown Popover */}
        {open && (
          <div className="absolute top-full left-0 mt-2 w-80 z-50 origin-top-left animate-scale-in rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            {/* Search Header */}
            <div className="flex items-center px-3 py-3 border-b border-border">
              <Search className="h-4 w-4 text-foreground-subtle mr-2" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find a deal..."
                className="bg-transparent border-none outline-none text-sm text-foreground placeholder:text-foreground-muted w-full"
              />
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto py-1">
              <div className="px-2 pb-1">
                <span className="text-[10px] uppercase font-medium text-foreground-muted px-2">
                  {query ? 'Results' : 'Recent Deals'}
                </span>
              </div>

              {filteredDeals.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-foreground-muted">
                  No deals found.
                </div>
              )}

              {filteredDeals.map((deal) => (
                <button
                  key={deal.id}
                  onClick={() => handleSelectDeal(deal.id)}
                  className="w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-surface-hover transition-colors group relative"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded bg-surface-elevated flex items-center justify-center border border-border group-hover:border-foreground-muted">
                    <Building2 className="h-4 w-4 text-foreground-subtle group-hover:text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground-secondary group-hover:text-foreground truncate transition-colors">
                      {deal.name}
                    </div>
                    <div className="text-xs text-foreground-muted truncate">
                      {deal.address}, {deal.city}
                    </div>
                  </div>
                  {currentDealId === deal.id && (
                    <Check className="h-3 w-3 text-foreground ml-2" />
                  )}
                </button>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="p-1 border-t border-border bg-surface/50">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push('/deals?new=true');
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-foreground-muted hover:text-foreground hover:bg-surface rounded transition-colors"
              >
                <Plus className="h-3 w-3" />
                Create New Deal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
