"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileJson } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ExportMenuProps<T> {
  data: T[];
  onExportCSV: (data: T[]) => void;
  onExportJSON: (data: T[]) => void;
  disabled?: boolean;
  className?: string;
}

export function ExportMenu<T>({
  data,
  onExportCSV,
  onExportJSON,
  disabled,
  className,
}: ExportMenuProps<T>) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

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

  const handleExportCSV = () => {
    onExportCSV(data);
    setOpen(false);
  };

  const handleExportJSON = () => {
    onExportJSON(data);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        disabled={disabled || data.length === 0}
      >
        <Download className="h-4 w-4 flex-shrink-0" />
        <span>Export</span>
      </Button>

      {open && (
        <div
          className={cn(
            "absolute right-0 mt-1 w-48 rounded-md border border-border bg-neutral-900 shadow-lg z-50",
            "animate-fade-in",
            "max-w-[calc(100vw-2rem)]"
          )}
        >
          <div className="py-1">
            <button
              onClick={handleExportCSV}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Export as CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground-muted hover:bg-surface-hover hover:text-foreground transition-colors"
            >
              <FileJson className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Export as JSON</span>
            </button>
          </div>
          <div className="border-t border-border px-4 py-2">
            <p className="text-xs text-foreground-subtle">
              {data.length} {data.length === 1 ? 'item' : 'items'} will be exported
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
