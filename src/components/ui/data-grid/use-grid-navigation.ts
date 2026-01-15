"use client";

import * as React from "react";

interface GridNavigationOptions {
    rowCount: number;
    columnCount: number;
    onEnterEdit?: (rowId: number, colId: string) => void;
    onExitEdit?: () => void;
}

export interface GridState {
    focusedRow: number;
    focusedCol: number;
    isEditing: boolean;
}

export function useGridNavigation({
    rowCount,
    columnCount,
    onEnterEdit,
    onExitEdit,
}: GridNavigationOptions) {
    const [gridState, setGridState] = React.useState<GridState>({
        focusedRow: 0,
        focusedCol: 0,
        isEditing: false,
    });

    // Reset focus if data changes significantly (optional safety)
    React.useEffect(() => {
        if (gridState.focusedRow >= rowCount && rowCount > 0) {
            setGridState((prev) => ({ ...prev, focusedRow: rowCount - 1 }));
        }
    }, [rowCount, gridState.focusedRow]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            // If editing, allow interactions within the cell (e.g. typing)
            // Only capture Esc or Enter to exit/save.
            if (gridState.isEditing) {
                if (e.key === "Escape") {
                    e.preventDefault();
                    setGridState((prev) => ({ ...prev, isEditing: false }));
                    onExitEdit?.();
                } else if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    // Typically Enter in edit mode might mean "Save" or "Move Down" depending on UX preference.
                    // For now, let's say it saves and exits edit mode.
                    setGridState((prev) => ({ ...prev, isEditing: false }));
                    onExitEdit?.(); // Consumer should handle save logic via other means or this callback

                    // Optional: Move down after enter? 
                    setGridState((prev) => ({
                        ...prev,
                        isEditing: false,
                        focusedRow: Math.min(prev.focusedRow + 1, rowCount - 1)
                    }));
                }
                return;
            }

            switch (e.key) {
                case "ArrowUp":
                    e.preventDefault();
                    setGridState((prev) => ({
                        ...prev,
                        focusedRow: Math.max(0, prev.focusedRow - 1),
                    }));
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setGridState((prev) => ({
                        ...prev,
                        focusedRow: Math.min(rowCount - 1, prev.focusedRow + 1),
                    }));
                    break;
                case "ArrowLeft":
                    e.preventDefault();
                    setGridState((prev) => ({
                        ...prev,
                        focusedCol: Math.max(0, prev.focusedCol - 1),
                    }));
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    setGridState((prev) => ({
                        ...prev,
                        focusedCol: Math.min(columnCount - 1, prev.focusedCol + 1),
                    }));
                    break;
                case "Enter":
                    e.preventDefault();
                    setGridState((prev) => ({ ...prev, isEditing: true }));
                    // We need a way to map column index to column ID for the callback
                    // For now, passing index as placeholder or we change the interface to accept generic
                    // Let's assume the consumer maps it.
                    onEnterEdit?.(gridState.focusedRow, gridState.focusedCol.toString());
                    break;
                case "Tab":
                    e.preventDefault();
                    // Move right (or down if end of row? Excel standard is right)
                    if (e.shiftKey) {
                        setGridState((prev) => ({
                            ...prev,
                            focusedCol: Math.max(0, prev.focusedCol - 1),
                        }));
                    } else {
                        setGridState((prev) => {
                            if (prev.focusedCol === columnCount - 1) {
                                // Wrap to next row?
                                return {
                                    ...prev,
                                    focusedRow: Math.min(rowCount - 1, prev.focusedRow + 1),
                                    focusedCol: 0
                                };
                            }
                            return {
                                ...prev,
                                focusedCol: Math.min(columnCount - 1, prev.focusedCol + 1),
                            };
                        });
                    }
                    break;
                default:
                    // Optional: Type to start editing?
                    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
                        setGridState((prev) => ({ ...prev, isEditing: true }));
                    }
                    break;
            }
        },
        [gridState, rowCount, columnCount, onExitEdit, onEnterEdit]
    );

    return {
        gridState,
        setGridState,
        handleKeyDown,
    };
}
