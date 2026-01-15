"use client";

import * as React from "react";
import { Suspense } from "react";
import { useToastActions } from "@/components/ui/toast";
import { getDeals } from "@/lib/supabase/queries";
import { DealDetailPanel } from "@/components/table-editor/deal-detail-panel";
import { NewDealPanel } from "@/components/table-editor/new-deal-panel";
import type { Deal } from "@/lib/supabase/types";
import { useQuery } from "@tanstack/react-query";
import { useCreateDeal, useUpdateDeal } from "@/lib/hooks/use-deals";
import { DataGrid } from "@/components/ui/data-grid/data-grid";
import { TextCell, SelectCell } from "@/components/ui/data-grid/cells";
import { useGridState } from "@/components/ui/data-grid/use-grid-state";
import type { ColumnDef, SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { Loader2 } from "lucide-react";

// Loading fallback
function DealsPageSkeleton() {
  return (
    <div className="h-full flex flex-col bg-[#1C1C1C]">
      <div className="h-12 border-b border-[#1C1C1C] flex items-center px-4 justify-between">
        <h1 className="text-sm font-semibold">Deals</h1>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#666]" />
      </div>
    </div>
  );
}

// Status options for inline select
const statusOptions = [
  { value: "active", label: "Under Contract", bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  { value: "closed", label: "Closed Won", bg: "rgba(62, 207, 142, 0.2)", text: "#3ECF8E" },
  { value: "on-hold", label: "On Hold", bg: "rgba(248, 113, 113, 0.15)", text: "#F87171" },
];

// Property type options for inline select
const propertyTypeOptions = [
  { value: "office", label: "Office", bg: "rgba(96, 165, 250, 0.15)", text: "#60A5FA" },
  { value: "retail", label: "Retail", bg: "rgba(236, 72, 153, 0.15)", text: "#EC4899" },
  { value: "industrial", label: "Industrial", bg: "rgba(251, 191, 36, 0.15)", text: "#FBBF24" },
  { value: "multifamily", label: "Multifamily", bg: "rgba(62, 207, 142, 0.15)", text: "#3ECF8E" },
  { value: "land", label: "Land", bg: "rgba(120, 113, 108, 0.15)", text: "#78716C" },
  { value: "mixed-use", label: "Mixed Use", bg: "rgba(139, 92, 246, 0.15)", text: "#8B5CF6" },
];

function DealsPageContent() {
  const toast = useToastActions();

  // URL State Management
  const {
    sorting,
    setSorting,
    columnFilters,
    setColumnFilters
  } = useGridState();

  // React Query Fetching
  const { data: deals = [], isLoading: loading } = useQuery({
    queryKey: ["deals"],
    queryFn: async () => getDeals(),
    staleTime: 60 * 1000,
  });

  // Optimistic Mutations
  const createMutation = useCreateDeal();
  const updateMutation = useUpdateDeal();

  const [showNewDealPanel, setShowNewDealPanel] = React.useState(false);
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);

  // Handle deal created
  const handleDealCreated = (newDeal: Deal) => {
    createMutation.mutate(newDeal, {
      onSuccess: () => {
        toast.success("Deal created");
        setShowNewDealPanel(false);
      },
      onError: () => toast.error("Failed to create")
    });
  };

  // Handle deal update
  const handleDealUpdate = (updatedDeal: Deal) => {
    updateMutation.mutate({ id: updatedDeal.id, updates: updatedDeal });
    setSelectedDeal(updatedDeal);
  };

  // Column definitions for DataGrid
  const gridColumns = React.useMemo<ColumnDef<Deal>[]>(() => [
    {
      accessorKey: "name",
      header: "Name",
      size: 300,
      cell: ({ getValue }) => <TextCell value={getValue()} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      size: 150,
      cell: ({ getValue }) => <SelectCell value={getValue()} options={statusOptions} />,
    },
    {
      accessorKey: "property_type",
      header: "Type",
      size: 150,
      cell: ({ getValue }) => <SelectCell value={getValue()} options={propertyTypeOptions} />,
    },
    {
      accessorKey: "city",
      header: "Location",
      size: 200,
      accessorFn: (row) => [row.city, row.state].filter(Boolean).join(", "),
      cell: ({ getValue }) => <TextCell value={getValue()} />,
    },
    {
      accessorKey: "created_at",
      header: "Created",
      size: 150,
      cell: ({ getValue }) => (
        <span className="text-[13px] text-[#A1A1A1]">
          {getValue()
            ? new Date(getValue() as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })
            : "—"}
        </span>
      ),
    },
  ], []);

  if (loading) {
    return <div className="p-10 text-[#6B6B6B]">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#0A0A0A] text-[#EDEDED]">
      <div className="h-12 border-b border-[#1C1C1C] flex items-center px-4 justify-between">
        <h1 className="text-sm font-semibold">Deals</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#666]">
            {deals.length} records • {loading ? "Syncing..." : "Synced"}
          </span>
          <button onClick={() => setShowNewDealPanel(true)} className="bg-white text-black px-3 py-1.5 rounded text-xs font-medium hover:bg-gray-200">
            New Deal
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <DataGrid
          data={deals}
          columns={gridColumns}
          onRowClick={(deal) => setSelectedDeal(deal)}
          sorting={sorting as SortingState}
          onSortingChange={setSorting as unknown as React.Dispatch<React.SetStateAction<SortingState>>}
          columnFilters={columnFilters as ColumnFiltersState}
          onColumnFiltersChange={setColumnFilters as unknown as React.Dispatch<React.SetStateAction<ColumnFiltersState>>}
        />
      </div>

      <NewDealPanel
        open={showNewDealPanel}
        onClose={() => setShowNewDealPanel(false)}
        onDealCreated={handleDealCreated}
      />
      <DealDetailPanel
        deal={selectedDeal}
        open={selectedDeal !== null}
        onClose={() => setSelectedDeal(null)}
        onDealUpdate={handleDealUpdate}
      />
    </div>
  );
}

export default function DealsPage() {
  return (
    <Suspense fallback={<DealsPageSkeleton />}>
      <DealsPageContent />
    </Suspense>
  );
}
