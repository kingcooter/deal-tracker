"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// --- Base Cell Interface ---
interface BaseCellProps {
    value: unknown;
    isEditing?: boolean;
    onSave?: (value: unknown) => void;
    onCancel?: () => void;
    className?: string;
    autoFocus?: boolean;
}

// --- Text Cell ---
export function TextCell({ value, isEditing, onSave, className, autoFocus }: BaseCellProps) {
    const [currentValue, setCurrentValue] = React.useState(String(value ?? ""));

    React.useEffect(() => {
        setCurrentValue(String(value ?? ""));
    }, [value]);

    if (isEditing) {
        return (
            <input
                autoFocus={autoFocus}
                className={cn("w-full h-full bg-[#1C1C1C] text-[#EDEDED] px-2 outline-none border border-blue-600 rounded-sm", className)}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                onBlur={() => onSave?.(currentValue)} // Save on blur? Or wait for Enter?
                // Note: Key handling for Enter/Esc is usually at grid level or captured here specifically
                onKeyDown={(e) => {
                    if (e.key === "Enter") onSave?.(currentValue);
                    // Esc handled by parent usually, but we can double safe
                }}
            />
        );
    }

    return <span className={cn("truncate block w-full", className)}>{String(value)}</span>;
}

// --- Status/Select Cell ---
// Simplified for now, can perform a full select dropdown
export function SelectCell({ value, isEditing, onSave, options = [], className }: BaseCellProps & { options?: { label: string, value: string, color?: string }[] }) {
    if (isEditing) {
        return (
            <select
                autoFocus
                className="w-full h-full bg-[#1C1C1C] text-[#EDEDED] outline-none border border-blue-600 rounded-sm"
                value={String(value)}
                onChange={(e) => onSave?.(e.target.value)}
                onBlur={() => onSave?.(value)}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        )
    }

    // safe cast for comparison
    const valStr = String(value);
    const option = options.find(o => o.value === valStr);

    return (
        <span
            className={cn("px-2 py-0.5 rounded text-xs font-medium inline-block truncate", className)}
            style={{
                backgroundColor: option?.color ? `${option.color}20` : undefined, // 20 = 12% opacity roughly
                color: option?.color
            }}
        >
            {option?.label || valStr}
        </span>
    );
}

// --- Number/Currency Cell ---
export function CurrencyCell({ value, className }: BaseCellProps) {
    const formatted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value) || 0);
    return <span className={cn("font-mono text-[12px] truncate block text-right w-full", className)}>{formatted}</span>;
}
