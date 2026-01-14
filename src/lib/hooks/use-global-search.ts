"use client";

import * as React from "react";
import { getDeals, getContacts } from "@/lib/supabase/queries";
import { fuzzySearch } from "@/lib/fuzzy-search";
import type { Deal, Contact } from "@/lib/supabase/types";

export type SearchResultType = "deal" | "contact" | "action";

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  href?: string;
  icon?: string;
  data?: Deal | Contact;
}

interface UseGlobalSearchOptions {
  includeDeals?: boolean;
  includeContacts?: boolean;
  includeActions?: boolean;
  maxResults?: number;
}

const defaultActions: SearchResult[] = [
  {
    id: "action-new-deal",
    type: "action",
    title: "Create new deal",
    subtitle: "Add a new property deal",
    icon: "plus",
  },
  {
    id: "action-new-contact",
    type: "action",
    title: "Add new contact",
    subtitle: "Add a new contact to your CRM",
    icon: "user-plus",
  },
  {
    id: "action-dashboard",
    type: "action",
    title: "Go to Dashboard",
    subtitle: "View your portfolio overview",
    href: "/dashboard",
    icon: "layout-dashboard",
  },
  {
    id: "action-deals",
    type: "action",
    title: "View all deals",
    subtitle: "Browse your property deals",
    href: "/deals",
    icon: "building",
  },
  {
    id: "action-contacts",
    type: "action",
    title: "View all contacts",
    subtitle: "Browse your contacts",
    href: "/contacts",
    icon: "users",
  },
  {
    id: "action-settings",
    type: "action",
    title: "Open settings",
    subtitle: "Manage your preferences",
    href: "/settings",
    icon: "settings",
  },
];

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const {
    includeDeals = true,
    includeContacts = true,
    includeActions = true,
    maxResults = 10,
  } = options;

  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [dataLoaded, setDataLoaded] = React.useState(false);

  // Load data on first search
  const loadData = React.useCallback(async () => {
    if (dataLoaded) return;

    setLoading(true);
    try {
      const [dealsData, contactsData] = await Promise.all([
        includeDeals ? getDeals() : Promise.resolve([]),
        includeContacts ? getContacts() : Promise.resolve([]),
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
      setDataLoaded(true);
    } catch (error) {
      console.error("Error loading search data:", error);
    } finally {
      setLoading(false);
    }
  }, [dataLoaded, includeDeals, includeContacts]);

  // Search logic
  React.useEffect(() => {
    if (!query.trim()) {
      // Show recent/suggested when empty
      if (includeActions) {
        setResults(defaultActions.slice(0, 5));
      } else {
        setResults([]);
      }
      return;
    }

    const searchResults: SearchResult[] = [];

    // Search deals
    if (includeDeals && deals.length > 0) {
      const dealResults = fuzzySearch(deals, query, (deal) => [
        deal.name,
        deal.address || "",
        deal.city || "",
        deal.state || "",
        deal.property_type || "",
      ]);

      dealResults.slice(0, maxResults).forEach(({ item }) => {
        searchResults.push({
          id: item.id,
          type: "deal",
          title: item.name,
          subtitle: [item.address, item.city, item.state].filter(Boolean).join(", ") || item.property_type || "No location",
          href: `/deals/${item.id}`,
          icon: "building",
          data: item,
        });
      });
    }

    // Search contacts
    if (includeContacts && contacts.length > 0) {
      const contactResults = fuzzySearch(contacts, query, (contact) => [
        contact.name,
        contact.email || "",
        contact.company || "",
        contact.role || "",
      ]);

      contactResults.slice(0, maxResults).forEach(({ item }) => {
        searchResults.push({
          id: item.id,
          type: "contact",
          title: item.name,
          subtitle: [item.company, item.role].filter(Boolean).join(" • ") || item.email || "No details",
          href: "/contacts",
          icon: "user",
          data: item,
        });
      });
    }

    // Search actions
    if (includeActions) {
      const actionResults = fuzzySearch(defaultActions, query, (action) => [
        action.title,
        action.subtitle || "",
      ]);

      actionResults.forEach(({ item }) => {
        searchResults.push(item);
      });
    }

    // Sort by relevance and limit
    setResults(searchResults.slice(0, maxResults));
  }, [query, deals, contacts, includeDeals, includeContacts, includeActions, maxResults]);

  return {
    query,
    setQuery,
    results,
    loading,
    loadData,
    dataLoaded,
  };
}
