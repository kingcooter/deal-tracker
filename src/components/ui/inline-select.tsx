"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
  color?: string;
}

interface InlineSelectProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  size?: "sm" | "md";
}

export function InlineSelect({
  value,
  options,
  onChange,
  disabled,
  className,
  size = "sm",
}: InlineSelectProps) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Close on click outside
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  // Close on escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [open]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (!disabled) setOpen(!open);
        }}
        disabled={disabled}
        className={cn(
          // Base styles with whitespace-nowrap to prevent wrapping
          "inline-flex items-center gap-1.5 rounded-md border transition-all whitespace-nowrap",
          "hover:border-border-strong focus:outline-none focus:ring-2 focus:ring-primary/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          size === "sm" && "px-2 py-1 text-xs",
          size === "md" && "px-3 py-1.5 text-sm",
          selectedOption?.color || "bg-surface border-border"
        )}
      >
        <span className="font-medium truncate max-w-[120px]">
          {selectedOption?.label || value}
        </span>
        <ChevronDown
          className={cn(
            "flex-shrink-0 transition-transform",
            size === "sm" && "h-3 w-3",
            size === "md" && "h-4 w-4",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute z-50 mt-1 min-w-[140px] rounded-md border border-border bg-neutral-900 shadow-lg",
            "animate-fade-in",
            // Viewport-safe positioning
            "left-0 max-w-[calc(100vw-2rem)]"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-1 max-h-[200px] overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSelect(option.value);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left transition-colors",
                  "hover:bg-surface-hover",
                  size === "sm" && "text-xs",
                  size === "md" && "text-sm",
                  option.value === value && "bg-surface"
                )}
              >
                <span
                  className={cn(
                    "flex items-center gap-2 truncate",
                    option.value === value && "font-medium"
                  )}
                >
                  {option.color && (
                    <span
                      className={cn(
                        "w-2 h-2 flex-shrink-0 rounded-full",
                        option.color.split(" ")[0]
                      )}
                    />
                  )}
                  <span className="truncate">{option.label}</span>
                </span>
                {option.value === value && (
                  <Check className="h-3 w-3 flex-shrink-0 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
