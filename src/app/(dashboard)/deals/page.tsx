"use client";

import * as React from "react";
import { Building2, LayoutList, Kanban } from "lucide-react";
import {
  TableLayout,
  Toolbar,
  Pagination,
  DataTable,
  StatusBadge,
  InlineTextEdit,
  InlineSelectEdit,
  DealDetailPanel,
  NewDealPanel,
  FilterDropdown,
  applyFilters,
} from "@/components/table-editor";
import { SavedFilters } from "@/components/table-editor/saved-filters";
import { DealKanban } from "@/components/deal-pipeline/deal-kanban";
import type { SortConfig, SortDirection, FilterConfig, FilterColumn } from "@/components/table-editor";
import { useToastActions } from "@/components/ui/toast";
import { getDeals, updateDeal, deleteDeal } from "@/lib/supabase/queries";
import { useTableShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { cn } from "@/lib/utils";
import type { Deal } from "@/lib/supabase/types";

type ViewMode = "table" | "kanban";

// Status mapping for PM vocabulary
const dealStatusMap: Record<string, { bg: string; text: string; label: string }> = {
  active: {
    bg: "rgba(251, 191, 36, 0.15)",
    text: "#FBBF24",
    label: "Under Contract",
  },
  closed: {
    bg: "rgba(62, 207, 142, 0.2)",
    text: "#3ECF8E",
    label: "Closed Won",
  },
  "on-hold": {
    bg: "rgba(248, 113, 113, 0.15)",
    text: "#F87171",
    label: "On Hold",
  },
};

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

interface EditingCell {
  rowId: string;
  columnId: string;
}

export default function DealsPage() {
  const toast = useToastActions();
  const [deals, setDeals] = React.useState<Deal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [showNewDealPanel, setShowNewDealPanel] = React.useState(false);
  const [editingCell, setEditingCell] = React.useState<EditingCell | null>(null);
  const [selectedDeal, setSelectedDeal] = React.useState<Deal | null>(null);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({
    column: "created_at",
    direction: "desc",
  });
  const [filters, setFilters] = React.useState<FilterConfig[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>("table");

  // Filter columns configuration
  const filterColumns: FilterColumn[] = [
    {
      id: "status",
      label: "Status",
      type: "select",
      options: statusOptions.map((s) => ({ value: s.value, label: s.label })),
    },
    {
      id: "property_type",
      label: "Property Type",
      type: "select",
      options: propertyTypeOptions.map((p) => ({ value: p.value, label: p.label })),
    },
    {
      id: "city",
      label: "City",
      type: "text",
    },
    {
      id: "state",
      label: "State",
      type: "text",
    },
  ];

  // Fetch deals
  React.useEffect(() => {
    async function fetchDeals() {
      try {
        const data = await getDeals();
        setDeals(data);
      } catch (error) {
        console.error("Error fetching deals:", error);
        toast.error("Failed to load deals", "Please refresh the page");
      } finally {
        setLoading(false);
      }
    }
    fetchDeals();
  }, []);

  // Sorting
  const handleSort = (columnId: string) => {
    setSortConfig((prev) => {
      if (prev.column === columnId) {
        // Cycle: asc -> desc -> null -> asc
        const nextDirection: SortDirection =
          prev.direction === "asc" ? "desc" : prev.direction === "desc" ? null : "asc";
        return { column: nextDirection ? columnId : null, direction: nextDirection };
      }
      return { column: columnId, direction: "asc" };
    });
  };

  // Filtered data
  const filteredDeals = React.useMemo(() => {
    return applyFilters(deals, filters);
  }, [deals, filters]);

  // Sorted data
  const sortedDeals = React.useMemo(() => {
    if (!sortConfig.column || !sortConfig.direction) return filteredDeals;

    return [...filteredDeals].sort((a, b) => {
      const col = sortConfig.column as keyof Deal;
      let aVal = a[col];
      let bVal = b[col];

      // Handle null/undefined
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return sortConfig.direction === "asc" ? 1 : -1;
      if (bVal == null) return sortConfig.direction === "asc" ? -1 : 1;

      // Handle dates
      if (col === "created_at" || col === "updated_at") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }

      // Compare
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredDeals, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedDeals.length / rowsPerPage);
  const paginatedDeals = React.useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedDeals.slice(start, start + rowsPerPage);
  }, [sortedDeals, currentPage, rowsPerPage]);

  // Selection
  const isAllSelected = selectedIds.size === paginatedDeals.length && paginatedDeals.length > 0;
  const isSomeSelected = selectedIds.size > 0 && selectedIds.size < paginatedDeals.length;

  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedDeals.map((d) => d.id)));
    }
  };

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle row click - open slide-over panel (only if not editing)
  const handleRowClick = (deal: Deal) => {
    if (!editingCell) {
      setSelectedDeal(deal);
    }
  };

  // Handle deal update from slide-over panel
  const handleDealUpdate = (updatedDeal: Deal) => {
    setDeals((prev) =>
      prev.map((d) => (d.id === updatedDeal.id ? updatedDeal : d))
    );
    setSelectedDeal(updatedDeal);
  };

  // Handle deal created from new deal panel
  const handleDealCreated = (newDeal: Deal) => {
    setDeals((prev) => [newDeal, ...prev]);
  };

  // Handle bulk delete
  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;

    const idsToDelete = Array.from(selectedIds);
    const count = idsToDelete.length;

    // Optimistic update
    setDeals((prev) => prev.filter((d) => !selectedIds.has(d.id)));
    setSelectedIds(new Set());

    try {
      await Promise.all(idsToDelete.map((id) => deleteDeal(id)));
      toast.success(
        `Deleted ${count} deal${count > 1 ? "s" : ""}`,
        "Successfully removed"
      );
    } catch (error) {
      // Rollback - refetch deals
      console.error("Error deleting deals:", error);
      toast.error("Failed to delete", "Some deals could not be deleted");
      const data = await getDeals();
      setDeals(data);
    }
  };

  // Table keyboard shortcuts
  useTableShortcuts({
    onNew: () => setShowNewDealPanel(true),
    onDelete: selectedIds.size > 0 ? handleDeleteSelected : undefined,
    onFilter: () => setShowFilterDropdown((prev) => !prev),
    onSelectAll: () => setSelectedIds(new Set(paginatedDeals.map((d) => d.id))),
    onClearSelection: () => {
      setSelectedIds(new Set());
      setEditingCell(null);
      setSelectedDeal(null);
    },
  });

  // Handle double-click to edit cell
  const handleRowDoubleClick = (deal: Deal, columnId: string) => {
    // Only allow editing on editable columns
    if (["name", "status", "property_type"].includes(columnId)) {
      setEditingCell({ rowId: deal.id, columnId });
    }
  };

  // Handle inline edit save
  const handleInlineSave = async (dealId: string, field: string, value: string) => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, [field]: value } : d))
    );
    setEditingCell(null);

    try {
      await updateDeal(dealId, { [field]: value });
      toast.success("Updated", `${field.replace("_", " ")} updated`);
    } catch (error) {
      // Rollback on error
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? deal : d))
      );
      toast.error("Failed to update", "Please try again");
    }
  };

  // Handle inline edit cancel
  const handleInlineCancel = () => {
    setEditingCell(null);
  };

  // Check if a cell is being edited
  const isEditing = (dealId: string, columnId: string) => {
    return editingCell?.rowId === dealId && editingCell?.columnId === columnId;
  };

  // Editable columns list for tab navigation
  const editableColumns = ["name", "status", "property_type"];

  // Handle tab navigation between editable cells
  const handleTab = (dealId: string, currentColumnId: string, shiftKey: boolean) => {
    const currentColumnIndex = editableColumns.indexOf(currentColumnId);
    const dealIndex = paginatedDeals.findIndex((d) => d.id === dealId);

    if (shiftKey) {
      // Move backward
      if (currentColumnIndex > 0) {
        // Previous column, same row
        setEditingCell({ rowId: dealId, columnId: editableColumns[currentColumnIndex - 1] });
      } else if (dealIndex > 0) {
        // Last column, previous row
        const prevDeal = paginatedDeals[dealIndex - 1];
        setEditingCell({ rowId: prevDeal.id, columnId: editableColumns[editableColumns.length - 1] });
      }
    } else {
      // Move forward
      if (currentColumnIndex < editableColumns.length - 1) {
        // Next column, same row
        setEditingCell({ rowId: dealId, columnId: editableColumns[currentColumnIndex + 1] });
      } else if (dealIndex < paginatedDeals.length - 1) {
        // First column, next row
        const nextDeal = paginatedDeals[dealIndex + 1];
        setEditingCell({ rowId: nextDeal.id, columnId: editableColumns[0] });
      }
    }
  };

  // Table columns with inline editing support
  const columns = [
    {
      id: "name",
      header: "Name",
      width: "30%",
      sortable: true,
      editable: true,
      render: (deal: Deal) =>
        isEditing(deal.id, "name") ? (
          <InlineTextEdit
            value={deal.name}
            onSave={(value) => handleInlineSave(deal.id, "name", value)}
            onCancel={handleInlineCancel}
            onTab={(shiftKey) => handleTab(deal.id, "name", shiftKey)}
          />
        ) : (
          <span className="text-[13px] font-medium text-[#EDEDED] truncate block">
            {deal.name}
          </span>
        ),
    },
    {
      id: "status",
      header: "Status",
      width: "15%",
      sortable: true,
      editable: true,
      render: (deal: Deal) =>
        isEditing(deal.id, "status") ? (
          <InlineSelectEdit
            value={deal.status}
            options={statusOptions}
            onSave={(value) => handleInlineSave(deal.id, "status", value)}
            onCancel={handleInlineCancel}
            onTab={(shiftKey) => handleTab(deal.id, "status", shiftKey)}
          />
        ) : (
          <StatusBadge status={deal.status} statusMap={dealStatusMap} />
        ),
    },
    {
      id: "property_type",
      header: "Type",
      width: "15%",
      sortable: true,
      editable: true,
      render: (deal: Deal) =>
        isEditing(deal.id, "property_type") ? (
          <InlineSelectEdit
            value={deal.property_type || ""}
            options={propertyTypeOptions}
            onSave={(value) => handleInlineSave(deal.id, "property_type", value)}
            onCancel={handleInlineCancel}
            onTab={(shiftKey) => handleTab(deal.id, "property_type", shiftKey)}
          />
        ) : (
          <span className="text-[13px] text-[#A1A1A1] capitalize">
            {deal.property_type?.replace("-", " ") || "—"}
          </span>
        ),
    },
    {
      id: "city",
      header: "Location",
      width: "25%",
      sortable: true,
      render: (deal: Deal) => (
        <span className="text-[13px] text-[#A1A1A1] truncate block">
          {[deal.city, deal.state].filter(Boolean).join(", ") || "—"}
        </span>
      ),
    },
    {
      id: "created_at",
      header: "Created",
      width: "15%",
      sortable: true,
      render: (deal: Deal) => (
        <span className="text-[13px] text-[#A1A1A1]">
          {deal.created_at
            ? new Date(deal.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })
            : "—"}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <TableLayout activeTable="deals">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-[13px] text-[#6B6B6B]">Loading deals...</div>
        </div>
      </TableLayout>
    );
  }

  return (
    <TableLayout activeTable="deals">
      {/* Toolbar */}
      <Toolbar
        onNewClick={() => setShowNewDealPanel(true)}
        newButtonLabel="New Deal"
        filterCount={filters.length}
        filterOpen={showFilterDropdown}
        onFilterClick={() => setShowFilterDropdown(!showFilterDropdown)}
        selectedCount={selectedIds.size}
        onDeleteSelected={handleDeleteSelected}
        sortLabel={
          viewMode === "table" && sortConfig.column && sortConfig.direction
            ? `${columns.find((c) => c.id === sortConfig.column)?.header || sortConfig.column} ${
                sortConfig.direction === "asc" ? "↑" : "↓"
              }`
            : undefined
        }
        filterContent={
          showFilterDropdown ? (
            <FilterDropdown
              columns={filterColumns}
              filters={filters}
              onFiltersChange={setFilters}
              onClose={() => setShowFilterDropdown(false)}
            />
          ) : null
        }
      >
        {/* View toggle & Saved Filters */}
        <div className="flex items-center gap-3">
          <SavedFilters
            storageKey="deals"
            currentFilters={filters}
            onApplyFilter={setFilters}
          />
          <div className="h-5 w-px bg-[#3E3E3E]" />
          <div className="flex items-center gap-1 bg-[#2A2A2A] rounded-md p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[12px] rounded transition-colors",
                viewMode === "table"
                  ? "bg-[#3E3E3E] text-[#EDEDED]"
                  : "text-[#6B6B6B] hover:text-[#A1A1A1]"
              )}
            >
              <LayoutList className="h-3.5 w-3.5" />
              Table
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 text-[12px] rounded transition-colors",
                viewMode === "kanban"
                  ? "bg-[#3E3E3E] text-[#EDEDED]"
                  : "text-[#6B6B6B] hover:text-[#A1A1A1]"
              )}
            >
              <Kanban className="h-3.5 w-3.5" />
              Pipeline
            </button>
          </div>
        </div>
      </Toolbar>

      {/* Content based on view mode */}
      {viewMode === "table" ? (
        <>
          {/* Data Table */}
          <DataTable
            data={paginatedDeals}
            columns={columns}
            selectedIds={selectedIds}
            onSelectAll={toggleAll}
            onSelectRow={toggleRow}
            onRowClick={handleRowClick}
            onRowDoubleClick={handleRowDoubleClick}
            isAllSelected={isAllSelected}
            isSomeSelected={isSomeSelected}
            getRowId={(deal) => deal.id}
            emptyMessage="No deals yet. Click 'New Deal' to create one."
            sortConfig={sortConfig}
            onSort={handleSort}
          />

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages || 1}
            totalRecords={sortedDeals.length}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={(rows) => {
              setRowsPerPage(rows);
              setCurrentPage(1);
            }}
          />
        </>
      ) : (
        /* Kanban View */
        <div className="flex-1 p-4 overflow-hidden">
          <DealKanban onNewDeal={() => setShowNewDealPanel(true)} />
        </div>
      )}

      {/* New Deal Panel (Slide-over) */}
      <NewDealPanel
        open={showNewDealPanel}
        onClose={() => setShowNewDealPanel(false)}
        onDealCreated={handleDealCreated}
      />

      {/* Deal Detail Panel */}
      <DealDetailPanel
        deal={selectedDeal}
        open={selectedDeal !== null}
        onClose={() => setSelectedDeal(null)}
        onDealUpdate={handleDealUpdate}
      />
    </TableLayout>
  );
}
