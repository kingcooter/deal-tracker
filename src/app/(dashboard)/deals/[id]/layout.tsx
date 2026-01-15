"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getDeal } from "@/lib/supabase/queries";
import { DealNavigationTabs } from "@/components/deals";
import { SkeletonDealDetail } from "@/components/ui/skeleton";
import Link from "next/link";
import { Building2 } from "lucide-react";
import { DealContext } from "./deal-context";

export default function DealLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const dealId = params.id as string;

  const { data: deal, isLoading, refetch } = useQuery({
    queryKey: ["deal", dealId],
    queryFn: () => getDeal(dealId),
    staleTime: 60 * 1000,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="-m-4 md:-m-6 lg:-m-8">
        <div className="border-b border-border bg-background px-4">
          <div className="flex gap-6 py-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-4 w-16 bg-surface-elevated animate-pulse rounded" />
            ))}
          </div>
        </div>
        <div className="p-4 md:p-6 lg:p-8">
          <SkeletonDealDetail />
        </div>
      </div>
    );
  }

  // Not found state
  if (!deal) {
    return (
      <div className="-m-4 md:-m-6 lg:-m-8">
        <DealNavigationTabs dealId={dealId} />
        <div className="p-4 md:p-6 lg:p-8">
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-foreground-subtle mb-4" />
            <h2 className="text-lg font-semibold text-foreground mb-2">Deal not found</h2>
            <p className="text-foreground-muted mb-4">
              The deal you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Link
              href="/deals"
              className="text-primary hover:underline"
            >
              Back to Deals
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DealContext.Provider value={{ deal, isLoading, refetch }}>
      <div className="-m-4 md:-m-6 lg:-m-8 flex flex-col h-[calc(100vh-48px)]">
        {/* Deal Navigation Tabs - flush against header */}
        <DealNavigationTabs dealId={dealId} />

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </DealContext.Provider>
  );
}
