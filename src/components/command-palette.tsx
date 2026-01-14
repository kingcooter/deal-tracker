"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Building2,
  Users,
  Settings,
  Plus,
  Loader2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { getDeals, getContacts } from "@/lib/supabase/queries";
import { fuzzySearch, highlightMatches, type FuzzyMatch } from "@/lib/fuzzy-search";
import type { Deal, Contact } from "@/lib/supabase/types";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SearchResult = {
  id: string;
  type: "deal" | "contact" | "action" | "recent";
  title: string;
  titleMatches?: Array<[number, number]>;
  subtitle?: string;
  subtitleMatches?: Array<[number, number]>;
  icon: React.ReactNode;
  href?: string;
  action?: () => void;
  score?: number;
};

// Highlighted text component
function HighlightedText({
  text,
  matches,
}: {
  text: string;
  matches?: Array<[number, number]>;
}) {
  if (!matches || matches.length === 0) {
    return <>{text}</>;
  }

  const parts = highlightMatches(text, matches);

  return (
    <>
      {parts.map((part, i) =>
        part.highlighted ? (
          <mark key={i} className="bg-primary/20 text-foreground rounded-sm px-0.5">
            {part.text}
          </mark>
        ) : (
          <span key={i}>{part.text}</span>
        )
      )}
    </>
  );
}

// Recent searches storage key
const RECENT_SEARCHES_KEY = "command-palette-recent";
const MAX_RECENT = 5;

