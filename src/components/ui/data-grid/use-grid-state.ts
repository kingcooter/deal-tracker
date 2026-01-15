"use client";

import { useQueryState, parseAsString, parseAsJson } from "nuqs";

export type SortState = {
    id: string;
    desc: boolean;
}[];

export type FilterState = {
    id: string;
    value: unknown;
}[];

export function useGridState() {
    // Parsing helpers
    // We use JSON for complex state like sorting and filtering to keep the URL relatively clean
    // but still expressive.
    // ?sort=[{"id":"created_at","desc":true}]
    // ?filters=[{"id":"status","value":"active"}]

    const [sorting, setSorting] = useQueryState<SortState>(
        "sort",
        parseAsJson<SortState>((v) => v as SortState).withDefault([{ id: "created_at", desc: true }])
    );

    const [columnFilters, setColumnFilters] = useQueryState<FilterState>(
        "filters",
        parseAsJson<FilterState>((v) => v as FilterState).withDefault([])
    );

    // View ID (e.g. "all", "mine", "closing-soon")
    const [viewId, setViewId] = useQueryState(
        "view",
        parseAsString.withDefault("all")
    );

    return {
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        viewId,
        setViewId,
    };
}
