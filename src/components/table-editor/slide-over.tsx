"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, ArrowLeft, MoreHorizontal } from "lucide-react";

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SlideOver({
  open,
  onClose,
  title,
  onBack,
  children,
  className,
}: SlideOverProps) {
  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Prevent body scroll when open
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-[480px] bg-[#1C1C1C]",
          "border-l border-[#2A2A2A]",
          "shadow-[-4px_0_16px_rgba(0,0,0,0.3)]",
          "animate-slide-in-right",
          "flex flex-col",
          className
        )}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-[#2A2A2A] flex-shrink-0">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded hover:bg-[#2A2A2A] transition-colors"
              >
                <ArrowLeft className="h-4 w-4 text-[#A1A1A1]" />
              </button>
            )}
            <h2 className="text-[15px] font-medium text-[#EDEDED] truncate max-w-[280px]">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded hover:bg-[#2A2A2A] transition-colors">
              <MoreHorizontal className="h-4 w-4 text-[#6B6B6B]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[#2A2A2A] transition-colors"
            >
              <X className="h-4 w-4 text-[#6B6B6B]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </>
  );
}

// Form field component for consistent styling
interface SlideOverFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function SlideOverField({ label, children, className }: SlideOverFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="block text-[12px] font-medium text-[#6B6B6B] uppercase tracking-wide">
        {label}
      </label>
      <div className="text-[14px] text-[#EDEDED]">{children}</div>
    </div>
  );
}

// Section divider component
interface SlideOverSectionProps {
  title: string;
  count?: number;
  onAdd?: () => void;
  children: React.ReactNode;
}

export function SlideOverSection({ title, count, onAdd, children }: SlideOverSectionProps) {
  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[12px] font-semibold text-[#6B6B6B] uppercase tracking-wide">
          {title}
          {count !== undefined && (
            <span className="ml-2 text-[#A1A1A1]">({count})</span>
          )}
        </h3>
        {onAdd && (
          <button
            onClick={onAdd}
            className="text-[12px] font-medium text-[#3ECF8E] hover:text-[#4AE39A] transition-colors"
          >
            + Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// Divider
export function SlideOverDivider() {
  return <div className="border-t border-[#2A2A2A]" />;
}
