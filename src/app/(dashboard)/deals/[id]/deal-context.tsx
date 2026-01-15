"use client";

import * as React from "react";
import type { Deal } from "@/lib/supabase/types";

// Create a context to share deal data with child pages
export const DealContext = React.createContext<{
  deal: Deal | null;
  isLoading: boolean;
  refetch: () => void;
} | null>(null);

export function useDeal() {
  const context = React.useContext(DealContext);
  if (!context) {
    throw new Error("useDeal must be used within DealLayout");
  }
  return context;
}
