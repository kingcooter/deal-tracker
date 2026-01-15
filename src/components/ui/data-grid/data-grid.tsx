"use client";

import * as React from "react";
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useGridNavigation } from "./use-grid-navigation";
import { cn } from "@/lib/utils";

interface DataGridProps<TData> {
    data: TData[];
    columns: ColumnDef<TData>[];
    className?: string;
    onRowClick?: (row: TData) => void;
    // Controlled state
    sorting?: SortingState;
    onSortingChange?: React.Dispatch<React.SetStateAction<SortingState>>;
    columnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
}

export function DataGrid<TData>({
    data,
    columns,
    className,
    onRowClick,
    sorting,
    onSortingChange,
    columnFilters,
    onColumnFiltersChange,
}: DataGridProps<TData>) {
    // Fallback to internal state if not controlled (standard React pattern)
    const [internalSorting, setInternalSorting] = React.useState<SortingState>([]);
    const [internalColumnFilters, setInternalColumnFilters] = React.useState<ColumnFiltersState>([]);

    const finalSorting = sorting ?? internalSorting;
    const finalSetSorting = onSortingChange ?? setInternalSorting;

    const finalColumnFilters = columnFilters ?? internalColumnFilters;
    const finalSetColumnFilters = onColumnFiltersChange ?? setInternalColumnFilters;

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting: finalSorting,
            columnFilters: finalColumnFilters,
        },
        onSortingChange: finalSetSorting,
        onColumnFiltersChange: finalSetColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const { rows } = table.getRowModel();

    // Scroll container ref
    const parentRef = React.useRef<HTMLDivElement>(null);

    // Virtualizer
    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 36, // Compact row height
        overscan: 10,
    });

    // Navigation Hook
    const { gridState, handleKeyDown } = useGridNavigation({
        rowCount: rows.length,
        columnCount: columns.length,
        onEnterEdit: (rowIdx, colId) => {
            // Handle edit entry
            console.log("Enter edit", rowIdx, colId);
        },
        onExitEdit: () => {
            // Handle edit exit
            // Probably need to focus back on the cell wrapper
        }
    });

    // Sync scroll on key nav (Basic implementation, can be improved)
    React.useEffect(() => {
        if (rowVirtualizer && parentRef.current) {
            try {
                rowVirtualizer.scrollToIndex(gridState.focusedRow);
            } catch {
                // ignore initial render race conditions
            }
        }
    }, [gridState.focusedRow, rowVirtualizer]);


    return (
        <div
            ref={parentRef}
            className={cn("h-full w-full overflow-auto outline-none", className)}
            onKeyDown={handleKeyDown}
            tabIndex={0} // Make container focusable to capture keys
        >
            <div
                style={{
                    height: `${rowVirtualizer.getTotalSize()}px`,
                    width: "100%",
                    position: "relative",
                }}
            >
                {/* Header - Sticky? For now just render static or we can use virtualizer header logic 
            Actually for a simple virtual list, headers usually sit OUTSIDE the scroll container 
            OR we use sticky positioning. Let's try sticky inside first.
        */}
                <div className="sticky top-0 z-10 grid bg-[#0A0A0A] border-b border-[#2A2A2A]"
                    style={{
                        gridTemplateColumns: columns.map(c =>
                            // Simplistic width handling; production needs strict width/flex parsing
                            (c.size ? `${c.size}px` : "1fr")
                        ).join(" ")
                    }}
                >
                    {table.getHeaderGroups().map(headerGroup => (
                        <React.Fragment key={headerGroup.id}>
                            {headerGroup.headers.map(header => (
                                <div key={header.id} className="px-3 py-2 text-xs font-medium text-[#A1A1A1] text-left truncate">
                                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                </div>
                            ))}
                        </React.Fragment>
                    ))}
                </div>

                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                    const row = rows[virtualRow.index];
                    return (
                        <div
                            key={row.id}
                            className={cn(
                                "absolute top-0 left-0 w-full grid items-center border-b border-[#1C1C1C] hover:bg-[#151515] transition-colors",
                                gridState.focusedRow === virtualRow.index ? "bg-[#1A1A1A] ring-1 ring-inset ring-blue-500/50 z-[1]" : ""
                            )}
                            style={{
                                height: `${virtualRow.size}px`,
                                transform: `translateY(${virtualRow.start}px)`,
                                gridTemplateColumns: columns.map(c =>
                                    (c.size ? `${c.size}px` : "1fr")
                                ).join(" ")
                            }}
                            onClick={() => onRowClick?.(row.original)}
                        >
                            {row.getVisibleCells().map((cell, cellIdx) => (
                                <div
                                    key={cell.id}
                                    className={cn(
                                        "px-3 text-[13px] text-[#EDEDED] truncate h-full flex items-center",
                                        gridState.focusedRow === virtualRow.index && gridState.focusedCol === cellIdx
                                            ? "ring-2 ring-blue-600 z-[2] bg-[#0A0A0A]"
                                            : ""
                                    )}
                                >
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                            ))}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
