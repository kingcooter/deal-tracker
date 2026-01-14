import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";
  size?: "default" | "sm" | "lg";
  truncate?: boolean;
  maxWidth?: string;
}

function Badge({
  className,
  variant = "default",
  size = "default",
  truncate = false,
  maxWidth,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        // Base styles - whitespace-nowrap prevents text wrapping
        "inline-flex items-center rounded-md font-medium whitespace-nowrap",
        "transition-colors",
        // Sizes
        {
          "px-1.5 py-0.5 text-[10px]": size === "sm",
          "px-2 py-0.5 text-xs": size === "default",
          "px-2.5 py-1 text-xs": size === "lg",
        },
        // Variants
        {
          "bg-primary/15 text-primary border border-primary/20": variant === "default",
          "bg-surface-active text-foreground-muted border border-transparent": variant === "secondary",
          "bg-success/15 text-success border border-success/20": variant === "success",
          "bg-warning/15 text-warning border border-warning/20": variant === "warning",
          "bg-error/15 text-error border border-error/20": variant === "error",
          "bg-info/15 text-info border border-info/20": variant === "info",
          "border border-border text-foreground-muted bg-transparent hover:bg-surface-hover": variant === "outline",
        },
        className
      )}
      style={maxWidth ? { maxWidth } : undefined}
      {...props}
    >
      {truncate ? (
        <span className="truncate">{children}</span>
      ) : (
        children
      )}
    </div>
  );
}

export { Badge };
