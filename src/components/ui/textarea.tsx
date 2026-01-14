"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border bg-surface-hover/50 px-3 py-2 text-sm",
          "text-foreground placeholder:text-foreground-subtle",
          "transition-all duration-150 resize-none",
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
Textarea.displayName = "Textarea";

export { Textarea };
