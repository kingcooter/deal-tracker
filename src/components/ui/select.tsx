"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-8 w-full appearance-none rounded border border-border bg-surface px-3 py-1.5 pr-8 text-sm",
            "text-foreground",
            "transition-colors duration-100",
            "focus:outline-none focus:border-foreground-subtle focus:bg-surface-hover",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 flex-shrink-0 -translate-y-1/2 text-foreground-subtle" />
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
