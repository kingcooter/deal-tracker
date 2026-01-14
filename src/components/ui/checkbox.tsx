"use client";

import * as React from "react";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  "aria-label"?: string;
}

export function Checkbox({
  checked = false,
  indeterminate = false,
  onChange,
  disabled,
  className,
  id,
  "aria-label": ariaLabel,
}: CheckboxProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onChange?.(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      if (!disabled) {
        onChange?.(!checked);
      }
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={indeterminate ? "mixed" : checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex h-4 w-4 items-center justify-center rounded border transition-all",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        checked || indeterminate
          ? "border-primary bg-primary text-white"
          : "border-border bg-surface hover:border-border-hover",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {indeterminate ? (
        <Minus className="h-3 w-3 flex-shrink-0" strokeWidth={3} />
      ) : checked ? (
        <Check className="h-3 w-3 flex-shrink-0" strokeWidth={3} />
      ) : null}
    </button>
  );
}

interface CheckboxWithLabelProps extends CheckboxProps {
  label: string;
  description?: string;
}

export function CheckboxWithLabel({
  label,
  description,
  id,
  ...props
}: CheckboxWithLabelProps) {
  const generatedId = React.useId();
  const checkboxId = id || generatedId;

  return (
    <div className="flex items-start gap-3">
      <Checkbox id={checkboxId} {...props} />
      <div className="flex flex-col">
        <label
          htmlFor={checkboxId}
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
    </div>
  );
}
