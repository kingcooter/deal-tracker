"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled,
  size = "md",
  className,
  id,
  "aria-label": ariaLabel,
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked ? "bg-primary" : "bg-surface-hover",
        disabled && "cursor-not-allowed opacity-50",
        size === "sm" ? "h-5 w-9" : "h-6 w-11",
        className
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          size === "sm" ? "h-4 w-4" : "h-5 w-5",
          checked
            ? size === "sm"
              ? "translate-x-4"
              : "translate-x-5"
            : "translate-x-0.5",
          size === "sm" ? "mt-0.5" : "mt-0.5"
        )}
      />
    </button>
  );
}

interface ToggleWithLabelProps extends ToggleProps {
  label: string;
  description?: string;
}

export function ToggleWithLabel({
  label,
  description,
  id,
  ...props
}: ToggleWithLabelProps) {
  const toggleId = id || React.useId();

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex flex-col">
        <label
          htmlFor={toggleId}
          className={cn(
            "text-sm font-medium text-foreground cursor-pointer",
            props.disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label}
        </label>
        {description && (
          <span className="text-xs text-foreground-muted">{description}</span>
        )}
      </div>
      <Toggle id={toggleId} {...props} />
    </div>
  );
}
