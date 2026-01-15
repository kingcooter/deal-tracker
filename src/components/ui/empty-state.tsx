"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  size?: "sm" | "default" | "lg";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = "default",
}: EmptyStateProps) {
  const iconSizes = {
    sm: "h-6 w-6",
    default: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const containerSizes = {
    sm: "h-12 w-12",
    default: "h-16 w-16",
    lg: "h-20 w-20",
  };

  const paddingSizes = {
    sm: "py-8",
    default: "py-12",
    lg: "py-16",
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        paddingSizes[size],
        className
      )}
    >
      {/* Icon container with subtle gradient border */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full mb-4",
          "bg-gradient-to-b from-surface-elevated to-surface",
          "border border-border",
          containerSizes[size]
        )}
      >
        <Icon className={cn("text-foreground-muted", iconSizes[size])} />
      </div>

      {/* Title */}
      <h3
        className={cn(
          "font-medium text-foreground mb-1",
          size === "sm" ? "text-sm" : size === "lg" ? "text-lg" : "text-base"
        )}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className={cn(
          "text-foreground-muted max-w-sm mx-auto",
          size === "sm" ? "text-xs" : "text-sm"
        )}
      >
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className={cn("flex items-center gap-3", size === "sm" ? "mt-4" : "mt-6")}>
          {secondaryAction && (
            <Button
              variant="outline"
              size={size === "lg" ? "default" : "sm"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
          {action && (
            <Button
              size={size === "lg" ? "default" : "sm"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for inline empty states (like in tables or sidebars)
interface CompactEmptyStateProps {
  icon?: LucideIcon;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function CompactEmptyState({
  icon: Icon,
  message,
  action,
  className,
}: CompactEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-8 text-center",
        className
      )}
    >
      {Icon && (
        <Icon className="h-5 w-5 text-foreground-subtle mb-2" />
      )}
      <p className="text-sm text-foreground-muted">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-2 text-sm text-primary hover:text-primary-hover transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
