"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface IllustrationProps {
  className?: string;
}

export function EmptyDealsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-40", className)}
    >
      {/* Building silhouette */}
      <rect
        x="60"
        y="50"
        width="80"
        height="90"
        rx="4"
        className="fill-surface stroke-border"
        strokeWidth="2"
      />
      {/* Windows */}
      <rect x="70" y="60" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="92" y="60" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="115" y="60" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="70" y="80" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="92" y="80" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="115" y="80" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="70" y="100" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="92" y="100" width="15" height="12" rx="2" className="fill-surface-hover" />
      <rect x="115" y="100" width="15" height="12" rx="2" className="fill-surface-hover" />
      {/* Door */}
      <rect x="90" y="118" width="20" height="22" rx="2" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      {/* Roof accent */}
      <path d="M60 50 L100 30 L140 50" className="stroke-primary" strokeWidth="2" fill="none" />
      {/* Plus icon */}
      <circle cx="160" cy="40" r="16" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
      <path d="M160 34 V46 M154 40 H166" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      {/* Decorative dots */}
      <circle cx="30" cy="80" r="3" className="fill-foreground-subtle/30" />
      <circle cx="25" cy="100" r="2" className="fill-foreground-subtle/20" />
      <circle cx="175" cy="90" r="3" className="fill-foreground-subtle/30" />
      <circle cx="180" cy="110" r="2" className="fill-foreground-subtle/20" />
    </svg>
  );
}

export function EmptyContactsIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-40", className)}
    >
      {/* Main person */}
      <circle cx="100" cy="55" r="25" className="fill-surface stroke-border" strokeWidth="2" />
      <path
        d="M60 130 C60 100 80 85 100 85 C120 85 140 100 140 130"
        className="fill-surface stroke-border"
        strokeWidth="2"
      />
      {/* Face features */}
      <circle cx="92" cy="52" r="3" className="fill-foreground-subtle" />
      <circle cx="108" cy="52" r="3" className="fill-foreground-subtle" />
      <path d="M94 62 Q100 68 106 62" className="stroke-foreground-subtle" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Secondary people (faded) */}
      <circle cx="45" cy="70" r="15" className="fill-surface-hover/50 stroke-border/50" strokeWidth="1.5" />
      <path d="M25 115 C25 95 35 87 45 87 C55 87 65 95 65 115" className="fill-surface-hover/50 stroke-border/50" strokeWidth="1.5" />
      <circle cx="155" cy="70" r="15" className="fill-surface-hover/50 stroke-border/50" strokeWidth="1.5" />
      <path d="M135 115 C135 95 145 87 155 87 C165 87 175 95 175 115" className="fill-surface-hover/50 stroke-border/50" strokeWidth="1.5" />
      {/* Plus icon */}
      <circle cx="160" cy="35" r="14" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
      <path d="M160 29 V41 M154 35 H166" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      {/* Connection lines */}
      <path d="M70 75 L45 85" className="stroke-primary/30" strokeWidth="1.5" strokeDasharray="3 3" />
      <path d="M130 75 L155 85" className="stroke-primary/30" strokeWidth="1.5" strokeDasharray="3 3" />
    </svg>
  );
}

export function EmptySearchIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-40", className)}
    >
      {/* Magnifying glass */}
      <circle cx="85" cy="70" r="35" className="fill-surface stroke-border" strokeWidth="2" />
      <circle cx="85" cy="70" r="25" className="fill-surface-hover stroke-border" strokeWidth="1.5" />
      {/* Handle */}
      <path d="M110 95 L140 125" className="stroke-border" strokeWidth="8" strokeLinecap="round" />
      <path d="M110 95 L140 125" className="stroke-surface" strokeWidth="4" strokeLinecap="round" />
      {/* Question mark */}
      <path
        d="M78 62 C78 55 85 52 90 55 C95 58 95 62 90 67 L85 72"
        className="stroke-foreground-subtle"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="85" cy="80" r="2" className="fill-foreground-subtle" />
      {/* Decorative elements */}
      <circle cx="40" cy="45" r="4" className="fill-primary/20" />
      <circle cx="150" cy="50" r="3" className="fill-primary/20" />
      <circle cx="160" cy="70" r="2" className="fill-foreground-subtle/30" />
      <rect x="30" y="100" width="20" height="3" rx="1.5" className="fill-foreground-subtle/20" />
      <rect x="35" y="110" width="15" height="3" rx="1.5" className="fill-foreground-subtle/20" />
      <rect x="150" y="95" width="25" height="3" rx="1.5" className="fill-foreground-subtle/20" />
      <rect x="155" y="105" width="15" height="3" rx="1.5" className="fill-foreground-subtle/20" />
    </svg>
  );
}

export function EmptyTasksIllustration({ className }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 200 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("w-48 h-40", className)}
    >
      {/* Clipboard */}
      <rect x="55" y="25" width="90" height="115" rx="6" className="fill-surface stroke-border" strokeWidth="2" />
      <rect x="75" y="18" width="50" height="14" rx="4" className="fill-surface-hover stroke-border" strokeWidth="1.5" />
      {/* Task lines */}
      <rect x="70" y="50" width="60" height="8" rx="2" className="fill-surface-hover" />
      <rect x="70" y="70" width="50" height="8" rx="2" className="fill-surface-hover" />
      <rect x="70" y="90" width="55" height="8" rx="2" className="fill-surface-hover" />
      <rect x="70" y="110" width="40" height="8" rx="2" className="fill-surface-hover" />
      {/* Checkboxes */}
      <rect x="70" y="50" width="8" height="8" rx="2" className="fill-success/20 stroke-success/40" strokeWidth="1" />
      <path d="M72 54 L74 56 L77 52" className="stroke-success" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="70" y="70" width="8" height="8" rx="2" className="fill-success/20 stroke-success/40" strokeWidth="1" />
      <path d="M72 74 L74 76 L77 72" className="stroke-success" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="70" y="90" width="8" height="8" rx="2" className="stroke-border" strokeWidth="1" />
      <rect x="70" y="110" width="8" height="8" rx="2" className="stroke-border" strokeWidth="1" />
      {/* Plus icon */}
      <circle cx="155" cy="35" r="14" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
      <path d="M155 29 V41 M149 35 H161" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
      {/* Decorative */}
      <circle cx="35" cy="60" r="3" className="fill-foreground-subtle/30" />
      <circle cx="30" cy="80" r="2" className="fill-foreground-subtle/20" />
      <circle cx="170" cy="100" r="3" className="fill-foreground-subtle/30" />
    </svg>
  );
}
