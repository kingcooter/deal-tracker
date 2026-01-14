"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border bg-surface-hover/50 px-3 py-2 text-sm",
          "text-foreground placeholder:text-foreground-subtle",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-surface",
          "hover:border-border-hover hover:bg-surface",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-error/50 focus:ring-error/20 focus:border-error/50"
            : "border-border",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
