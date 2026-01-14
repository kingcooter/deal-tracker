"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "danger" | "outline";
  size?: "default" | "sm" | "lg" | "icon";
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium",
          "rounded-md transition-all duration-150 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          // Variants
          {
            // Primary - glowing green
            "bg-primary text-neutral-950 font-semibold shadow-sm hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(62,207,142,0.3)]":
              variant === "default",
            // Secondary - subtle surface
            "bg-surface text-foreground border border-border hover:bg-surface-hover hover:border-border-strong":
              variant === "secondary",
            // Ghost - minimal
            "text-foreground-muted hover:text-foreground hover:bg-surface-hover":
              variant === "ghost",
            // Destructive/Danger - error
            "bg-error text-white font-semibold hover:bg-error/90 hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]":
              variant === "destructive" || variant === "danger",
            // Outline - bordered
            "border border-border bg-transparent hover:bg-surface-hover hover:border-border-strong text-foreground":
              variant === "outline",
          },
          // Sizes
          {
            "h-9 px-4 text-sm": size === "default",
            "h-7 px-3 text-xs": size === "sm",
            "h-10 px-5 text-sm": size === "lg",
            "h-9 w-9 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {/* Content wrapper - invisible when loading */}
        <span
          className={cn(
            "inline-flex items-center justify-center gap-2",
            loading && "invisible"
          )}
        >
          {children}
        </span>

        {/* Loading spinner overlay - properly centered */}
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