function getRecentSearches(): SearchResult[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(result: SearchResult) {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentSearches().filter((r) => r.id !== result.id);
    recent.unshift({ ...result, type: "recent" as const });
    localStorage.setItem(
      RECENT_SEARCHES_KEY,
      JSON.stringify(recent.slice(0, MAX_RECENT))
    );
  } catch {
    // Ignore storage errors
  }
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [recentSearches, setRecentSearches] = React.useState<SearchResult[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLDivElement>(null);

  // Load recent searches on mount
  React.useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Fetch data when opened
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setLoading(true);
      inputRef.current?.focus();

      // Fetch deals and contacts
      Promise.all([getDeals(), getContacts()])
        .then(([dealsData, contactsData]) => {
          setDeals(dealsData);
          setContacts(contactsData);
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      // Refresh recent searches
      setRecentSearches(getRecentSearches());
    }
  }, [open]);

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, onOpenChange]);

  // Quick actions
  const actions: SearchResult[] = [
    {
      id: "new-deal",
      type: "action",
      title: "Create new deal",
      icon: <Plus className="h-4 w-4" />,
      href: "/deals?new=true",
    },
    {
      id: "new-contact",
      type: "action",
      title: "Add new contact",
      icon: <Plus className="h-4 w-4" />,
      href: "/contacts?new=true",
    },
    {
      id: "go-deals",
      type: "action",
      title: "Go to Deals",
      icon: <Building2 className="h-4 w-4" />,
      href: "/deals",
    },
    {
      id: "go-contacts",
      type: "action",
      title: "Go to Contacts",
      icon: <Users className="h-4 w-4" />,
      href: "/contacts",
    },
    {
      id: "go-settings",
      type: "action",
      title: "Go to Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/settings",
    },
  ];

  // Build search results with fuzzy search
  const results = React.useMemo(() => {
    const q = query.trim();

    if (!q) {
      // Show recent searches + actions when no query
      if (recentSearches.length > 0) {
        return [
          ...recentSearches.map((r) => ({
            ...r,
            icon: <Clock className="h-4 w-4" />,
          })),
          ...actions,
        ];
      }
      return actions;
    }

    const items: SearchResult[] = [];

    // Fuzzy search deals
    const dealResults = fuzzySearch(deals, q, (deal) => [
      deal.name,
      deal.address || "",
      deal.city || "",
    ]);

    for (const { item: deal, match } of dealResults.slice(0, 5)) {
      const subtitle = [deal.address, deal.city, deal.state].filter(Boolean).join(", ");
      items.push({
        id: deal.id,
        type: "deal",
        title: deal.name,
        titleMatches: match.matches,
        subtitle,
        icon: <Building2 className="h-4 w-4" />,
        href: `/deals/${deal.id}`,
        score: match.score,
      });
    }

    // Fuzzy search contacts
    const contactResults = fuzzySearch(contacts, q, (contact) => [
      contact.name,
      contact.email || "",
      contact.company || "",
    ]);

    for (const { item: contact, match } of contactResults.slice(0, 5)) {
      items.push({
        id: contact.id,
        type: "contact",
        title: contact.name,
        titleMatches: match.matches,
        subtitle: contact.company || contact.email || undefined,
        icon: <Users className="h-4 w-4" />,
        href: `/contacts?highlight=${contact.id}`,
        score: match.score,
      });
    }

    // Fuzzy search actions
    const actionResults = fuzzySearch(actions, q, (action) => action.title);
    for (const { item: action, match } of actionResults) {
      items.push({
        ...action,
        titleMatches: match.matches,
        score: match.score,
      });
    }

    // Sort all results by score
    return items.sort((a, b) => (b.score || 0) - (a.score || 0));
  }, [query, deals, contacts, actions, recentSearches]);

  // Reset selected index when results change
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        const selected = results[selectedIndex];
        if (selected) {
          if (selected.href) {
            router.push(selected.href);
            onOpenChange(false);
          } else if (selected.action) {
            selected.action();
            onOpenChange(false);
          }
        }
        break;
    }
  };

  const handleSelect = (result: SearchResult) => {
    // Save to recent searches (except actions and recent items)
    if (result.type === "deal" || result.type === "contact") {
      addRecentSearch(result);
    }

    if (result.href) {
      router.push(result.href);
      onOpenChange(false);
    } else if (result.action) {
      result.action();
      onOpenChange(false);
    }
  }

  // Scroll selected item into view
  React.useEffect(() => {
    if (resultsRef.current) {
      const selected = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (selected) {
        selected.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);;

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <div className="rounded border border-border bg-background shadow-2xl">
          {/* Search input */}
          <div className="flex items-center border-b border-border px-3">
            <Search className="h-4 w-4 text-foreground-subtle" />
            <Input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search deals, contacts, or type a command..."
              className="border-0 bg-transparent focus:ring-0 focus:border-transparent h-12"
            />
            <kbd className="hidden sm:inline-flex items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-foreground-muted">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div ref={resultsRef} className="max-h-80 overflow-y-auto py-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-foreground-muted" />
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-foreground-muted">
                No results found for &quot;{query}&quot;
              </div>
            ) : (
              <div className="space-y-1 px-2">
                {/* Group header for recent searches */}
                {!query && recentSearches.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground-subtle">
                    Recent
                  </div>
                )}
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    data-index={index}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all",
                      index === selectedIndex
                        ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                        : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                    )}
                  >
                    <span className={cn(
                      "flex-shrink-0",
                      index === selectedIndex ? "text-primary" : "text-foreground-subtle"
                    )}>
                      {result.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        <HighlightedText text={result.title} matches={result.titleMatches} />
                      </div>
                      {result.subtitle && (
                        <div className="text-xs text-foreground-subtle truncate">
                          <HighlightedText text={result.subtitle} matches={result.subtitleMatches} />
                        </div>
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] uppercase px-1.5 py-0.5 rounded",
                      result.type === "deal" && "bg-info-muted text-info",
                      result.type === "contact" && "bg-success-muted text-success",
                      result.type === "action" && "bg-surface text-foreground-subtle",
                      result.type === "recent" && "bg-surface text-foreground-subtle"
                    )}>
                      {result.type === "recent" ? "recent" : result.type}
                    </span>
                  </button>
                ))}
                {/* Group header for actions */}
                {!query && recentSearches.length > 0 && (
                  <div className="px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground-subtle mt-2">
                    Quick Actions
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-foreground-subtle">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-surface px-1 py-0.5">↑</kbd>
                <kbd className="rounded border border-border bg-surface px-1 py-0.5">↓</kbd>
                navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-surface px-1 py-0.5">↵</kbd>
                select
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Hook to use command palette with keyboard shortcut
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return { open, setOpen };
}
